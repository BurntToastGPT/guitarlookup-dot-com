import React from "react";
import PropTypes from "prop-types";
import { getFenderFunFact } from "../../utils/fenderFunFacts";
import styles from "./FenderEnhancedResults.module.css";

const FenderEnhancedResults = ({ decodingResult, guitarData, isSupported }) => {
  // Only render for supported Fender serials
  if (!isSupported || !decodingResult || !guitarData) {
    return null;
  }

  // Get the year for fun facts and model suggestions
  const year =
    decodingResult.decodedValues?.Year ||
    decodingResult.years ||
    (Array.isArray(decodingResult.years) ? decodingResult.years[0] : null);

  const numericYear = typeof year === "string" ? parseInt(year, 10) : year;

  // Get fun fact
  const funFact = getFenderFunFact(numericYear);

  // Get country for origin-specific information
  const country =
    decodingResult.decodedValues?.Country ||
    decodingResult.country ||
    "Unknown";

  const isMexican = country === "Mexico" || country === "MX";
  const isUS =
    country === "United States" || country === "USA" || country === "US";

  // Era-based model suggestions
  const getModelSuggestions = (year) => {
    if (!year) return null;

    if (year >= 1976 && year <= 1985) {
      return {
        era: "Mid-70s to Mid-80s",
        description:
          "This era includes the later CBS years and the transition period. These guitars often feature larger headstocks and unique hardware.",
        popularModels: [
          "Stratocaster with large headstock",
          "Telecaster with bullet truss rod",
          "Precision Bass with maple neck",
        ],
      };
    } else if (year >= 1986 && year <= 1999) {
      return {
        era: "Late 80s to 90s",
        description:
          "The post-CBS revival era brought back classic features while introducing modern improvements.",
        popularModels: [
          "American Standard Stratocaster",
          "American Standard Telecaster",
          "Stratocaster Plus with Lace Sensors",
        ],
      };
    } else if (year >= 2000 && year <= 2009) {
      return {
        era: "2000s",
        description:
          "The millennium era featured refined American Series guitars with modern appointments and improved consistency.",
        popularModels: [
          "American Series Stratocaster",
          "American Deluxe Stratocaster",
          "Highway One series",
        ],
      };
    } else if (year >= 2010) {
      return {
        era: "2010s and Beyond",
        description:
          "Modern Fender guitars with premium hardware, improved fretwork, and innovative features.",
        popularModels: [
          "American Professional Series",
          "Player Series (Mexico)",
          "American Elite/Ultra Series",
        ],
      };
    }
    return null;
  };

  const modelSuggestions = getModelSuggestions(numericYear);

  return (
    <div className={styles.enhancedResults}>
      {/* Fun Fact Box */}
      {funFact && (
        <div className={styles.funFactBox}>
          <h3 className={styles.funFactTitle}>
            🎸 Fun Fact About {numericYear}
          </h3>
          <p className={styles.funFactText}>{funFact.fact}</p>
          <a
            href={funFact.source}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.funFactSource}
          >
            Read more about this →
          </a>
        </div>
      )}

      {/* What This Means for You */}
      {modelSuggestions && (
        <div className={styles.meaningSection}>
          <h3 className={styles.sectionTitle}>🔍 What This Means for You</h3>
          <div className={styles.meaningContent}>
            <h4 className={styles.eraTitle}>{modelSuggestions.era} Era</h4>
            <p className={styles.eraDescription}>
              {modelSuggestions.description}
            </p>

            <div className={styles.popularModels}>
              <h5 className={styles.modelsTitle}>
                Popular models from this time:
              </h5>
              <ul className={styles.modelsList}>
                {modelSuggestions.popularModels.map((model, index) => (
                  <li key={index} className={styles.modelItem}>
                    {model}
                  </li>
                ))}
              </ul>
            </div>

            {isMexican && (
              <div className={styles.originNote}>
                <p>
                  <strong>Made in Mexico:</strong> These guitars offer excellent
                  value and quality, often featuring the same electronics and
                  hardware as their US counterparts at a more accessible price
                  point.
                </p>
              </div>
            )}

            {isUS && (
              <div className={styles.originNote}>
                <p>
                  <strong>Made in USA:</strong> These represent Fender's
                  flagship instruments, built with premium materials and
                  meticulous attention to detail in Corona, California.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* External Resource Links */}
      <div className={styles.resourcesSection}>
        <h3 className={styles.sectionTitle}>📚 Learn More About Your Fender</h3>
        <div className={styles.resourceGrid}>
          <div className={styles.resourceCard}>
            <h4 className={styles.resourceTitle}>Official Fender Resources</h4>
            <ul className={styles.resourceList}>
              <li>
                <a
                  href="https://www.fender.com/articles/gear/decoding-fender-serial-numbers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.resourceLink}
                >
                  Fender Serial Number Guide
                </a>
              </li>
              <li>
                <a
                  href="https://www.fender.com/support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.resourceLink}
                >
                  Fender Customer Support
                </a>
              </li>
              <li>
                <a
                  href="https://www.fender.com/articles/gear/guitar-care"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.resourceLink}
                >
                  Guitar Care & Maintenance
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.resourceCard}>
            <h4 className={styles.resourceTitle}>Community & Information</h4>
            <ul className={styles.resourceList}>
              <li>
                <a
                  href="https://reverb.com/news/how-to-date-a-fender"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.resourceLink}
                >
                  Reverb Dating Guide
                </a>
              </li>
              <li>
                <a
                  href="https://www.tdpri.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.resourceLink}
                >
                  Telecaster Discussion Page
                </a>
              </li>
              <li>
                <a
                  href="https://www.stratocaster.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.resourceLink}
                >
                  Stratocaster Community
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Inherited Instrument Message */}
      <div className={styles.heritageSection}>
        <h3 className={styles.sectionTitle}>💝 Is This a Family Guitar?</h3>
        <div className={styles.heritageContent}>
          <p className={styles.heritageText}>
            If this guitar was passed down to you, you're holding more than just
            an instrument—you're carrying forward someone's musical journey.
            Family guitars often have the most character and story to tell.
          </p>
          <div className={styles.heritageAdvice}>
            <h4 className={styles.adviceTitle}>
              Making the Most of Your Heritage Guitar:
            </h4>
            <ul className={styles.adviceList}>
              <li>
                Consider having it professionally set up for optimal playability
              </li>
              <li>Document its history and any unique modifications</li>
              <li>Keep original parts even if you decide to upgrade</li>
              <li>Share its story with other musicians and family members</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Still Stuck Section */}
      <div className={styles.helpSection}>
        <h3 className={styles.sectionTitle}>🤔 Still Need Help?</h3>
        <div className={styles.helpContent}>
          <p className={styles.helpText}>
            Guitar identification can be tricky, especially with older or
            modified instruments. Here are some next steps:
          </p>

          <div className={styles.helpOptions}>
            <div className={styles.helpOption}>
              <h4 className={styles.optionTitle}>📸 Take Photos</h4>
              <p className={styles.optionText}>
                Clear photos of the headstock, serial number, and any unique
                features can help experts identify your guitar more accurately.
              </p>
            </div>

            <div className={styles.helpOption}>
              <h4 className={styles.optionTitle}>🏪 Visit a Music Store</h4>
              <p className={styles.optionText}>
                Local guitar shops often have experienced staff who can help
                identify your instrument and provide maintenance advice.
              </p>
            </div>

            <div className={styles.helpOption}>
              <h4 className={styles.optionTitle}>💬 Join Communities</h4>
              <p className={styles.optionText}>
                Online forums like the Telecaster Discussion Page or Reddit's
                r/guitars have knowledgeable communities willing to help.
              </p>
            </div>
          </div>

          <div className={styles.contactInfo}>
            <h4 className={styles.contactTitle}>Direct Contact Options:</h4>
            <ul className={styles.contactList}>
              <li>
                <strong>Fender Customer Service:</strong>
                <a
                  href="https://www.fender.com/support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                >
                  Submit a support request
                </a>
              </li>
              <li>
                <strong>Vintage Guitar Experts:</strong> Consider contacting a
                certified guitar appraiser for valuable or rare instruments
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Reference Block */}
      <div className={styles.referenceSection}>
        <h3 className={styles.sectionTitle}>
          📋 Quick Reference: What Fender Serials Tell You
        </h3>
        <div className={styles.referenceGrid}>
          <div className={styles.referenceCard}>
            <h4 className={styles.referenceTitle}>✅ What We Can Determine</h4>
            <ul className={styles.referenceList}>
              <li>Manufacturing year (usually within 1-2 years)</li>
              <li>Country of origin (USA, Mexico, etc.)</li>
              <li>General production period</li>
              <li>Factory location in some cases</li>
              <li>Whether it's part of a special series</li>
            </ul>
          </div>

          <div className={styles.referenceCard}>
            <h4 className={styles.referenceTitle}>
              ❌ What We Cannot Determine
            </h4>
            <ul className={styles.referenceList}>
              <li>Exact model (Stratocaster, Telecaster, etc.)</li>
              <li>Specific color or finish</li>
              <li>Pickup configuration</li>
              <li>Whether it's been modified</li>
              <li>Current market value</li>
            </ul>
          </div>
        </div>

        <div className={styles.referenceNote}>
          <p className={styles.noteText}>
            <strong>Remember:</strong> Serial numbers are just one piece of the
            puzzle. The neck date, pot codes, and physical features all
            contribute to a complete identification of your guitar.
          </p>
        </div>
      </div>
    </div>
  );
};

FenderEnhancedResults.propTypes = {
  decodingResult: PropTypes.object.isRequired,
  guitarData: PropTypes.object.isRequired,
  isSupported: PropTypes.bool.isRequired,
};

export default FenderEnhancedResults;
