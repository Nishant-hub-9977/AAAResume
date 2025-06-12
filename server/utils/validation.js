import Joi from 'joi';

// Analytics event validation schema
export const analyticsEventSchema = Joi.object({
  action: Joi.string().required().valid(
    'dashboard_view',
    'resume_upload',
    'resume_upload_error',
    'resume_view',
    'job_requirement_create',
    'job_requirement_create_error',
    'candidate_shortlist',
    'ai_analysis',
    'user_login',
    'user_signup'
  ),
  resumeId: Joi.string().uuid().optional(),
  jobId: Joi.string().uuid().optional(),
  userId: Joi.string().uuid().required(),
  timestamp: Joi.string().isoDate().required(),
  metadata: Joi.object().optional()
});

// Resume analysis validation schema
export const resumeAnalysisSchema = Joi.object({
  resume: Joi.string().min(10).max(50000).required(),
  job: Joi.string().min(10).max(10000).required()
});

// File upload validation schema
export const fileUploadSchema = Joi.object({
  filename: Joi.string().required(),
  mimetype: Joi.string().valid(
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ).required(),
  size: Joi.number().max(5 * 1024 * 1024).required() // 5MB limit
});

// Validation middleware factory
export const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property]);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    req[property] = value;
    next();
  };
};

// Sanitize input data
export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
};