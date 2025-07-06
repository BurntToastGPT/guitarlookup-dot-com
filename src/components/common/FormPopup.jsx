import React, { useState } from "react";
import FooterPopup from "./FooterPopup";
import Button from "./Button";
import Input from "./Input";
import styles from "../../styles/components/FormPopup.module.css";

/**
 * FormPopup Component
 *
 * Used for displaying forms like report issue and brand request.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Function to close modal
 * @param {string} props.title - Modal title
 * @param {string} props.description - Optional description text
 * @param {Array} props.fields - Form field definitions
 * @param {string} props.submitButtonText - Submit button text
 * @param {string} props.successMessage - Success message to display
 * @param {Function} props.onSubmit - Submit handler function
 */
const FormPopup = ({
  isOpen,
  onClose,
  title,
  description,
  fields = [],
  submitButtonText = "Submit",
  successMessage = "Thank you! Your submission has been received.",
  onSubmit,
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    fields.forEach((field) => {
      if (field.required && !formData[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }

      if (field.type === "email" && formData[field.name]?.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.name].trim())) {
          newErrors[field.name] = "Please enter a valid email address";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      setIsSuccess(true);
      setFormData({});

      // Auto-close after showing success message
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Form submission error:", error);
      setErrors({
        submit: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    setErrors({});
    setIsSuccess(false);
    onClose();
  };

  if (isSuccess) {
    return (
      <FooterPopup isOpen={isOpen} onClose={handleClose} title="Success!">
        <div className={styles.successContent}>
          <div className={styles.successIcon}>✓</div>
          <p className={styles.successMessage}>{successMessage}</p>
        </div>
      </FooterPopup>
    );
  }

  return (
    <FooterPopup isOpen={isOpen} onClose={handleClose} title={title}>
      <div className={styles.content}>
        {description && <p className={styles.description}>{description}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {fields.map((field) => (
            <div key={field.name} className={styles.fieldWrapper}>
              {field.type === "textarea" ? (
                <div className={styles.textareaWrapper}>
                  <label htmlFor={field.name} className={styles.label}>
                    {field.label}
                    {field.required && (
                      <span className={styles.required}>*</span>
                    )}
                  </label>
                  <textarea
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className={`${styles.textarea} ${
                      errors[field.name] ? styles.error : ""
                    }`}
                    rows={4}
                    aria-invalid={!!errors[field.name]}
                    aria-describedby={
                      errors[field.name]
                        ? `${field.name}-error`
                        : field.helperText
                        ? `${field.name}-helper`
                        : undefined
                    }
                  />
                  {errors[field.name] && (
                    <span
                      id={`${field.name}-error`}
                      className={styles.errorText}
                    >
                      {errors[field.name]}
                    </span>
                  )}
                  {field.helperText && !errors[field.name] && (
                    <span
                      id={`${field.name}-helper`}
                      className={styles.helperText}
                    >
                      {field.helperText}
                    </span>
                  )}
                </div>
              ) : field.type === "radio" ? (
                <div className={styles.radioGroup}>
                  <label className={styles.label}>
                    {field.label}
                    {field.required && (
                      <span className={styles.required}>*</span>
                    )}
                  </label>
                  {field.options.map((option) => (
                    <label key={option} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name={field.name}
                        value={option}
                        checked={formData[field.name] === option}
                        onChange={handleInputChange}
                        className={styles.radioInput}
                      />
                      <span className={styles.radioText}>{option}</span>
                    </label>
                  ))}
                  {errors[field.name] && (
                    <span className={styles.errorText}>
                      {errors[field.name]}
                    </span>
                  )}
                </div>
              ) : (
                <Input
                  label={field.label}
                  name={field.name}
                  type={field.type || "text"}
                  value={formData[field.name] || ""}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  error={errors[field.name]}
                  helperText={field.helperText}
                />
              )}
            </div>
          ))}

          {errors.submit && (
            <div className={styles.submitError}>{errors.submit}</div>
          )}

          <div className={styles.buttonContainer}>
            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? "Submitting..." : submitButtonText}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="medium"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </FooterPopup>
  );
};

export default FormPopup;
