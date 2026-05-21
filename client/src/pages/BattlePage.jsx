import { useEffect, useState } from "react";
import { getCreatures } from "../api/creatureApi";
import { playTurn } from "../api/battleApi";

const TEAM_SIZE = 3;

function createTeamMember(creature) {
  return {
    creature,
    currentHp: creature.hp,
    modifiers: { atk: 1, def: 1, spd: 1 },
    fainted: false
  };
}

function createBattlePlayer(member, id, name) {
  return {
    id,
    name,
    currentHp: member.currentHp,
    modifiers: member.modifiers,
    creature: member.creature
  };
}

function getCreatureMoves(creature) {
  return creature.moves.map((item) => item.move);
}

function getHpPercent(member) {
  return Math.max((member.currentHp / member.creature.hp) * 100, 0);
}

function updateTeamMember(member, battlePlayer) {
  return {
    ...member,
    creature: battlePlayer.creature,
    currentHp: battlePlayer.currentHp,
    modifiers: battlePlayer.modifiers || { atk: 1, def: 1, spd: 1 },
    fainted: battlePlayer.currentHp <= 0
  };
}

function getRandomEnemyTeam(creatures) {
  const uniqueCreatures = Array.from(
    new Map(creatures.map((creature) => [creature.id, creature])).values()
  );
  const shuffled = [...uniqueCreatures];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, TEAM_SIZE).map(createTeamMember);
}

function getFirstAvailableIndex(team) {
  return team.findIndex((member) => !member.fainted);
}

