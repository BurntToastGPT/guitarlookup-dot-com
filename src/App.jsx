import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import ChatLookup from "./pages/ChatLookup";
import Feedback from "./pages/Feedback";
import ThankYou from "./pages/ThankYou";
import DevelopmentNotice from "./components/common/DevelopmentNotice";
import PersistentFooter from "./components/common/PersistentFooter";
import "./App.css";

function App() {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    // Check if user has already seen the notice
    const hasSeenNotice = localStorage.getItem("hasSeenDevelopmentNotice");
    if (!hasSeenNotice) {
      setShowNotice(true);
    }
  }, []);

  const handleCloseNotice = () => {
    setShowNotice(false);
    // Remember that user has seen the notice
    localStorage.setItem("hasSeenDevelopmentNotice", "true");
  };

  return (
    <Router>
      <div className="main-layout">
        {showNotice && <DevelopmentNotice onClose={handleCloseNotice} />}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lookup/:sessionId" element={<ChatLookup />} />
            <Route path="/lookup" element={<ChatLookup />} />
            {/* Keep old routes for backwards compatibility, redirect to new flow */}
            <Route
              path="/clarify"
              element={<Navigate to="/lookup" replace />}
            />
            <Route
              path="/results"
              element={<Navigate to="/lookup" replace />}
            />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/thank-you" element={<ThankYou />} />
          </Routes>
        </main>
        <PersistentFooter />
      </div>
    </Router>
  );
}

export default App;
