// Utility functions for encoding/decoding session state to/from URL

export const encodeSessionState = (sessionData) => {
  // Create a compact representation of the session
  const compactState = {
    b: sessionData.brand, // brand
    s: sessionData.serialNumber, // serial
    a: sessionData.clarificationAnswers || [], // answers
    r: sessionData.result
      ? {
          y: sessionData.result.years,
          c: sessionData.result.country,
          cf: sessionData.result.confidence,
          f: sessionData.result.factory,
          ed: sessionData.result.exactDate,
          pn: sessionData.result.productionNumber,
          pc: sessionData.result.productionContext,
          mn: sessionData.result.modelNotes,
          rl: sessionData.result.rule,
          n: sessionData.result.notes,
          sn: sessionData.result.sourceNotes,
        }
      : null,
  };

  // Convert to JSON and encode
  const jsonString = JSON.stringify(compactState);
  // Use base64url encoding (URL-safe)
  const encoded = btoa(jsonString)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return encoded;
};

export const decodeSessionState = (code) => {
  try {
    // Decode from base64url
    const base64 =
      code.replace(/-/g, "+").replace(/_/g, "/") +
      "=".repeat((4 - (code.length % 4)) % 4);

    const jsonString = atob(base64);
    const compactState = JSON.parse(jsonString);

    // Reconstruct full session data
    const sessionData = {
      brand: compactState.b,
      serialNumber: compactState.s,
      clarificationAnswers: compactState.a || [],
      clarificationQuestion: null,
      result: compactState.r
        ? {
            years: compactState.r.y,
            country: compactState.r.c,
            confidence: compactState.r.cf,
            factory: compactState.r.f,
            exactDate: compactState.r.ed,
            productionNumber: compactState.r.pn,
            productionContext: compactState.r.pc,
            modelNotes: compactState.r.mn,
            rule: compactState.r.rl,
            notes: compactState.r.n,
            sourceNotes: compactState.r.sn,
            // Add default sources structure
            sources: [
              {
                name: "Gibson Serial Number Guide",
                url: "https://www.gibson.com/Support/Serial-Number-Search",
                description: "Official Gibson serial number documentation",
              },
            ],
          }
        : null,
    };

    return sessionData;
  } catch (error) {
    console.error("Failed to decode session state:", error);
    return null;
  }
};

// Generate shareable URL with encoded state
export const generateShareableUrl = (sessionData) => {
  const code = encodeSessionState(sessionData);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?code=${code}`;
};
