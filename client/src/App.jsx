import { useEffect, useState } from "react";

import "./index.css";

import Navbar from "./components/Navbar";
import { getCurrentUser } from "./api/authApi";

import MenuPage from "./pages/MenuPage";
import CreaturesPage from "./pages/CreaturesPage";
import TeamBuilderPage from "./pages/TeamBuilderPage";
import BattlePage from "./pages/BattlePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const TOKEN_STORAGE_KEY = "battlemonToken";

function App() {
  const [currentPage, setCurrentPage] = useState("menu");
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_STORAGE_KEY) || ""
  );
  const [currentUser, setCurrentUser] = useState(null);

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
      return <BattlePage selectedTeam={selectedTeam} />;
    }

    return <MenuPage onNavigate={setCurrentPage} />;
  }

  return (
    <>
      <Navbar
        currentUser={currentUser}
        currentPage={currentPage}
        onLogout={handleLogout}
        onNavigate={setCurrentPage}
      />

      {renderPage()}
    </>
  );
}

export default App;
