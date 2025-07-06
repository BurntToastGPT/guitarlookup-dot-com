import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ChatMessage from "../components/chat/ChatMessage";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import FenderEnhancedResults from "../components/results/FenderEnhancedResults";
import brandsData from "../data/brands.json";
import { decodeSerial, decodeGibsonSerial } from "../utils/serialDecoder";
import {
  encodeSessionState,
  decodeSessionState,
  generateShareableUrl,
} from "../utils/sessionEncoder";
import styles from "../styles/pages/ChatLookup.module.css";

const ChatLookup = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [currentStep, setCurrentStep] = useState("brand"); // brand, serial, clarification, complete
  const [sessionData, setSessionData] = useState({
    brand: null,
    serialNumber: null,
    clarificationAnswers: [],
    clarificationQuestion: null,
    result: null,
  });
  const [isShowingResults, setIsShowingResults] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState([]);
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [shareableUrl, setShareableUrl] = useState(null);
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  const [showJapaneseInfo, setShowJapaneseInfo] = useState(false);

  // Helper function to determine if a Fender serial is supported for enhanced results
  const isSupportedFenderSerial = (sessionData) => {
    // Only for Fender guitars
    if (sessionData.brand !== "fender") {
      return false;
    }

    // Get the year from the result
    const result = sessionData.result;
    if (!result) return false;

    const year =
      result.decodedValues?.Year ||
      result.years ||
      (Array.isArray(result.years) ? result.years[0] : null);

    const numericYear = typeof year === "string" ? parseInt(year, 10) : year;

    // If we can't determine the year, don't show enhanced results
    if (!numericYear || isNaN(numericYear)) {
      return false;
    }

    // Get the country/location from the result
    const country =
      result.decodedValues?.Country || result.country || "Unknown";
    const location = result.decodedValues?.Location || result.location || "";

    // Check support criteria - check both country and location fields
    const isMexican =
      country === "Mexico" ||
      country === "MX" ||
      location.includes("Mexico") ||
      location.includes("Ensenada");

    const isUS =
      country === "United States" ||
      country === "USA" ||
      country === "US" ||
      location.includes("USA") ||
      location.includes("Corona") ||
      location.includes("California");

    const isJapanese =
      country === "Japan" || country === "JPN" || location.includes("Japan");

    // Japanese serials are not supported
    if (isJapanese) {
      return false;
    }

    // US guitars: year >= 1976
    if (isUS && numericYear >= 1976) {
      return true;
    }

    // Mexico guitars: year >= 1990
    if (isMexican && numericYear >= 1990) {
      return true;
    }

    // If country is unknown but year is reasonable, allow it
    // (Some older serials might not have country info but are still valid)
    if (country === "Unknown" && numericYear >= 1976) {
      return true;
    }

    return false;
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize session
  useEffect(() => {
    // Check for code parameter in URL
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");

    if (code) {
      // Decode session from URL (shared link scenario)
      const decodedSession = decodeSessionState(code);
      if (decodedSession) {
        // Reconstruct the conversation from the decoded state
        reconstructConversation(decodedSession);
      } else {
        // Invalid code - show error and start fresh
        alert("Invalid or corrupted share link. Starting a new lookup.");
        navigate("/lookup/" + generateSessionId());
      }
    } else if (!sessionId) {
      // Generate new session ID
      const newSessionId = generateSessionId();
      navigate(`/lookup/${newSessionId}`, { replace: true });
    } else {
      // Try to load from sessionStorage first (internal navigation)
      const savedSession = sessionStorage.getItem(`session_${sessionId}`);
      if (savedSession) {
        const data = JSON.parse(savedSession);
        setSessionData(data.sessionData);
        setMessages(data.messages || []);
        setCurrentStep(data.currentStep);

        // If we're in clarification step, show options
        if (
          data.currentStep === "clarification" &&
          data.sessionData?.clarificationQuestion
        ) {
          setShowOptions(true);
          setOptions(
            data.sessionData.clarificationQuestion.options?.map((opt) => ({
              value: opt,
              label: opt,
            })) || []
          );
        }
      } else {
        // New session with ID
        initializeChat();
      }
    }
  }, [sessionId, navigate, location.search]);

  // Save session state for internal navigation
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      const sessionState = {
        sessionData,
        messages,
        currentStep,
        timestamp: Date.now(),
      };
      // Save to sessionStorage for internal navigation
      sessionStorage.setItem(
        `session_${sessionId}`,
        JSON.stringify(sessionState)
      );
    }
  }, [sessionId, sessionData, messages, currentStep]);

  // Update URL when conversation is complete
  useEffect(() => {
    if (
      currentStep === "complete" &&
      sessionData.result &&
      !location.search.includes("code=")
    ) {
      // Generate and set shareable URL
      const url = generateShareableUrl(sessionData);
      setShareableUrl(url);
      // Only update URL if we're not already on a shared link
      if (!shareableUrl) {
        window.history.replaceState({}, "", url);
      }
    }
  }, [currentStep, sessionData, location.search, shareableUrl]);

  // Parallax effect for background
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.innerWidth <= 768) return; // Skip on mobile

      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      // Calculate offset based on mouse position (max 15px movement)
      const offsetX = (clientX / innerWidth - 0.5) * 30; // 30px range = 15px each direction
      const offsetY = (clientY / innerHeight - 0.5) * 30;

      setParallaxOffset({ x: offsetX, y: offsetY });
    };

    const handleDeviceOrientation = (e) => {
      if (window.innerWidth > 768) return; // Only on mobile

      // Use device orientation for mobile parallax
      const { beta, gamma } = e; // beta: front-back tilt, gamma: left-right tilt

      if (beta !== null && gamma !== null) {
        // Limit the tilt effect and convert to offset
        const offsetX = Math.max(-15, Math.min(15, gamma * 0.5));
        const offsetY = Math.max(-15, Math.min(15, beta * 0.5));

        setParallaxOffset({ x: offsetX, y: offsetY });
      }
    };

    // Add event listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("deviceorientation", handleDeviceOrientation);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    };
  }, []);

  const generateSessionId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  };

  const reconstructConversation = (decodedSession) => {
    // Set the session data
    setSessionData(decodedSession);
    setCurrentStep("complete");

    // Reconstruct messages
    const reconstructedMessages = [];

    // Add initial greeting
    reconstructedMessages.push({
      id: Date.now(),
      isRandy: true,
      text: "Hey there! I'm Randy Researcher, your guitar specialist. 🎸 First things first - what brand is your guitar?",
    });

    // Add brand selection
    const brandName =
      brandsData.brands.find((b) => b.id === decodedSession.brand)
        ?.displayName || decodedSession.brand;
    reconstructedMessages.push({
      id: Date.now() + 2,
      isRandy: false,
      text: brandName,
    });

    reconstructedMessages.push({
      id: Date.now() + 3,
      isRandy: true,
      text: `Great choice! ${brandName} makes some fantastic instruments. Now, can you share the serial number with me? It's usually on the back of the headstock or inside the sound hole.`,
    });

    // Add serial number
    reconstructedMessages.push({
      id: Date.now() + 4,
      isRandy: false,
      text: decodedSession.serialNumber,
    });

    // Add clarification questions and answers if any
    if (
      decodedSession.clarificationAnswers &&
      decodedSession.clarificationAnswers.length > 0
    ) {
      // For each answer, we need to reconstruct the question
      // This is a simplified version - in production you'd want to store questions too
      decodedSession.clarificationAnswers.forEach((answer, index) => {
        if (index === 0) {
          reconstructedMessages.push({
            id: Date.now() + 5 + index * 2,
            isRandy: true,
            text: "Hmm, I need a bit more info to narrow this down.",
          });
        } else {
          reconstructedMessages.push({
            id: Date.now() + 5 + index * 2,
            isRandy: true,
            text: "Thanks! I have another quick question...",
          });
        }

        reconstructedMessages.push({
          id: Date.now() + 6 + index * 2,
          isRandy: false,
          text: answer,
        });
      });

      reconstructedMessages.push({
        id: Date.now() + 100,
        isRandy: true,
        text: "Perfect! That helps narrow things down. Let me check my database...",
      });
    }

    // Add result intro
    let introMessage;
    if (decodedSession.result.confidence === "High") {
      introMessage = `Great news! I found detailed information about your ${brandName}.`;
    } else if (decodedSession.result.confidence === "Medium") {
      introMessage = `I've found some information about your ${brandName}, though there's a bit of uncertainty due to the serial number format.`;
    } else {
      introMessage = `I found some basic information about your ${brandName}, but the serial number format is unusual, so I'm less certain about the details.`;
    }

    reconstructedMessages.push({
      id: Date.now() + 200,
      isRandy: true,
      text: introMessage,
    });

    // Add results display
    reconstructedMessages.push({
      id: Date.now() + 201,
      isRandy: true,
      text: null,
      showResults: true,
    });

    setMessages(reconstructedMessages);
  };

  const initializeChat = () => {
    const initialMessages = [
      {
        id: Date.now(),
        isRandy: true,
        text: "Hey there! I'm Randy Researcher, your guitar specialist. 🎸 First things first - what brand is your guitar?",
      },
    ];
    setMessages(initialMessages);
    setShowOptions(true);
    setOptions(
      brandsData.brands.map((b) => ({ value: b.id, label: b.displayName }))
    );
  };

  const addMessage = (
    text,
    isRandy = false,
    showResults = false,
    showFenderIntro = false
  ) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      isRandy,
      text: !showResults && !showFenderIntro ? text : undefined,
      showResults,
      showFenderIntro,
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const handleBrandSelect = (brandId) => {
    const brand = brandsData.brands.find((b) => b.id === brandId);
    if (!brand) return;

    // Add user message
    addMessage(brand.displayName, false);
    setShowOptions(false);
    setOptions([]);

    // Update session data
    setSessionData((prev) => ({ ...prev, brand: brandId }));

    // Randy's response with special handling for Fender
    setTimeout(() => {
      if (brandId === "fender") {
        // Special Fender introduction with Randy Researcher
        addMessage(null, true, false, true);
        setCurrentStep("serial");
      } else {
        // Generic response for other brands
        addMessage(
          `Great choice! ${brand.displayName} makes some fantastic instruments. Now, can you share the serial number with me? It's usually on the back of the headstock or inside the sound hole.`,
          true
        );
        setCurrentStep("serial");
      }
    }, 500);
  };

  const handleSerialSubmit = () => {
    if (!inputValue.trim()) return;

    const currentSerial = inputValue.trim();
    console.log("1. Starting serial submission:", currentSerial);

    // Reset results flag for new submission
    setIsShowingResults(false);

    // Add user message
    console.log("2. Adding user message");
    addMessage(currentSerial, false);
    console.log("3. Setting input value to empty");
    setInputValue("");

    // Update session data
    setSessionData((prev) => ({ ...prev, serialNumber: currentSerial }));

    // Process serial with comprehensive error handling
    setTimeout(() => {
      try {
        console.log(
          "Processing serial:",
          currentSerial,
          "for brand:",
          sessionData.brand
        );

        // Validate inputs before processing
        if (!sessionData.brand) {
          throw new Error("No brand selected");
        }

        if (!currentSerial) {
          throw new Error("No serial number provided");
        }

        console.log(
          "6. About to call decodeSerial with brand:",
          sessionData.brand,
          "serial:",
          currentSerial
        );
        let result;
        try {
          result = decodeSerial(sessionData.brand, currentSerial);
          console.log("7. Decode result received successfully:", result);
        } catch (decodeError) {
          console.error("8. Critical error in decodeSerial:", decodeError);
          throw new Error(`Decoder failed: ${decodeError.message}`);
        }

        // Validate result object
        if (!result || typeof result !== "object") {
          throw new Error("Invalid result from decoder");
        }

        if (result.needsClarification) {
          // Handle clarification
          setSessionData((prev) => ({
            ...prev,
            clarificationQuestion: result,
          }));
          addMessage(
            result.question ||
              "I need a bit more information to narrow this down.",
            true
          );
          setCurrentStep("clarification");
          setShowOptions(true);
          setOptions(
            result.options?.map((opt) => ({ value: opt, label: opt })) || []
          );
        } else {
          console.log("8. About to show results");
          // Show results
          showResults(result);
          console.log("9. showResults completed");
        }
      } catch (error) {
        console.error("Critical error in handleSerialSubmit:", error, {
          serial: currentSerial,
          brand: sessionData.brand,
        });

        try {
          addMessage(
            "Sorry, I encountered an error while processing your serial number. Please try again or contact support.",
            true
          );
        } catch (messageError) {
          console.error("Failed to add error message:", messageError);
          // Last resort - force page reload to prevent broken state
          window.location.reload();
        }
      }
    }, 800);
  };

  const handleClarificationAnswer = (answer) => {
    // Add user message
    addMessage(answer, false);
    setShowOptions(false);
    setOptions([]);

    // Update answers
    const updatedAnswers = [...sessionData.clarificationAnswers, answer];
    setSessionData((prev) => ({
      ...prev,
      clarificationAnswers: updatedAnswers,
    }));

    // Process clarification
    setTimeout(() => {
      if (
        sessionData.brand === "gibson" &&
        sessionData.clarificationQuestion?.ruleIndex !== undefined
      ) {
        // Gibson multi-step clarification
        const result = decodeGibsonSerial(
          sessionData.serialNumber,
          updatedAnswers,
          sessionData.clarificationQuestion.ruleIndex
        );

        if (result.needsClarification) {
          // Another clarification needed
          addMessage("Thanks! I have another quick question...", true);
          setTimeout(() => {
            setSessionData((prev) => ({
              ...prev,
              clarificationQuestion: result,
            }));
            addMessage(result.question, true);
            setShowOptions(true);
            setOptions(
              result.options.map((opt) => ({ value: opt, label: opt }))
            );
          }, 800);
        } else {
          // Got final result
          addMessage(
            "Perfect! That helps narrow things down. Let me check my database...",
            true
          );
          setTimeout(() => {
            showResults(result);
          }, 1500);
        }
      } else {
        // Simple clarification flow
        addMessage(
          "Perfect! That helps narrow things down. Let me check my database...",
          true
        );
        // For non-Gibson brands, we'd process the clarification here
        // For now, just show a basic result
        setTimeout(() => {
          showResults({
            years: ["2000-2024"],
            country: "Various",
            confidence: "Medium",
            rule: "Based on your information, this appears to be a modern instrument.",
          });
        }, 1500);
      }
    }, 500);
  };
  const showResults = (result) => {
    try {
      console.log("Showing results:", result);

      // Prevent double display
      if (isShowingResults) {
        console.log("Results already being shown, skipping duplicate call");
        return;
      }

      setIsShowingResults(true);

      // Validate result object
      if (!result || typeof result !== "object") {
        throw new Error("Invalid result object provided to showResults");
      }

      const brandName =
        brandsData.brands.find((b) => b.id === sessionData.brand)
          ?.displayName ||
        sessionData.brand ||
        "Unknown";

      // Add confidence-based intro message with safe fallback
      let introMessage;
      const confidence = result.confidence || "Unknown";

      if (confidence === "High") {
        introMessage = `Great news! I found detailed information about your ${brandName}.`;
      } else if (confidence === "Medium") {
        introMessage = `I've found some information about your ${brandName}, though there's a bit of uncertainty due to the serial number format.`;
      } else {
        introMessage = `I found some basic information about your ${brandName}, but the serial number format is unusual, so I'm less certain about the details.`;
      }

      console.log("Adding intro message:", introMessage);
      addMessage(introMessage, true);

      // Update session data first
      setSessionData((prev) => ({ ...prev, result }));

      // Add results display after a brief delay to ensure state update
      setTimeout(() => {
        try {
          console.log("Adding results display message");
          addMessage(null, true, true);
          setCurrentStep("complete");
        } catch (delayedError) {
          console.error("Error in delayed results display:", delayedError);
          addMessage(
            "Results processed successfully. Please check above for details.",
            true
          );
          setCurrentStep("complete");
        }
      }, 200);
    } catch (error) {
      console.error("Critical error in showResults:", error, { result });

      try {
        // Fallback: show a basic error message
        addMessage(
          "I've processed your serial number but encountered a display error. Here's what I found: The serial appears to be from a Gibson guitar. Please contact support for detailed information.",
          true
        );
        setCurrentStep("complete");
      } catch (fallbackError) {
        console.error("Failed to show fallback results:", fallbackError);
        // Last resort - reload the page
        alert("Sorry, we encountered a technical issue. The page will reload.");
        window.location.reload();
      }
    }
  };
  const handleNewLookup = () => {
    const newSessionId = generateSessionId();
    setIsShowingResults(false); // Reset flag for new lookup
    navigate(`/lookup/${newSessionId}`);
    window.location.reload(); // Fresh start
  };

  const handleShowSources = () => {
    setShowSourcesModal(true);
  };

  const handleCloseModal = () => {
    setShowSourcesModal(false);
  };

  const handleShowJapaneseInfo = () => {
    setShowJapaneseInfo(true);
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (currentStep === "brand") {
      // Check if it's a valid brand
      const brand = brandsData.brands.find(
        (b) =>
          b.displayName.toLowerCase() === inputValue.toLowerCase() ||
          b.id.toLowerCase() === inputValue.toLowerCase()
      );
      if (brand) {
        handleBrandSelect(brand.id);
      } else {
        addMessage(inputValue, false);
        setTimeout(() => {
          addMessage(
            "I'm not familiar with that brand yet, but I'm always learning! Try selecting from the list above.",
            true
          );
        }, 500);
      }
      setInputValue("");
    } else if (currentStep === "serial") {
      handleSerialSubmit();
    }
  };

  return (
    <div
      ref={containerRef}
      className={styles.container}
      style={{
        "--parallax-x": `${parallaxOffset.x}px`,
        "--parallax-y": `${parallaxOffset.y}px`,
      }}
    >
      <div className={styles.chatCard}>
        <div className={styles.innerContent}>
          <div className={styles.chatHeader}>
            <h1 className={styles.logoText}>GuitarLookup</h1>
            <div className={styles.goldAccent}></div>
          </div>
          <div className={styles.chatWindow}>
            <div className={styles.messagesArea}>
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  isRandy={msg.isRandy}
                  message={msg.text}
                  showResults={msg.showResults}
                >
                  {msg.showFenderIntro && (
                    <div className={styles.fenderIntro}>
                      <div className={styles.randyIntro}>
                        <h3>
                          Hi! I'm Randy Researcher, here to help date your
                          Fender guitar.
                        </h3>

                        <div className={styles.fenderWarnings}>
                          <p>
                            <strong>Quick heads-up:</strong>
                          </p>
                          <ul>
                            <li>
                              We can accurately date most Fender guitars made in
                              the USA (after 1976) and Mexico (after 1990).
                            </li>
                            <li>
                              We do NOT support Japanese Fender serial numbers
                              or Squier guitars yet.
                            </li>
                          </ul>
                        </div>

                        <button
                          className={styles.japaneseInfoButton}
                          onClick={handleShowJapaneseInfo}
                        >
                          How do I know if mine is Japanese?
                        </button>

                        {showJapaneseInfo && (
                          <div className={styles.japaneseInfoExpanded}>
                            <p>
                              Most Japanese Fenders say "Made in Japan" or
                              "Crafted in Japan" on the guitar (usually on the
                              headstock or neck).
                            </p>
                            <p>
                              The serial usually starts with two letters like
                              "JV", "SQ", "E", "A", or "JD", often on the back
                              of the neck or neck plate.
                            </p>
                            <p>
                              If your serial doesn't start with US, MX, MN, MZ,
                              S, E, N, or Z, and you see "Made in Japan," it's
                              probably not supported yet by this tool!
                            </p>
                          </div>
                        )}

                        <div className={styles.fenderPrompt}>
                          <p>
                            Now, can you share the serial number with me? It's
                            usually on the back of the headstock or inside the
                            sound hole.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {msg.showResults &&
                    sessionData.result &&
                    typeof sessionData.result === "object" && (
                      <div className={styles.resultsCard}>
                        <h3 className={styles.resultsTitle}>
                          Your{" "}
                          {brandsData.brands.find(
                            (b) => b.id === sessionData.brand
                          )?.displayName || "Unknown"}{" "}
                          Details:
                        </h3>

                        {/* Show decoded values section if available */}
                        {sessionData.result?.decodedValues &&
                          typeof sessionData.result.decodedValues ===
                            "object" &&
                          sessionData.result.decodedValues !== null && (
                            <div className={styles.decodedSection}>
                              <h4 className={styles.decodedTitle}>
                                🔍 Decoded from serial number:{" "}
                                {sessionData.serialNumber || "N/A"}
                              </h4>
                              {Object.entries(sessionData.result.decodedValues)
                                .filter(
                                  ([key, value]) =>
                                    value != null && value !== undefined
                                )
                                .map(([key, value]) => (
                                  <div key={key} className={styles.resultItem}>
                                    <span className={styles.label}>{key}:</span>
                                    <span className={styles.value}>
                                      {String(value)}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          )}

                        {/* Standard result fields */}
                        {!sessionData.result?.decodedValues && (
                          <>
                            <div className={styles.resultItem}>
                              <span className={styles.label}>📅 Year(s):</span>
                              <span className={styles.value}>
                                {sessionData.result?.years
                                  ? Array.isArray(sessionData.result?.years)
                                    ? sessionData.result?.years.join(" - ")
                                    : String(sessionData.result?.years)
                                  : "Unknown"}
                              </span>
                            </div>

                            {sessionData.result?.exactDate &&
                              typeof sessionData.result.exactDate ===
                                "object" &&
                              sessionData.result.exactDate?.month &&
                              sessionData.result.exactDate?.day &&
                              sessionData.result.exactDate?.year && (
                                <div className={styles.resultItem}>
                                  <span className={styles.label}>
                                    📆 Exact Date:
                                  </span>
                                  <span className={styles.value}>
                                    {sessionData.result.exactDate.month}{" "}
                                    {sessionData.result.exactDate.day},{" "}
                                    {sessionData.result.exactDate.year}
                                  </span>
                                </div>
                              )}

                            {sessionData.result?.country &&
                              sessionData.result.country !== "Unknown" && (
                                <div className={styles.resultItem}>
                                  <span className={styles.label}>
                                    🌍 Country:
                                  </span>
                                  <span className={styles.value}>
                                    {sessionData.result.country}
                                  </span>
                                </div>
                              )}

                            {sessionData.result?.factory &&
                              sessionData.result.factory !== "Not available" &&
                              sessionData.result.factory !==
                                "Not specified" && (
                                <div className={styles.resultItem}>
                                  <span className={styles.label}>
                                    🏭 Factory:
                                  </span>
                                  <span className={styles.value}>
                                    {sessionData.result.factory}
                                  </span>
                                </div>
                              )}

                            {sessionData.result?.productionNumber && (
                              <div className={styles.resultItem}>
                                <span className={styles.label}>
                                  🔢 Production #:
                                </span>
                                <span className={styles.value}>
                                  {sessionData.result.productionContext ||
                                    `#${
                                      sessionData.result?.productionNumber ||
                                      "Unknown"
                                    }`}
                                </span>
                              </div>
                            )}

                            {sessionData.result?.batchNumber && (
                              <div className={styles.resultItem}>
                                <span className={styles.label}>📦 Batch:</span>
                                <span className={styles.value}>
                                  {sessionData.result?.batchNumber}
                                </span>
                              </div>
                            )}

                            {sessionData.result?.model && (
                              <div className={styles.resultItem}>
                                <span className={styles.label}>🎸 Model:</span>
                                <span className={styles.value}>
                                  {sessionData.result?.model}
                                </span>
                              </div>
                            )}

                            {sessionData.result?.modelNotes && (
                              <div className={styles.resultItem}>
                                <span className={styles.label}>
                                  ✨ Special Edition:
                                </span>
                                <span className={styles.value}>
                                  {sessionData.result?.modelNotes}
                                </span>
                              </div>
                            )}
                          </>
                        )}

                        <div className={styles.resultItem}>
                          <span className={styles.label}>🎯 Confidence:</span>
                          <span
                            className={`${styles.value} ${
                              sessionData.result?.confidence &&
                              typeof sessionData.result.confidence === "string"
                                ? styles[
                                    sessionData.result.confidence.toLowerCase()
                                  ] || ""
                                : ""
                            }`}
                          >
                            {sessionData.result?.confidence || "Unknown"}
                          </span>
                        </div>

                        <div className={styles.ruleSection}>
                          <p className={styles.ruleLabel}>
                            How I figured this out:
                          </p>
                          <p className={styles.ruleText}>
                            {sessionData.result?.rule ||
                              "Analysis completed based on serial number pattern."}
                          </p>
                        </div>

                        {(sessionData.result?.confidence !== "High" ||
                          sessionData.result?.error ||
                          sessionData.result?.ambiguityNotes) && (
                          <div className={styles.uncertaintyNote}>
                            <p>
                              💡 <strong>Note:</strong>{" "}
                              {sessionData.result.error
                                ? "We couldn't decode this serial number format. Please verify the serial number or contact the manufacturer."
                                : sessionData.result.ambiguityNotes
                                ? sessionData.result.ambiguityNotes
                                : "Serial number dating can be complex. For the most accurate information, I'd recommend contacting " +
                                  (brandsData.brands.find(
                                    (b) => b.id === sessionData.brand
                                  )?.displayName || "the manufacturer") +
                                  " directly or consulting with a vintage guitar expert."}
                            </p>
                          </div>
                        )}

                        {sessionData.result.sources &&
                          Array.isArray(sessionData.result.sources) &&
                          sessionData.result.sources.length > 0 && (
                            <button
                              className={styles.sourcesButton}
                              onClick={handleShowSources}
                            >
                              See sources
                            </button>
                          )}

                        {/* Enhanced Fender Results */}
                        {sessionData.brand === "fender" &&
                          isSupportedFenderSerial(sessionData) && (
                            <FenderEnhancedResults
                              decodingResult={sessionData.result}
                              guitarData={{
                                brand: sessionData.brand,
                                serialNumber: sessionData.serialNumber,
                              }}
                              isSupported={isSupportedFenderSerial(sessionData)}
                            />
                          )}
                      </div>
                    )}
                </ChatMessage>
              ))}

              {showOptions && options.length > 0 && (
                <div className={styles.optionsContainer}>
                  {currentStep === "brand" ? (
                    <select
                      className={styles.brandSelect}
                      onChange={(e) =>
                        e.target.value && handleBrandSelect(e.target.value)
                      }
                      value=""
                    >
                      <option value="">-- Choose a brand --</option>
                      {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className={styles.clarificationOptions}>
                      {options.map((opt) => (
                        <button
                          key={opt.value}
                          className={styles.optionButton}
                          onClick={() => handleClarificationAnswer(opt.value)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className={styles.bottomArea}>
              <div className={styles.inputArea}>
                {currentStep === "complete" ? (
                  <div className={styles.completedActions}>
                    <Button
                      onClick={() => navigate("/feedback")}
                      variant="primary"
                      size="large"
                    >
                      Help Randy Improve
                    </Button>
                    <Button
                      onClick={handleNewLookup}
                      variant="secondary"
                      size="medium"
                    >
                      Look Up Another Guitar
                    </Button>
                    <Button
                      onClick={() => {
                        const urlToCopy = shareableUrl || window.location.href;
                        navigator.clipboard
                          .writeText(urlToCopy)
                          .then(() => {
                            alert("Link copied to clipboard!");
                          })
                          .catch(() => {
                            // Fallback for older browsers
                            const input = document.createElement("input");
                            input.value = urlToCopy;
                            document.body.appendChild(input);
                            input.select();
                            document.execCommand("copy");
                            document.body.removeChild(input);
                            alert("Link copied to clipboard!");
                          });
                      }}
                      variant="secondary"
                      size="medium"
                    >
                      Copy Link
                    </Button>
                  </div>
                ) : (
                  currentStep !== "clarification" && (
                    <form
                      onSubmit={handleInputSubmit}
                      className={styles.inputForm}
                    >
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={
                          currentStep === "brand"
                            ? "Type a brand name or select from above..."
                            : currentStep === "serial"
                            ? "Enter serial number..."
                            : "Type your answer..."
                        }
                        className={styles.chatInput}
                      />
                      <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className={styles.sendButton}
                      >
                        Send
                      </button>
                    </form>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sources Modal */}
      {showSourcesModal && sessionData.result?.sources && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>How Randy Decoded Your Serial Number</h2>
              <button className={styles.closeButton} onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <section className={styles.modalSection}>
                <h3>🔍 Decoding Logic</h3>
                <p className={styles.serialDisplay}>
                  Serial Number: <strong>{sessionData.serialNumber}</strong>
                </p>

                {sessionData.result.decodedValues && (
                  <div className={styles.decodedBreakdown}>
                    <h4>Breakdown:</h4>
                    <ul>
                      {Object.entries(sessionData.result.decodedValues).map(
                        ([key, value]) => (
                          <li key={key}>
                            <strong>{key}:</strong> {value}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                <p>{sessionData.result.rule}</p>
                {sessionData.result.notes && (
                  <p className={styles.notesText}>
                    <em>Note: {sessionData.result.notes}</em>
                  </p>
                )}
                {sessionData.result.ambiguityNotes && (
                  <p className={styles.notesText}>
                    <em>⚠️ Important: {sessionData.result.ambiguityNotes}</em>
                  </p>
                )}
              </section>

              <section className={styles.modalSection}>
                <h3>📚 Sources</h3>
                {sessionData.result.sources.map((source, index) => (
                  <div key={index} className={styles.sourceItem}>
                    <h4>{source.name}</h4>
                    <p>{source.description}</p>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.sourceLink}
                      >
                        Visit source →
                      </a>
                    )}
                  </div>
                ))}
              </section>

              {sessionData.result.factoryDetails && (
                <section className={styles.modalSection}>
                  <h3>🏭 Factory Information</h3>
                  <p>{sessionData.result.factoryDetails}</p>
                </section>
              )}

              {sessionData.result.sourceNotes && (
                <section className={styles.modalSection}>
                  <h3>📝 Additional Notes</h3>
                  <p>{sessionData.result.sourceNotes}</p>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatLookup;
