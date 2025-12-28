const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: error.details[0].message 
      });
    }
    next();
  };
};

// Validation schemas
const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'faculty', 'student').required(),
    department: Joi.string().max(100).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  createFaculty: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    department: Joi.string().max(100).required()
  }),

  createSubject: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    faculty_id: Joi.number().integer().positive().required(),
    department: Joi.string().max(100).required()
  }),

  qrSession: Joi.object({
    subject_id: Joi.number().integer().positive().required()
  }),

  scanQR: Joi.object({
    qr_token: Joi.string().required()
  }),

  leaveRequest: Joi.object({
    from_date: Joi.date().required(),
    to_date: Joi.date().min(Joi.ref('from_date')).required(),
    reason: Joi.string().min(10).max(500).required()
  }),

  leaveAction: Joi.object({
    status: Joi.string().valid('approved', 'rejected').required()
  })
};

module.exports = { validateRequest, schemas };