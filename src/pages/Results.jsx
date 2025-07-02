import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatMessage from "../components/chat/ChatMessage";
import Button from "../components/common/Button";
import brandsData from "../data/brands.json";
import styles from "../styles/pages/Results.module.css";

const Results = () => {
  const navigate = useNavigate();
  const [guitarData, setGuitarData] = useState(null);
  const [decodingResult, setDecodingResult] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Get data from sessionStorage
    const storedGuitarData = sessionStorage.getItem("guitarData");
    const storedResult = sessionStorage.getItem("decodingResult");

    if (!storedGuitarData || !storedResult) {
      navigate("/");
      return;
    }

    const guitar = JSON.parse(storedGuitarData);
    const result = JSON.parse(storedResult);

    setGuitarData(guitar);
    setDecodingResult(result);

    // Build Randy's messages
    const brandName =
      brandsData.brands.find((b) => b.id === guitar.brand)?.displayName ||
      guitar.brand;

    const initialMessages = [];

    if (result.confidence === "High") {
      initialMessages.push({
        id: 1,
        isRandy: true,
        message: `Great news! I found detailed information about your ${brandName}.`,
      });
    } else if (result.confidence === "Medium") {
      initialMessages.push({
        id: 1,
        isRandy: true,
        message: `I've found some information about your ${brandName}, though there's a bit of uncertainty due to the serial number format.`,
      });
    } else {
      initialMessages.push({
        id: 1,
        isRandy: true,
        message: `I found some basic information about your ${brandName}, but the serial number format is unusual, so I'm less certain about the details.`,
      });
    }

    setMessages(initialMessages);

    // Add result details after a delay
    setTimeout(() => {
      const detailsMessage = {
        id: 2,
        isRandy: true,
        showResults: true,
      };
      setMessages((prev) => [...prev, detailsMessage]);
    }, 1200);
  }, [navigate]);

  const handleFeedback = () => {
    navigate("/feedback");
  };

  const handleNewSearch = () => {
    sessionStorage.clear();
    navigate("/");
  };

  if (!guitarData || !decodingResult) {
    return null;
  }

  const brandName =
    brandsData.brands.find((b) => b.id === guitarData.brand)?.displayName ||
    guitarData.brand;

  return (
    <div className="page-wrapper">
      <div className={styles.chatContainer}>
        <div className={styles.messagesArea}>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} isRandy={msg.isRandy}>
              {msg.message}
              {msg.showResults && (
                <div className={styles.resultsCard}>
                  <h3 className={styles.resultsTitle}>
                    Your {brandName} Details:
                  </h3>

                  <div className={styles.resultItem}>
                    <span className={styles.label}>📅 Year(s):</span>
                    <span className={styles.value}>
                      {Array.isArray(decodingResult.years)
                        ? decodingResult.years.join(" - ")
                        : decodingResult.years}
                    </span>
                  </div>

                  {decodingResult.country &&
                    decodingResult.country !== "Unknown" && (
                      <div className={styles.resultItem}>
                        <span className={styles.label}>🌍 Country:</span>
                        <span className={styles.value}>
                          {decodingResult.country}
                        </span>
                      </div>
                    )}

                  {decodingResult.model && (
                    <div className={styles.resultItem}>
                      <span className={styles.label}>🎸 Model:</span>
                      <span className={styles.value}>
                        {decodingResult.model}
                      </span>
                    </div>
                  )}

                  <div className={styles.resultItem}>
                    <span className={styles.label}>🎯 Confidence:</span>
                    <span
                      className={`${styles.value} ${
                        styles[decodingResult.confidence.toLowerCase()]
                      }`}
                    >
                      {decodingResult.confidence}
                    </span>
                  </div>

                  <div className={styles.ruleSection}>
                    <p className={styles.ruleLabel}>How I figured this out:</p>
                    <p className={styles.ruleText}>{decodingResult.rule}</p>
                  </div>

                  {decodingResult.confidence !== "High" && (
                    <div className={styles.uncertaintyNote}>
                      <p>
                        💡 <strong>Note:</strong> Serial number dating can be
                        complex. For the most accurate information, I'd
                        recommend contacting {brandName} directly or consulting
                        with a vintage guitar expert.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </ChatMessage>
          ))}
        </div>

        <div className={styles.actionArea}>
          <Button
            onClick={handleFeedback}
            variant="primary"
            size="large"
            fullWidth
          >
            Help Randy Improve
          </Button>
          <Button onClick={handleNewSearch} variant="secondary" size="medium">
            Look Up Another Guitar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