function isTeamDefeated(team) {
  return team.length > 0 && team.every((member) => member.fainted);
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

function BattlePage({ selectedTeam = [] }) {
  const [playerTeam, setPlayerTeam] = useState([]);
  const [enemyTeam, setEnemyTeam] = useState([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [activeEnemyIndex, setActiveEnemyIndex] = useState(0);
  const [battleState, setBattleState] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const activePlayer = playerTeam[activePlayerIndex];
  const activeEnemy = enemyTeam[activeEnemyIndex];
  const battleFinished = isTeamDefeated(playerTeam) || isTeamDefeated(enemyTeam);
  const playerMustSwitch =
    activePlayer?.fainted && !isTeamDefeated(playerTeam);
  const playerMoves = activePlayer ? getCreatureMoves(activePlayer.creature) : [];
  const winner = isTeamDefeated(enemyTeam)
    ? "Player 1"
    : isTeamDefeated(playerTeam)
      ? "Player 2"
      : "";

  useEffect(() => {
    if (selectedTeam.length !== TEAM_SIZE) {
      setPlayerTeam([]);
      setEnemyTeam([]);
      setActivePlayerIndex(0);
      setActiveEnemyIndex(0);
      setBattleState(null);
      setLogs([]);
      setError("");
      return;
    }

    let active = true;

    async function startTeamBattle() {
      setIsLoading(true);
      setError("");
      setPlayerTeam(selectedTeam.map(createTeamMember));
      setEnemyTeam([]);
      setActivePlayerIndex(0);
      setActiveEnemyIndex(0);
      setBattleState(null);
      setLogs([]);

      try {
        const creatures = await getCreatures();

        const uniqueCreatureCount = new Set(
          creatures.map((creature) => creature.id)
        ).size;

        if (uniqueCreatureCount < TEAM_SIZE) {
          throw new Error("Not enough creatures");
        }

        if (active) {
          setEnemyTeam(getRandomEnemyTeam(creatures));
        }
      } catch {
        if (active) {
          setError("Could not create an enemy team. Make sure the server is running.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    startTeamBattle();

    return () => {
      active = false;
    };
  }, [selectedTeam]);

  function appendLog(message) {
    setLogs((currentLogs) => [...currentLogs, { message }]);
  }

  function handleSwitch(index) {
    const nextCreature = playerTeam[index];

    if (!nextCreature || nextCreature.fainted || index === activePlayerIndex) {
      return;
    }

    const previousName = activePlayer?.creature.name;

    setActivePlayerIndex(index);
    setBattleState(null);
    setError("");

    if (previousName) {
      appendLog(
        `Player switched from ${previousName} to ${nextCreature.creature.name}.`
      );
    }
  }

  async function handleMove(move1) {
    if (!activePlayer || !activeEnemy || activePlayer.fainted || battleFinished) {
      return;
    }

    const enemyMove = getCreatureMoves(activeEnemy.creature)[0];

    if (!enemyMove) {
      setError("Enemy has no available moves.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const previousLogCount = battleState?.logs?.length || 0;
      const battle = await playTurn({
        battleState,
        player1: createBattlePlayer(activePlayer, 1, "Player 1"),
        player2: createBattlePlayer(activeEnemy, 2, "Player 2"),
        move1,
        move2: enemyMove
      });

      const nextPlayerTeam = [...playerTeam];
      const nextEnemyTeam = [...enemyTeam];

      nextPlayerTeam[activePlayerIndex] = updateTeamMember(
        nextPlayerTeam[activePlayerIndex],
        battle.player1
      );
      nextEnemyTeam[activeEnemyIndex] = updateTeamMember(
        nextEnemyTeam[activeEnemyIndex],
        battle.player2
      );

      const nextLogs = battle.logs.slice(previousLogCount);
      const extraLogs = [];
      const playerDefeated = isTeamDefeated(nextPlayerTeam);
      const enemyDefeated = isTeamDefeated(nextEnemyTeam);
      let nextBattleState = battle.status === "finished" ? null : battle;
      let nextActiveEnemyIndex = activeEnemyIndex;

      if (nextEnemyTeam[activeEnemyIndex].fainted && !enemyDefeated) {
        nextActiveEnemyIndex = getFirstAvailableIndex(nextEnemyTeam);
        extraLogs.push({
          message: `Enemy sent out ${nextEnemyTeam[nextActiveEnemyIndex].creature.name}.`
        });
        nextBattleState = null;
      }

      if (nextPlayerTeam[activePlayerIndex].fainted && !playerDefeated) {
        extraLogs.push({
          message: `${nextPlayerTeam[activePlayerIndex].creature.name} fainted. Choose another creature.`
        });
        nextBattleState = null;
      }

      if (enemyDefeated || playerDefeated) {
        const battleWinner = enemyDefeated ? "Player 1" : "Player 2";
        extraLogs.push({ message: `${battleWinner} wins the battle!` });
        nextBattleState = {
          ...battle,
          status: "finished",
          winner: battleWinner
        };
      }

      setPlayerTeam(nextPlayerTeam);
      setEnemyTeam(nextEnemyTeam);
      setActiveEnemyIndex(nextActiveEnemyIndex);
      setBattleState(nextBattleState);
      setLogs((currentLogs) => [...currentLogs, ...nextLogs, ...extraLogs]);
    } catch {
      setError("Could not play the turn. Make sure the server is running.");
    } finally {
      setIsLoading(false);
    }
  }

  if (selectedTeam.length !== TEAM_SIZE) {
    return (
      <div className="page">
        <h1>Battle Arena</h1>
        <p className="empty-team">
          Build a team of 3 creatures first, then come back to start a battle.
        </p>
      </div>
    );
  }

  if (!activePlayer || !activeEnemy) {
    return (
      <div className="page">
        <h1>Battle Arena</h1>
        {error ? (
          <p className="error-message">{error}</p>
        ) : (
          <p className="empty-team">Preparing teams...</p>
        )}
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Battle Arena</h1>

      {winner && (
        <h2 className="winner-message">Winner: {winner}</h2>
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
            {activeEnemy.creature.name.charAt(0)}
          </div>

          <div className="battle-card enemy">
            <h2>{activeEnemy.creature.name}</h2>
            <p>Type: {activeEnemy.creature.type}</p>
            <p>
              HP: {activeEnemy.currentHp} / {activeEnemy.creature.hp}
            </p>

            <div className="hp-bar">
              <div
                className="hp-fill enemy-fill"
                style={{ width: `${getHpPercent(activeEnemy)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <section className="switch-section">
        <h2>Switch</h2>
        <div className="switch-buttons">
          {playerTeam.map((member, index) => (
            <button
              key={member.creature.id}
              onClick={() => handleSwitch(index)}
              disabled={
                isLoading ||
                battleFinished ||
                member.fainted ||
                index === activePlayerIndex
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
            disabled={isLoading || battleFinished || playerMustSwitch}
          >
            {move.name}
          </button>
        ))}
      </div>

      <div className="battle-log">
        <h3>Battle Log</h3>
        {error && <p className="error-message">{error}</p>}
        {logs.length === 0 && !error && <p>Choose a move to start the battle.</p>}

        {logs.map((entry, index) => (
          <div key={index}>
            {entry.message ? (
              <p>{entry.message}</p>
            ) : (
              <>
                <strong>Turn {index + 1}</strong>
                {entry.actions.map((action, actionIndex) => (
                  <p key={`${index}-${actionIndex}`}>{formatAction(action)}</p>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BattlePage;
