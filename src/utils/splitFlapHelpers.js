/**
 * Split-Flap Display Helper Utilities
 *
 * This module provides utilities for managing split-flap display animations,
 * including detecting digit changes and providing easing functions for
 * smooth transitions between states.
 *
 * @module splitFlapHelpers
 */

import { getDigitArray } from "./guitarCountCalculator.js";

/**
 * Animation easing constants for split-flap transitions
 * @namespace animationEasing
 */
export const animationEasing = {
  /**
   * Easing function for smooth split-flap transitions
   * Uses cubic-bezier for realistic mechanical movement
   * @constant {string}
   */
  CUBIC_BEZIER: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",

  /**
   * Easing function for bounce effect on digit landing
   * @constant {string}
   */
  BOUNCE: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",

  /**
   * Standard ease-out for general animations
   * @constant {string}
   */
  EASE_OUT: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",

  /**
   * Sharp ease-in for quick starts
   * @constant {string}
   */
  EASE_IN: "cubic-bezier(0.55, 0.055, 0.675, 0.19)",

  /**
   * Animation duration constants in milliseconds
   * @namespace duration
   */
  duration: {
    /** Fast flip for single digit changes */
    FAST: 300,
    /** Medium flip for multiple digit changes */
    MEDIUM: 500,
    /** Slow flip for dramatic effect */
    SLOW: 800,
    /** Stagger delay between consecutive flips */
    STAGGER: 100,
  },
};

/**
 * Compares two guitar counts and returns the indices of digits that changed
 * between the old and new formatted counts. This is used to determine which
 * split-flap digits need to animate.
 *
 * @param {number} oldCount - The previous guitar count
 * @param {number} newCount - The new guitar count
 * @returns {number[]} Array of indices where digits changed
 *
 * @example
 * // Count changes from 8,000,123 to 8,000,124
 * const changedIndices = getChangingDigits(8000123, 8000124);
 * console.log(changedIndices); // [8] (last digit index)
 *
 * @example
 * // Count changes from 8,000,999 to 8,001,000
 * const changedIndices = getChangingDigits(8000999, 8001000);
 * console.log(changedIndices); // [4, 6, 7, 8] (multiple digits rolling over)
 */
export const getChangingDigits = (oldCount, newCount) => {
  try {
    // Handle edge cases
    if (typeof oldCount !== "number" || typeof newCount !== "number") {
      return [];
    }

    if (isNaN(oldCount) || isNaN(newCount)) {
      return [];
    }

    // Get digit arrays for both counts
    const oldDigits = getDigitArray(oldCount);
    const newDigits = getDigitArray(newCount);

    // Find the maximum length to handle different sized numbers
    const maxLength = Math.max(oldDigits.length, newDigits.length);
    const changingIndices = [];

    // Compare each position
    for (let i = 0; i < maxLength; i++) {
      const oldDigit = oldDigits[i] || "";
      const newDigit = newDigits[i] || "";

      // If digits are different, mark this index as changing
      if (oldDigit !== newDigit) {
        changingIndices.push(i);
      }
    }

    return changingIndices;
  } catch (error) {
    console.error("Error detecting changing digits:", error);
    return [];
  }
};

/**
 * Calculates the animation delay for a digit at a specific index
 * Creates a staggered effect where digits animate in sequence
 *
 * @param {number} index - The index of the digit
 * @param {number[]} changingIndices - Array of all changing indices
 * @param {boolean} [reverseOrder=false] - Whether to reverse the animation order
 * @returns {number} Delay in milliseconds
 *
 * @example
 * const changingIndices = [6, 7, 8];
 * const delay = getAnimationDelay(7, changingIndices, false);
 * console.log(delay); // 100 (second in sequence)
 */
export const getAnimationDelay = (
  index,
  changingIndices,
  reverseOrder = false
) => {
  try {
    const position = changingIndices.indexOf(index);
    if (position === -1) return 0;

    const actualPosition = reverseOrder
      ? changingIndices.length - 1 - position
      : position;

    return actualPosition * animationEasing.duration.STAGGER;
  } catch (error) {
    console.error("Error calculating animation delay:", error);
    return 0;
  }
};

/**
 * Determines the appropriate animation duration based on the number of changing digits
 * More changing digits = longer duration for better visual effect
 *
 * @param {number[]} changingIndices - Array of changing digit indices
 * @returns {number} Duration in milliseconds
 *
 * @example
 * const changingIndices = [6, 7, 8];
 * const duration = getAnimationDuration(changingIndices);
 * console.log(duration); // 500 (medium duration for 3 changes)
 */
