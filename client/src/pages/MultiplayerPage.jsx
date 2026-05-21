import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const TEAM_SIZE = 3;
const SOCKET_URL = "http://localhost:3000";

function getCreatureMoves(creature) {
  return creature.moves.map((item) => item.move);
}

function getHpPercent(member) {
  return Math.max((member.currentHp / member.creature.hp) * 100, 0);
}

function formatAction(action) {
  if (action.action === "switch") {
    return `${action.player} switched to ${action.creature}.`;
  }

  if (!action.hit) {
    return `${action.attacker} used ${action.move}, but it missed.`;
  }

  if (action.damage > 0) {
    const faintedText = action.fainted ? ` ${action.defender} fainted.` : "";
    return `${action.attacker} used ${action.move}. ${action.defender} took ${action.damage} damage.${faintedText}`;
  }

  if (action.effect) {
    return `${action.attacker} used ${action.move}. ${action.effect}.`;
  }

  return `${action.attacker} used ${action.move}.`;
}

function MultiplayerPage({ currentUser, selectedTeam = [] }) {
  const socketRef = useRef(null);
  const [battle, setBattle] = useState(null);
  const [queueStatus, setQueueStatus] = useState("");
  const [error, setError] = useState("");
  const [actionSubmitted, setActionSubmitted] = useState(false);

  const activePlayer = battle?.playerTeam?.[battle.activePlayerIndex];
  const opponentActive = battle?.opponentActive;
  const playerMoves = activePlayer ? getCreatureMoves(activePlayer.creature) : [];
  const battleFinished = battle?.status === "finished";
  const playerMustSwitch = Boolean(battle?.playerMustSwitch);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("matchFound", (state) => {
      setBattle(state);
      setQueueStatus("Match found.");
      setActionSubmitted(false);
      setError("");
    });

    socket.on("battleUpdate", (state) => {
      if (state.queueStatus) {
        setQueueStatus(state.queueStatus);
        return;
      }

      setBattle(state);
      setActionSubmitted(Boolean(state.waitingForOpponent));
      setError("");
    });

    socket.on("battleError", (message) => {
      setError(message);
      setActionSubmitted(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUser]);

  function handleFindMatch() {
    if (!socketRef.current) {
      setError("Could not connect to multiplayer server.");
      return;
    }

    socketRef.current.emit("joinQueue", {
      username: currentUser.username,
      team: selectedTeam
    });
    setBattle(null);
    setQueueStatus("Searching for match...");
    setError("");
  }

  function handleCancelQueue() {
    socketRef.current?.emit("leaveQueue");
    setQueueStatus("Queue cancelled.");
  }

  function handleMove(move) {
    if (!battle || actionSubmitted || battleFinished || playerMustSwitch) {
      return;
    }

    socketRef.current?.emit("submitMove", {
      roomId: battle.roomId,
      moveName: move.name
    });
    setActionSubmitted(true);
  }

  function handleSwitch(index) {
    if (!battle || actionSubmitted || battleFinished) {
      return;
    }

    socketRef.current?.emit("submitSwitch", {
      roomId: battle.roomId,
      index
    });
    setActionSubmitted(true);
  }

  if (!currentUser) {
    return (
      <div className="page">
        <h1>Multiplayer</h1>
        <p className="empty-team">Login to find a multiplayer battle.</p>
      </div>
    );
  }

  if (selectedTeam.length !== TEAM_SIZE) {
    return (
      <div className="page">
        <h1>Multiplayer</h1>
        <p className="empty-team">
          Build or load a team of 3 creatures before finding a match.
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Multiplayer</h1>

      <div className="multiplayer-actions">
        <button onClick={handleFindMatch} disabled={Boolean(battle)}>
          Find Match
        </button>
        <button onClick={handleCancelQueue} disabled={Boolean(battle)}>
          Cancel Queue
        </button>
      </div>

      {queueStatus && <p className="empty-team">{queueStatus}</p>}
      {error && <p className="error-message">{error}</p>}
      {actionSubmitted && !battleFinished && (
        <p className="empty-team">Action submitted. Waiting for opponent...</p>
      )}

      {battle && activePlayer && opponentActive && (
        <>
          {battleFinished && (
            <h2 className="winner-message">Winner: {battle.winner}</h2>
          )}

          {playerMustSwitch && (
            <p className="error-message">
              Your active creature fainted. Switch to another creature.
            </p>
          )}

          <div className="arena">
            <div className="battle-side player-side">
              <div className="battle-sprite player-sprite">
                {activePlayer.creature.name.charAt(0)}
              </div>

              <div className="battle-card">
                <h2>{activePlayer.creature.name}</h2>
                <p>Type: {activePlayer.creature.type}</p>
                <p>
                  HP: {activePlayer.currentHp} / {activePlayer.creature.hp}
                </p>

                <div className="hp-bar">
                  <div
                    className="hp-fill"
                    style={{ width: `${getHpPercent(activePlayer)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="battle-side enemy-side">
              <div className="battle-sprite enemy-sprite">
                {opponentActive.creature.name.charAt(0)}
              </div>

              <div className="battle-card enemy">
                <h2>{opponentActive.creature.name}</h2>
                <p>Trainer: {battle.opponentName}</p>
                <p>Type: {opponentActive.creature.type}</p>
                <p>
                  HP: {opponentActive.currentHp} / {opponentActive.creature.hp}
                </p>

                <div className="hp-bar">
                  <div
                    className="hp-fill enemy-fill"
                    style={{ width: `${getHpPercent(opponentActive)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <section className="switch-section">
            <h2>Switch</h2>
            <div className="switch-buttons">
              {battle.playerTeam.map((member, index) => (
                <button
                  key={member.creature.id}
                  onClick={() => handleSwitch(index)}
                  disabled={
                    actionSubmitted ||
                    battleFinished ||
                    member.fainted ||
                    index === battle.activePlayerIndex
                  }
                >
                  {member.creature.name} ({member.currentHp}/{member.creature.hp})
                </button>
              ))}
            </div>
          </section>

          <div className="move-buttons">
            {playerMoves.map((move) => (
              <button
                key={move.id || move.name}
                onClick={() => handleMove(move)}
                disabled={actionSubmitted || battleFinished || playerMustSwitch}
              >
                {move.name}
              </button>
            ))}
          </div>

          <div className="battle-log">
            <h3>Battle Log</h3>
            {battle.logs.length === 0 && <p>Submit an action to begin.</p>}

            {battle.logs.map((entry, index) => (
              <div key={index}>
                {entry.message ? (
                  <p>{entry.message}</p>
                ) : (
                  <>
                    <strong>Turn {entry.turnNumber}</strong>
                    {entry.actions.map((action, actionIndex) => (
                      <p key={`${index}-${actionIndex}`}>{formatAction(action)}</p>
                    ))}
                    {entry.messages.map((message, messageIndex) => (
                      <p key={`${index}-message-${messageIndex}`}>{message}</p>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default MultiplayerPage;
