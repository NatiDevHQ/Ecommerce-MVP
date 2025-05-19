const express = require("express");
const multer = require("multer");
const {
  getAllProducts,
  getProductById,
  getCategories,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductImage,
} = require("../controllers/productController.js");

const router = express.Router();

// Multer setup (simplified)
const upload = multer({ dest: "uploads/" });

router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/categories", getCategories);
router.get("/:id", getProductById);
router.post(
  "/",
  upload.fields([{ name: "mainImage", maxCount: 1 }]),
  createProduct
);
router.put(
  "/:id",
  upload.fields([{ name: "mainImage", maxCount: 1 }]),
  updateProduct
);
router.patch("/:id/image", upload.single("mainImage"), updateProductImage);
router.delete("/:id", deleteProduct);

module.exports = router;
