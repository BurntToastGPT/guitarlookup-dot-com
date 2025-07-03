import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect to the chat lookup
    navigate("/lookup");
  }, [navigate]);

  return null; // No content needed as we're redirecting
};

export default Home;
