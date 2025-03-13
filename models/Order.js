/**
 * Order Model - Core data structure for customer orders
 * 
 * This model represents orders in the eCommerce system, capturing essential
 * information including which user placed the order, total cost, and current
 * fulfillment status. The order items themselves are stored in a separate OrderItem model.
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Order = sequelize.define(
  "Order",
  {
    // Unique identifier for each order
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    
    // Foreign key linking to the Users table
    // Identifies which customer placed this order
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    
    // Total price of the order in currency units
    // Calculated by summing (product price × quantity) for all items
    total: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0, // Ensures order total is never negative
      }
    },
    
    // Current status of the order in the fulfillment process
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending", // New orders start as pending
      validate: {
        // Restricts status to one of the allowed values in the order lifecycle
        isIn: [["pending", "processing", "shipped", "delivered", "cancelled"]],
      }
    },
  },
  { tableName: "Orders" } // Explicitly sets table name in database
);

module.exports = Order;