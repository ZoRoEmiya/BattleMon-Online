import { useEffect, useState } from "react";
import { getCreatures } from "../api/creatureApi";
import { getMyTeam, saveMyTeam } from "../api/teamApi";

const TEAM_SIZE = 3;

function TeamBuilderPage({ currentUser, selectedTeam, setSelectedTeam, token }) {
  const [creatures, setCreatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
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
      setSaveMessage("");
      return;
    }

    let active = true;

    async function loadSavedTeam() {
      try {
        const data = await getMyTeam(token);

        if (active && data.team?.creatures?.length === TEAM_SIZE) {
          setSelectedTeam(data.team.creatures);
          setSaveMessage("Saved team loaded.");
        }
      } catch {
        if (active) {
          setSaveMessage("Could not load saved team.");
        }
      }
    }

    loadSavedTeam();

    return () => {
      active = false;
    };
  }, [currentUser, setSelectedTeam, token]);

  function isSelected(creature) {
    return selectedTeam.some((teamCreature) => teamCreature.id === creature.id);
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
  }

  function removeCreature(creatureId) {
    setSelectedTeam((currentTeam) =>
      currentTeam.filter((creature) => creature.id !== creatureId)
    );
  }

  async function handleSaveTeam() {
    if (!currentUser || !token) {
      return;
    }

    if (selectedTeam.length !== TEAM_SIZE) {
      setSaveMessage("Choose exactly 3 creatures before saving.");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    try {
      const data = await saveMyTeam(
        token,
        selectedTeam.map((creature) => creature.id)
      );
      setSelectedTeam(data.team.creatures);
      setSaveMessage("Team saved.");
    } catch (err) {
      setSaveMessage(err.response?.data?.error || "Could not save team.");
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
          <p className="empty-team">Login to save this team.</p>
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
          <button
            className="save-team-button"
            onClick={handleSaveTeam}
            disabled={isSaving || selectedTeam.length !== TEAM_SIZE}
          >
            {isSaving ? "Saving..." : "Save Team"}
          </button>
        )}

        {saveMessage && <p className="empty-team">{saveMessage}</p>}
      </section>

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
