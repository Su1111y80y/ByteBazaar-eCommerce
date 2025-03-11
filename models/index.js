const Product = require("./Product");
const Category = require("./Category");

// One category can have many products
Category.hasMany(Product, { foreignKey: "categoryId", onDelete: "CASCADE" });
Product.belongsTo(Category, { foreignKey: "categoryId" });

module.exports = { Product, Category };
