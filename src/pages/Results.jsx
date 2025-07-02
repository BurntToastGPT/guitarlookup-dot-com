import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import { decodeSerial, processClarification } from "../utils/serialDecoder";
import styles from "../styles/pages/Results.module.css";

const Results = () => {
  const navigate = useNavigate();
  const [guitarData, setGuitarData] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get guitar data from sessionStorage
    const storedData = sessionStorage.getItem("guitarData");
    if (!storedData) {
      navigate("/");
      return;
    }

    const data = JSON.parse(storedData);
    setGuitarData(data);

    // Check if we have a direct result or need to process clarification
    const storedResult = sessionStorage.getItem("decodedResult");
    const clarificationAnswer = sessionStorage.getItem("clarificationAnswer");

    let finalResult;

    if (storedResult) {
      // Direct result without clarification
      finalResult = JSON.parse(storedResult);
    } else if (clarificationAnswer) {
      // Process with clarification answer
      finalResult = processClarification(
        data.brand,
        data.serialNumber,
        clarificationAnswer
      );
    } else {
      // Fallback: decode again
      finalResult = decodeSerial(data.brand, data.serialNumber);
    }

    setResults(finalResult);
    setLoading(false);

    // Store result for feedback page
    sessionStorage.setItem("finalResult", JSON.stringify(finalResult));
  }, [navigate]);

  const handleFeedback = () => {
    navigate("/feedback");
  };

  if (loading || !guitarData || !results) {
    return <div className="page-wrapper">Loading results...</div>;
  }

  // Determine confidence badge color
  const getConfidenceBadgeClass = (confidence) => {
    switch (confidence) {
      case "High":
        return styles.confidenceHigh;
      case "Medium":
        return styles.confidenceMedium;
      case "Low":
      default:
        return styles.confidenceLow;
    }
  };

  // Format brand name
  const brandDisplay =
    guitarData.brand.charAt(0).toUpperCase() + guitarData.brand.slice(1);

  return (
    <div className="page-wrapper">
      <div className={styles.content}>
        <h2>Your Guitar Information</h2>

        <div className={styles.guitarInfo}>
          <div className={styles.infoRow}>
            <span className={styles.label}>Brand:</span>
            <span className={styles.value}>{brandDisplay}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Serial Number:</span>
            <span className={styles.value}>{guitarData.serialNumber}</span>
          </div>
        </div>

        <div className={styles.resultsCard}>
          <div className={styles.resultSection}>
            <h3>Manufacturing Year</h3>
            <p className={styles.resultValue}>
              {results.years ? results.years.join(" or ") : "Unknown"}
            </p>
          </div>

          <div className={styles.resultSection}>
            <h3>Model</h3>
            <p className={styles.resultValue}>
              {results.model ||
                "Unable to determine specific model from serial number"}
            </p>
          </div>

          <div className={styles.resultSection}>
            <h3>Country/Factory</h3>
            <p className={styles.resultValue}>{results.country || "Unknown"}</p>
          </div>

          <div className={styles.confidenceSection}>
            <h3>Confidence Score</h3>
            <span
              className={`${styles.confidenceBadge} ${getConfidenceBadgeClass(
                results.confidence
              )}`}
            >
              {results.confidence || "Low"}
            </span>
          </div>
        </div>

        <div className={styles.howWeKnowSection}>
          <h3>How We Know</h3>
          <p>
            {results.rule ||
              "Based on general serial number patterns for this brand."}
          </p>
        </div>

        {results.confidence === "Low" && (
          <div className={styles.ambiguousNote}>
            <p>
              <strong>Note:</strong> This serial number format is ambiguous.
              Additional information such as model name, features, or photos
              would help narrow down the exact year and model.
            </p>
          </div>
        )}

        <div className={styles.actions}>
          <Button onClick={handleFeedback} size="large" fullWidth>
            Was This Information Helpful?
          </Button>

          <Button
            onClick={() => navigate("/")}
            variant="secondary"
            size="medium"
            fullWidth
          >
            Look Up Another Guitar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
