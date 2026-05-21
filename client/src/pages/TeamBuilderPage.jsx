import { useEffect, useState } from "react";
import { getCreatures } from "../api/creatureApi";
import {
  createTeam,
  deleteTeam,
  getMyTeams,
  updateTeam
} from "../api/teamApi";

const TEAM_SIZE = 3;

function TeamBuilderPage({ currentUser, selectedTeam, setSelectedTeam, token }) {
  const [creatures, setCreatures] = useState([]);
  const [savedTeams, setSavedTeams] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [activeSavedTeamId, setActiveSavedTeamId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teamMessage, setTeamMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadCreatures() {
      try {
        const data = await getCreatures();
        setCreatures(data);
      } catch {
        setError("Failed to load creatures");
      } finally {
        setLoading(false);
      }
    }

    loadCreatures();
  }, []);

  useEffect(() => {
    if (!currentUser || !token) {
      setSavedTeams([]);
      setActiveSavedTeamId(null);
      setTeamMessage("");
      return;
    }

    let active = true;

    async function loadSavedTeams() {
      try {
        const data = await getMyTeams(token);

        if (active) {
          setSavedTeams(data.teams);
        }
      } catch {
        if (active) {
          setTeamMessage("Could not load saved teams.");
        }
      }
    }

    loadSavedTeams();

    return () => {
      active = false;
    };
  }, [currentUser, token]);

  function isSelected(creature) {
    return selectedTeam.some((teamCreature) => teamCreature.id === creature.id);
  }

  function getSelectedCreatureIds() {
    return selectedTeam.map((creature) => creature.id);
  }

  function selectCreature(creature) {
    setSelectedTeam((currentTeam) => {
      const alreadySelected = currentTeam.some(
        (teamCreature) => teamCreature.id === creature.id
      );

      if (alreadySelected || currentTeam.length >= TEAM_SIZE) {
        return currentTeam;
      }

      return [...currentTeam, creature];
    });
    setTeamMessage("");
  }

  function removeCreature(creatureId) {
    setSelectedTeam((currentTeam) =>
      currentTeam.filter((creature) => creature.id !== creatureId)
    );
    setTeamMessage("");
  }

  function loadSavedTeam(team) {
    setSelectedTeam(team.creatures);
    setTeamName(team.name);
    setActiveSavedTeamId(team.id);
    setTeamMessage(`${team.name} loaded.`);
  }

  async function refreshSavedTeams(nextActiveTeamId) {
    const data = await getMyTeams(token);
    setSavedTeams(data.teams);

    if (nextActiveTeamId) {
      setActiveSavedTeamId(nextActiveTeamId);
    }
  }

  async function handleSaveNewTeam() {
    if (!currentUser || !token) {
      return;
    }

    if (selectedTeam.length !== TEAM_SIZE) {
      setTeamMessage("Choose exactly 3 creatures before saving.");
      return;
    }

    if (!teamName.trim()) {
      setTeamMessage("Enter a team name before saving.");
      return;
    }

    setIsSaving(true);
    setTeamMessage("");

    try {
      const data = await createTeam(token, {
        name: teamName,
        creatureIds: getSelectedCreatureIds()
      });
      await refreshSavedTeams(data.team.id);
      setSelectedTeam(data.team.creatures);
      setTeamName(data.team.name);
      setTeamMessage(`${data.team.name} saved.`);
    } catch (err) {
      setTeamMessage(err.response?.data?.error || "Could not save team.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdateTeam(team) {
    if (!currentUser || !token) {
      return;
    }

    if (selectedTeam.length !== TEAM_SIZE) {
      setTeamMessage("Choose exactly 3 creatures before updating.");
      return;
    }

    const nextName = activeSavedTeamId === team.id && teamName.trim()
      ? teamName
      : team.name;

    setIsSaving(true);
    setTeamMessage("");

    try {
      const data = await updateTeam(token, team.id, {
        name: nextName,
        creatureIds: getSelectedCreatureIds()
      });
      await refreshSavedTeams(data.team.id);
      setSelectedTeam(data.team.creatures);
      setTeamName(data.team.name);
      setTeamMessage(`${data.team.name} updated.`);
    } catch (err) {
      setTeamMessage(err.response?.data?.error || "Could not update team.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteTeam(team) {
    if (!currentUser || !token) {
      return;
    }

    setIsSaving(true);
    setTeamMessage("");

    try {
      await deleteTeam(token, team.id);
      await refreshSavedTeams(null);

      if (activeSavedTeamId === team.id) {
        setActiveSavedTeamId(null);
        setTeamName("");
      }

      setTeamMessage(`${team.name} deleted.`);
    } catch (err) {
      setTeamMessage(err.response?.data?.error || "Could not delete team.");
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return <h2>Loading creatures...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div className="page">
      <h1>Team Builder</h1>

      <section className="selected-team">
        <div className="team-header">
          <h2>Selected Team</h2>
          <span>{selectedTeam.length} / {TEAM_SIZE}</span>
        </div>

        {selectedTeam.length === 0 && (
          <p className="empty-team">Choose 3 creatures for your battle team.</p>
        )}

        {!currentUser && (
          <p className="empty-team">Login to save and load teams.</p>
        )}

        <div className="team-slots">
          {selectedTeam.map((creature) => (
            <div className="team-slot" key={creature.id}>
              <strong>{creature.name}</strong>
              <span>{creature.type}</span>
              <button onClick={() => removeCreature(creature.id)}>Remove</button>
            </div>
          ))}
        </div>

        {currentUser && (
          <div className="team-save-panel">
            <label>
              Team Name
              <input
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                placeholder="Enter team name"
              />
            </label>

            <button
              className="save-team-button"
              onClick={handleSaveNewTeam}
              disabled={isSaving || selectedTeam.length !== TEAM_SIZE}
            >
              {isSaving ? "Saving..." : "Save New Team"}
            </button>
          </div>
        )}

        {teamMessage && <p className="empty-team">{teamMessage}</p>}
      </section>

      {currentUser && (
        <section className="selected-team">
          <div className="team-header">
            <h2>Saved Teams</h2>
            <span>{savedTeams.length}</span>
          </div>

          {savedTeams.length === 0 && (
            <p className="empty-team">No saved teams yet.</p>
          )}

          <div className="saved-teams-list">
            {savedTeams.map((team) => (
              <div
                className={`saved-team-card ${activeSavedTeamId === team.id ? "selected" : ""}`}
                key={team.id}
              >
                <h3>{team.name}</h3>
                <p>{team.creatures.map((creature) => creature.name).join(", ")}</p>

                <div className="saved-team-actions">
                  <button onClick={() => loadSavedTeam(team)}>Load</button>
                  <button
                    onClick={() => handleUpdateTeam(team)}
                    disabled={isSaving || selectedTeam.length !== TEAM_SIZE}
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team)}
                    disabled={isSaving}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="creatures-grid">
        {creatures.map((creature) => {
          const selected = isSelected(creature);
          const teamFull = selectedTeam.length >= TEAM_SIZE;

          return (
            <div
              className={`creature-card selectable-card ${selected ? "selected" : ""}`}
              key={creature.id}
            >
              <div className="sprite-placeholder">
                {creature.name.charAt(0)}
              </div>

              <h2>{creature.name}</h2>

              <p>Type: {creature.type}</p>
              <p>HP: {creature.hp}</p>
              <p>ATK: {creature.atk}</p>
              <p>DEF: {creature.def}</p>
              <p>SPD: {creature.spd}</p>

              <h3>Moves</h3>
              <ul>
                {creature.moves.map((item) => (
                  <li key={item.id}>
                    {item.move.name} - {item.move.type} - Power: {item.move.power}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => selectCreature(creature)}
                disabled={selected || teamFull}
              >
                {selected ? "Selected" : "Add to Team"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TeamBuilderPage;
