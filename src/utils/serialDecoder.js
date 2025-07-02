// Serial number decoder logic for major guitar brands
import gibsonRules from "../data/gibson_serial_rules.json";

// Helper function to replace [serial_number] placeholder in text
const replacePlaceholder = (text, serial) => {
  if (!text) return text;
  return text.replace(/\[serial_number\]/g, serial);
};

// Helper function to calculate exact date from day of year
const getDateFromDayOfYear = (year, dayOfYear) => {
  const date = new Date(year, 0); // January 1st
  date.setDate(dayOfYear);

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
    month: months[date.getMonth()],
    day: date.getDate(),
    year: year,
  };
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
    const decade = yearDigit >= "7" ? "197" : "198";
    processedAnswer = processedAnswer.replace(/\[year\]/g, decade + yearDigit);
  } else if (serial.length === 9 && /^\d{9}$/.test(serial)) {
    const yearCode = serial.substring(0, 2);
    const year = 2000 + parseInt(yearCode);
    processedAnswer = processedAnswer.replace(/\[year\]/g, year.toString());
  }

  return processedAnswer;
};

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

export const decodeGibsonSerial = (
  serial,
  previousAnswers = [],
  continueFromRuleIndex = -1
) => {
  const upperSerial = serial.toUpperCase();
  const rules = gibsonRules.gibson;

  // If we have a rule index to continue from, start there
  let startIndex = continueFromRuleIndex >= 0 ? continueFromRuleIndex : 0;

  // Try to match serial against each rule
  for (let i = startIndex; i < rules.length; i++) {
    const rule = rules[i];
    let isMatch = false;

    // If continuing from a rule, we already matched it
    if (i === continueFromRuleIndex) {
      isMatch = true;
    } else {
      // Pattern matching logic based on pattern_description
      if (rule.pattern_description.includes("Pre-1952 Factory Order Numbers")) {
        // Complex FON patterns - simplified check
        isMatch =
          serial.length <= 5 ||
          (serial.length <= 10 && /[A-Z]/.test(upperSerial));
      } else if (
        rule.pattern_description.includes("5 or 6-digit number (inked")
      ) {
        isMatch = /^\d{5,6}$/.test(serial);
      } else if (
        rule.pattern_description.includes("6-digit number (impressed)")
      ) {
        isMatch = /^\d{6}$/.test(serial);
      } else if (rule.pattern_description.includes("8-digit decal/sticker")) {
        isMatch =
          /^\d{8}$/.test(serial) &&
          (serial.startsWith("99") ||
            serial.startsWith("00") ||
            serial.startsWith("06"));
      } else if (
        rule.pattern_description.includes("8-digit number (impressed)")
      ) {
        isMatch =
          /^\d{8}$/.test(serial) &&
          !serial.startsWith("94") &&
          !serial.startsWith("99") &&
          !serial.startsWith("00") &&
          !serial.startsWith("06");
      } else if (
        rule.pattern_description.includes("9-digit number (impressed)")
      ) {
        isMatch = /^\d{9}$/.test(serial);
      } else if (
        rule.pattern_description.includes(
          "9-digit number (starts with model year)"
        )
      ) {
        isMatch =
          /^\d{9}$/.test(serial) &&
          parseInt(serial.substring(0, 2)) >= 14 &&
          parseInt(serial.substring(0, 2)) <= 19;
      } else if (
        rule.pattern_description.includes("8-digit number (starts with '94')")
      ) {
        isMatch = serial.startsWith("94") && /^\d{8}$/.test(serial);
      } else if (rule.pattern_description.includes("Ink-Stamped number")) {
        isMatch =
          /^[A-Z]?\s?\d{4,5}$/.test(upperSerial) ||
          /^\d{1,2}\s\d{4}$/.test(serial);
      } else if (rule.pattern_description.includes("Starts with 'CS'")) {
        isMatch = upperSerial.startsWith("CS");
      } else if (rule.pattern_description.includes("Custom Shop Reissue")) {
        isMatch =
          /^[A-Z]\s?\d{4}/.test(upperSerial) ||
          /^\d{1,2}\s?\d{4}[A-Z]?$/.test(serial);
      }
    }

    if (isMatch) {
      // Check if we need clarification
      if (rule.clarifying_questions && rule.clarifying_questions.length > 0) {
        // Find which question to ask based on previous answers
        const questionIndex = previousAnswers.length;
        if (questionIndex < rule.clarifying_questions.length) {
          const question = rule.clarifying_questions[questionIndex];

          // Generate appropriate options based on the question
          let options = ["Yes", "No"]; // Default

          if (question.question.includes("1950s or 1960s")) {
            options = ["1950s features", "1960s features", "Not sure"];
          } else if (question.question.includes("MADE IN USA")) {
            options = [
              "Yes, it has 'MADE IN USA' and/or a volute",
              "No, it doesn't have these features",
              "Not sure",
            ];
          } else if (question.question.includes("impressed into the back")) {
            options = [
              "Yes, impressed with 'MADE IN USA'",
              "No, it's ink-stamped",
              "Not sure",
            ];
          } else if (question.question.includes("acoustic or an electric")) {
            options = ["Acoustic", "Electric"];
          } else if (
            question.question.includes("first digit alone") ||
            question.question.includes("first two digits")
          ) {
            options = [
              "First digit only (e.g., '8' for 2008)",
              "First two digits (e.g., '19' for 2019)",
            ];
          } else if (question.question.includes("Centennial")) {
            options = [
              "Yes, it has Centennial/100th Anniversary markings",
              "No special markings",
            ];
          } else if (
            question.question.includes("Classic") ||
            question.question.includes("Reissue")
          ) {
            options = [
              "Les Paul Classic",
              "Historic Reissue (e.g., '60 Les Paul')",
              "Other model",
            ];
          } else if (question.question.includes("199[Y], 200[Y], or 201[Y]")) {
            options = [
              "1990s (199X)",
              "2000s (200X)",
              "2010s (201X)",
              "2020s (202X)",
            ];
          }

          return {
            needsClarification: true,
            question: replacePlaceholder(question.question, serial),
            options: options,
            reason: question.purpose,
            ruleIndex: i,
            previousAnswers: previousAnswers,
          };
        }
      }

      // We have an answer or need to generate one
      let answer = rule.answer ? replacePlaceholder(rule.answer, serial) : null;
      let years = [rule.years];

      // Special handling for specific patterns
      if (rule.pattern_description.includes("8-digit decal/sticker")) {
        const yearCode = serial.substring(0, 2);
        if (yearCode === "99") years = ["1975"];
        else if (yearCode === "00") years = ["1976"];
        else if (yearCode === "06") years = ["1977"];
        if (answer) answer = answer.replace("[year]", years[0]);
      } else if (
        rule.pattern_description.includes("8-digit number (impressed)")
      ) {
        // YDDDYRRR format
        const yearDigit = serial[0];
        const dayOfYear = serial.substring(1, 4);
        const factoryRanking = serial.substring(5, 8);

        // Determine year based on digit and context
        let year;
        if (yearDigit >= "7") {
          year = `197${yearDigit}`;
        } else if (yearDigit <= "5") {
          year = `200${yearDigit}`;
        } else {
          year = `198${yearDigit}`;
        }
        years = [year];

        // Determine factory based on answers and ranking
        let factory = "Not available";
        let factoryDetails = "";

        if (previousAnswers.includes("Electric")) {
          const ranking = parseInt(factoryRanking);
          if (ranking >= 300 && ranking <= 999) {
            factory = "Nashville/Memphis";
            factoryDetails =
              "Electric guitars with rankings 300-999 were made in Nashville or Memphis";
          } else if (ranking >= 1 && ranking <= 299) {
            factory = "Kalamazoo";
            factoryDetails =
              "Electric guitars with rankings 1-299 were made in Kalamazoo";
          }
        } else if (previousAnswers.includes("Acoustic")) {
          const ranking = parseInt(factoryRanking);
          if (ranking >= 1 && ranking <= 299) {
            factory = "Bozeman, MT";
            factoryDetails =
              "Acoustic guitars with rankings 1-299 were made in Bozeman, Montana";
          } else if (ranking >= 300 && ranking <= 999) {
            factory = "Nashville";
            factoryDetails =
              "Acoustic guitars with rankings 300-999 were made in Nashville";
          }
        }

        // Calculate exact date
        const exactDate = getDateFromDayOfYear(
          parseInt(year),
          parseInt(dayOfYear)
        );

        // Generate answer for this format
        answer =
          `This Gibson was made on ${exactDate.month} ${exactDate.day}, ${year}. ` +
          `It was guitar #${parseInt(factoryRanking)} made that day` +
          (factory !== "Not available" ? ` at the ${factory} factory` : "") +
          ". " +
          `${rule.notes}`;

        // Return enhanced structure
        return {
          years: years,
          exactDate: exactDate,
          country: "USA",
          factory: factory,
          factoryDetails: factoryDetails,
          productionNumber: parseInt(factoryRanking),
          productionContext: `#${parseInt(
            factoryRanking
          )} made on day ${parseInt(dayOfYear)} of ${year}`,
          confidence: "High",
          rule: answer,
          notes: rule.notes,
          sourceNotes: rule.source_notes,
          sources: [
            {
              name: "Gibson Serial Number Guide",
              url: "https://www.gibson.com/Support/Serial-Number-Search",
              description:
                "8-digit impressed format YDDDYRRR where Y=year digit, DDD=day of year, RRR=ranking/production number",
            },
          ],
        };
      } else if (
        rule.pattern_description.includes(
          "9-digit number (starts with model year)"
        )
      ) {
        // YYRRRRRRR format
        const modelYear = serial.substring(0, 2);
        const ranking = serial.substring(2);
        const fullYear = `20${modelYear}`;
        years = [fullYear];

        if (answer) {
          answer = answer
            .replace("[YY]", modelYear)
            .replace("[RRRRRRR]", ranking);
        }

        return {
          years: years,
          exactDate: null, // Production sequence doesn't give exact date
          country: "USA",
          factory: "Not available", // Modern Gibsons don't specify factory in serial
          productionNumber: parseInt(ranking),
          productionContext: `Production sequence #${parseInt(
            ranking
          )} in ${fullYear}`,
          confidence: "High",
          rule:
            answer ||
            `This Gibson was made in ${fullYear}, production sequence #${parseInt(
              ranking
            )}`,
          notes: rule.notes,
          sourceNotes: rule.source_notes,
          sources: [
            {
              name: "Gibson Serial Number Guide",
              url: "https://www.gibson.com/Support/Serial-Number-Search",
              description:
                "9-digit format YYRRRRRRR where YY=model year, RRRRRRR=ranking/production sequence",
            },
          ],
        };
      } else if (
        rule.pattern_description.includes("5 or 6-digit number (inked") ||
        rule.pattern_description.includes("6-digit number (impressed)") ||
        rule.pattern_description.includes(
          "8-digit number (starts with '94')"
        ) ||
        rule.pattern_description.includes("Ink-Stamped number") ||
        rule.pattern_description.includes("Starts with 'CS'") ||
        rule.pattern_description.includes("9-digit number (impressed)")
      ) {
        // Rules that need answer generation after clarification
        if (!answer) {
          // Generate a basic answer based on the rule information
          answer = `This Gibson with serial number ${serial} dates to ${rule.years}. ${rule.notes}`;
        }
      }

      // Process answer if we have one
      if (answer) {
        answer = extractYearFromAnswer(answer, serial);

        // Try to extract specific year from answer
        if (answer.includes("20") || answer.includes("19")) {
          const yearMatch = answer.match(/(?:19|20)\d{2}/);
          if (yearMatch) {
            years = [yearMatch[0]];
          }
        }
      }

      // Default enhanced return structure for other patterns
      let modelNotes = null;
      if (
        rule.notes.includes("Centennial") ||
        rule.notes.includes("100th Anniversary")
      ) {
        modelNotes = "Centennial edition (100th Anniversary)";
      } else if (rule.notes.includes("Les Paul Classic")) {
        modelNotes = "Les Paul Classic model";
      } else if (rule.notes.includes("Historic")) {
        modelNotes = "Historic Reissue model";
      }

      // Determine sources based on pattern
      let sources = [
        {
          name: "Gibson Serial Number Guide",
          url: "https://www.gibson.com/Support/Serial-Number-Search",
          description: rule.pattern_description,
        },
      ];

      if (rule.source_notes) {
        sources.push({
          name: "Additional Research",
          url: "",
          description: rule.source_notes,
        });
      }

      return {
        years: Array.isArray(years) ? years : [years],
        exactDate: null,
        country: "USA",
        factory: "Not available",
        productionNumber: null,
        modelNotes: modelNotes,
        confidence:
          rule.notes.includes("ambiguity") || rule.notes.includes("uncertain")
            ? "Medium"
            : "High",
        rule:
          answer ||
          `This Gibson with serial number ${serial} dates to ${rule.years}.`,
        notes: rule.notes,
        sourceNotes: rule.source_notes,
        sources: sources,
      };
    }
  }

  // No matching rule found
  return {
    years: ["Unknown"],
    country: "Unknown",
    confidence: "Low",
    rule: "Serial format not recognized in our Gibson database. This could be a special edition, import model, or the serial might need verification.",
    notes:
      "Gibson serial number systems are complex and have changed many times. Consider checking with Gibson directly or a vintage guitar expert.",
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

  if (brand === "fender" && answer === "On the neck plate") {
    return {
      ...baseResult,
      years: ["1954-1976"],
      country: "USA",
      confidence: "Medium",
      rule: "Neck plate serials typically indicate vintage era Fenders",
    };
  }

  return baseResult;
};
