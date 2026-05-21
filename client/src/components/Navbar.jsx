function Navbar({ currentPage, onNavigate }) {
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
          className={currentPage === "battle" ? "active" : ""}
          onClick={() => onNavigate("battle")}
        >
          Battle
        </button>
      </div>
    </nav>
  );
}

export default Navbar;