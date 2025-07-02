import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatMessage from "../components/chat/ChatMessage";
import Button from "../components/common/Button";
import styles from "../styles/pages/ThankYou.module.css";

const ThankYou = () => {
  const navigate = useNavigate();
  const [feedbackType, setFeedbackType] = useState("");

  useEffect(() => {
    // Get feedback type from sessionStorage
    const storedFeedbackType = sessionStorage.getItem("feedbackType");
    if (storedFeedbackType) {
      setFeedbackType(storedFeedbackType);
    }
  }, []);

  const handleNewSearch = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const getRandyMessage = () => {
    switch (feedbackType) {
      case "positive":
        return "Thanks so much! Happy to be your guitar guide anytime. Rock on! 🎸✨";
      case "mixed":
        return "Thanks for taking the time! Every bit of feedback helps me become a better guitar assistant. See you next time! 🎸";
      case "negative":
        return "Thank you for your honesty - it really helps me improve. Hope to do better next time you need guitar help! 🎸";
      default:
        return "Thanks for using GuitarLookup! Come back anytime you need help with a guitar serial number. Keep playing! 🎸";
    }
  };

  return (
    <div className="page-wrapper">
      <div className={styles.chatContainer}>
        <div className={styles.messagesArea}>
          <ChatMessage isRandy>{getRandyMessage()}</ChatMessage>

          <div className={styles.finalMessage}>
            <h2>Until Next Time!</h2>
            <p>
              Got another guitar to look up? I'm always here to help decode
              those mysterious serial numbers.
            </p>
          </div>
        </div>

        <div className={styles.actionArea}>
          <Button onClick={handleNewSearch} size="large" fullWidth>
            Look Up Another Guitar
          </Button>

          <div className={styles.socialLinks}>
            <p>Share GuitarLookup with fellow musicians:</p>
            <div className={styles.shareButtons}>
              <button
                className={styles.shareButton}
                aria-label="Share on Twitter"
              >
                🐦
              </button>
              <button
                className={styles.shareButton}
                aria-label="Share on Facebook"
              >
                📘
              </button>
              <button
                className={styles.shareButton}
                aria-label="Share via Email"
              >
                ✉️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
