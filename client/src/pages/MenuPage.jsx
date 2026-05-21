function MenuPage({ currentUser, onNavigate }) {
  return (
    <div className="menu-page">
      <h1>BattleMon Online</h1>

      <p className="subtitle">
        Build your team. Enter battle. Win with strategy.
      </p>

      <div className="menu-actions">
        <button onClick={() => onNavigate("creatures")}>
          View Creatures
        </button>

        <button onClick={() => onNavigate("team-builder")}>
          Team Builder
        </button>

        <button onClick={() => onNavigate("battle")}>
          Start Battle
        </button>

        {!currentUser && (
          <>
            <button onClick={() => onNavigate("login")}>
              Login
            </button>

            <button onClick={() => onNavigate("register")}>
              Register
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default MenuPage;
