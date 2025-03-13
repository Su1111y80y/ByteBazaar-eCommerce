// models/OrderItem.js
const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Orders",
        key: "id",
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Products",
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      }
    },
    priceAtPurchase: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      }
    },
  },
  { tableName: "OrderItems" }
);

module.exports = OrderItem;