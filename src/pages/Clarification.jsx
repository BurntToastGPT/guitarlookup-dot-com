import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import { decodeSerial } from "../utils/serialDecoder";
import styles from "../styles/pages/Clarification.module.css";

const Clarification = () => {
  const navigate = useNavigate();
  const [guitarData, setGuitarData] = useState(null);
  const [decodedInfo, setDecodedInfo] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");

  useEffect(() => {
    // Get data from sessionStorage
    const storedData = sessionStorage.getItem("guitarData");
    if (!storedData) {
      // If no data, redirect to home
      navigate("/");
      return;
    }

    const data = JSON.parse(storedData);
    setGuitarData(data);

    // Decode the serial
    const decoded = decodeSerial(data.brand, data.serialNumber);
    setDecodedInfo(decoded);

    // If no clarification needed, go directly to results
    if (!decoded.needsClarification) {
      sessionStorage.setItem("decodedResult", JSON.stringify(decoded));
      navigate("/results");
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedOption) {
      return;
    }

    // Store the clarification answer
    sessionStorage.setItem("clarificationAnswer", selectedOption);

    // Navigate to results
    navigate("/results");
  };

  if (!guitarData || !decodedInfo || !decodedInfo.needsClarification) {
    return <div className="page-wrapper">Loading...</div>;
  }

  return (
    <div className="page-wrapper">
      <div className={styles.content}>
        <h2>We Need a Bit More Information</h2>

        <div className={styles.infoBox}>
          <p className={styles.brand}>
            <strong>Brand:</strong>{" "}
            {guitarData.brand.charAt(0).toUpperCase() +
              guitarData.brand.slice(1)}
          </p>
          <p className={styles.serial}>
            <strong>Serial:</strong> {guitarData.serialNumber}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.questionSection}>
            <h3>{decodedInfo.question}</h3>
            <p className={styles.reason}>{decodedInfo.reason}</p>
          </div>

          <div className={styles.optionsContainer}>
            {decodedInfo.options.map((option) => (
              <label key={option} className={styles.optionLabel}>
                <input
                  type="radio"
                  name="clarification"
                  value={option}
                  checked={selectedOption === option}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className={styles.radioInput}
                />
                <span className={styles.optionText}>{option}</span>
              </label>
            ))}
          </div>

          <Button
            type="submit"
            size="large"
            fullWidth
            disabled={!selectedOption}
          >
            Next
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Clarification;
