import { useEffect, useState } from "react";

import "./index.css";

import Navbar from "./components/Navbar";
import { getCurrentUser } from "./api/authApi";

import MenuPage from "./pages/MenuPage";
import CreaturesPage from "./pages/CreaturesPage";
import TeamBuilderPage from "./pages/TeamBuilderPage";
import BattlePage from "./pages/BattlePage";
import BattleHistoryPage from "./pages/BattleHistoryPage";
import LoginPage from "./pages/LoginPage";
import MultiplayerPage from "./pages/MultiplayerPage";
import RegisterPage from "./pages/RegisterPage";

const TOKEN_STORAGE_KEY = "battlemonToken";
const THEME_STORAGE_KEY = "battlemonTheme";

function getStoredTheme() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  return storedTheme === "light" ? "light" : "dark";
}

function App() {
  const [currentPage, setCurrentPage] = useState("menu");
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [theme, setTheme] = useState(getStoredTheme);
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_STORAGE_KEY) || ""
  );
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    async function loadUser() {
      try {
        const data = await getCurrentUser(token);

        if (active) {
          setCurrentUser(data.user);
        }
      } catch {
        if (active) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          setToken("");
          setCurrentUser(null);
          setCurrentPage("menu");
        }
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, [token]);

  function handleLogin(data) {
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    setToken(data.token);
    setCurrentUser(data.user);
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken("");
    setCurrentUser(null);
    setCurrentPage("menu");
  }

  function renderPage() {
    if (currentPage === "menu") {
      return (
        <MenuPage
          currentUser={currentUser}
          onNavigate={setCurrentPage}
        />
      );
    }

    if (currentPage === "creatures") {
      return <CreaturesPage />;
    }

    if (currentPage === "team-builder") {
      return (
        <TeamBuilderPage
          currentUser={currentUser}
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}
          token={token}
        />
      );
    }

    if (currentPage === "login") {
      return (
        <LoginPage
          onLogin={handleLogin}
          onNavigate={setCurrentPage}
        />
      );
    }

    if (currentPage === "register") {
      return (
        <RegisterPage
          onLogin={handleLogin}
          onNavigate={setCurrentPage}
        />
      );
    }

    if (currentPage === "battle") {
      return (
        <BattlePage
          currentUser={currentUser}
          selectedTeam={selectedTeam}
          token={token}
        />
      );
    }

    if (currentPage === "battle-history") {
      return (
        <BattleHistoryPage
          currentUser={currentUser}
          token={token}
        />
      );
    }

    if (currentPage === "multiplayer") {
      return (
        <MultiplayerPage
          currentUser={currentUser}
          selectedTeam={selectedTeam}
          token={token}
        />
      );
    }

    return (
      <MenuPage
        currentUser={currentUser}
        onNavigate={setCurrentPage}
      />
    );
  }

  return (
    <>
      <Navbar
        currentUser={currentUser}
        currentPage={currentPage}
        theme={theme}
        onLogout={handleLogout}
        onNavigate={setCurrentPage}
        onToggleTheme={() =>
          setTheme((currentTheme) =>
            currentTheme === "dark" ? "light" : "dark"
          )
        }
      />

      {renderPage()}
    </>
  );
}

export default App;
