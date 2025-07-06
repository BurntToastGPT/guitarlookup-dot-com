import Joi from "joi";

// Validation schema for report issue form
const reportIssueSchema = Joi.object({
  problem: Joi.string().min(10).max(1000).required().trim().messages({
    "string.empty": "Problem description is required",
    "string.min": "Problem description must be at least 10 characters",
    "string.max": "Problem description must not exceed 1000 characters",
    "any.required": "Problem description is required",
  }),
  email: Joi.string().email().allow("").optional().trim().messages({
    "string.email": "Please provide a valid email address",
  }),
});

// Validation schema for brand request form
const brandRequestSchema = Joi.object({
  brandName: Joi.string().min(2).max(100).required().trim().messages({
    "string.empty": "Brand name is required",
    "string.min": "Brand name must be at least 2 characters",
    "string.max": "Brand name must not exceed 100 characters",
    "any.required": "Brand name is required",
  }),
  isManufacturer: Joi.boolean().required().messages({
    "any.required": "Please specify if you are a manufacturer or brand owner",
  }),
  details: Joi.string().max(1000).allow("").optional().trim().messages({
    "string.max": "Details must not exceed 1000 characters",
  }),
  website: Joi.string().uri().allow("").optional().trim().messages({
    "string.uri": "Please provide a valid website URL",
  }),
  email: Joi.string().email().allow("").optional().trim().messages({
    "string.email": "Please provide a valid email address",
  }),
});

// Middleware factory function
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

// Export validation middleware functions
export const validateReportIssue = validateRequest(reportIssueSchema);
export const validateBrandRequest = validateRequest(brandRequestSchema);

// Export schemas for testing
export { reportIssueSchema, brandRequestSchema };
