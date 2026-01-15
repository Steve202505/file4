const { body, validationResult } = require('express-validator');
const { User, Agent } = require('../models');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      errors: errors.array()
    });
  };
};

// User registration validation
const validateUserSignup = validate([
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters')
    .custom(async (username) => {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        throw new Error('Username already exists');
      }
      return true;
    }),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .custom(async (email) => {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('Email already registered');
      }
      return true;
    }),
  body('mobileNumber')
    .matches(/^[0-9]{10,15}$/)
    .withMessage('Please provide a valid mobile number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
]);

// Agent creation validation
const validateAgentCreation = validate([
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters')
    .custom(async (username) => {
      const existingAgent = await Agent.findOne({ where: { username } });
      if (existingAgent) {
        throw new Error('Username already exists');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['agent', 'admin'])
    .withMessage('Role must be either agent or admin')
]);

module.exports = {
  validate,
  validateUserSignup,
  validateAgentCreation
};