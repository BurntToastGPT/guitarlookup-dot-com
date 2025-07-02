import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import Home from "./pages/Home";
import Clarification from "./pages/Clarification";
import Results from "./pages/Results";
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
            <Route path="/clarify" element={<Clarification />} />
            <Route path="/results" element={<Results />} />
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
