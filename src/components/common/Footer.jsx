import React from "react";
import styles from "../../styles/components/Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <p>&copy; 2025 GuitarLookup. For educational purposes only.</p>
        <p className={styles.disclaimer}>
          Serial number data is approximate and may not be 100% accurate.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
