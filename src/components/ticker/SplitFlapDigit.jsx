import React, { useState, useEffect } from "react";
import styles from "../../styles/components/SplitFlapDigit.module.css";

/**
 * SplitFlapDigit Component
 *
 * Renders a single digit with split-flap animation effect.
 * Supports digits 0-9, comma, and space characters.
 *
 * @param {Object} props - Component props
 * @param {string} props.digit - Current character to display
 * @param {boolean} props.isAnimating - Whether digit is currently animating
 * @param {number} props.animationDelay - Delay before animation starts (ms)
 * @param {string} [props.className] - Additional CSS classes
 * @param {Object} [props.style] - Inline styles
 */
const SplitFlapDigit = ({
  digit,
  isAnimating = false,
  animationDelay = 0,
  className = "",
  style = {},
}) => {
  const [displayDigit, setDisplayDigit] = useState(digit);
  const [animationState, setAnimationState] = useState("idle");

  // Update display digit when prop changes
  useEffect(() => {
    if (isAnimating) {
      setAnimationState("flipping");

      // Start animation after delay
      const animationTimer = setTimeout(() => {
        setDisplayDigit(digit);
        setAnimationState("landing");

        // Complete animation
        setTimeout(() => {
          setAnimationState("idle");
        }, 200); // Animation duration
      }, animationDelay);

      return () => clearTimeout(animationTimer);
    } else {
      setDisplayDigit(digit);
      setAnimationState("idle");
    }
  }, [digit, isAnimating, animationDelay]);

  // Determine character type for styling
  const getCharacterType = (char) => {
    if (char === ",") return "comma";
    if (char === " ") return "space";
    if (/\d/.test(char)) return "digit";
    return "other";
  };

  const characterType = getCharacterType(displayDigit);

  return (
    <div
      className={`${styles.digitContainer} ${className}`}
      style={style}
      data-character-type={characterType}
    >
      {/* Functional split-flap digit display */}
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2c2112 0%, #1a1410 100%)",
          border: "2px solid #295032",
          borderRadius: "8px",
          color: "#e2c275",
          fontSize: characterType === "comma" ? "1.5rem" : "1.75rem",
          fontWeight: "bold",
          fontFamily: '"Courier New", "Monaco", monospace',
          textShadow:
            "0 0 10px rgba(226, 194, 117, 0.6), 0 0 20px rgba(226, 194, 117, 0.4), 0 2px 4px rgba(0, 0, 0, 0.8)",
          letterSpacing: "0.05em",
          boxShadow:
            "inset 0 2px 8px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)",
          transition: "all 200ms ease-in-out",
          transform: isAnimating ? "scale(1.05)" : "scale(1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Split line in the middle */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "2px",
            right: "2px",
            height: "2px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(41, 80, 50, 0.3) 10%, rgba(41, 80, 50, 0.3) 90%, transparent 100%)",
            transform: "translateY(-50%)",
            zIndex: 1,
            boxShadow: "0 0 2px rgba(41, 80, 50, 0.2)",
            opacity: 0.5,
          }}
        />
        <div style={{ position: "relative", zIndex: 10 }}>{displayDigit}</div>
      </div>
    </div>
  );
};

export default SplitFlapDigit;
