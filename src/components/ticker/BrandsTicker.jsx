import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import SplitFlapDigit from "./SplitFlapDigit";
import brandsData from "../../data/brands.json";
import styles from "../../styles/components/BrandsTicker.module.css";
import Button from "../common/Button";

/**
 * BrandsTicker Component
 *
 * Displays the count of supported brands with split-flap animation effects.
 * Shows a 2-digit count of active brands from the brands.json file.
 */
const BrandsTicker = () => {
  const [brandCount, setBrandCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate brand count from brands.json
  useEffect(() => {
    const activeBrands = brandsData.brands.filter(
      (brand) =>
        // Only count brands that are supported
        brand.id && brand.displayName && brand.supported === true
    );
    setBrandCount(activeBrands.length);
  }, []);

  // Format count as 2-digit string with leading zero if needed
  const formatCount = (count) => {
    return count.toString().padStart(2, "0");
  };

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

  const formattedCount = formatCount(brandCount);

  return (
    <>
      <div
        className={styles.tickerContainer}
        onClick={handleModalOpen}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Number of guitar brands we support. Click to learn more about supported brands."
      >
        <div className={styles.tickerContent}>
          {/* Headline */}
          <h2 className={styles.headline}># of Brands Supported:</h2>

          {/* Brand count display */}
          <div className={styles.countDisplay}>
            <div className={styles.digitRow}>
              {formattedCount.split("").map((digit, index) => (
                <SplitFlapDigit
                  key={`brand-${index}-${digit}`}
                  digit={digit}
                  isAnimating={isAnimating}
                  animationDelay={index * 100}
                  className={styles.digit}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Brands Modal - Rendered using portal to document body for fullscreen coverage */}
      {isModalOpen &&
        createPortal(
          <div className={styles.overlay}>
            <div className={styles.popup}>
              <div className={styles.content}>
                <p className={styles.message}>
                  We're currently supporting {brandCount} brand
                  {brandCount !== 1 ? "s" : ""} and constantly working to expand
                  our database of guitar serial number formats. Right now we
                  support <strong>Fender</strong>, but we're actively working to
                  add Gibson, Martin, Taylor, and other major brands. Our team
                  is continuously researching and adding new guitar brands to
                  our database. Don't see your brand? We're likely working on
                  it!
                </p>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleModalClose}
                  className={styles.button}
                >
                  Okay, thanks!
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default BrandsTicker;
