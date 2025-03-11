const express = require("express");
const categoryController = require("../controllers/categoryController");
const validate = require("../middleware/validate");
const categorySchema = require("../schemas/categorySchemas");

const router = express.Router();

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.post("/", validate(categorySchema), categoryController.createCategory);
router.put("/:id", validate(categorySchema), categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
