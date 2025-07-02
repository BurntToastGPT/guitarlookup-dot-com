import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../common/Input";
import Button from "../common/Button";
import brandsData from "../../data/brands.json";
import styles from "../../styles/components/Form.module.css";

const BrandSerialForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    brand: "",
    serialNumber: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.brand) {
      newErrors.brand = "Please select a brand";
    }

    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = "Please enter a serial number";
    } else if (formData.serialNumber.trim().length < 3) {
      newErrors.serialNumber = "Serial number must be at least 3 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Store data in sessionStorage for the next page
      sessionStorage.setItem("guitarData", JSON.stringify(formData));

      // Navigate to clarification or results page
      // For now, we'll go to clarification page
      navigate("/clarify");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="brand-select" className={styles.selectLabel}>
          Select Your Guitar Brand
          <span className={styles.required}>*</span>
        </label>
        <select
          id="brand-select"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          className={`${styles.select} ${errors.brand ? styles.error : ""}`}
          aria-invalid={!!errors.brand}
          aria-describedby={errors.brand ? "brand-error" : undefined}
        >
          <option value="">-- Choose a brand --</option>
          {brandsData.brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.displayName}
            </option>
          ))}
        </select>
        {errors.brand && (
          <span id="brand-error" className={styles.errorText}>
            {errors.brand}
          </span>
        )}
      </div>

      <Input
        label="Enter Serial Number"
        name="serialNumber"
        type="text"
        value={formData.serialNumber}
        onChange={handleChange}
        placeholder="e.g., Z0123456, MN8123456"
        required
        error={errors.serialNumber}
        helperText="Found on the back of the headstock or inside the sound hole"
        size="large"
      />

      <Button type="submit" size="large" fullWidth>
        Look Up My Guitar
      </Button>
    </form>
  );
};

export default BrandSerialForm;
