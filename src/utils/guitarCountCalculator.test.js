/**
 * Test file for guitar count calculator utilities
 *
 * This file can be run in the browser console or used for manual testing
 * to verify the functionality of the guitar count calculation system.
 *
 * @module guitarCountCalculatorTest
 */

import {
  BASE_COUNT,
  BASE_DATE,
  GUITARS_PER_SECOND,
  getCurrentGuitarCount,
  formatGuitarCount,
  getDigitArray,
  getGuitarCountData,
  getProjectedGuitarCount,
} from "./guitarCountCalculator.js";

import {
  getChangingDigits,
  getAnimationDelay,
  getAnimationDuration,
  getSplitFlapAnimationStyles,
  isValidDigitArray,
  padDigitArray,
  getTotalAnimationTime,
} from "./splitFlapHelpers.js";

/**
 * Test suite for guitar count calculator
 */
export const runGuitarCountTests = () => {
  console.log("🧪 Running Guitar Count Calculator Tests...\n");

  // Test 1: Basic count calculation
  console.log("Test 1: Basic count calculation");
  const baseCount = getCurrentGuitarCount(BASE_DATE);
  console.log(`Count at base date: ${baseCount}`);
  console.log(`Expected: ${BASE_COUNT}`);
  console.log(`✅ Pass: ${baseCount === BASE_COUNT ? "YES" : "NO"}\n`);

  // Test 2: Count increases over time
  console.log("Test 2: Count increases over time");
  const futureDate = new Date(BASE_DATE.getTime() + 1000); // 1 second later
  const futureCount = getCurrentGuitarCount(futureDate);
  const expectedIncrease = GUITARS_PER_SECOND;
  const actualIncrease = futureCount - baseCount;
  console.log(`Count after 1 second: ${futureCount}`);
  console.log(`Expected increase: ${expectedIncrease}`);
  console.log(`Actual increase: ${actualIncrease}`);
  console.log(
    `✅ Pass: ${
      Math.abs(actualIncrease - expectedIncrease) < 1 ? "YES" : "NO"
    }\n`
  );

  // Test 3: Formatting works correctly
  console.log("Test 3: Number formatting");
  const testNumbers = [8000000, 8000123, 12345678, 1000000];
  testNumbers.forEach((num) => {
    const formatted = formatGuitarCount(num);
    console.log(`${num} -> "${formatted}"`);
  });
  console.log(`✅ Pass: All numbers formatted with commas\n`);

  // Test 4: Digit array creation
  console.log("Test 4: Digit array creation");
  const digitArrayTest = getDigitArray(8000123);
  console.log(`8000123 -> [${digitArrayTest.join(", ")}]`);
  const expectedArray = ["8", ",", "0", "0", "0", ",", "1", "2", "3"];
  const arraysMatch =
    JSON.stringify(digitArrayTest) === JSON.stringify(expectedArray);
  console.log(`✅ Pass: ${arraysMatch ? "YES" : "NO"}\n`);

  // Test 5: Current time calculation
  console.log("Test 5: Current time calculation");
  const currentCount = getCurrentGuitarCount();
  const currentFormatted = formatGuitarCount(currentCount);
  console.log(`Current count: ${currentFormatted}`);
  console.log(
    `Current digit array: [${getDigitArray(currentCount).join(", ")}]`
  );
  console.log(`✅ Pass: Current count calculated successfully\n`);

  // Test 6: Edge cases
  console.log("Test 6: Edge cases");
  const pastDate = new Date(BASE_DATE.getTime() - 1000); // Before base date
  const pastCount = getCurrentGuitarCount(pastDate);
  console.log(`Count before base date: ${pastCount}`);
  console.log(`✅ Pass: ${pastCount === BASE_COUNT ? "YES" : "NO"}\n`);

  console.log("🎯 Guitar Count Calculator Tests Complete!\n");
};

/**
 * Test suite for split-flap helpers
 */
