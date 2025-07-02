import React from "react";
import styles from "../../styles/components/ChatMessage.module.css";

const ChatMessage = ({ message, isRandy = false, children }) => {
  return (
    <div
      className={`${styles.messageWrapper} ${
        isRandy ? styles.randy : styles.user
      }`}
    >
      {isRandy && (
        <div className={styles.avatar}>
          <span className={styles.avatarEmoji}>🎸</span>
        </div>
      )}
      <div className={styles.messageBubble}>
        {isRandy && <span className={styles.name}>Randy</span>}
        {message && <div className={styles.messageContent}>{message}</div>}
        {children}
      </div>
    </div>
  );
};

export default ChatMessage;
