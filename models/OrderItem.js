/**
 * OrderItem Model - Represents individual items within an order
 * 
 * This model implements a junction table design pattern that creates the many-to-many 
 * relationship between orders and products. Each record represents a specific product
 * within a specific order, along with its quantity and price at the time of purchase.
 * 
 * The separation of OrderItems from the main Order allows:
 * - Orders to contain multiple products
 * - Tracking of individual product quantities
 * - Historical price preservation (important when product prices change)
 */
const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    // Unique identifier for each order item
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    
    // Foreign key to the parent order
    // Creates the relationship between an order and its items
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Orders",
        key: "id",
      },
    },
    
    // Foreign key to the product being ordered
    // Creates the relationship between order items and products
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Products",
        key: "id",
      },
    },
    
    // Number of units of this product in the order
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1, // Ensures at least one unit is ordered
      }
    },
    
    // Product price at the time of purchase
    // This is stored separately from the Product model's price to maintain
    // historical accuracy when product prices change over time
    priceAtPurchase: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0, // Ensures price is never negative
      }
    },
  },
  { tableName: "OrderItems" } // Explicitly sets table name in database
);

module.exports = OrderItem;