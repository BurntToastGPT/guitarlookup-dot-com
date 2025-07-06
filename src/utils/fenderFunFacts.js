import fenderFunFacts from "../data/fender_fun_facts.json" with { type: "json" };

/**
 * Get appropriate fun facts based on the guitar's year
 * @param {number} year - The year of the guitar
 * @returns {Object|null} - Returns { fact, source, period } or null if no facts found
 */
export function getFenderFunFact(year) {
  // Input validation
  if (
    !year ||
    typeof year !== "number" ||
    year < 1950 ||
    year > new Date().getFullYear()
  ) {
    return null;
  }

  // First, look for year-specific facts
  const yearSpecificFacts = fenderFunFacts.filter(
    (factObj) => factObj.year === year
  );

  if (yearSpecificFacts.length > 0) {
    // If multiple year-specific facts exist, randomly select one
    const selectedFact =
      yearSpecificFacts[Math.floor(Math.random() * yearSpecificFacts.length)];
    return {
      fact: selectedFact.fact,
      source: selectedFact.source,
      period: "year-specific",
    };
  }

  // If no year-specific fact, look for decade-level facts
  const decade = Math.floor(year / 10) * 10; // Convert year to decade (e.g., 1976 -> 1970)
  const decadeFacts = fenderFunFacts.filter(
    (factObj) => factObj.decade === decade
  );

  if (decadeFacts.length > 0) {
    // Randomly select one fact from available decade facts
    const selectedFact =
      decadeFacts[Math.floor(Math.random() * decadeFacts.length)];
    return {
      fact: selectedFact.fact,
      source: selectedFact.source,
      period: "decade-specific",
    };
  }

  // No relevant facts found
  return null;
}

/**
 * Get all available years and decades that have fun facts
 * @returns {Object} - Returns { years: Array, decades: Array }
 */
export function getAvailableFunFactPeriods() {
  const years = [];
  const decades = [];

  fenderFunFacts.forEach((factObj) => {
    if (factObj.year && !years.includes(factObj.year)) {
      years.push(factObj.year);
    }
    if (factObj.decade && !decades.includes(factObj.decade)) {
      decades.push(factObj.decade);
    }
  });

  return {
    years: years.sort((a, b) => a - b),
    decades: decades.sort((a, b) => a - b),
  };
}

/**
 * Get all fun facts for a specific period (for testing/debugging)
 * @param {number} year - The year to get facts for
 * @returns {Array} - Array of all matching facts
 */
export function getAllFunFactsForYear(year) {
  if (!year || typeof year !== "number") {
    return [];
  }

  const yearFacts = fenderFunFacts.filter((factObj) => factObj.year === year);
  const decade = Math.floor(year / 10) * 10;
  const decadeFacts = fenderFunFacts.filter(
    (factObj) => factObj.decade === decade
  );

  return [...yearFacts, ...decadeFacts];
}
