import React from "react";
import BrandSerialForm from "../components/home/BrandSerialForm";
import styles from "../styles/pages/Home.module.css";

const Home = () => {
  return (
    <div className="page-wrapper">
      <div className={styles.hero}>
        <h2 className={styles.title}>Decode Your Guitar's History</h2>
        <p className={styles.subtitle}>
          Enter your guitar's brand and serial number below to discover its
          manufacturing year, model information, and origin.
        </p>
      </div>

      <BrandSerialForm />

      <div className={styles.footer}>
        <p className={styles.supportText}>
          Currently supporting major brands including Fender, Gibson, Martin,
          Taylor, and more.
        </p>
      </div>
    </div>
  );
};

export default Home;
