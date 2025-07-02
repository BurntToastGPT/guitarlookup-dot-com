import React from "react";
import ChatContainer from "../components/chat/ChatContainer";
import styles from "../styles/pages/Home.module.css";

const Home = () => {
  return (
    <div className="page-wrapper">
      <div className={styles.hero}>
        <h1 className={styles.title}>Meet Randy, Your Guitar Expert</h1>
        <p className={styles.subtitle}>
          Let's discover your guitar's story together
        </p>
      </div>

      <ChatContainer />
    </div>
  );
};

export default Home;
