import express from "express";
import { validateReportIssue } from "../middleware/validation.js";
import { sendReportIssueEmail } from "../services/emailService.js";

const router = express.Router();

// POST /api/report-issue
router.post("/", validateReportIssue, async (req, res) => {
  try {
    const { problem, email } = req.body;

    // Log the request for debugging
    console.log("📧 Processing report issue request:", {
      problem: problem.substring(0, 100) + "...",
      hasEmail: Boolean(email),
      timestamp: new Date().toISOString(),
    });

    // Send email
    const result = await sendReportIssueEmail({ problem, email });

    // Log success
    console.log("✅ Report issue email sent successfully:", result.messageId);

    // Return success response
    res.status(200).json({
      success: true,
      message: "Issue report submitted successfully",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("❌ Error processing report issue request:", error);

    // Return error response
    res.status(500).json({
      success: false,
      error: "Failed to submit issue report",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// GET /api/report-issue (for testing)
router.get("/", (req, res) => {
  res.json({
    endpoint: "POST /api/report-issue",
    description: "Submit an issue report",
    requiredFields: ["problem"],
    optionalFields: ["email"],
    example: {
      problem: "Found an issue with the serial number lookup feature",
      email: "user@example.com",
    },
  });
});

export default router;
