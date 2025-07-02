import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatMessage from "../components/chat/ChatMessage";
import Button from "../components/common/Button";
import { processClarification } from "../utils/serialDecoder";
import styles from "../styles/pages/Clarification.module.css";

const Clarification = () => {
  const navigate = useNavigate();
  const [guitarData, setGuitarData] = useState(null);
  const [clarificationQuestion, setClarificationQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [showingResult, setShowingResult] = useState(false);

  useEffect(() => {
    // Get data from sessionStorage
    const storedGuitarData = sessionStorage.getItem("guitarData");
    const storedQuestion = sessionStorage.getItem("clarificationQuestion");

    if (!storedGuitarData || !storedQuestion) {
      navigate("/");
      return;
    }

    setGuitarData(JSON.parse(storedGuitarData));
    setClarificationQuestion(JSON.parse(storedQuestion));
  }, [navigate]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption || !guitarData) return;

    setShowingResult(true);

    // Process the clarification
    const result = processClarification(
      guitarData.brand,
      guitarData.serialNumber,
      selectedOption
    );

    // Store result and navigate after a delay
    setTimeout(() => {
      sessionStorage.setItem("decodingResult", JSON.stringify(result));
      navigate("/results");
    }, 2000);
  };

  if (!clarificationQuestion || !guitarData) {
    return null;
  }

  return (
    <div className="page-wrapper">
      <div className={styles.chatContainer}>
        <div className={styles.messagesArea}>
          <ChatMessage isRandy>{clarificationQuestion.question}</ChatMessage>

          {!showingResult ? (
            <div className={styles.optionsContainer}>
              {clarificationQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`${styles.optionButton} ${
                    selectedOption === option ? styles.selected : ""
                  }`}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <>
              <ChatMessage isRandy={false}>{selectedOption}</ChatMessage>
              <ChatMessage isRandy>
                Perfect! That helps narrow things down. Let me check my
                database...
              </ChatMessage>
            </>
          )}
        </div>

        {selectedOption && !showingResult && (
          <div className={styles.actionArea}>
            <Button onClick={handleSubmit} size="large" fullWidth>
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clarification;
