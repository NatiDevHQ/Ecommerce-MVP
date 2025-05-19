const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path"); // Add this line to import path module
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

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "product-" + uniqueSuffix + ext);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed."
      ),
      false
    );
  }
};

// Initialize Multer with configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Routes
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
