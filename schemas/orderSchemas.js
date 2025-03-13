/**
 * Order Validation Schemas
 * 
 * This file defines validation schemas for order-related API endpoints using Joi.
 * These schemas ensure that all incoming request data meets the expected format
 * and constraints before processing, enhancing security and data integrity.
 */
const Joi = require("joi");

/**
 * Validation schema for creating a new order
 * 
 * Validates the structure and data types for order creation requests.
 * Ensures that orders have a valid user and at least one product with quantity.
 * Custom error messages provide clear feedback for client applications.
 */
const createOrderSchema = Joi.object({
  // User ID must be a positive integer and is required
  // This identifies which customer is placing the order
  userId: Joi.number().integer().positive().required()
    .messages({
      "number.base": "User ID must be a number",
      "number.integer": "User ID must be an integer",
      "number.positive": "User ID must be positive",
      "any.required": "User ID is required"
    }),

  // Products array containing items to be purchased
  // Each product must have a valid ID and quantity
  products: Joi.array().items(
    Joi.object({
      // Product ID references an existing product in the database
      productId: Joi.number().integer().positive().required()
        .messages({
          "number.base": "Product ID must be a number",
          "number.integer": "Product ID must be an integer",
          "number.positive": "Product ID must be positive",
          "any.required": "Product ID is required"
        }),
      // Quantity must be at least 1 unit
      quantity: Joi.number().integer().min(1).required()
        .messages({
          "number.base": "Quantity must be a number",
          "number.integer": "Quantity must be an integer",
          "number.min": "Quantity must be at least 1",
          "any.required": "Quantity is required"
        })
    })
  ).min(1).required() // Order must contain at least one product
    .messages({
      "array.min": "Order must contain at least one product",
      "any.required": "Products are required"
    })
});

/**
 * Validation schema for updating an existing order
 * 
 * Similar to the creation schema but with less strict requirements
 * All fields are optional since updates may modify only part of an order
 * This allows for partial updates (e.g., changing just the status)
 */
const updateOrderSchema = Joi.object({
  // User ID is optional for updates
  // When present, must be a positive integer
  userId: Joi.number().integer().positive()
    .messages({
      "number.base": "User ID must be a number",
      "number.integer": "User ID must be an integer",
      "number.positive": "User ID must be positive"
    }),

  // Products array for modifying items in the order
  // Structure is the same as in create schema, but the array itself is optional
  products: Joi.array().items(
    Joi.object({
      productId: Joi.number().integer().positive().required()
        .messages({
          "number.base": "Product ID must be a number",
          "number.integer": "Product ID must be an integer",
          "number.positive": "Product ID must be positive",
          "any.required": "Product ID is required"
        }),
      quantity: Joi.number().integer().min(1).required()
        .messages({
          "number.base": "Quantity must be a number",
          "number.integer": "Quantity must be an integer",
          "number.min": "Quantity must be at least 1",
          "any.required": "Quantity is required"
        })
    })
  ).min(1) // If products are included, at least one is required
    .messages({
      "array.min": "Order must contain at least one product"
    }),

  // Order status for tracking fulfillment progress
  // Must be one of the predefined values in the order lifecycle
  status: Joi.string().valid("pending", "processing", "shipped", "delivered", "cancelled")
    .messages({
      "string.base": "Status must be a string",
      "any.only": "Status must be one of: pending, processing, shipped, delivered, cancelled"
    })
});

module.exports = {
  createOrderSchema,
  updateOrderSchema
};