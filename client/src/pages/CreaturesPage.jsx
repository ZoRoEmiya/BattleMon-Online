import { useEffect, useState } from "react";
import { getCreatures } from "../api/creatureApi";
import CreatureCard from "../components/CreatureCard";

function CreaturesPage() {
  const [creatures, setCreatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCreatures() {
      try {
        const data = await getCreatures();
        setCreatures(data);
      } catch (err) {
        setError("Failed to load creatures");
      } finally {
        setLoading(false);
      }
    }

    loadCreatures();
  }, []);

  if (loading) {
    return <h2>Loading creatures...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div className="page">
      <h1>BattleMon Creatures</h1>

      <div className="creatures-grid">
        {creatures.map((creature) => (
          <CreatureCard key={creature.id} creature={creature} />
        ))}
      </div>
    </div>
  );
}

export default CreaturesPage;