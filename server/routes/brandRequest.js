import express from "express";
import { validateBrandRequest } from "../middleware/validation.js";
import { sendBrandRequestEmail } from "../services/emailService.js";

const router = express.Router();

// POST /api/brand-request
router.post("/", validateBrandRequest, async (req, res) => {
  try {
    const { brandName, isManufacturer, details, website, email } = req.body;

    // Log the request for debugging
    console.log("📧 Processing brand request:", {
      brandName,
      isManufacturer,
      hasDetails: Boolean(details),
      hasWebsite: Boolean(website),
      hasEmail: Boolean(email),
      timestamp: new Date().toISOString(),
    });

    // Send email
    const result = await sendBrandRequestEmail({
      brandName,
      isManufacturer,
      details,
      website,
      email,
    });

    // Log success
    console.log("✅ Brand request email sent successfully:", result.messageId);

    // Return success response
    res.status(200).json({
      success: true,
      message: "Brand request submitted successfully",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("❌ Error processing brand request:", error);

    // Return error response
    res.status(500).json({
      success: false,
      error: "Failed to submit brand request",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// GET /api/brand-request (for testing)
router.get("/", (req, res) => {
  res.json({
    endpoint: "POST /api/brand-request",
    description: "Submit a brand request",
    requiredFields: ["brandName", "isManufacturer"],
    optionalFields: ["details", "website", "email"],
    example: {
      brandName: "Custom Guitar Co.",
      isManufacturer: true,
      details:
        "We are a boutique guitar manufacturer specializing in custom instruments.",
      website: "https://customguitarco.com",
      email: "info@customguitarco.com",
    },
  });
});

export default router;
