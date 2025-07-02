import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatMessage from "../components/chat/ChatMessage";
import Button from "../components/common/Button";
import {
  processClarification,
  decodeGibsonSerial,
} from "../utils/serialDecoder";
import styles from "../styles/pages/Clarification.module.css";

const Clarification = () => {
  const navigate = useNavigate();
  const [guitarData, setGuitarData] = useState(null);
  const [clarificationQuestion, setClarificationQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [showingResult, setShowingResult] = useState(false);
  const [allAnswers, setAllAnswers] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Get data from sessionStorage
    const storedGuitarData = sessionStorage.getItem("guitarData");
    const storedQuestion = sessionStorage.getItem("clarificationQuestion");
    const storedAnswers = sessionStorage.getItem("clarificationAnswers");

    if (!storedGuitarData || !storedQuestion) {
      navigate("/");
      return;
    }

    const parsedGuitarData = JSON.parse(storedGuitarData);
    const parsedQuestion = JSON.parse(storedQuestion);
    const parsedAnswers = storedAnswers ? JSON.parse(storedAnswers) : [];

    setGuitarData(parsedGuitarData);
    setClarificationQuestion(parsedQuestion);
    setAllAnswers(parsedAnswers);

    // Initialize messages with the question
    setMessages([
      {
        id: Date.now(),
        isRandy: true,
        text: parsedQuestion.question,
      },
    ]);
  }, [navigate]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption || !guitarData) return;

    // Add user's answer to messages
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        isRandy: false,
        text: selectedOption,
      },
    ]);

    setShowingResult(true);

    // Update all answers
    const updatedAnswers = [...allAnswers, selectedOption];
    setAllAnswers(updatedAnswers);
    sessionStorage.setItem(
      "clarificationAnswers",
      JSON.stringify(updatedAnswers)
    );

    // For Gibson, check if we need more clarifications
    if (
      guitarData.brand === "gibson" &&
      clarificationQuestion.previousAnswers !== undefined
    ) {
      // Process with Gibson rules, continuing from the same rule
      const result = decodeGibsonSerial(
        guitarData.serialNumber,
        updatedAnswers,
        clarificationQuestion.ruleIndex
      );

      setTimeout(() => {
        if (result.needsClarification) {
          // Need another clarification
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              isRandy: true,
              text: "Thanks! I have another quick question...",
            },
          ]);

          setTimeout(() => {
            sessionStorage.setItem(
              "clarificationQuestion",
              JSON.stringify(result)
            );
            setClarificationQuestion(result);
            setSelectedOption("");
            setShowingResult(false);

            // Add the new question
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now() + 2,
                isRandy: true,
                text: result.question,
              },
            ]);
          }, 1500);
        } else {
          // Got final result
          sessionStorage.setItem("decodingResult", JSON.stringify(result));
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              isRandy: true,
              text: "Perfect! That helps narrow things down. Let me check my database...",
            },
          ]);

          setTimeout(() => {
            navigate("/results");
          }, 2000);
        }
      }, 1500);
    } else {
      // Non-Gibson or old flow
      const result = processClarification(
        guitarData.brand,
        guitarData.serialNumber,
        selectedOption
      );

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          isRandy: true,
          text: "Perfect! That helps narrow things down. Let me check my database...",
        },
      ]);

      setTimeout(() => {
        sessionStorage.setItem("decodingResult", JSON.stringify(result));
        navigate("/results");
      }, 2000);
    }
  };

  if (!clarificationQuestion || !guitarData) {
    return null;
  }

  return (
    <div className="page-wrapper">
      <div className={styles.chatContainer}>
        <div className={styles.messagesArea}>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} isRandy={msg.isRandy}>
              {msg.text}
            </ChatMessage>
          ))}

          {clarificationQuestion && !showingResult && (
            <div className={styles.optionsContainer}>
              {(clarificationQuestion.options || []).map((option, index) => (
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
