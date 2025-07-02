import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";

const Feedback = () => {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper">
      <div className="text-center">
        <h2>Feedback Page</h2>
        <p className="mb-4">
          This page will collect user feedback about the results accuracy.
        </p>
        <Button onClick={() => navigate("/thank-you")}>Submit Feedback</Button>
      </div>
    </div>
  );
};

export default Feedback;
