function BattlePage() {
  return (
    <div className="page">
      <h1>Battle Arena</h1>

      <div className="arena">
        <div className="battle-side player-side">
          <div className="battle-sprite player-sprite">B</div>

          <div className="battle-card">
            <h2>Burnix</h2>
            <p>Type: Fire</p>
            <p>HP: 60 / 60</p>

            <div className="hp-bar">
              <div className="hp-fill" style={{ width: "100%" }}></div>
            </div>
          </div>
        </div>

        <div className="battle-side enemy-side">
          <div className="battle-sprite enemy-sprite">T</div>

          <div className="battle-card enemy">
            <h2>Thornon</h2>
            <p>Type: Grass</p>
            <p>HP: 95 / 95</p>

            <div className="hp-bar">
              <div className="hp-fill enemy-fill" style={{ width: "100%" }}></div>
            </div>
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
        <p>Thornon lost HP</p>
      </div>
    </div>
  );
}

export default BattlePage;