import { useEffect, useState } from "react";
import { getCreatures } from "../api/creatureApi";

const TEAM_SIZE = 3;

function TeamBuilderPage({ selectedTeam, setSelectedTeam }) {
  const [creatures, setCreatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        <div className="team-slots">
          {selectedTeam.map((creature) => (
            <div className="team-slot" key={creature.id}>
              <strong>{creature.name}</strong>
              <span>{creature.type}</span>
              <button onClick={() => removeCreature(creature.id)}>Remove</button>
            </div>
          ))}
        </div>
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