export const getAnimationDuration = (changingIndices) => {
  try {
    const changeCount = changingIndices.length;

    if (changeCount === 0) return 0;
    if (changeCount === 1) return animationEasing.duration.FAST;
    if (changeCount <= 3) return animationEasing.duration.MEDIUM;
    return animationEasing.duration.SLOW;
  } catch (error) {
    console.error("Error calculating animation duration:", error);
    return animationEasing.duration.MEDIUM;
  }
};

/**
 * Creates a CSS animation style object for a split-flap digit
 *
 * @param {number} index - The index of the digit
 * @param {number[]} changingIndices - Array of all changing indices
 * @param {Object} [options={}] - Animation options
 * @param {boolean} [options.reverseOrder=false] - Reverse animation order
 * @param {string} [options.easing] - Custom easing function
 * @returns {Object} CSS style object for the animation
 *
 * @example
 * const changingIndices = [6, 7, 8];
 * const styles = getSplitFlapAnimationStyles(7, changingIndices);
 * console.log(styles); // { animationDelay: '100ms', animationDuration: '500ms', ... }
 */
export const getSplitFlapAnimationStyles = (
  index,
  changingIndices,
  options = {}
) => {
  try {
    const { reverseOrder = false, easing = animationEasing.CUBIC_BEZIER } =
      options;

    const isChanging = changingIndices.includes(index);

    if (!isChanging) {
      return {};
    }

    const delay = getAnimationDelay(index, changingIndices, reverseOrder);
    const duration = getAnimationDuration(changingIndices);

    return {
      animationDelay: `${delay}ms`,
      animationDuration: `${duration}ms`,
      animationTimingFunction: easing,
      animationFillMode: "forwards",
    };
  } catch (error) {
    console.error("Error generating split-flap animation styles:", error);
    return {};
  }
};

/**
 * Validates that a digit array contains only valid characters for split-flap display
 * Valid characters: 0-9, comma, and space
 *
 * @param {string[]} digitArray - Array of digit characters
 * @returns {boolean} True if all characters are valid
 *
 * @example
 * isValidDigitArray(['8', ',', '0', '0', '0']); // true
 * isValidDigitArray(['8', 'a', '0']); // false
 */
export const isValidDigitArray = (digitArray) => {
  try {
    if (!Array.isArray(digitArray)) return false;

    const validChars = /^[0-9,\s]$/;
    return digitArray.every((char) => validChars.test(char));
  } catch (error) {
    console.error("Error validating digit array:", error);
    return false;
  }
};

/**
 * Pads a digit array to a minimum length with leading spaces
 * Useful for maintaining consistent display width
 *
 * @param {string[]} digitArray - Array of digit characters
 * @param {number} minLength - Minimum length to pad to
 * @returns {string[]} Padded digit array
 *
 * @example
 * padDigitArray(['1', '2', '3'], 6); // [' ', ' ', ' ', '1', '2', '3']
 */
export const padDigitArray = (digitArray, minLength) => {
  try {
    if (!Array.isArray(digitArray) || minLength <= digitArray.length) {
      return digitArray;
    }

    const paddingNeeded = minLength - digitArray.length;
    const padding = Array(paddingNeeded).fill(" ");

    return [...padding, ...digitArray];
  } catch (error) {
    console.error("Error padding digit array:", error);
    return digitArray;
  }
};

/**
 * Calculates the total animation time including all staggered delays
 * Useful for knowing when all animations will complete
 *
 * @param {number[]} changingIndices - Array of changing digit indices
 * @returns {number} Total animation time in milliseconds
 *
 * @example
 * const changingIndices = [6, 7, 8];
 * const totalTime = getTotalAnimationTime(changingIndices);
 * console.log(totalTime); // 700 (500ms duration + 200ms max delay)
 */
export const getTotalAnimationTime = (changingIndices) => {
  try {
    if (changingIndices.length === 0) return 0;

    const duration = getAnimationDuration(changingIndices);
    const maxDelay =
      (changingIndices.length - 1) * animationEasing.duration.STAGGER;

    return duration + maxDelay;
  } catch (error) {
    console.error("Error calculating total animation time:", error);
    return 0;
  }
};
