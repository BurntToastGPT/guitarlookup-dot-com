import React from "react";
import { Link } from "react-router-dom";
import SplitFlapTicker from "../ticker/SplitFlapTicker";
import styles from "../../styles/components/Header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo}>
            <h1 className={styles.logoText}>GuitarLookup</h1>
          </Link>
          <div className={styles.tickerSection}>
            <SplitFlapTicker />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
