import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { decodeSerial, decodeGibsonSerial } from "../../utils/serialDecoder";
import brandsData from "../../data/brands.json";
import styles from "../../styles/components/ChatContainer.module.css";

const ChatContainer = () => {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState("greeting");
  const [guitarData, setGuitarData] = useState({
    brand: "",
    serialNumber: "",
  });
  const [isTyping, setIsTyping] = useState(false);

  // Initialize with Randy's greeting
  useEffect(() => {
    // Prevent duplicate initialization
    if (messages.length > 0) return;

    const greetingMessage = {
      id: `msg-${Date.now()}-1`,
      isRandy: true,
      message:
        "Hey there! I'm Randy, your guitar specialist. I'd love to help you discover your guitar's history! 🎸",
    };

    const followUpMessage = {
      id: `msg-${Date.now()}-2`,
      isRandy: true,
      message:
        "First things first - what brand is your guitar? You can select from the list or type it in.",
      showBrandSelect: true,
    };

    setMessages([greetingMessage]);

    // Add a delay for the follow-up message
    const timer = setTimeout(() => {
      setMessages((prev) => [...prev, followUpMessage]);
    }, 1500);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (message, isRandy = false, options = {}) => {
    const newMessage = {
      id: Date.now(),
      isRandy,
      message,
      ...options,
    };

    if (isRandy) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, newMessage]);
      }, 800 + Math.random() * 700); // Random typing delay
    } else {
      setMessages((prev) => [...prev, newMessage]);
    }
  };

  const handleBrandSelect = (brand) => {
    const brandName =
      brandsData.brands.find((b) => b.id === brand)?.displayName || brand;

    // Add user message
    addMessage(brandName, false);

    // Update guitar data
    setGuitarData((prev) => ({ ...prev, brand }));
    setCurrentStep("serial");

    // Randy's response
    setTimeout(() => {
      addMessage(
        `Great choice! ${brandName} makes some fantastic instruments. Now, can you share the serial number with me? It's usually on the back of the headstock or inside the sound hole.`,
        true,
        { showSerialInput: true }
      );
    }, 500);
  };

  const handleSerialSubmit = (serialNumber) => {
    // Add user message
    addMessage(serialNumber, false);

    // Update guitar data
    const updatedData = { ...guitarData, serialNumber };
    setGuitarData(updatedData);

    // Store in sessionStorage for other pages
    sessionStorage.setItem("guitarData", JSON.stringify(updatedData));

    // Process the serial number
    setTimeout(() => {
      addMessage("Let me look that up for you...", true);

      // Use special handler for Gibson
      let result;
      if (guitarData.brand === "gibson") {
        result = decodeGibsonSerial(serialNumber, []);
      } else {
        result = decodeSerial(guitarData.brand, serialNumber);
      }

      setTimeout(() => {
        if (result.needsClarification) {
          // Store the clarification question with all necessary data
          sessionStorage.setItem(
            "clarificationQuestion",
            JSON.stringify({
              question: result.question,
              options: result.options,
              reason: result.reason,
              ruleIndex: result.ruleIndex,
              previousAnswers: result.previousAnswers || [],
            })
          );

          // Clear any previous answers for new lookups
          sessionStorage.removeItem("clarificationAnswers");

          addMessage(
            `Hmm, I need a bit more info to narrow this down. ${result.reason}`,
            true
          );

          setTimeout(() => {
            navigate("/clarify");
          }, 1500);
        } else if (result.error) {
          addMessage(
            "I'm having trouble with that serial number. Could you double-check it for me?",
            true,
            { showSerialInput: true }
          );
        } else {
          // Store results and navigate
          sessionStorage.setItem("decodingResult", JSON.stringify(result));

          addMessage(
            "Got it! I've found some information about your guitar. Let me show you what I discovered...",
            true
          );

          setTimeout(() => {
            navigate("/results");
          }, 1500);
        }
      }, 1500);
    }, 500);
  };

  const handleInputSubmit = (value) => {
    if (currentStep === "greeting" || currentStep === "brand") {
      setCurrentStep("brand");
      // Check if the input matches a brand
      const brand = brandsData.brands.find(
        (b) =>
          b.name.toLowerCase() === value.toLowerCase() ||
          b.displayName.toLowerCase() === value.toLowerCase()
      );

      if (brand) {
        handleBrandSelect(brand.id);
      } else {
        addMessage(value, false);
        setTimeout(() => {
          addMessage(
            "I don't have that brand in my database yet, but I'm always learning! Could you select from one of these brands for now?",
            true,
            { showBrandSelect: true }
          );
        }, 500);
      }
    } else if (currentStep === "serial") {
      if (value.trim().length >= 3) {
        handleSerialSubmit(value.trim());
      } else {
        addMessage(value, false);
        setTimeout(() => {
          addMessage(
            "Serial numbers are usually at least 3 characters long. Could you check again and make sure you've got the complete serial number?",
            true,
            { showSerialInput: true }
          );
        }, 500);
      }
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messagesArea}>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg.message} isRandy={msg.isRandy}>
            {msg.showBrandSelect && (
              <div className={styles.brandSelectWrapper}>
                <select
                  className={styles.brandSelect}
                  onChange={(e) =>
                    e.target.value && handleBrandSelect(e.target.value)
                  }
                  defaultValue=""
                >
                  <option value="">-- Choose a brand --</option>
                  {brandsData.brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.displayName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {msg.showSerialInput && (
              <div className={styles.serialInputWrapper}>
                <ChatInput
                  placeholder="Enter serial number..."
                  onSubmit={handleSerialSubmit}
                  autoFocus
                />
              </div>
            )}
          </ChatMessage>
        ))}

        {isTyping && (
          <div className={styles.typingIndicator}>
            <ChatMessage isRandy>
              <div className={styles.typingDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </ChatMessage>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {(currentStep === "greeting" || currentStep === "brand") &&
        messages.length > 1 &&
        !guitarData.brand && (
          <div className={styles.inputArea}>
            <ChatInput
              placeholder="Type a brand name or select from above..."
              onSubmit={handleInputSubmit}
            />
          </div>
        )}
    </div>
  );
};

export default ChatContainer;
