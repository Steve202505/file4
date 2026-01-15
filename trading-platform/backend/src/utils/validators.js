const { body } = require('express-validator');
const User = require('../models/User');
const Agent = require('../models/Agent');
const validator = require('validator');

// User registration validation rules
exports.validateUserRegistration = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('val_username_required')
    .isLength({ min: 3, max: 30 })
    .withMessage('val_username_length')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('val_username_format')
    .custom(async (username) => {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        throw new Error('val_username_taken');
      }
      return true;
    }),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('val_email_required')
    .isEmail()
    .withMessage('val_email_invalid')
    .normalizeEmail()
    .custom(async (email) => {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('val_email_registered');
      }
      return true;
    }),

  body('mobileNumber')
    .trim()
    .notEmpty()
    .withMessage('val_mobile_required')
    .matches(/^[0-9]{10,15}$/)
    .withMessage('val_mobile_invalid')
    .custom(async (mobileNumber) => {
      const existingUser = await User.findOne({ where: { mobileNumber } });
      if (existingUser) {
        throw new Error('val_mobile_registered');
      }
      return true;
    }),

  body('password')
    .notEmpty()
    .withMessage('val_password_required')
    .isLength({ min: 6 })
    .withMessage('val_password_length')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('val_password_complexity'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('val_confirm_password_required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('val_password_mismatch');
      }
      return true;
    }),

  body('referCode')
    .optional()
    .trim()
    .toUpperCase()
    .isLength({ min: 6, max: 12 })
    .withMessage('val_refer_code_length')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('val_refer_code_format')
    .custom(async (referCode) => {
      if (referCode) {
        const referrer = await User.findOne({ where: { referCode } });
        if (!referrer) {
          throw new Error('val_refer_code_invalid');
        }
      }
      return true;
    })
];

// User login validation rules
exports.validateUserLogin = [
  body('emailOrUsername')
    .trim()
    .notEmpty()
    .withMessage('val_login_input_required'),

  body('password')
    .notEmpty()
    .withMessage('val_password_required')
];

// Agent login validation rules
exports.validateAgentLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('val_username_required'),

  body('password')
    .notEmpty()
    .withMessage('val_password_required')
];

// User update validation rules
exports.validateUserUpdate = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('val_username_length')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('val_username_format')
    .custom(async (username, { req }) => {
      if (username) {
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser && existingUser.id !== req.params.id) {
          throw new Error('val_username_taken');
        }
      }
      return true;
    }),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('val_email_invalid')
    .normalizeEmail()
    .custom(async (email, { req }) => {
      if (email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser && existingUser.id !== req.params.id) {
          throw new Error('val_email_registered');
        }
      }
      return true;
    }),

  body('mobileNumber')
    .optional()
    .trim()
    .matches(/^[0-9]{10,15}$/)
    .withMessage('val_mobile_invalid')
    .custom(async (mobileNumber, { req }) => {
      if (mobileNumber) {
        const existingUser = await User.findOne({ where: { mobileNumber } });
        if (existingUser && existingUser.id !== req.params.id) {
          throw new Error('val_mobile_registered');
        }
      }
      return true;
    }),

  body('resetPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('val_new_password_length')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('val_password_complexity')
];

// Agent creation validation rules
exports.validateAgentCreation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('val_username_required')
    .isLength({ min: 3, max: 30 })
    .withMessage('val_username_length')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('val_username_format')
    .custom(async (username) => {
      const existingAgent = await Agent.findOne({ where: { username } });
      if (existingAgent) {
        throw new Error('val_username_taken');
      }
      return true;
    }),

  body('password')
    .notEmpty()
    .withMessage('val_password_required')
    .isLength({ min: 6 })
    .withMessage('val_password_length')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('val_password_complexity'),

  body('role')
    .optional()
    .isIn(['agent', 'admin'])
    .withMessage('val_role_invalid'),

  body('permissions')
    .optional()
    .isArray()
    .withMessage('val_permissions_invalid')
    .custom((permissions) => {
      const validPermissions = ['view_users', 'edit_users', 'manage_winloss', 'delete_users'];
      if (permissions) {
        permissions.forEach(permission => {
          if (!validPermissions.includes(permission)) {
            throw new Error(`Invalid permission: ${permission}`); // Keep technical error
          }
        });
      }
      return true;
    })
];

// Win/Loss control validation rules
exports.validateWinLossControl = [
  body('controlLevel')
    .notEmpty()
    .withMessage('val_control_level_required')
    .isIn(['high', 'medium', 'low', 'none'])
    .withMessage('val_control_level_invalid'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('val_is_active_boolean'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('val_notes_length')
];

// Password reset validation
exports.validatePasswordReset = [
  body('newPassword')
    .notEmpty()
    .withMessage('val_new_password_required')
    .isLength({ min: 6 })
    .withMessage('val_new_password_length')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('val_password_complexity'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('val_confirm_password_required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('val_password_mismatch');
      }
      return true;
    })
];

// Match other simple validations...

// Query parameter validation for pagination
exports.validatePaginationParams = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('val_page_integer')
    .toInt(),

  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('val_limit_range')
    .toInt(),

  body('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('val_search_length'),

  body('status')
    .optional()
    .isIn(['all', 'active', 'inactive'])
    .withMessage('val_status_invalid')
];

// Balance update validation
exports.validateBalanceUpdate = [
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number')
    .toFloat(),

  body('type')
    .notEmpty()
    .withMessage('Transaction type is required')
    .isIn(['deposit', 'withdrawal', 'bonus', 'adjustment'])
    .withMessage('Invalid transaction type'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes cannot exceed 200 characters')
];

// Export all validators
module.exports = exports;