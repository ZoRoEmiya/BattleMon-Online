import { useEffect, useState } from "react";
import { playTestTurn } from "../api/battleApi";

const initialPlayer2 = {
  id: 2,
  name: "Player 2",
  currentHp: 95,
  modifiers: { atk: 1, def: 1, spd: 1 },
  creature: {
    name: "Thornon",
    type: "Grass",
    hp: 95,
    atk: 70,
    def: 100,
    spd: 40
  }
};

const enemyMove = {
  name: "Vine Lash",
  type: "Grass",
  power: 70,
  accuracy: 100
};

function getHpPercent(player) {
  return Math.max((player.currentHp / player.creature.hp) * 100, 0);
}

function createPlayerFromCreature(creature) {
  return {
    id: 1,
    name: "Player 1",
    currentHp: creature.hp,
    modifiers: { atk: 1, def: 1, spd: 1 },
    creature
  };
}

function getCreatureMoves(creature) {
  return creature.moves.map((item) => item.move);
}

function formatAction(action) {
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

function BattlePage({ selectedTeam }) {
  const [battleState, setBattleState] = useState(null);
  const [player1, setPlayer1] = useState(
    selectedTeam[0] ? createPlayerFromCreature(selectedTeam[0]) : null
  );
  const [player2, setPlayer2] = useState(initialPlayer2);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const playerMoves = player1 ? getCreatureMoves(player1.creature) : [];

  useEffect(() => {
    if (!selectedTeam[0]) {
      setBattleState(null);
      setPlayer1(null);
      setPlayer2(initialPlayer2);
      setLogs([]);
      setError("");
      return;
    }

    setBattleState(null);
    setPlayer1(createPlayerFromCreature(selectedTeam[0]));
    setPlayer2(initialPlayer2);
    setLogs([]);
    setError("");
  }, [selectedTeam]);

  async function handleMove(move1) {
    setIsLoading(true);
    setError("");

    try {
      const battle = await playTestTurn({
        battleState,
        player1,
        player2,
        move1,
        move2: enemyMove
      });

      setBattleState(battle);
      setPlayer1(battle.player1);
      setPlayer2(battle.player2);
      setLogs(battle.logs);
    } catch {
      setError("Could not play the turn. Make sure the server is running.");
    } finally {
      setIsLoading(false);
    }
  }

  if (selectedTeam.length !== 3) {
    return (
      <div className="page">
        <h1>Battle Arena</h1>
        <p className="empty-team">
          Build a team of 3 creatures first, then come back to start a battle.
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Battle Arena</h1>

      {battleState?.status === "finished" && (
        <h2 className="winner-message">Winner: {battleState.winner}</h2>
      )}

      <div className="arena">
        <div className="battle-side player-side">
          <div className="battle-sprite player-sprite">B</div>

          <div className="battle-card">
            <h2>{player1.creature.name}</h2>
            <p>Type: {player1.creature.type}</p>
            <p>
              HP: {player1.currentHp} / {player1.creature.hp}
            </p>

            <div className="hp-bar">
              <div
                className="hp-fill"
                style={{ width: `${getHpPercent(player1)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="battle-side enemy-side">
          <div className="battle-sprite enemy-sprite">T</div>

          <div className="battle-card enemy">
            <h2>{player2.creature.name}</h2>
            <p>Type: {player2.creature.type}</p>
            <p>
              HP: {player2.currentHp} / {player2.creature.hp}
            </p>

            <div className="hp-bar">
              <div
                className="hp-fill enemy-fill"
                style={{ width: `${getHpPercent(player2)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="move-buttons">
        {playerMoves.map((move) => (
          <button
            key={move.id || move.name}
            onClick={() => handleMove(move)}
            disabled={isLoading || battleState?.status === "finished"}
          >
            {move.name}
          </button>
        ))}
      </div>

      <div className="battle-log">
        <h3>Battle Log</h3>
        {error && <p className="error-message">{error}</p>}
        {logs.length === 0 && !error && <p>Choose a move to start the battle.</p>}

        {logs.map((turn, index) => (
          <div key={index}>
            <strong>Turn {turn.turnNumber}</strong>
            {turn.actions.map((action, actionIndex) => (
              <p key={`${index}-${actionIndex}`}>{formatAction(action)}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BattlePage;
