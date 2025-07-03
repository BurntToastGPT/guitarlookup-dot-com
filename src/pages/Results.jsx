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
  const [showSourcesModal, setShowSourcesModal] = useState(false);

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
    const timer = setTimeout(() => {
      setMessages((prev) => {
        // Check if we already have a results message to prevent duplicates
        if (prev.some((msg) => msg.showResults)) {
          return prev;
        }
        const detailsMessage = {
          id: 2,
          isRandy: true,
          showResults: true,
        };
        return [...prev, detailsMessage];
      });
    }, 1200);

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleFeedback = () => {
    navigate("/feedback");
  };

  const handleNewSearch = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const handleShowSources = () => {
    setShowSourcesModal(true);
  };

  const handleCloseModal = () => {
    setShowSourcesModal(false);
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

                  {/* Show decoded values section if available */}
                  {decodingResult.decodedValues && (
                    <div className={styles.decodedSection}>
                      <h4 className={styles.decodedTitle}>
                        🔍 Decoded from serial number: {guitarData.serialNumber}
                      </h4>
                      {Object.entries(decodingResult.decodedValues).map(
                        ([key, value]) => (
                          <div key={key} className={styles.resultItem}>
                            <span className={styles.label}>{key}:</span>
                            <span className={styles.value}>{value}</span>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* Standard result fields */}
                  {!decodingResult.decodedValues && (
                    <>
                      <div className={styles.resultItem}>
                        <span className={styles.label}>📅 Year(s):</span>
                        <span className={styles.value}>
                          {Array.isArray(decodingResult.years)
                            ? decodingResult.years.join(" - ")
                            : decodingResult.years}
                        </span>
                      </div>

                      {decodingResult.exactDate && (
                        <div className={styles.resultItem}>
                          <span className={styles.label}>📆 Exact Date:</span>
                          <span className={styles.value}>
                            {decodingResult.exactDate.month}{" "}
                            {decodingResult.exactDate.day},{" "}
                            {decodingResult.exactDate.year}
                          </span>
                        </div>
                      )}

                      {decodingResult.country &&
                        decodingResult.country !== "Unknown" && (
                          <div className={styles.resultItem}>
                            <span className={styles.label}>🌍 Country:</span>
                            <span className={styles.value}>
                              {decodingResult.country}
                            </span>
                          </div>
                        )}

                      {decodingResult.factory &&
                        decodingResult.factory !== "Not available" &&
                        decodingResult.factory !== "Not specified" && (
                          <div className={styles.resultItem}>
                            <span className={styles.label}>🏭 Factory:</span>
                            <span className={styles.value}>
                              {decodingResult.factory}
                            </span>
                          </div>
                        )}

                      {decodingResult.productionNumber && (
                        <div className={styles.resultItem}>
                          <span className={styles.label}>🔢 Production #:</span>
                          <span className={styles.value}>
                            {decodingResult.productionContext ||
                              `#${decodingResult.productionNumber}`}
                          </span>
                        </div>
                      )}

                      {decodingResult.batchNumber && (
                        <div className={styles.resultItem}>
                          <span className={styles.label}>📦 Batch:</span>
                          <span className={styles.value}>
                            {decodingResult.batchNumber}
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

                      {decodingResult.modelNotes && (
                        <div className={styles.resultItem}>
                          <span className={styles.label}>
                            ✨ Special Edition:
                          </span>
                          <span className={styles.value}>
                            {decodingResult.modelNotes}
                          </span>
                        </div>
                      )}
                    </>
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

                  {(decodingResult.confidence !== "High" ||
                    decodingResult.error) && (
                    <div className={styles.uncertaintyNote}>
                      <p>
                        💡 <strong>Note:</strong>{" "}
                        {decodingResult.error
                          ? "We couldn't decode this serial number format. Please verify the serial number or contact the manufacturer."
                          : "Serial number dating can be complex. For the most accurate information, I'd recommend contacting " +
                            brandName +
                            " directly or consulting with a vintage guitar expert."}
                      </p>
                    </div>
                  )}

                  {decodingResult.sources &&
                    decodingResult.sources.length > 0 && (
                      <button
                        className={styles.sourcesButton}
                        onClick={handleShowSources}
                      >
                        See sources
                      </button>
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

      {/* Sources Modal */}
      {showSourcesModal && decodingResult.sources && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>How Randy Decoded Your Serial Number</h2>
              <button className={styles.closeButton} onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <section className={styles.modalSection}>
                <h3>🔍 Decoding Logic</h3>
                <p className={styles.serialDisplay}>
                  Serial Number: <strong>{guitarData.serialNumber}</strong>
                </p>

                {decodingResult.decodedValues && (
                  <div className={styles.decodedBreakdown}>
                    <h4>Breakdown:</h4>
                    <ul>
                      {Object.entries(decodingResult.decodedValues).map(
                        ([key, value]) => (
                          <li key={key}>
                            <strong>{key}:</strong> {value}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                <p>{decodingResult.rule}</p>
                {decodingResult.notes && (
                  <p className={styles.notesText}>
                    <em>Note: {decodingResult.notes}</em>
                  </p>
                )}
              </section>

              <section className={styles.modalSection}>
                <h3>📚 Sources</h3>
                {decodingResult.sources.map((source, index) => (
                  <div key={index} className={styles.sourceItem}>
                    <h4>{source.name}</h4>
                    <p>{source.description}</p>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.sourceLink}
                      >
                        Visit source →
                      </a>
                    )}
                  </div>
                ))}
              </section>

              {decodingResult.factoryDetails && (
                <section className={styles.modalSection}>
                  <h3>🏭 Factory Information</h3>
                  <p>{decodingResult.factoryDetails}</p>
                </section>
              )}

              {decodingResult.sourceNotes && (
                <section className={styles.modalSection}>
                  <h3>📝 Additional Notes</h3>
                  <p>{decodingResult.sourceNotes}</p>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
