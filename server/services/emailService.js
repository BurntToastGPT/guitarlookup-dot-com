import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter
const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  return transporter;
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email configuration verified successfully");
    return true;
  } catch (error) {
    console.error("❌ Email configuration error:", error.message);
    return false;
  }
};

// Send email function
const sendEmail = async (emailOptions) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: process.env.TO_EMAIL,
      subject: emailOptions.subject,
      html: emailOptions.html,
      text: emailOptions.text,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully:", info.messageId);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ Email sending error:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send report issue email
const sendReportIssueEmail = async (data) => {
  const { problem, email } = data;

  const subject = "GuitarLookup: Issue Report";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
        🎸 GuitarLookup Issue Report
      </h2>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #dc3545; margin-top: 0;">Problem Description:</h3>
        <p style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #dc3545;">
          ${problem}
        </p>
      </div>
      
      ${
        email
          ? `
        <div style="background: #e9ecef; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #28a745; margin-top: 0;">Contact Information:</h3>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        </div>
      `
          : `
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
          <p style="margin: 0; color: #856404;">
            <strong>Note:</strong> No contact email provided by the user.
          </p>
        </div>
      `
      }
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 12px;">
        <p>This report was submitted through the GuitarLookup.com website.</p>
        <p>Timestamp: ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;

  const text = `
GuitarLookup Issue Report

Problem Description:
${problem}

${email ? `Contact Email: ${email}` : "No contact email provided"}

Submitted: ${new Date().toLocaleString()}
  `;

  return await sendEmail({ subject, html, text });
};

// Send brand request email
const sendBrandRequestEmail = async (data) => {
  const { brandName, isManufacturer, details, website, email } = data;

  const subjectPrefix = isManufacturer ? "[Manufacturer/Brand]" : "";
  const subject = `GuitarLookup: ${subjectPrefix} Brand ${
    isManufacturer ? "Submission" : "Request"
  } — ${brandName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
        🎸 GuitarLookup Brand ${isManufacturer ? "Submission" : "Request"}
      </h2>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #28a745; margin-top: 0;">Brand Information:</h3>
        <p><strong>Brand Name:</strong> ${brandName}</p>
        <p><strong>Request Type:</strong> 
          <span style="background: ${
            isManufacturer ? "#d1ecf1" : "#fff3cd"
          }; padding: 2px 8px; border-radius: 4px;">
            ${
              isManufacturer
                ? "Official Brand/Manufacturer Submission"
                : "User Brand Request"
            }
          </span>
        </p>
        ${
          website
            ? `<p><strong>Website:</strong> <a href="${website}">${website}</a></p>`
            : ""
        }
      </div>
      
      ${
        details
          ? `
        <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Additional Details:</h3>
          <p style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #007bff;">
            ${details}
          </p>
        </div>
      `
          : ""
      }
      
      ${
        email
          ? `
        <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #155724; margin-top: 0;">Contact Information:</h3>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        </div>
      `
          : `
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
          <p style="margin: 0; color: #856404;">
            <strong>Note:</strong> No contact email provided by the user.
          </p>
        </div>
      `
      }
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 12px;">
        <p>This request was submitted through the GuitarLookup.com website.</p>
        <p>Timestamp: ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;

  const text = `
GuitarLookup Brand ${isManufacturer ? "Submission" : "Request"}

Brand Name: ${brandName}
Request Type: ${
    isManufacturer
      ? "Official Brand/Manufacturer Submission"
      : "User Brand Request"
  }
${website ? `Website: ${website}` : ""}

${details ? `Additional Details:\n${details}` : ""}

${email ? `Contact Email: ${email}` : "No contact email provided"}

Submitted: ${new Date().toLocaleString()}
  `;

  return await sendEmail({ subject, html, text });
};

export {
  verifyEmailConfig,
  sendEmail,
  sendReportIssueEmail,
  sendBrandRequestEmail,
};
