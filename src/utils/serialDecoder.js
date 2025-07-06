// Serial number decoder logic for major guitar brands
import gibsonRules from "../data/gibson_serial_rules.json";

// Helper function to replace [serial_number] placeholder in text
const replacePlaceholder = (text, serial) => {
  if (!text) return text;
  return text.replace(/\[serial_number\]/g, serial);
};

// Helper function to calculate exact date from day of year
const getDateFromDayOfYear = (year, dayOfYear) => {
  try {
    // Validate inputs
    if (!year || !dayOfYear || dayOfYear < 1 || dayOfYear > 366) {
      console.warn("Invalid date parameters:", { year, dayOfYear });
      return null;
    }

    const date = new Date(year, 0); // January 1st
    date.setDate(dayOfYear);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn("Invalid date created:", { year, dayOfYear });
      return null;
    }

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthIndex = date.getMonth();
    if (monthIndex < 0 || monthIndex >= months.length) {
      console.warn("Invalid month index:", monthIndex);
      return null;
    }

    return {
      month: months[monthIndex],
      day: date.getDate(),
      year: year,
    };
  } catch (error) {
    console.error("Error in getDateFromDayOfYear:", error, { year, dayOfYear });
    return null;
  }
};

// Helper function to extract year info from rule answers
const extractYearFromAnswer = (answer, serial) => {
  if (!answer) return null;

  // Look for patterns like [year], [YY], [YYYY], etc.
  const yearPatterns = [
    /20\[YY\]/g,
    /19\[YY\]/g,
    /19\[MM\]/g,
    /\[year\]/g,
    /\[YYYY\]/g,
  ];

  let processedAnswer = answer;

  // Extract actual year values from serial if possible
  if (serial.length === 8 && /^\d{8}$/.test(serial)) {
    const yearDigit = serial[0];
    const decade = yearDigit >= "7" ? "197" : "188";
    processedAnswer = processedAnswer.replace(/\[year\]/g, decade + yearDigit);
  } else if (serial.length === 9 && /^\d{9}$/.test(serial)) {
    const yearCode = serial.substring(0, 2);
    const year = 2000 + parseInt(yearCode);
    processedAnswer = processedAnswer.replace(/\[year\]/g, year.toString());
  }

  return processedAnswer;
};

// Helper function to convert a serial number to a placeholder pattern
const serialToPlaceholderPattern = (serial) => {
  // This function converts a serial like "B123456" to "A000000"
  // or "CS12345" to "CSXXXXX", etc.

  let pattern = "";
  let i = 0;

  while (i < serial.length) {
    const char = serial[i];

    // Check for specific prefixes first
    if (i === 0) {
      // Check for multi-character prefixes
      const twoChar = serial.substring(0, 2).toUpperCase();
      const threeChar = serial.substring(0, 3).toUpperCase();

      if (twoChar === "CS") {
        pattern += "CS";
        i += 2;
        continue;
      } else if (twoChar === "PF") {
        pattern += "PF";
        i += 2;
        continue;
      } else if (threeChar === "250") {
        pattern += "250";
        i += 3;
        continue;
      }
    }

    // Handle spaces
    if (char === " " || char === "-") {
      pattern += "_";
    }
    // Handle letters
    else if (/[A-Za-z]/.test(char)) {
      // For single letters in patterns, use the position-based placeholder
      if (i === 0 && serial.length > 1 && !/[A-Za-z]/.test(serial[1])) {
        // First character is a letter followed by non-letter = single letter prefix
        pattern += "Z"; // Using Z as placeholder for single letter prefix
      } else if (
        i === serial.length - 1 &&
        i > 0 &&
        !/[A-Za-z]/.test(serial[i - 1])
      ) {
        // Last character is a letter preceded by non-letter = letter suffix
        pattern += "A"; // Using A as placeholder for letter suffix
      } else {
        // Generic letter
        pattern += char.toUpperCase();
      }
    }
    // Handle digits
    else if (/\d/.test(char)) {
      // Look ahead to see if this is part of a specific year pattern
      if (i === 0 && serial.length >= 8) {
        const firstTwo = serial.substring(0, 2);
        if (
          firstTwo === "94" ||
          firstTwo === "99" ||
          firstTwo === "00" ||
          firstTwo === "06"
        ) {
          // These are specific year prefixes in the patterns
          pattern += firstTwo;
          i += 2;
          continue;
        }
      }

      // For year-based patterns, check if it's a year digit in specific positions
      if (i === 0 && serial.length > 4 && /\d\s\d{4}/.test(serial)) {
        // Pattern like "Y XXXX" - first digit is year
        pattern += "Y";
      } else if (i === 0 && serial.length === 8 && /^\d{8}$/.test(serial)) {
        // 8-digit pattern where first digit might be year
        pattern += "Y";
      } else {
        pattern += "0";
      }
    }

    i++;
  }

  return pattern;
};

