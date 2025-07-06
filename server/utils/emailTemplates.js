// Email template for report issue
const reportIssueTemplate = (data) => {
  const { problem, email } = data;

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

  return { html, text };
};

// Email template for brand request
const brandRequestTemplate = (data) => {
  const { brandName, isManufacturer, details, website, email } = data;

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

  return { html, text };
};

// Generate email subject for report issue
const getReportIssueSubject = () => {
  return "GuitarLookup: Issue Report";
};

// Generate email subject for brand request
const getBrandRequestSubject = (brandName, isManufacturer) => {
  const subjectPrefix = isManufacturer ? "[Manufacturer/Brand]" : "";
  return `GuitarLookup: ${subjectPrefix} Brand ${
    isManufacturer ? "Submission" : "Request"
  } — ${brandName}`;
};

// Base email styles for consistency
const baseEmailStyles = `
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 2px solid #007bff;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .section {
      margin: 20px 0;
      padding: 20px;
      border-radius: 8px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #dee2e6;
      color: #6c757d;
      font-size: 12px;
    }
  </style>
`;

export {
  reportIssueTemplate,
  brandRequestTemplate,
  getReportIssueSubject,
  getBrandRequestSubject,
  baseEmailStyles,
};
