import React, { useState } from "react";
import SimpleInfoPopup from "./SimpleInfoPopup";
import FormPopup from "./FormPopup";
import styles from "../../styles/components/PersistentFooter.module.css";

const PersistentFooter = () => {
  const [privacyPopupOpen, setPrivacyPopupOpen] = useState(false);
  const [disclaimerPopupOpen, setDisclaimerPopupOpen] = useState(false);
  const [aboutPopupOpen, setAboutPopupOpen] = useState(false);
  const [reportIssuePopupOpen, setReportIssuePopupOpen] = useState(false);
  const [brandRequestPopupOpen, setBrandRequestPopupOpen] = useState(false);

  // Privacy popup content
  const privacyContent =
    "We do not collect any personal or identifying data from users. Only aggregate, anonymous data is tracked (such as which brands or guitars are searched, and general usage trends). This helps us improve GuitarLookup without ever tracking you individually. Your privacy is 100% respected here.";

  // Disclaimer popup content
  const disclaimerContent =
    "GuitarLookup is a work in progress, currently supporting a limited number of brands (see the brand dropdown for the full list). This project is created by musicians for musicians, is not affiliated with any brand, and is strictly for informational/educational use. If you'd like to contribute, share feedback, or report a bug, email: noah@guitarlookup.com.";

  // About popup content
  const aboutContent = `GuitarLookup is run by me—Noah, a guitarist who's spent years frustrated by the scattered, inconsistent information available for decoding serial numbers from different guitar brands. I know many others have compiled info and even built decoders, but there's still no single, trusted tool where players (and newcomers!) can quickly, confidently get answers. This is a passion project for the entire guitar community—no brand affiliation, no secret corporate funding.

Want to know more about me?
• My personal website: https://www.noahscott.org
• My LinkedIn profile: https://www.linkedin.com/in/noahmscott/`;

  // Report issue form fields
  const reportIssueFields = [
    {
      name: "problem",
      label: "What problem did you encounter?",
      type: "textarea",
      placeholder: "Please describe the issue you encountered...",
      required: true,
    },
    {
      name: "email",
      label: "Email (optional, for follow-up)",
      type: "email",
      placeholder: "your.email@example.com",
      required: false,
    },
  ];

  // Brand request form fields
  const brandRequestFields = [
    {
      name: "brandName",
      label: "Brand Name",
      type: "text",
      placeholder: "Enter the brand name...",
      required: true,
    },
    {
      name: "isManufacturer",
      label: "Are you the manufacturer/luthier?",
      type: "radio",
      options: ["Yes", "No"],
      required: true,
    },
    {
      name: "details",
      label: "Tell us more",
      type: "textarea",
      placeholder: "Share any additional details...",
      required: false,
      helperText:
        "If you're a manufacturer, tell us about your history, production numbers, or any data for our decoder logic. If you're a fan, let us know why this brand matters!",
    },
    {
      name: "website",
      label: "Website or documentation link",
      type: "url",
      placeholder: "https://...",
      required: false,
    },
    {
      name: "email",
      label: "Email (optional, for updates)",
      type: "email",
      placeholder: "your.email@example.com",
      required: false,
    },
  ];

  const handleReportIssueSubmit = async (formData) => {
    const response = await fetch("http://localhost:3001/api/report-issue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error("Failed to submit report");
    }

    return response.json();
  };

  const handleBrandRequestSubmit = async (formData) => {
    const response = await fetch("http://localhost:3001/api/brand-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error("Failed to submit brand request");
    }

    return response.json();
  };

  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.buttonContainer}>
          <button
            className={styles.footerButton}
            onClick={() => setPrivacyPopupOpen(true)}
          >
            Why we don't collect your data
          </button>
          <button
            className={styles.footerButton}
            onClick={() => setDisclaimerPopupOpen(true)}
          >
            Disclaimer
          </button>
          <button
            className={styles.footerButton}
            onClick={() => setAboutPopupOpen(true)}
          >
            Who runs this website?
          </button>
          <button
            className={styles.footerButton}
            onClick={() => setReportIssuePopupOpen(true)}
          >
            Report an Issue
          </button>
          <button
            className={styles.footerButton}
            onClick={() => setBrandRequestPopupOpen(true)}
          >
            Request a Brand / Submit Your Brand
          </button>
        </div>
      </footer>

      {/* Privacy Popup */}
      <SimpleInfoPopup
        isOpen={privacyPopupOpen}
        onClose={() => setPrivacyPopupOpen(false)}
        title="Why we don't collect your data"
        content={privacyContent}
      />

      {/* Disclaimer Popup */}
      <SimpleInfoPopup
        isOpen={disclaimerPopupOpen}
        onClose={() => setDisclaimerPopupOpen(false)}
        title="Disclaimer"
        content={disclaimerContent}
      />

      {/* About Popup */}
      <SimpleInfoPopup
        isOpen={aboutPopupOpen}
        onClose={() => setAboutPopupOpen(false)}
        title="Who runs this website?"
        content={aboutContent}
      />

      {/* Report Issue Popup */}
      <FormPopup
        isOpen={reportIssuePopupOpen}
        onClose={() => setReportIssuePopupOpen(false)}
        title="Report an Issue"
        fields={reportIssueFields}
        submitButtonText="Send Report"
        successMessage="Thanks for helping improve GuitarLookup! We review all submissions."
        onSubmit={handleReportIssueSubmit}
      />

      {/* Brand Request Popup */}
      <FormPopup
        isOpen={brandRequestPopupOpen}
        onClose={() => setBrandRequestPopupOpen(false)}
        title="Request a Brand or Submit Your Own"
        description="Are you a player who wants to see a new brand supported—or a manufacturer, luthier, or builder who wants your guitars included in GuitarLookup? Fill out the form below! Whether you're suggesting as a fan, owner, or you are the brand, we want to hear from you."
        fields={brandRequestFields}
        submitButtonText="Submit Request"
        successMessage="Thank you! Your request has been submitted. If you're a manufacturer/luthier, we'll reach out for more info as needed. Every suggestion helps us make GuitarLookup better for the community!"
        onSubmit={handleBrandRequestSubmit}
      />
    </>
  );
};

export default PersistentFooter;