// Helper function to match a serial against a pattern description
const matchesPattern = (serial, patternDescription) => {
  // Extract the pattern part before the "–"
  const patternMatch = patternDescription.match(/^([^–]+)(?:\s*–)/);
  if (!patternMatch) return false;

  const patternPart = patternMatch[1].trim();

  // Handle special cases
  if (patternPart.includes(" or ")) {
    // Multiple patterns separated by "or"
    const patterns = patternPart.split(" or ").map((p) => p.trim());
    return patterns.some((p) => matchesPatternSingle(serial, p));
  }

  return matchesPatternSingle(serial, patternPart);
};

// Helper function to match a serial against a single pattern
const matchesPatternSingle = (serial, pattern) => {
  const upperSerial = serial.toUpperCase();

  // Direct pattern matching for specific formats

  // Handle range patterns like "000001-099999"
  if (pattern.includes("-") && /^\d+-\d+$/.test(pattern.replace(/,/g, ""))) {
    const [start, end] = pattern.split("-").map((p) => parseInt(p));
    const serialNum = parseInt(serial);
    return !isNaN(serialNum) && serialNum >= start && serialNum <= end;
  }

  // XXXX or XXXXX patterns (3-5 digits)
  if (pattern === "XXXX" && /^\d{4}$/.test(serial)) return true;
  if (pattern === "XXXXX" && /^\d{5}$/.test(serial)) return true;
  if (pattern === "XXXXXX" && /^\d{6}$/.test(serial)) return true;

  // Letter + digits patterns
  if (pattern === "XXXXA" && /^\d{4}[A-Z]$/i.test(serial)) return true;
  if (pattern === "ZXXXX_XX" && /^[A-Z]\d{4}[\s\-_]\d{2}$/i.test(serial))
    return true;
  if (pattern === "A_XXXX" && /^A[\s\-_]\d{4}$/i.test(serial)) return true;

  // Year patterns
  if (pattern === "Y_XXXX" && /^\d[\s\-_]\d{4}$/i.test(serial)) return true;
  if (pattern === "Y_XXXXX" && /^\d[\s\-_]\d{5}$/i.test(serial)) return true;

  // 8-digit patterns
  if (pattern === "YDDDYRRR" && /^\d{8}$/.test(serial)) {
    // Check if it matches the strict YDDDYRRR format (positions 0 and 4 match)
    if (serial[0] === serial[4]) {
      return true;
    }

    // Also accept 8-digit serials that could be valid Gibson serials
    // but don't match the strict pattern (like 20560089)
    // These could be alternative formats or transition periods
    const firstTwo = serial.substring(0, 2);
    if (firstTwo === "20" || firstTwo === "19" || firstTwo === "18") {
      // Could be year-based format
      return true;
    }

    // Fallback: accept any 8-digit number for YDDDYRRR pattern
    // This ensures we don't reject legitimate Gibson serials
    return true;
  }
  if (
    pattern === "99XXXXXX" &&
    serial.startsWith("99") &&
    /^\d{8}$/.test(serial)
  )
    return true;
  if (
    pattern === "00XXXXXX" &&
    serial.startsWith("00") &&
    /^\d{8}$/.test(serial)
  )
    return true;
  if (
    pattern === "06XXXXXX" &&
    serial.startsWith("06") &&
    /^\d{8}$/.test(serial)
  )
    return true;

  // 9-digit patterns
  if (pattern === "YDDDYBRRR" && /^\d{9}$/.test(serial)) {
    // Check if it's a valid 2005-2014 format
    // The pattern is more complex than just matching positions
    const firstDigit = serial[0];
    const fifthDigit = serial[4];

    // For 2005-2014 format, we need to check if it makes sense as a date
    const dayOfYear = parseInt(serial.substring(0, 4));
    const potentialYear = parseInt(serial.substring(4, 5));

    // Day of year should be valid (1-366)
    if (dayOfYear >= 1 && dayOfYear <= 366) {
      // This could be a valid format where day comes first
      return true;
    }

    // Original format where year digit is at positions 0 and 4
    return firstDigit === fifthDigit;
  }

  // 10-digit pattern
  if (pattern === "YYMMDDFFFF" && /^\d{10}$/.test(serial)) return true;

  // Les Paul Classic patterns
  if (pattern === "YYXXXX" && /^\d{6}$/.test(serial)) {
    const year = parseInt(serial.substring(0, 2));
    return year >= 0 && year <= 99;
  }

  // Custom Shop patterns
  if (pattern === "YYRRRM" && /^\d{5}[A-Z]$/i.test(serial)) return true;
  if (pattern === "(A_or_B)-MYRRR" && /^[AB][\-]\d[A-Z]\d{3}$/i.test(serial))
    return true;
  if (pattern === "CSYRRRR" && /^CS\d{5}$/i.test(serial)) return true;
  if (pattern === "M_YRRR" && /^[A-Z][\s\-_]\d{4}$/i.test(serial)) return true;
  if (pattern === "MYRRRR" && /^[A-Z]\d{5}$/i.test(serial)) return true;

  // Other patterns
  if (pattern === "PF_XXX" && /^PF[\s\-_]\d{3}$/i.test(serial)) return true;
  if (pattern === "PFYXXX" && /^PF\d{4}$/i.test(serial)) return true;
  if (pattern === "250-TT-RR" && /^250[\-]\d{2}[\-]\d{2}$/i.test(serial))
    return true;
  if (
    pattern === "S(S)-YYMM-RR" &&
    /^[A-Z]{1,2}[\-]\d{4}[\-]\d{2}$/i.test(serial)
  )
    return true;

  return false;
};

