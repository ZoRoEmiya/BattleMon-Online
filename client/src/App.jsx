import { useState } from "react";

import "./index.css";

import Navbar from "./components/Navbar";

import MenuPage from "./pages/MenuPage";
import CreaturesPage from "./pages/CreaturesPage";
import TeamBuilderPage from "./pages/TeamBuilderPage";
import BattlePage from "./pages/BattlePage";

function App() {
  const [currentPage, setCurrentPage] = useState("menu");
  const [selectedTeam, setSelectedTeam] = useState([]);

  function renderPage() {
    if (currentPage === "menu") {
      return <MenuPage onNavigate={setCurrentPage} />;
    }

    if (currentPage === "creatures") {
      return <CreaturesPage />;
    }

    if (currentPage === "team-builder") {
      return (
        <TeamBuilderPage
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}
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
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      {renderPage()}
    </>
  );
}

export default App;
