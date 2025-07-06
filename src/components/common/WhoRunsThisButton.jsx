import React, { useState } from "react";
import SimpleInfoPopup from "./SimpleInfoPopup";
import styles from "../../styles/components/WhoRunsThisButton.module.css";

const WhoRunsThisButton = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const aboutContent = `GuitarLookup is run by me—Noah, a guitarist who's spent years frustrated by the scattered, inconsistent information available for decoding serial numbers from different guitar brands. I know many others have compiled info and even built decoders, but there's still no single, trusted tool where players (and newcomers!) can quickly, confidently get answers. This is a passion project for the entire guitar community—no brand affiliation, no secret corporate funding.

Want to know more about me?
• My personal website: https://www.noahscott.org
• My LinkedIn profile: https://www.linkedin.com/in/noahmscott/`;

  return (
    <>
      <button
        className={styles.button}
        onClick={() => setIsPopupOpen(true)}
        aria-label="About the creator of GuitarLookup"
      >
        Who runs this website?
      </button>

      <SimpleInfoPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Who runs this website?"
        content={aboutContent}
      />
    </>
  );
};

export default WhoRunsThisButton;