export const decodeFenderSerial = (serial) => {
  const upperSerial = serial.toUpperCase();

  // Helper function to extract year from letter+digit patterns
  const extractYearFromLetterSerial = (serial, startIndex = 1) => {
    const yearMatch = serial.substring(startIndex).match(/^(\d{1,2})/);
    if (yearMatch) {
      let year = parseInt(yearMatch[1]);
      // For 1-digit years, assume 2000s for 0-9
      if (year < 10 && yearMatch[1].length === 1) {
        year = 2000 + year;
      }
      // For 2-digit years, handle century logic
      else if (year < 100) {
        // Years 50-99 are 1950s-1990s, 00-49 are 2000s-2040s
        year = year >= 50 ? 1900 + year : 2000 + year;
      }
      return year;
    }
    return null;
  };

  // Japanese Serial Detection - Check first to avoid false positives
  const japanesePatterns = [
    /^JV/, // Japanese Vintage series
    /^SQ/, // Squier Japan
    /^E\d/, // Export models (could be Japanese)
    /^A\d/, // Could be Japanese (Aria, etc.)
    /^JD/, // Japanese Domestic
    /^CIJ/, // Crafted in Japan
    /^MIJ/, // Made in Japan
    /^T\d/, // Terada (Japanese manufacturer)
    /^O\d/, // Could be Japanese Orville
    /^P\d{6}/, // Some Japanese serials start with P + 6 digits
  ];

  // Check if serial matches Japanese patterns
  const looksJapanese = japanesePatterns.some((pattern) =>
    pattern.test(upperSerial)
  );

  if (looksJapanese) {
    return {
      years: ["Unknown"],
      country: "Japan",
      confidence: "High",
      rule: "This looks like a Japanese Fender serial number. Sorry, we can't date those yet! Click the button above for tips on identifying Japanese Fenders.",
      isJapanese: true,
    };
  }

  // US/Corona post-1976 patterns (letter + digits)
  // Common US prefixes: S, E, N, Z, US, DZ, etc.
  const usPatterns = [
    /^(S|E|N|Z|DZ|US)(\d{1,2})/, // Single or double letter + 1-2 digits
    /^(CD|CN|CO|CZ)(\d{1,2})/, // Corona plant codes
    /^(V|R|T|B)(\d{1,2})/, // Other US prefix patterns
  ];

  for (const pattern of usPatterns) {
    const match = upperSerial.match(pattern);
    if (match) {
      const prefix = match[1];
      const yearDigits = match[2];
      let year = parseInt(yearDigits);

      // Handle year logic for US serials
      if (yearDigits.length === 1) {
        // Single digit: 0-9 typically means 2000s
        year = 2000 + year;
      } else if (yearDigits.length === 2) {
        // Two digits: 76-99 = 1976-1999, 00-49 = 2000-2049
        year = year >= 76 ? 1900 + year : 2000 + year;
      }

      return {
        years: [year.toString()],
        country: "USA",
        confidence: "High",
        rule: `${prefix} prefix indicates US-made Fender from Corona plant, year: ${year}`,
        plantCode: prefix,
        decodedValues: {
          "Plant Code": prefix,
          Year: year.toString(),
          Location: "Corona, California, USA",
        },
      };
    }
  }

  // Mexico post-1990 patterns (MN/MZ/MX prefixes)
  const mexicanPatterns = [
    /^(MN|MZ|MX)(\d{1,2})/, // Standard Mexican prefixes
    /^(MA|MC|MD|ME|MF|MG|MH|MI|MJ|MK|ML|MM|MO|MP|MQ|MR|MS|MT|MU|MV|MW|MY)(\d{1,2})/, // Extended Mexican codes
  ];

  for (const pattern of mexicanPatterns) {
    const match = upperSerial.match(pattern);
    if (match) {
      const prefix = match[1];
      const yearDigits = match[2];
      let year = parseInt(yearDigits);

      // Mexican serials started in 1990, so adjust year logic
      if (yearDigits.length === 1) {
        // Single digit: assume 1990s-2000s
        year = year >= 0 && year <= 9 ? 2000 + year : 1990 + year;
      } else if (yearDigits.length === 2) {
        // Two digits: 90-99 = 1990-1999, 00-49 = 2000-2049
        year = year >= 90 ? 1900 + year : 2000 + year;
      }

      return {
        years: [year.toString()],
        country: "Mexico",
        confidence: "High",
        rule: `${prefix} prefix indicates Mexican-made Fender from Ensenada plant, year: ${year}`,
        plantCode: prefix,
        decodedValues: {
          "Plant Code": prefix,
          Year: year.toString(),
          Location: "Ensenada, Mexico",
        },
      };
    }
  }

  // Pre-1976 all-numeric serials - need location clarification
  if (/^[0-9]+$/.test(serial) && serial.length >= 4) {
    return {
      needsClarification: true,
      question: "Where is your serial number located?",
      options: [
        "On the headstock (front or back)",
        "On the neck plate (back of guitar)",
        "Inside the body (f-hole or pickup cavity)",
        "On the neck heel",
      ],
      reason:
        "All-numeric serials can be from different eras depending on location. This helps us determine the correct dating system.",
      serialType: "all-numeric",
    };
  }

  // Check for other recognizable but unsupported patterns
  const otherPatterns = [
    /^[A-Z]{3,4}\d/, // 3-4 letter prefix + digits (could be import)
    /^[A-Z]\d{7,8}/, // Single letter + 7-8 digits (could be import)
    /^\d{4}[A-Z]/, // 4 digits + letter (could be special format)
  ];

  for (const pattern of otherPatterns) {
    if (pattern.test(upperSerial)) {
      return {
        years: ["Unknown"],
        country: "Unknown",
        confidence: "Low",
        rule: "This serial format is recognized but not yet supported in our database. It may be from an import model or special series.",
        needsResearch: true,
      };
    }
  }

  // Invalid or unrecognized format
  return {
    years: ["Unknown"],
    country: "Unknown",
    confidence: "Low",
    rule: "This serial format is not recognized in our database. Please double-check the serial number or contact Fender directly.",
    error: true,
  };
};

