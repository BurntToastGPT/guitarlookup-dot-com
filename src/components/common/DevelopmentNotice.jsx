import React from "react";
import styles from "../../styles/components/DevelopmentNotice.module.css";
import Button from "./Button";

const DevelopmentNotice = ({ onClose }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.content}>
          <p className={styles.message}>
            GuitarLookup is still under development, with only Gibson supported
            at the current moment (July 2025). This is a passion project for
            other guitarists to enjoy and is not affiliated with any of the
            mentioned brands. If you'd like to contribute to the development or
            have feedback, please email me:{" "}
            <a href="mailto:noah@guitarlookup.com" className={styles.email}>
              noah@guitarlookup.com
            </a>
          </p>
          <Button
            type="primary"
            size="large"
            onClick={onClose}
            className={styles.button}
          >
            Okay, thanks Noah!
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentNotice;
