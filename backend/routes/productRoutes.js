const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const multer = require("multer");
const path = require("path");

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// POST route to add product with multiple images
router.post(
  "/",
  upload.fields([
    { name: "mainImage", maxCount: 1 }, // Main product image
    { name: "additionalImages", maxCount: 5 }, // Up to 5 additional images
  ]),
  productController.createProduct
);

// GET all products
router.get("/", productController.getAllProducts);

// GET product categories
router.get("/categories", productController.getCategories);

// Search products
router.get("/search", productController.searchProducts);

// GET product by ID
router.get("/:id", productController.getProductById);

// PUT update product
router.put(
  "/:id",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 5 },
  ]),
  productController.updateProduct
);

// DELETE product
router.delete("/:id", productController.deleteProduct);

module.exports = router;
