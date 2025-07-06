/**
 * Guitar Count Calculator Utility
 *
 * This module provides utilities for calculating the real-time guitar count
 * for the split-flap ticker display. The count is deterministic based on
 * elapsed time since a base date, ensuring all users see the same count
 * at any given moment.
 *
 * @module guitarCountCalculator
 */

/**
 * Base count of guitars at the reference date (8 million)
 * @constant {number}
 */
export const BASE_COUNT = 8000000;

/**
 * Reference date for the count calculation (July 6, 2025 UTC)
 * @constant {Date}
 */
export const BASE_DATE = new Date("2025-07-06T00:00:00Z");

/**
 * Rate of guitar growth per second (150,000 guitars per year)
 * Calculated as: 150,000 / (365.25 * 24 * 60 * 60)
 * @constant {number}
 */
export const GUITARS_PER_SECOND = 150000 / (365.25 * 24 * 60 * 60);

/**
 * Calculates the current guitar count based on elapsed time since BASE_DATE
 *
 * Formula: BASE_COUNT + (elapsed_seconds * GUITARS_PER_SECOND)
 *
 * @param {Date} [currentDate] - Optional date to calculate from (defaults to now)
 * @returns {number} The current guitar count as a whole number
 *
 * @example
 * // Get current guitar count
 * const count = getCurrentGuitarCount();
 * console.log(count); // 8000123
 *
 * // Get count for a specific date
 * const specificDate = new Date('2025-07-07T00:00:00Z');
 * const countForDate = getCurrentGuitarCount(specificDate);
 */
export const getCurrentGuitarCount = (currentDate = new Date()) => {
  try {
    // Calculate elapsed time in seconds
    const elapsedMilliseconds = currentDate.getTime() - BASE_DATE.getTime();
    const elapsedSeconds = elapsedMilliseconds / 1000;

    // Handle edge case where current date is before base date
    if (elapsedSeconds < 0) {
      return BASE_COUNT;
    }

    // Calculate current count
    const currentCount = BASE_COUNT + elapsedSeconds * GUITARS_PER_SECOND;

    // Return as whole number
    return Math.floor(currentCount);
  } catch (error) {
    console.error("Error calculating guitar count:", error);
    return BASE_COUNT;
  }
};

/**
 * Formats a guitar count number with comma separators
 *
 * @param {number} count - The guitar count to format
 * @returns {string} The formatted count string with commas
 *
 * @example
 * formatGuitarCount(8000123); // "8,000,123"
 * formatGuitarCount(1234567); // "1,234,567"
 */
export const formatGuitarCount = (count) => {
  try {
    // Handle edge cases
    if (typeof count !== "number" || isNaN(count)) {
      return "0";
    }

    // Format with commas
    return Math.floor(count).toLocaleString("en-US");
  } catch (error) {
    console.error("Error formatting guitar count:", error);
    return "0";
  }
};

/**
 * Converts a formatted guitar count into an array of individual digits/characters
 * for the split-flap display. This includes digits and comma separators.
 *
 * @param {number} count - The guitar count to convert
 * @returns {string[]} Array of individual characters (digits and commas)
 *
 * @example
 * getDigitArray(8000123); // ['8', ',', '0', '0', '0', ',', '1', '2', '3']
 * getDigitArray(1234567); // ['1', ',', '2', '3', '4', ',', '5', '6', '7']
 */
export const getDigitArray = (count) => {
  try {
    // Format the count and split into character array
    const formattedCount = formatGuitarCount(count);
    return formattedCount.split("");
  } catch (error) {
    console.error("Error creating digit array:", error);
    return ["0"];
  }
};

/**
 * Gets the current guitar count and returns it in multiple formats
 * for convenience. This is useful for components that need both
 * the raw count and formatted versions.
 *
 * @param {Date} [currentDate] - Optional date to calculate from (defaults to now)
 * @returns {Object} Object containing count in multiple formats
 * @returns {number} returns.raw - Raw count as number
 * @returns {string} returns.formatted - Formatted count with commas
 * @returns {string[]} returns.digitArray - Array of individual characters
 *
 * @example
 * const guitarData = getGuitarCountData();
 * console.log(guitarData.raw); // 8000123
 * console.log(guitarData.formatted); // "8,000,123"
 * console.log(guitarData.digitArray); // ['8', ',', '0', '0', '0', ',', '1', '2', '3']
 */
export const getGuitarCountData = (currentDate = new Date()) => {
  try {
    const rawCount = getCurrentGuitarCount(currentDate);
    const formattedCount = formatGuitarCount(rawCount);
    const digitArray = getDigitArray(rawCount);

    return {
      raw: rawCount,
      formatted: formattedCount,
      digitArray: digitArray,
    };
  } catch (error) {
    console.error("Error getting guitar count data:", error);
    return {
      raw: BASE_COUNT,
      formatted: formatGuitarCount(BASE_COUNT),
      digitArray: getDigitArray(BASE_COUNT),
    };
  }
};

/**
 * Calculates the expected guitar count at a future date
 * Useful for testing and projections
 *
 * @param {Date} futureDate - The future date to calculate for
 * @returns {number} The projected guitar count
 *
 * @example
 * const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
 * const projectedCount = getProjectedGuitarCount(nextWeek);
 */
export const getProjectedGuitarCount = (futureDate) => {
  return getCurrentGuitarCount(futureDate);
};