// Helper function to parse specific serial formats for detailed decoding
const parseGibsonSerialFormat = (serial, rule) => {
  const pattern = rule.pattern_description;

  // 8-digit YDDDYRRR format (1977-2005)
  if (pattern.includes("YDDDYRRR") && /^\d{8}$/.test(serial)) {
    // First try the strict YDDDYRRR format where positions 0 and 4 match
    if (serial[0] === serial[4]) {
      const yearDigit = serial[0];
      const dayOfYear = serial.substring(1, 4);
      const factoryRanking = serial.substring(5, 8);

      let year;
      if (yearDigit >= "7" && yearDigit <= "9") {
        year = `197${yearDigit}`;
      } else if (yearDigit >= "0" && yearDigit <= "5") {
        year = `200${yearDigit}`;
      } else {
        year = `198${yearDigit}`;
      }

      const exactDate = getDateFromDayOfYear(
        parseInt(year),
        parseInt(dayOfYear)
      );

      return {
        type: "8-digit impressed",
        year: year,
        exactDate: exactDate,
        dayOfYear: parseInt(dayOfYear),
        factoryRanking: parseInt(factoryRanking),
        decodedInfo: {
          Format: "8-digit impressed (YDDDYRRR)",
          Year: year,
          "Production day": `${dayOfYear} (${
            exactDate
              ? exactDate.month + " " + exactDate.day
              : "Day " + dayOfYear
          })`,
          "Daily production sequence": factoryRanking,
        },
      };
    }

    // Handle 8-digit serials that don't match strict YDDDYRRR but could be valid Gibson serials
    // Like "20560089" which might be an alternative format
    const firstTwo = serial.substring(0, 2);
    if (firstTwo === "20" || firstTwo === "19" || firstTwo === "18") {
      // Could be a year-based format: 20560089 might be from 2005
      let possibleYear;
      if (firstTwo === "20") {
        possibleYear = "2005"; // Assuming 20 prefix indicates 2005
      } else if (firstTwo === "19") {
        possibleYear = "1995"; // Or similar interpretation
      } else if (firstTwo === "18") {
        possibleYear = "1985";
      }

      const sequenceNumber = serial.substring(2);

      return {
        type: "8-digit alternative format",
        year: possibleYear,
        sequenceNumber: parseInt(sequenceNumber),
        decodedInfo: {
          Format: "8-digit (alternative format)",
          Year: possibleYear,
          "Production sequence": sequenceNumber,
          Note: "This format doesn't match the standard YDDDYRRR pattern but appears to be a valid Gibson serial",
        },
      };
    }

    // Fallback for other 8-digit serials
    return {
      type: "8-digit impressed",
      year: "Unknown",
      decodedInfo: {
        Format: "8-digit (format uncertain)",
        "Serial number": serial,
        Note: "8-digit Gibson serial number - exact format unclear",
      },
    };
  }

  // 9-digit YDDDYBRRR format (2005-2014)
  if (pattern.includes("YDDDYBRRR") && /^\d{9}$/.test(serial)) {
    try {
      // Check both possible formats
      // Format 1: YDDDYBRRR where Y is at positions 0 and 4
      if (serial[0] === serial[4]) {
        const yearDigit = serial[0];
        const dayOfYear = serial.substring(1, 4);
        const batchNumber = serial[5];
        const ranking = serial.substring(6);

        let year;
        if (yearDigit === "5") year = "2005";
        else if (yearDigit >= "6" && yearDigit <= "9") year = `200${yearDigit}`;
        else if (yearDigit >= "0" && yearDigit <= "4") year = `201${yearDigit}`;

        const exactDate = getDateFromDayOfYear(
          parseInt(year),
          parseInt(dayOfYear)
        );

        // Build result with defensive checks
        const result = {
          type: "9-digit impressed",
          year: year || "Unknown",
          exactDate: exactDate,
          dayOfYear: parseInt(dayOfYear) || 0,
          batchNumber: parseInt(batchNumber) || 0,
          sequenceNumber: parseInt(ranking) || 0,
          productionNumber: parseInt(ranking) || 0,
          decodedInfo: {
            Format: "9-digit impressed (YDDDYBRRR)",
            Year: year || "Unknown",
            "Production day": exactDate
              ? `${dayOfYear} (${exactDate.month} ${exactDate.day})`
              : `Day ${dayOfYear}`,
            Batch: batchNumber || "Unknown",
            "Production Number": ranking || "Unknown",
          },
        };

        return result;
      }

      // Format 2: DDDYYBRRR where DDD is day, YY is year position 4
      const dayOfYear = parseInt(serial.substring(0, 4));
      if (dayOfYear >= 1 && dayOfYear <= 366) {
        const yearDigit = serial[4];
        const batchNumber = serial[5];
        const ranking = serial.substring(6);

        let year;
        if (yearDigit === "5") year = "2005";
        else if (yearDigit >= "6" && yearDigit <= "9") year = `200${yearDigit}`;
        else if (yearDigit >= "0" && yearDigit <= "4") year = `201${yearDigit}`;

        const exactDate = getDateFromDayOfYear(parseInt(year), dayOfYear);

        // Determine factory for Nashville plant
        let factory = "Nashville Plant, TN, USA";

        const result = {
          type: "9-digit impressed",
          year: year || "Unknown",
          exactDate: exactDate,
          dayOfYear: dayOfYear || 0,
          batchNumber: parseInt(batchNumber) || 0,
          sequenceNumber: parseInt(ranking) || 0,
          productionNumber: parseInt(ranking) || 0,
          factory: factory,
          decodedInfo: {
            Format: "9-digit impressed",
            Year: year || "Unknown",
            "Production day": exactDate
              ? `Day ${dayOfYear} (${exactDate.month} ${exactDate.day})`
              : `Day ${dayOfYear}`,
            Factory: factory,
            Batch: batchNumber || "Unknown",
            "Production Number": ranking || "Unknown",
          },
        };
        console.log("Decoded 9-digit result:", result);
        return result;
      }
    } catch (error) {
      console.error("Error parsing 9-digit Gibson serial:", error, {
        serial,
        pattern,
      });
      // Return a basic result instead of crashing
      return {
        type: "9-digit impressed",
        year: "Unknown",
        exactDate: null,
        dayOfYear: 0,
        batchNumber: 0,
        sequenceNumber: 0,
        productionNumber: 0,
        factory: "Nashville Plant, TN, USA",
        decodedInfo: {
          Format: "9-digit impressed (parsing error)",
          Year: "Unknown",
          "Production day": "Unable to parse",
          Factory: "Nashville Plant, TN, USA",
          Batch: "Unknown",
          "Production Number": "Unknown",
        },
      };
    }
  }

  // 10-digit YYMMDDFFFF format (2014-Present)
  if (pattern.includes("YYMMDDFFFF") && /^\d{10}$/.test(serial)) {
    const year = `20${serial.substring(0, 2)}`;
    const month = parseInt(serial.substring(2, 4));
    const day = parseInt(serial.substring(4, 6));
    const factoryOrder = serial.substring(6);

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return {
      type: "10-digit modern",
      year: year,
      exactDate: {
        month: months[month - 1],
        day: day,
        year: parseInt(year),
      },
      factoryOrder: parseInt(factoryOrder),
      decodedInfo: {
        Format: "10-digit (YYMMDDFFFF)",
        Year: year,
        "Production date": `${months[month - 1]} ${day}, ${year}`,
        "Factory order number": factoryOrder,
      },
    };
  }

  // 8-digit decal (1975-1977)
  if (
    (pattern.includes("99XXXXXX") ||
      pattern.includes("00XXXXXX") ||
      pattern.includes("06XXXXXX")) &&
    /^\d{8}$/.test(serial)
  ) {
    const yearCode = serial.substring(0, 2);
    let year;
    if (yearCode === "99") year = "1975";
    else if (yearCode === "00") year = "1976";
    else if (yearCode === "06") year = "1977";

    return {
      type: "8-digit decal",
      year: year,
      decodedInfo: {
        Format: "8-digit decal/sticker",
        Year: year,
        "Production sequence": serial.substring(2),
      },
    };
  }

  // Custom Shop format
  if (pattern.includes("CSYRRRR") && /^CS\d{5}$/i.test(serial)) {
    return {
      type: "custom shop",
      yearDigit: serial[2],
      sequenceNumber: serial.substring(3),
      decodedInfo: {
        Format: "Custom Shop (CS prefix)",
        "Year digit": serial[2],
        "Production sequence": serial.substring(3),
      },
    };
  }

  // Les Paul Classic format
  if (
    (pattern.includes("Y_XXXX") || pattern.includes("YYXXXX")) &&
    (/^\d\s\d{4}$/.test(serial) || /^\d{6}$/.test(serial))
  ) {
    let year, sequence;
    if (serial.includes(" ")) {
      const parts = serial.split(" ");
      const yearDigit = parts[0];
      year = yearDigit.length === 1 ? `199${yearDigit}` : `20${yearDigit}`;
      sequence = parts[1];
    } else if (serial.length === 6) {
      year = `20${serial.substring(0, 2)}`;
      sequence = serial.substring(2);
    }

    return {
      type: "les paul classic",
      year: year,
      sequenceNumber: sequence,
      decodedInfo: {
        Format: "Les Paul Classic",
        Year: year,
        "Production sequence": sequence,
      },
    };
  }

  return null;
};

