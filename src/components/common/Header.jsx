import React from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/components/Header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className="container">
        <Link to="/" className={styles.logo}>
          <h1 className={styles.logoText}>GuitarLookup</h1>
        </Link>
      </div>
    </header>
  );
};

export default Header;
