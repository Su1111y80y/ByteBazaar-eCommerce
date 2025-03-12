const Joi = require('joi');

// Schema for validating user data during registration and update
const userSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.base': 'Username should be a type of string',
      'string.empty': 'Username cannot be empty',
      'string.min': 'Username should have a minimum length of 3 characters',
      'string.max': 'Username should have a maximum length of 30 characters',
      'any.required': 'Username is required',
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.base': 'Email should be a type of string',
      'string.empty': 'Email cannot be empty',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(8)
    .max(100)
    .required()
    .messages({
      'string.base': 'Password should be a type of string',
      'string.empty': 'Password cannot be empty',
      'string.min': 'Password should have a minimum length of 8 characters',
      'string.max': 'Password should have a maximum length of 100 characters',
      'any.required': 'Password is required',
    }),

  // Optional fields can be added as needed, for example, for user updates
  newPassword: Joi.string()
    .min(8)
    .max(100)
    .optional()
    .messages({
      'string.base': 'Password should be a type of string',
      'string.empty': 'Password cannot be empty',
      'string.min': 'Password should have a minimum length of 8 characters',
      'string.max': 'Password should have a maximum length of 100 characters',
    }),

  // Add more fields if needed (e.g., phone number, address, etc.)
});

module.exports = userSchema;
