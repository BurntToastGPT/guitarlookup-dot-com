import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatMessage from "../components/chat/ChatMessage";
import Button from "../components/common/Button";
import styles from "../styles/pages/Feedback.module.css";

const Feedback = () => {
  const navigate = useNavigate();
  const [feedbackType, setFeedbackType] = useState("");
  const [additionalFeedback, setAdditionalFeedback] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);

  const feedbackOptions = [
    {
      type: "positive",
      emoji: "😊",
      label: "Very helpful!",
      response:
        "Awesome! I'm so glad I could help you learn about your guitar. Keep on rockin'! 🎸",
    },
    {
      type: "mixed",
      emoji: "🤔",
      label: "Somewhat helpful",
      response:
        "Thanks for the feedback! I'm always learning and improving. Your input helps me get better at helping other guitar enthusiasts.",
    },
    {
      type: "negative",
      emoji: "😕",
      label: "Not very helpful",
      response:
        "I'm sorry I couldn't be more helpful this time. I'm constantly working to improve my knowledge. Your feedback is invaluable for making me better!",
    },
  ];

  const handleFeedbackSelect = (type) => {
    setFeedbackType(type);
  };

  const handleSubmit = () => {
    if (!feedbackType) return;

    setShowThankYou(true);

    // Store feedback (in a real app, this would send to a server)
    console.log("Feedback submitted:", {
      type: feedbackType,
      additional: additionalFeedback,
    });

    // Navigate to thank you page after delay
    setTimeout(() => {
      sessionStorage.setItem("feedbackType", feedbackType);
      navigate("/thank-you");
    }, 2000);
  };

  const selectedOption = feedbackOptions.find(
    (opt) => opt.type === feedbackType
  );

  return (
    <div className="page-wrapper">
      <div className={styles.chatContainer}>
        <div className={styles.messagesArea}>
          <ChatMessage isRandy>
            Hey, before you go - was Randy helpful today? How can I get better
            at helping guitar enthusiasts like you?
          </ChatMessage>

          {!showThankYou ? (
            <>
              <div className={styles.feedbackOptions}>
                {feedbackOptions.map((option) => (
                  <button
                    key={option.type}
                    className={`${styles.feedbackButton} ${
                      feedbackType === option.type ? styles.selected : ""
                    }`}
                    onClick={() => handleFeedbackSelect(option.type)}
                  >
                    <span className={styles.emoji}>{option.emoji}</span>
                    <span className={styles.label}>{option.label}</span>
                  </button>
                ))}
              </div>

              {feedbackType && (
                <div className={styles.additionalFeedbackSection}>
                  <p className={styles.promptText}>
                    Any specific thoughts you'd like to share? (optional)
                  </p>
                  <textarea
                    className={styles.textarea}
                    placeholder="Tell Randy what you think..."
                    value={additionalFeedback}
                    onChange={(e) => setAdditionalFeedback(e.target.value)}
                    rows={4}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <ChatMessage isRandy={false}>
                {selectedOption.label}
                {additionalFeedback && (
                  <div className={styles.userFeedbackText}>
                    "{additionalFeedback}"
                  </div>
                )}
              </ChatMessage>
              <ChatMessage isRandy>{selectedOption.response}</ChatMessage>
            </>
          )}
        </div>

        {feedbackType && !showThankYou && (
          <div className={styles.actionArea}>
            <Button onClick={handleSubmit} size="large" fullWidth>
              Submit Feedback
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="secondary"
              size="medium"
            >
              Skip & Start New Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;
