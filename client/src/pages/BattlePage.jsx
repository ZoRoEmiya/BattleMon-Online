function BattlePage() {
  return (
    <div className="page">
      <h1>Battle Screen</h1>

      <div className="battle-layout">
        <div className="battle-card">
          <h2>Burnix</h2>
          <p>Type: Fire</p>
          <p>HP: 60 / 60</p>

          <div className="hp-bar">
            <div
              className="hp-fill"
              style={{ width: "100%" }}
            ></div>
          </div>
        </div>

        <div className="battle-card enemy">
          <h2>Thornon</h2>
          <p>Type: Grass</p>
          <p>HP: 95 / 95</p>

          <div className="hp-bar">
            <div
              className="hp-fill enemy-fill"
              style={{ width: "100%" }}
            ></div>
          </div>
        </div>
      </div>

      <div className="move-buttons">
        <button>Flame Burst</button>
        <button>Quick Hit</button>
      </div>

      <div className="battle-log">
        <h3>Battle Log</h3>

        <p>Burnix used Flame Burst</p>
        <p>It's super effective</p>
        <p>Thornon lost 78 HP</p>
      </div>
    </div>
  );
}

export default BattlePage;