export const decodeGibsonSerial = (
  serial,
  previousAnswers = [],
  continueFromRuleIndex = -1
) => {
  try {
    console.log("Decoding Gibson serial:", serial);

    // Validate inputs
    if (!serial || typeof serial !== "string") {
      throw new Error("Invalid serial number provided");
    }

    const upperSerial = serial.toUpperCase();
    const rules = gibsonRules.gibson;

    if (!rules || !Array.isArray(rules)) {
      throw new Error("Gibson rules data is invalid");
    }

    // If we have a rule index to continue from, start there
    let startIndex = continueFromRuleIndex >= 0 ? continueFromRuleIndex : 0;

    // Try to match serial against each rule
    for (let i = startIndex; i < rules.length; i++) {
      const rule = rules[i];

      if (!rule || typeof rule !== "object") {
        continue;
      }

      let isMatch = false;

      // If continuing from a rule, we already matched it
      if (i === continueFromRuleIndex) {
        isMatch = true;
      } else {
        // Skip header/category entries
        if (
          !rule.pattern_description ||
          rule.pattern_description.includes("nan") ||
          rule.years === "nan" ||
          (rule.pattern_description.includes("–") &&
            !rule.pattern_description.split("–")[1]?.trim())
        ) {
          continue;
        }

        // Use the new pattern matching system
        try {
          isMatch = matchesPattern(serial, rule.pattern_description);
        } catch (patternError) {
          console.warn("Error matching pattern:", patternError);
          continue;
        }
      }

      if (isMatch) {
        // Check if we need clarification
        if (
          rule.clarifying_questions &&
          Array.isArray(rule.clarifying_questions) &&
          rule.clarifying_questions.length > 0 &&
          rule.clarifying_questions[0] !== "nan"
        ) {
          // Find which question to ask based on previous answers
          const questionIndex = Array.isArray(previousAnswers)
            ? previousAnswers.length
            : 0;
          if (questionIndex < rule.clarifying_questions.length) {
            const question = rule.clarifying_questions[questionIndex];

            // Skip "nan" questions
            if (!question || question === "nan") {
              // Move to next rule or return result
              continue;
            }

            // Generate appropriate options based on the question
            let options = ["Yes", "No", "Not sure"]; // Default

            if (
              question.includes("inside the body") ||
              question.includes("f-hole")
            ) {
              options = [
                "Yes, on a white label",
                "Yes, stamped on wood",
                "No, it's elsewhere",
              ];
            } else if (question.includes("MADE IN USA")) {
              options = [
                "Yes, it has 'MADE IN USA'",
                "No, no such stamp",
                "Not sure",
              ];
            } else if (question.includes("volute")) {
              options = ["Yes, has a volute", "No volute", "Not sure"];
            } else if (
              question.includes("decal") ||
              question.includes("sticker")
            ) {
              options = [
                "Yes, it's a decal/sticker",
                "No, it's impressed into wood",
                "Not sure",
              ];
            } else if (
              question.includes("Classic") ||
              question.includes("logo")
            ) {
              options = [
                "Yes, it says 'Classic'",
                "No 'Classic' marking",
                "Not sure",
              ];
            }

            return {
              needsClarification: true,
              question: replacePlaceholder(question, serial),
              options: options,
              reason:
                rule.notes ||
                "This helps us determine the exact year and model",
              ruleIndex: i,
              previousAnswers: previousAnswers || [],
            };
          }
        }

        // Parse the serial for detailed information
        let parsedInfo = null;
        try {
          parsedInfo = parseGibsonSerialFormat(serial, rule);
        } catch (parseError) {
          console.error("Error parsing Gibson serial format:", parseError);
        }

        // Build the response with defensive checks
        let years =
          rule.years && rule.years !== "Unknown" ? [rule.years] : ["Unknown"];
        let confidence = "Medium";
        let decodedValues = {};
        let exactDate = null;
        let factory = null;
        let productionNumber = null;

        if (parsedInfo && typeof parsedInfo === "object") {
          if (parsedInfo.year) {
            years = [parsedInfo.year];
            confidence = "High";
          }
          if (parsedInfo.exactDate) {
            exactDate = parsedInfo.exactDate;
          }
          if (parsedInfo.factory) {
            factory = parsedInfo.factory;
          }
          if (parsedInfo.productionNumber) {
            productionNumber = parsedInfo.productionNumber;
          }
          if (
            parsedInfo.decodedInfo &&
            typeof parsedInfo.decodedInfo === "object"
          ) {
            decodedValues = parsedInfo.decodedInfo;
          }
        } else {
          // Basic decoding based on pattern
          decodedValues = {
            "Serial format": rule.pattern_description
              ? rule.pattern_description.split("–")[0]?.trim() || "Unknown"
              : "Unknown",
            "Year range": rule.years || "Unknown",
            "Serial number": serial,
          };
        }

        // Check if notes indicate ambiguity
        if (
          rule.notes &&
          typeof rule.notes === "string" &&
          rule.notes.includes("AMBIGUITY")
        ) {
          confidence = "Low";
        }

        const result = {
          years: years || ["Unknown"],
          exactDate: exactDate,
          country: "USA",
          factory: factory,
          productionNumber: productionNumber,
          confidence: confidence || "Medium",
          decodedValues: decodedValues || {},
          rule:
            rule.answer && typeof rule.answer === "string"
              ? replacePlaceholder(rule.answer, serial)
              : `This serial number pattern (${
                  rule.pattern_description?.split("–")[0]?.trim() || "Unknown"
                }) indicates production years: ${rule.years || "Unknown"}`,
          notes: rule.notes && rule.notes !== "nan" ? rule.notes : null,
          ambiguityNotes:
            rule.notes && rule.notes.includes("AMBIGUITY")
              ? rule.notes.split("AMBIGUITY.")[1]?.trim()
              : null,
          sourceNotes:
            rule.source_notes && rule.source_notes !== "nan"
              ? rule.source_notes
              : null,
          sources:
            rule.source_notes && rule.source_notes !== "nan"
              ? [
                  {
                    name: "Gibson Serial Reference",
                    url: rule.source_notes.includes("http")
                      ? rule.source_notes
                      : "https://www.gibson.com/Support/Serial-Number-Search",
                    description:
                      rule.pattern_description || "Gibson serial pattern",
                  },
                ]
              : [],
        };

        console.log("Successfully decoded Gibson serial:", result);
        return result;
      }
    }

    // No matching rule found
    return {
      years: ["Unknown"],
      country: "Unknown",
      confidence: "Low",
      error: true,
      rule: "Sorry, we couldn't decode your serial number. The format doesn't match any known Gibson serial number patterns in our database.",
      notes:
        "Gibson has used many different serial number formats over the years. Please double-check your serial number or contact Gibson directly for assistance.",
      sources: [
        {
          name: "Gibson Support",
          url: "https://www.gibson.com/Support/Contact-Us",
          description: "Contact Gibson directly for serial number verification",
        },
      ],
    };
  } catch (error) {
    console.error("Critical error in decodeGibsonSerial:", error, {
      serial,
      previousAnswers,
      continueFromRuleIndex,
    });

    // Return a safe fallback result
    return {
      years: ["Unknown"],
      country: "USA",
      confidence: "Low",
      error: true,
      rule: "Sorry, we encountered an error while processing your serial number. Please try again or contact Gibson directly.",
      notes: "An unexpected error occurred during serial number processing.",
      sources: [
        {
          name: "Gibson Support",
          url: "https://www.gibson.com/Support/Contact-Us",
          description: "Contact Gibson directly for serial number verification",
        },
      ],
    };
  }
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
  // For Gibson, this is handled differently through decodeGibsonSerial
  if (brand === "gibson") {
    // This should not be called for Gibson anymore, but if it is, return a basic result
    return {
      years: ["Unknown"],
      country: "USA",
      confidence: "Low",
      model: "Unable to determine specific model",
      rule: "Please use the updated Gibson decoder for accurate results",
    };
  }

  // This is simplified for other brands
  const baseResult = {
    years: ["2000-2024"],
    country: "Various",
    confidence: "Low",
    model: "Unable to determine specific model",
    rule: "Clarification helped narrow down possibilities",
  };

  // Enhanced Fender all-numeric serial processing
  if (brand === "fender") {
    const numericSerial = parseInt(serial);

    if (answer === "On the neck plate (back of guitar)") {
      // Neck plate serials - vintage era dating
      if (numericSerial >= 1 && numericSerial <= 6000) {
        return {
          years: ["1950-1954"],
          country: "USA",
          confidence: "High",
          rule: "Early Fender production, very rare instruments",
          decodedValues: {
            "Serial Range": "1-6,000",
            Years: "1950-1954",
            Location: "Neck plate",
            Note: "Very early Fender production",
          },
        };
      } else if (numericSerial >= 6001 && numericSerial <= 25000) {
        return {
          years: ["1954-1956"],
          country: "USA",
          confidence: "High",
          rule: "Early Stratocaster and Telecaster era",
          decodedValues: {
            "Serial Range": "6,001-25,000",
            Years: "1954-1956",
            Location: "Neck plate",
            Note: "Early Stratocaster introduction period",
          },
        };
      } else if (numericSerial >= 25001 && numericSerial <= 30000) {
        return {
          years: ["1956-1957"],
          country: "USA",
          confidence: "High",
          rule: "Mid-1950s Fender production",
          decodedValues: {
            "Serial Range": "25,001-30,000",
            Years: "1956-1957",
            Location: "Neck plate",
          },
        };
      } else if (numericSerial >= 30001 && numericSerial <= 40000) {
        return {
          years: ["1957-1958"],
          country: "USA",
          confidence: "High",
          rule: "Late 1950s production",
          decodedValues: {
            "Serial Range": "30,001-40,000",
            Years: "1957-1958",
            Location: "Neck plate",
          },
        };
      } else if (numericSerial >= 40001 && numericSerial <= 70000) {
        return {
          years: ["1958-1961"],
          country: "USA",
          confidence: "High",
          rule: "Late 1950s to early 1960s production",
          decodedValues: {
            "Serial Range": "40,001-70,000",
            Years: "1958-1961",
            Location: "Neck plate",
          },
        };
      } else if (numericSerial >= 70001 && numericSerial <= 99999) {
        return {
          years: ["1961-1962"],
          country: "USA",
          confidence: "High",
          rule: "Early 1960s production",
          decodedValues: {
            "Serial Range": "70,001-99,999",
            Years: "1961-1962",
            Location: "Neck plate",
          },
        };
      } else if (numericSerial >= 100000) {
        return {
          years: ["1962-1976"],
          country: "USA",
          confidence: "Medium",
          rule: "1960s-1970s production - overlapping ranges make exact dating difficult",
          decodedValues: {
            "Serial Range": "100,000+",
            Years: "1962-1976",
            Location: "Neck plate",
            Note: "Serial ranges overlap during this period",
          },
        };
      }
    } else if (answer === "On the headstock (front or back)") {
      // Headstock serials - could be post-1976 or transition period
      if (numericSerial >= 100000 && numericSerial <= 200000) {
        return {
          years: ["1976-1982"],
          country: "USA",
          confidence: "Medium",
          rule: "Transition period - moved from neck plate to headstock",
          decodedValues: {
            "Serial Range": "100,000-200,000",
            Years: "1976-1982",
            Location: "Headstock",
            Note: "Transition period with some overlap",
          },
        };
      } else if (numericSerial >= 200000) {
        return {
          years: ["1982-1990"],
          country: "USA",
          confidence: "Medium",
          rule: "1980s American-made Fender",
          decodedValues: {
            "Serial Range": "200,000+",
            Years: "1982-1990",
            Location: "Headstock",
            Note: "Pre-letter prefix era",
          },
        };
      }
    } else if (answer === "Inside the body (f-hole or pickup cavity)") {
      // Body cavity serials - could be various eras
      return {
        years: ["1950-1990"],
        country: "USA",
        confidence: "Low",
        rule: "Body cavity serials can be from various periods - exact dating requires professional examination",
        decodedValues: {
          "Serial Number": serial,
          Location: "Body cavity",
          Note: "Dating requires additional guitar details",
        },
      };
    } else if (answer === "On the neck heel") {
      // Neck heel serials - various periods
      return {
        years: ["1950-1980"],
        country: "USA",
        confidence: "Low",
        rule: "Neck heel serials appear on various models across different periods",
        decodedValues: {
          "Serial Number": serial,
          Location: "Neck heel",
          Note: "Dating requires model identification",
        },
      };
    }

    // Default fallback for unrecognized numeric serials
    return {
      years: ["1950-1990"],
      country: "USA",
      confidence: "Low",
      rule: "All-numeric Fender serial from vintage era - exact dating requires more details",
      decodedValues: {
        "Serial Number": serial,
        Note: "Vintage-era Fender serial number",
      },
    };
  }

  return baseResult;
};
