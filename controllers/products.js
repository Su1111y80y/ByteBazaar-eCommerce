const Product = require("../models/Product");
const Category = require("../models/Category");

exports.getAllProducts = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const where = categoryId ? { categoryId } : {};
    const products = await Product.findAll({ where });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    console.log("Request body:", req.body); // Log the raw input
    const { name, description, price, categoryId } = req.body;
    console.log("Extracted price:", price, typeof price); // Log price and its type
    const category = await Category.findByPk(categoryId);
    if (!category)
      return res.status(400).json({ error: "Category does not exist" });
    const newProduct = await Product.create({
      name,
      description,
      price,
      categoryId,
    });
    res.status(201).json(newProduct);
  } catch (error) {
    console.log("Error details:", error); // Log full error
    res.status(400).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const { categoryId } = req.body;
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category)
        return res.status(400).json({ error: "Category does not exist" });
    }

    await product.update(req.body);
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    await product.destroy();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
