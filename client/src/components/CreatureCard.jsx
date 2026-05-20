function CreatureCard({ creature }) {
  return (
    <div className="creature-card">
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
    </div>
  );
}

export default CreatureCard;