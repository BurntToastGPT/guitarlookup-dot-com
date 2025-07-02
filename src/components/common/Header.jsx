import React from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/components/Header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className="container">
        <Link to="/" className={styles.logo}>
          <h1>GuitarLookup</h1>
        </Link>
        <p className={styles.tagline}>Decode your guitar's serial number</p>
      </div>
    </header>
  );
};

export default Header;
