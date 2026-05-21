import { useState } from "react";

import "./index.css";

import Navbar from "./components/Navbar";

import MenuPage from "./pages/MenuPage";
import CreaturesPage from "./pages/CreaturesPage";
import BattlePage from "./pages/BattlePage";

function App() {
  const [currentPage, setCurrentPage] = useState("menu");

  function renderPage() {
    if (currentPage === "menu") {
      return <MenuPage onNavigate={setCurrentPage} />;
    }

    if (currentPage === "creatures") {
      return <CreaturesPage />;
    }

    if (currentPage === "battle") {
      return <BattlePage />;
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