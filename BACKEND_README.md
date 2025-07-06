# GuitarLookup Backend Server

This document outlines the backend server infrastructure for GuitarLookup.com's footer functionality.

## Overview

The backend server handles email submissions for two main features:

- **Report an Issue**: Users can report problems with the website
- **Request a Brand**: Users can request new guitar brands to be added

## Architecture

### Server Structure

```
server/
├── server.js              # Main Express server
├── routes/
│   ├── reportIssue.js     # Handle issue reports
│   └── brandRequest.js    # Handle brand requests
├── middleware/
│   └── validation.js      # Request validation using Joi
├── services/
│   └── emailService.js    # Nodemailer email service
└── utils/
    └── emailTemplates.js  # Email HTML templates
```

### Key Features

- **Express.js** server with security middleware
- **Joi** validation for request data
- **Nodemailer** for email sending
- **Rate limiting** to prevent spam
- **CORS** configuration for frontend integration
- **Helmet** for security headers

## Setup Instructions

### 1. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Fill in your email configuration in `.env`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# SMTP Configuration for Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Email Configuration
FROM_EMAIL=your-email@gmail.com
TO_EMAIL=noah@guitarlookup.com
FROM_NAME=GuitarLookup

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

### 2. Gmail Setup

To use Gmail SMTP:

1. Enable 2-factor authentication on your Google account
2. Generate an App Password:
   - Go to Google Account Settings → Security → 2-Step Verification
   - Select "App passwords"
   - Choose "Mail" and generate a password
   - Use this password as `SMTP_PASSWORD`

### 3. Install Dependencies

Dependencies are already included in `package.json`:

```bash
npm install
```

### 4. Run the Server

**Development (backend only):**

```bash
npm run server
```

**Development (frontend + backend):**

```bash
npm run dev:full
```

The server will run on `http://localhost:3001`

## API Endpoints

### Health Check

```
GET /api/health
```

Returns server status and configuration info.

### Report Issue

```
POST /api/report-issue
Content-Type: application/json

{
  "problem": "Description of the issue (required, 10-1000 chars)",
  "email": "user@example.com (optional)"
}
```

### Brand Request

```
POST /api/brand-request
Content-Type: application/json

{
  "brandName": "Brand Name (required, 2-100 chars)",
  "isManufacturer": true/false (required),
  "details": "Additional details (optional, max 1000 chars)",
  "website": "https://example.com (optional, valid URL)",
  "email": "contact@example.com (optional)"
}
```

## Email Templates

### Report Issue Email

- **Subject**: "GuitarLookup: Issue Report"
- **Content**: Problem description and optional contact email
- **Recipient**: noah@guitarlookup.com

### Brand Request Email

- **Subject**: "GuitarLookup: [Manufacturer/Brand] Brand Submission — [Brand Name]"
- **Content**: Brand information, manufacturer status, details, and contact info
- **Recipient**: noah@guitarlookup.com

## Security Features

- **Rate Limiting**: 10 requests per 15 minutes per IP
- **Input Validation**: Joi schemas for all request data
- **CORS**: Configured for frontend domain only
- **Helmet**: Security headers for all responses
- **Data Sanitization**: Automatic trimming and cleaning of input data

## Development Scripts

```bash
# Run frontend only (Vite dev server)
npm run dev

# Run backend only (Express server with nodemon)
npm run server

# Run both frontend and backend concurrently
npm run dev:full

# Build for production
npm run build
```

## Deployment

### Vercel Configuration

The `vercel.json` file configures the server for Vercel's serverless functions:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Environment Variables on Vercel

Add these environment variables in your Vercel dashboard:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `FROM_EMAIL`
- `TO_EMAIL`
- `FROM_NAME`
- `FRONTEND_URL`

## Testing

### Manual Testing

1. **Test server health:**

   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Test report issue:**

   ```bash
   curl -X POST http://localhost:5000/api/report-issue \
     -H "Content-Type: application/json" \
     -d '{"problem": "Test issue report", "email": "test@example.com"}'
   ```

3. **Test brand request:**
   ```bash
   curl -X POST http://localhost:5000/api/brand-request \
     -H "Content-Type: application/json" \
     -d '{"brandName": "Test Brand", "isManufacturer": true, "email": "test@example.com"}'
   ```

### Error Handling

The server includes comprehensive error handling:

- **Validation errors**: 400 status with detailed field errors
- **Email sending errors**: 500 status with error message
- **Rate limiting**: 429 status with retry information
- **Not found**: 404 status for unknown endpoints

## Troubleshooting

### Common Issues

1. **Email not sending:**

   - Check Gmail App Password setup
   - Verify SMTP credentials in `.env`
   - Check server logs for error details

2. **CORS errors:**

   - Ensure `FRONTEND_URL` matches your frontend URL
   - Check browser developer tools for CORS messages

3. **Rate limiting:**
   - Wait 15 minutes or restart server in development
   - Check IP address if issues persist

### Logs

The server provides detailed logging:

- Request processing: `📧 Processing [type] request`
- Email success: `✅ Email sent successfully`
- Email errors: `❌ Email sending error`
- Server startup: Configuration details on startup

## Future Enhancements

- Add email templates for different languages
- Implement email queuing for high volume
- Add database logging for submitted requests
- Create admin dashboard for managing submissions
- Add email notifications for successful submissions
