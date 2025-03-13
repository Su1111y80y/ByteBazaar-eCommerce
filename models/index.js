// models/index.js
const Product = require("./Product");
const Category = require("./Category");
const User = require("./User");
const Order = require("./Order");
const OrderItem = require("./OrderItem");

// Category-Product associations
Category.hasMany(Product, { foreignKey: "categoryId", onDelete: "CASCADE" });
Product.belongsTo(Category, { foreignKey: "categoryId" });

// User-Order associations
User.hasMany(Order, { foreignKey: "userId", onDelete: "CASCADE" });
Order.belongsTo(User, { foreignKey: "userId" });

// Order-OrderItem associations
Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

// Product-OrderItem associations
Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

// Many-to-many relationship between Order and Product through OrderItem
Order.belongsToMany(Product, { through: OrderItem, foreignKey: "orderId" });
Product.belongsToMany(Order, { through: OrderItem, foreignKey: "productId" });

module.exports = {
  Product,
  Category,
  User,
  Order,
  OrderItem
};