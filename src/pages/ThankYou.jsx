import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import styles from "../styles/pages/ThankYou.module.css";

const ThankYou = () => {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper">
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.checkIcon}
          >
            <path
              d="M20 6L9 17L4 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 className={styles.title}>Thank You!</h2>
        <p className={styles.message}>
          Your feedback helps us improve our guitar serial number database.
        </p>

        <div className={styles.stats}>
          <p className={styles.statText}>
            You've helped make our database more accurate for thousands of
            guitar enthusiasts!
          </p>
        </div>

        <Button onClick={() => navigate("/")} size="large" fullWidth>
          Look Up Another Guitar
        </Button>
      </div>
    </div>
  );
};

export default ThankYou;
