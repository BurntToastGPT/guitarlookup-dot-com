import React from "react";
import FooterPopup from "./FooterPopup";
import Button from "./Button";
import styles from "../../styles/components/SimpleInfoPopup.module.css";

/**
 * SimpleInfoPopup Component
 *
 * Used for displaying simple informational content like privacy policy and disclaimer.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Function to close modal
 * @param {string} props.title - Modal title
 * @param {string} props.content - Text content to display
 */
const SimpleInfoPopup = ({ isOpen, onClose, title, content }) => {
  // Handle line breaks in content
  const formatContent = (text) => {
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <FooterPopup isOpen={isOpen} onClose={onClose} title={title}>
      <div className={styles.content}>
        <div className={styles.text}>{formatContent(content)}</div>
        <div className={styles.buttonContainer}>
          <Button
            variant="primary"
            size="large"
            onClick={onClose}
            className={styles.button}
          >
            Got it!
          </Button>
        </div>
      </div>
    </FooterPopup>
  );
};

export default SimpleInfoPopup;
