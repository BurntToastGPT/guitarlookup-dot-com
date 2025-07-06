import React, { useState, useEffect, useRef } from "react";
import SplitFlapDigit from "./SplitFlapDigit";
import EstimationModal from "./EstimationModal";
import {
  getCurrentGuitarCount,
  getGuitarCountData,
} from "../../utils/guitarCountCalculator";
import {
  getChangingDigits,
  getAnimationDelay,
} from "../../utils/splitFlapHelpers";
import styles from "../../styles/components/SplitFlapTicker.module.css";

/**
 * SplitFlapTicker Component
 *
 * Main ticker display that shows the real-time guitar count with
 * split-flap animation effects. Updates every 10 seconds.
 */
const SplitFlapTicker = () => {
  const [currentCount, setCurrentCount] = useState(getCurrentGuitarCount());
  const [previousCount, setPreviousCount] = useState(getCurrentGuitarCount());
  const [isAnimating, setIsAnimating] = useState(false);
  const [changingIndices, setChangingIndices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guitarData, setGuitarData] = useState(() => getGuitarCountData());
  const intervalRef = useRef(null);
  const animationTimeoutRef = useRef(null);

  // Update guitar count every 10 seconds
  useEffect(() => {
    const updateCount = () => {
      const newCount = getCurrentGuitarCount();
      const newGuitarData = getGuitarCountData();

      if (newCount !== currentCount) {
        // Determine which digits are changing
        const changingDigitIndices = getChangingDigits(currentCount, newCount);

        if (changingDigitIndices.length > 0) {
          setPreviousCount(currentCount);
          setChangingIndices(changingDigitIndices);
          setIsAnimating(true);

          // Calculate total animation time
          const maxDelay = Math.max(
            ...changingDigitIndices.map((index) =>
              getAnimationDelay(index, changingDigitIndices)
            )
          );
          const totalAnimationTime = maxDelay + 400; // 400ms for animation duration + buffer

          // Clear any existing animation timeout
          if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
          }

          // Complete animation after calculated time
          animationTimeoutRef.current = setTimeout(() => {
            setIsAnimating(false);
            setChangingIndices([]);
          }, totalAnimationTime);
        }

        setCurrentCount(newCount);
        setGuitarData(newGuitarData);
      }
    };

    // Initial update
    updateCount();

    // Set up interval for updates every 10 seconds
    intervalRef.current = setInterval(updateCount, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []); // Remove currentCount from dependency array to prevent infinite loops

  // Handle modal open/close
  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  // Handle keyboard navigation for modal trigger
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleModalOpen();
    }
  };

  // Render digit or comma based on character type
  const renderDigitOrComma = (char, index) => {
    if (char === ",") {
      return (
        <span key={`comma-${index}`} className={styles.staticComma}>
          ,
        </span>
      );
    }

    return (
      <SplitFlapDigit
        key={`${index}-${char}`}
        digit={char}
        isAnimating={isAnimating && changingIndices.includes(index)}
        animationDelay={getAnimationDelay(index, changingIndices)}
        className={styles.digit}
      />
    );
  };

  return (
    <>
      <div
        className={styles.tickerContainer}
        onClick={handleModalOpen}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="# of Guitars Supported. Click to learn how we calculate this number."
      >
        <div className={styles.tickerContent}>
          {/* Headline */}
          <h2 className={styles.headline}># of Guitars Supported:</h2>

          {/* Guitar count display */}
          <div className={styles.countDisplay}>
            <div className={styles.digitRow}>
              {guitarData.digitArray.map((char, index) =>
                renderDigitOrComma(char, index)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Estimation Modal - Rendered at root level for fullscreen coverage */}
      <EstimationModal isOpen={isModalOpen} onClose={handleModalClose} />
    </>
  );
};

export default SplitFlapTicker;
