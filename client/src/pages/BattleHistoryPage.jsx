import { useEffect, useState } from "react";
import { getBattleHistory } from "../api/battleHistoryApi";

function actionText(action) {
  if (action.action === "switch") {
    return `Player switched to ${action.creature}.`;
  }

  if (!action.hit) {
    return `${action.attacker} used ${action.move}, but it missed.`;
  }

  if (action.damage > 0) {
    return `${action.attacker} used ${action.move} for ${action.damage} damage.`;
  }

  return `${action.attacker} used ${action.move}.`;
}

function getLogSummary(logs) {
  const summary = [];

  for (const entry of logs || []) {
    if (entry.message) {
      summary.push(entry.message);
    }

    if (entry.actions) {
      summary.push(...entry.actions.map(actionText));
    }

    if (entry.messages) {
      summary.push(...entry.messages);
    }

    if (summary.length >= 3) {
      break;
    }
  }

  return summary.slice(0, 3).join(" ");
}

function BattleHistoryPage({ currentUser, token }) {
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser || !token) {
      setBattles([]);
      return;
    }

    let active = true;

    async function loadHistory() {
      setLoading(true);
      setError("");

      try {
        const data = await getBattleHistory(token);

        if (active) {
          setBattles(data.battles);
        }
      } catch {
        if (active) {
          setError("Could not load battle history.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      active = false;
    };
  }, [currentUser, token]);

  if (!currentUser) {
    return (
      <div className="page">
        <h1>Battle History</h1>
        <p className="empty-team">Login to view saved battle history.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Battle History</h1>

      {loading && <p className="empty-team">Loading battle history...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && battles.length === 0 && !error && (
        <p className="empty-team">No saved battles yet.</p>
      )}

      <div className="saved-teams-list">
        {battles.map((battle) => (
          <div className="saved-team-card" key={battle.id}>
            <h2>{battle.result}</h2>
            <p>Opponent: {battle.opponentName}</p>
            <p>Status: {battle.status}</p>
            <p>Date: {new Date(battle.endedAt || battle.createdAt).toLocaleString()}</p>
            <p>{getLogSummary(battle.logs) || "No log summary available."}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BattleHistoryPage;
