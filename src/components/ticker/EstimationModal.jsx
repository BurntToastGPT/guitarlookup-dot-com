import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "../../styles/components/EstimationModal.module.css";
import Button from "../common/Button";

/**
 * EstimationModal Component
 *
 * Modal component that explains how guitar count estimation works.
 * Includes external links to sources and proper accessibility features.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Function to close modal
 */
const EstimationModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previouslyFocusedElement = useRef(null);

  // Handle focus management
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previouslyFocusedElement.current = document.activeElement;

      // Focus the close button when modal opens
      setTimeout(() => {
        if (closeButtonRef.current) {
          closeButtonRef.current.focus();
        }
      }, 100);

      // Prevent body scrolling
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scrolling
      document.body.style.overflow = "unset";

      // Restore focus to previously focused element
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;

      if (event.key === "Escape") {
        onClose();
      }

      // Trap focus within modal
      if (event.key === "Tab") {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  // Render modal using portal to document body for fullscreen coverage
  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.content}>
          <p className={styles.message}>
            This guitar count reflects instruments in existence and being
            produced for currently supported brands only. Right now we only
            support <strong>Fender</strong>, but we're actively working to add
            Gibson, Martin, Taylor, and other major brands. When we do, you'll
            see this count jump significantly! This is an estimate based on
            available industry data for supported brands only.
          </p>
          <Button
            type="primary"
            size="large"
            onClick={onClose}
            className={styles.button}
          >
            Okay, thanks!
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EstimationModal;
