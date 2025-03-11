const Joi = require("joi");

const productSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .required()
    .messages({ "string.empty": "Product name cannot be empty" }),
  description: Joi.string()
    .min(1)
    .required()
    .messages({ "string.empty": "Description cannot be empty" }),
  price: Joi.number()
    .min(0)
    .required()
    .messages({ "number.min": "Price must be non-negative" }),
  categoryId: Joi.number()
    .integer()
    .required()
    .messages({ "number.base": "Category ID must be a number" }),
});

const updateProductSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .messages({ "string.empty": "Product name cannot be empty" }),
  description: Joi.string()
    .min(1)
    .messages({ "string.empty": "Description cannot be empty" }),
  price: Joi.number()
    .min(0)
    .messages({ "number.min": "Price must be non-negative" }),
  categoryId: Joi.number()
    .integer()
    .messages({ "number.base": "Category ID must be a number" }),
}).or("name", "description", "price", "categoryId"); // At least one field required

module.exports = { productSchema, updateProductSchema };