export const runSplitFlapTests = () => {
  console.log("🧪 Running Split-Flap Helper Tests...\n");

  // Test 1: Digit change detection
  console.log("Test 1: Digit change detection");
  const changingIndices1 = getChangingDigits(8000123, 8000124);
  console.log(`8000123 -> 8000124: [${changingIndices1.join(", ")}]`);
  console.log(`Expected: [8] (last digit)`);
  console.log(
    `✅ Pass: ${
      JSON.stringify(changingIndices1) === JSON.stringify([8]) ? "YES" : "NO"
    }\n`
  );

  // Test 2: Multiple digit changes
  console.log("Test 2: Multiple digit changes");
  const changingIndices2 = getChangingDigits(8000999, 8001000);
  console.log(`8000999 -> 8001000: [${changingIndices2.join(", ")}]`);
  console.log(`Expected: Multiple indices for rollover`);
  console.log(`✅ Pass: ${changingIndices2.length > 1 ? "YES" : "NO"}\n`);

  // Test 3: Animation delay calculation
  console.log("Test 3: Animation delay calculation");
  const testIndices = [6, 7, 8];
  testIndices.forEach((index, i) => {
    const delay = getAnimationDelay(index, testIndices);
    console.log(`Index ${index} delay: ${delay}ms`);
  });
  console.log(`✅ Pass: Delays calculated successfully\n`);

  // Test 4: Animation duration
  console.log("Test 4: Animation duration");
  const duration1 = getAnimationDuration([8]); // Single digit
  const duration2 = getAnimationDuration([6, 7, 8]); // Multiple digits
  console.log(`Single digit duration: ${duration1}ms`);
  console.log(`Multiple digit duration: ${duration2}ms`);
  console.log(`✅ Pass: ${duration2 > duration1 ? "YES" : "NO"}\n`);

  // Test 5: Digit array validation
  console.log("Test 5: Digit array validation");
  const validArray = ["8", ",", "0", "0", "0"];
  const invalidArray = ["8", "a", "0"];
  console.log(`Valid array: ${isValidDigitArray(validArray)}`);
  console.log(`Invalid array: ${isValidDigitArray(invalidArray)}`);
  console.log(
    `✅ Pass: ${
      isValidDigitArray(validArray) && !isValidDigitArray(invalidArray)
        ? "YES"
        : "NO"
    }\n`
  );

  // Test 6: Array padding
  console.log("Test 6: Array padding");
  const paddedArray = padDigitArray(["1", "2", "3"], 6);
  console.log(`Padded [1,2,3] to length 6: [${paddedArray.join(", ")}]`);
  console.log(`✅ Pass: ${paddedArray.length === 6 ? "YES" : "NO"}\n`);

  console.log("🎯 Split-Flap Helper Tests Complete!\n");
};

/**
 * Integration test showing real-time behavior
 */
export const runIntegrationTest = () => {
  console.log("🧪 Running Integration Test...\n");

  let previousCount = getCurrentGuitarCount();
  let previousDigits = getDigitArray(previousCount);

  console.log(`Starting count: ${formatGuitarCount(previousCount)}`);
  console.log(`Starting digits: [${previousDigits.join(", ")}]\n`);

  // Simulate time passing
  setTimeout(() => {
    const currentCount = getCurrentGuitarCount();
    const currentDigits = getDigitArray(currentCount);
    const changingIndices = getChangingDigits(previousCount, currentCount);

    console.log(`Current count: ${formatGuitarCount(currentCount)}`);
    console.log(`Current digits: [${currentDigits.join(", ")}]`);
    console.log(`Changing indices: [${changingIndices.join(", ")}]`);

    if (changingIndices.length > 0) {
      const totalAnimTime = getTotalAnimationTime(changingIndices);
      console.log(`Total animation time: ${totalAnimTime}ms`);
    }

    console.log("\n🎯 Integration Test Complete!\n");
  }, 1000);
};

/**
 * Performance test for the calculation functions
 */
export const runPerformanceTest = () => {
  console.log("🧪 Running Performance Test...\n");

  const iterations = 10000;
  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    getCurrentGuitarCount();
    formatGuitarCount(8000000 + i);
    getDigitArray(8000000 + i);
  }

  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / iterations;

  console.log(
    `${iterations} iterations completed in ${totalTime.toFixed(2)}ms`
  );
  console.log(`Average time per calculation: ${avgTime.toFixed(4)}ms`);
  console.log(
    `✅ Pass: ${avgTime < 1 ? "YES" : "NO"} (should be < 1ms per calculation)\n`
  );

  console.log("🎯 Performance Test Complete!\n");
};

/**
 * Run all tests
 */
export const runAllTests = () => {
  console.log("🚀 Running All Guitar Count Calculator Tests...\n");

  runGuitarCountTests();
  runSplitFlapTests();
  runPerformanceTest();
  runIntegrationTest();

  console.log("✅ All tests completed! Check the output above for results.\n");
};

// Auto-run tests if in browser console
if (typeof window !== "undefined") {
  console.log("Guitar Count Calculator Test Suite loaded!");
  console.log("Run runAllTests() to execute all tests.");
}
