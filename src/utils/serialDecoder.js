// Basic serial number decoder logic for major guitar brands
// This is simplified for MVP - real implementations would be more complex

export const decodeFenderSerial = (serial) => {
  const upperSerial = serial.toUpperCase();

  // Modern Fender serials often start with letters indicating country/year
  if (upperSerial.startsWith("US") || upperSerial.startsWith("Z")) {
    const yearDigits = upperSerial.match(/\d{1,2}/);
    if (yearDigits) {
      const year = parseInt(yearDigits[0]);
      return {
        years: [`20${year.toString().padStart(2, "0")}`],
        country: "USA",
        confidence: "High",
        rule: "US/Z prefix indicates American-made, followed by year digits",
      };
    }
  }

  if (upperSerial.startsWith("MX")) {
    const yearDigits = upperSerial.match(/\d{1,2}/);
    if (yearDigits) {
      const year = parseInt(yearDigits[0]);
      return {
        years: [`20${year.toString().padStart(2, "0")}`],
        country: "Mexico",
        confidence: "High",
        rule: "MX prefix indicates Mexican-made, followed by year digits",
      };
    }
  }

  // Check if it needs clarification
  if (/^[0-9]+$/.test(serial) && serial.length >= 6) {
    return {
      needsClarification: true,
      question: "Where is your serial number located?",
      options: ["On the headstock", "On the neck plate", "Inside the body"],
      reason: "All-numeric serials need location info to determine era",
    };
  }

  return {
    years: ["Unknown"],
    country: "Unknown",
    confidence: "Low",
    rule: "Serial format not recognized in our database",
  };
};

export const decodeGibsonSerial = (serial) => {
  const upperSerial = serial.toUpperCase();

  // Modern Gibson serials: YY DDD Y PPP
  if (serial.length === 9 && /^\d{9}$/.test(serial)) {
    const yearCode = serial.substring(0, 2);
    const year = 2000 + parseInt(yearCode);
    return {
      years: [year.toString()],
      country: "USA",
      confidence: "High",
      rule: "9-digit format: first 2 digits indicate year after 2000",
    };
  }

  // 8-digit serials from 1977-2013
  if (serial.length === 8 && /^\d{8}$/.test(serial)) {
    return {
      needsClarification: true,
      question: "What is the first digit of your serial number?",
      options: ["0-3", "4-6", "7-9"],
      reason:
        "8-digit serials span multiple decades, first digit helps narrow down",
    };
  }

  return {
    years: ["Unknown"],
    country: "Unknown",
    confidence: "Low",
    rule: "Serial format not recognized in our database",
  };
};

export const decodeMartinSerial = (serial) => {
  // Martin uses sequential numbering
  const numericSerial = parseInt(serial);

  if (!isNaN(numericSerial)) {
    if (numericSerial >= 2500000) {
      return {
        years: ["2019-2024"],
        country: "USA",
        confidence: "Medium",
        rule: "Serial numbers above 2,500,000 indicate recent production",
      };
    } else if (numericSerial >= 2000000) {
      return {
        years: ["2009-2018"],
        country: "USA",
        confidence: "Medium",
        rule: "Serial numbers 2,000,000-2,500,000 indicate 2009-2018 production",
      };
    } else if (numericSerial >= 1000000) {
      return {
        years: ["1994-2008"],
        country: "USA",
        confidence: "Medium",
        rule: "Serial numbers 1,000,000-2,000,000 indicate 1994-2008 production",
      };
    }
  }

  return {
    needsClarification: true,
    question: "Does your Martin have any letter prefix before the numbers?",
    options: ["Yes", "No"],
    reason:
      "Letter prefixes can indicate special models or different dating systems",
  };
};

// Main decoder function
export const decodeSerial = (brand, serial) => {
  if (!brand || !serial) {
    return {
      error: "Missing brand or serial number",
    };
  }

  switch (brand) {
    case "fender":
      return decodeFenderSerial(serial);
    case "gibson":
      return decodeGibsonSerial(serial);
    case "martin":
      return decodeMartinSerial(serial);
    default:
      // For other brands, return a generic clarification
      return {
        needsClarification: true,
        question: "What type of guitar is this?",
        options: ["Electric", "Acoustic", "Bass"],
        reason: "This helps us use the correct dating system for your brand",
      };
  }
};

// Process clarification answers
export const processClarification = (brand, serial, answer) => {
  // This is simplified - real implementation would be more complex
  const baseResult = {
    years: ["2000-2024"],
    country: "Various",
    confidence: "Low",
    model: "Unable to determine specific model",
    rule: "Clarification helped narrow down possibilities",
  };

  if (brand === "fender" && answer === "On the neck plate") {
    return {
      ...baseResult,
      years: ["1954-1976"],
      country: "USA",
      confidence: "Medium",
      rule: "Neck plate serials typically indicate vintage era Fenders",
    };
  }

  if (brand === "gibson" && answer === "7-9") {
    return {
      ...baseResult,
      years: ["1993-2003"],
      country: "USA",
      confidence: "Medium",
      rule: "8-digit serials starting with 7-9 indicate 1990s-early 2000s",
    };
  }

  return baseResult;
};
