import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";

const ThankYou = () => {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper">
      <div className="text-center">
        <h2>Thank You!</h2>
        <p className="mb-4">
          Your feedback helps us improve our guitar serial number database.
        </p>
        <Button onClick={() => navigate("/")} size="large">
          Look Up Another Guitar
        </Button>
      </div>
    </div>
  );
};

export default ThankYou;
