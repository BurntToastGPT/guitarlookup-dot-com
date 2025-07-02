import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ChatMessage from "../components/chat/ChatMessage";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
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
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState([]);
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [shareableUrl, setShareableUrl] = useState(null);

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
      // Update browser URL without navigation
      window.history.replaceState({}, "", url);
    }
  }, [currentStep, sessionData, location.search]);

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
      text: "Hey there! I'm Randy, your guitar specialist. I'd love to help you discover your guitar's history! 🎸",
    });

    reconstructedMessages.push({
      id: Date.now() + 1,
      isRandy: true,
      text: "First things first - what brand is your guitar? You can select from the list or type it in.",
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
        text: "Hey there! I'm Randy, your guitar specialist. I'd love to help you discover your guitar's history! 🎸",
      },
      {
        id: Date.now() + 1,
        isRandy: true,
        text: "First things first - what brand is your guitar? You can select from the list or type it in.",
      },
    ];
    setMessages(initialMessages);
    setShowOptions(true);
    setOptions(
      brandsData.brands.map((b) => ({ value: b.id, label: b.displayName }))
    );
  };

  const addMessage = (text, isRandy = false, showResults = false) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      isRandy,
      text: !showResults ? text : undefined,
      showResults,
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

    // Randy's response
    setTimeout(() => {
      addMessage(
        `Great choice! ${brand.displayName} makes some fantastic instruments. Now, can you share the serial number with me? It's usually on the back of the headstock or inside the sound hole.`,
        true
      );
      setCurrentStep("serial");
    }, 500);
  };

  const handleSerialSubmit = () => {
    if (!inputValue.trim()) return;

    // Add user message
    addMessage(inputValue, false);
    setInputValue("");

    // Update session data
    setSessionData((prev) => ({ ...prev, serialNumber: inputValue }));

    // Process serial
    setTimeout(() => {
      const result = decodeSerial(sessionData.brand, inputValue);

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
        // Show results
        showResults(result);
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
    setSessionData((prev) => ({ ...prev, result }));

    const brandName =
      brandsData.brands.find((b) => b.id === sessionData.brand)?.displayName ||
      sessionData.brand;

    // Add confidence-based intro message
    let introMessage;
    if (result.confidence === "High") {
      introMessage = `Great news! I found detailed information about your ${brandName}.`;
    } else if (result.confidence === "Medium") {
      introMessage = `I've found some information about your ${brandName}, though there's a bit of uncertainty due to the serial number format.`;
    } else {
      introMessage = `I found some basic information about your ${brandName}, but the serial number format is unusual, so I'm less certain about the details.`;
    }

    addMessage(introMessage, true);

    // Add results message after delay
    setTimeout(() => {
      addMessage(null, true, true);
      setCurrentStep("complete");
    }, 800);
  };

  const handleNewLookup = () => {
    const newSessionId = generateSessionId();
    navigate(`/lookup/${newSessionId}`);
    window.location.reload(); // Fresh start
  };

  const handleShowSources = () => {
    setShowSourcesModal(true);
  };

  const handleCloseModal = () => {
    setShowSourcesModal(false);
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
    <div className={styles.container}>
      <div className={styles.chatWindow}>
        <div className={styles.messagesArea}>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} isRandy={msg.isRandy} message={msg.text}>
              {msg.showResults && sessionData.result && (
                <div className={styles.resultsCard}>
                  <h3 className={styles.resultsTitle}>
                    Your{" "}
                    {
                      brandsData.brands.find((b) => b.id === sessionData.brand)
                        ?.displayName
                    }{" "}
                    Details:
                  </h3>

                  <div className={styles.resultItem}>
                    <span className={styles.label}>📅 Year(s):</span>
                    <span className={styles.value}>
                      {Array.isArray(sessionData.result.years)
                        ? sessionData.result.years.join(" - ")
                        : sessionData.result.years}
                    </span>
                  </div>

                  {sessionData.result.exactDate && (
                    <div className={styles.resultItem}>
                      <span className={styles.label}>📆 Exact Date:</span>
                      <span className={styles.value}>
                        {sessionData.result.exactDate.month}{" "}
                        {sessionData.result.exactDate.day},{" "}
                        {sessionData.result.exactDate.year}
                      </span>
                    </div>
                  )}

                  {sessionData.result.country &&
                    sessionData.result.country !== "Unknown" && (
                      <div className={styles.resultItem}>
                        <span className={styles.label}>🌍 Country:</span>
                        <span className={styles.value}>
                          {sessionData.result.country}
                        </span>
                      </div>
                    )}

                  {sessionData.result.factory &&
                    sessionData.result.factory !== "Not available" && (
                      <div className={styles.resultItem}>
                        <span className={styles.label}>🏭 Factory:</span>
                        <span className={styles.value}>
                          {sessionData.result.factory}
                        </span>
                      </div>
                    )}

                  {sessionData.result.productionNumber && (
                    <div className={styles.resultItem}>
                      <span className={styles.label}>🔢 Production #:</span>
                      <span className={styles.value}>
                        {sessionData.result.productionContext ||
                          `#${sessionData.result.productionNumber}`}
                      </span>
                    </div>
                  )}

                  {sessionData.result.modelNotes && (
                    <div className={styles.resultItem}>
                      <span className={styles.label}>✨ Special Edition:</span>
                      <span className={styles.value}>
                        {sessionData.result.modelNotes}
                      </span>
                    </div>
                  )}

                  <div className={styles.resultItem}>
                    <span className={styles.label}>🎯 Confidence:</span>
                    <span
                      className={`${styles.value} ${
                        styles[sessionData.result.confidence.toLowerCase()]
                      }`}
                    >
                      {sessionData.result.confidence}
                    </span>
                  </div>

                  <div className={styles.ruleSection}>
                    <p className={styles.ruleLabel}>How I figured this out:</p>
                    <p className={styles.ruleText}>{sessionData.result.rule}</p>
                  </div>

                  {sessionData.result.confidence !== "High" && (
                    <div className={styles.uncertaintyNote}>
                      <p>
                        💡 <strong>Note:</strong> Serial number dating can be
                        complex. For the most accurate information, I'd
                        recommend contacting{" "}
                        {
                          brandsData.brands.find(
                            (b) => b.id === sessionData.brand
                          )?.displayName
                        }{" "}
                        directly or consulting with a vintage guitar expert.
                      </p>
                    </div>
                  )}

                  {sessionData.result.sources &&
                    sessionData.result.sources.length > 0 && (
                      <button
                        className={styles.sourcesButton}
                        onClick={handleShowSources}
                      >
                        See sources
                      </button>
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
            </div>
          ) : (
            currentStep !== "clarification" && (
              <form onSubmit={handleInputSubmit} className={styles.inputForm}>
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

      {/* Share URL notice */}
      {currentStep === "complete" && (
        <div className={styles.shareNotice}>
          <p>📎 Share this lookup:</p>
          <div className={styles.shareActions}>
            <input
              type="text"
              value={shareableUrl || window.location.href}
              readOnly
              className={styles.shareInput}
              onClick={(e) => e.target.select()}
            />
            <button
              className={styles.copyButton}
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
            >
              Copy Link
            </button>
          </div>
        </div>
      )}

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
                <p>{sessionData.result.rule}</p>
                {sessionData.result.notes && (
                  <p className={styles.notesText}>
                    <em>Note: {sessionData.result.notes}</em>
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
