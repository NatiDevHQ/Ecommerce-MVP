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
  "/products",
  upload.fields([
    { name: "mainImage", maxCount: 1 }, // Main product image
    { name: "additionalImages", maxCount: 5 }, // Up to 5 additional images
  ]),
  productController.createProduct
);

// GET all products
router.get("/products", productController.getAllProducts);

// GET product categories
router.get("/products/categories", productController.getCategories);

// Search products
router.get("/products/search", productController.searchProducts);

// GET product by ID
router.get("/products/:id", productController.getProductById);

// PUT update product
router.put(
  "/products/:id",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 5 },
  ]),
  productController.updateProduct
);

// PATCH to update product image
router.patch(
  "/products/:id/image",
  upload.single("image"),
  productController.updateProductImage
);

// DELETE product
router.delete("/products/:id", productController.deleteProduct);

module.exports = router;
