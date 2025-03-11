const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Product = sequelize.define(
  "Product",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: "Product name cannot be empty" } },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: "Description cannot be empty" } },
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0, // Change to plain min: 0
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Categories", key: "id" },
    },
  },
  { timestamps: false, tableName: "Products" }
);

module.exports = Product;
