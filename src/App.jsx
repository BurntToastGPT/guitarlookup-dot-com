import React from "react";
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
import "./App.css";

function App() {
  return (
    <Router>
      <div className="main-layout">
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
      </div>
    </Router>
  );
}

export default App;
