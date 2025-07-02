import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import Home from "./pages/Home";
import ChatLookup from "./pages/ChatLookup";
import Feedback from "./pages/Feedback";
import ThankYou from "./pages/ThankYou";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="main-layout">
        <Header />
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
        <Footer />
      </div>
    </Router>
  );
}

export default App;
