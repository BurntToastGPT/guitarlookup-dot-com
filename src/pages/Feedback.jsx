import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import styles from "../styles/pages/Feedback.module.css";

const Feedback = () => {
  const navigate = useNavigate();
  const [selectedFeedback, setSelectedFeedback] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Store feedback in sessionStorage (in real app, would send to server)
    const feedbackData = {
      rating: selectedFeedback,
      comments: additionalComments,
      timestamp: new Date().toISOString(),
    };
    sessionStorage.setItem("userFeedback", JSON.stringify(feedbackData));

    navigate("/thank-you");
  };

  const feedbackOptions = [
    { value: "accurate", label: "✅ Accurate - Information was correct" },
    {
      value: "partial",
      label: "⚠️ Partially Accurate - Some info was correct",
    },
    { value: "inaccurate", label: "❌ Inaccurate - Information was wrong" },
  ];

  return (
    <div className="page-wrapper">
      <div className={styles.content}>
        <h2 className={styles.title}>How Accurate Was Our Information?</h2>
        <p className={styles.subtitle}>
          Your feedback helps us improve our guitar serial number database
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.feedbackOptions}>
            {feedbackOptions.map((option) => (
              <label key={option.value} className={styles.optionLabel}>
                <input
                  type="radio"
                  name="feedback"
                  value={option.value}
                  checked={selectedFeedback === option.value}
                  onChange={(e) => setSelectedFeedback(e.target.value)}
                  className={styles.radioInput}
                />
                <span className={styles.optionText}>{option.label}</span>
              </label>
            ))}
          </div>

          <div className={styles.commentSection}>
            <label htmlFor="comments" className={styles.commentLabel}>
              Additional Comments (Optional)
            </label>
            <textarea
              id="comments"
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              placeholder="Tell us more about your guitar or how we can improve..."
              className={styles.commentTextarea}
              rows="4"
            />
          </div>

          <div className={styles.actions}>
            <Button
              type="submit"
              size="large"
              fullWidth
              disabled={!selectedFeedback}
            >
              Submit Feedback
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="medium"
              fullWidth
              onClick={() => navigate("/thank-you")}
            >
              Skip Feedback
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
