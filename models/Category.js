const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Category = sequelize.define("Category", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: "Category name cannot be empty" },
      len: { args: [2, 50], msg: "Category name must be 2-50 characters long" },
    },
  },
});

module.exports = Category;
