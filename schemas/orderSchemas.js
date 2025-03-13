// schemas/orderSchemas.js
const Joi = require("joi");

// Schema for creating a new order
const createOrderSchema = Joi.object({
  userId: Joi.number().integer().positive().required()
    .messages({
      "number.base": "User ID must be a number",
      "number.integer": "User ID must be an integer",
      "number.positive": "User ID must be positive",
      "any.required": "User ID is required"
    }),

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
  ).min(1).required()
    .messages({
      "array.min": "Order must contain at least one product",
      "any.required": "Products are required"
    })
});

// Schema for updating an existing order
const updateOrderSchema = Joi.object({
  userId: Joi.number().integer().positive()
    .messages({
      "number.base": "User ID must be a number",
      "number.integer": "User ID must be an integer",
      "number.positive": "User ID must be positive"
    }),

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
  ).min(1)
    .messages({
      "array.min": "Order must contain at least one product"
    }),

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