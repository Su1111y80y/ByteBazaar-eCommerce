const express = require("express");
const router = express.Router();
const productController = require("../controllers/products");
const validate = require("../middleware/validate"); // Assuming team has this
const {
  productSchema,
  updateProductSchema,
} = require("../schemas/productSchemas");

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.post("/", validate(productSchema), productController.createProduct);
router.put(
  "/:id",
  validate(updateProductSchema),
  productController.updateProduct
);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
