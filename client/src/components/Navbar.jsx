function Navbar({ currentPage, currentUser, onLogout, onNavigate }) {
  return (
    <nav className="navbar">
      <div className="logo">BattleMon Online</div>

      <div className="nav-buttons">
        <button
          className={currentPage === "menu" ? "active" : ""}
          onClick={() => onNavigate("menu")}
        >
          Menu
        </button>

        <button
          className={currentPage === "creatures" ? "active" : ""}
          onClick={() => onNavigate("creatures")}
        >
          Creatures
        </button>

        <button
          className={currentPage === "team-builder" ? "active" : ""}
          onClick={() => onNavigate("team-builder")}
        >
          Team Builder
        </button>

        <button
          className={currentPage === "battle" ? "active" : ""}
          onClick={() => onNavigate("battle")}
        >
          Battle
        </button>

        {currentUser ? (
          <>
            <span className="nav-user">{currentUser.username}</span>
            <button onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <button
              className={currentPage === "login" ? "active" : ""}
              onClick={() => onNavigate("login")}
            >
              Login
            </button>

            <button
              className={currentPage === "register" ? "active" : ""}
              onClick={() => onNavigate("register")}
            >
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
