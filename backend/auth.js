const db = require("../config/db");
const path = require("path");
const fs = require("fs");

// Get all products (unchanged)
exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await db.pool.query("SELECT * FROM products");
    const products = rows.map((product) => ({
      ...product,
      keywords: JSON.parse(product.keywords || "[]"),
      image_url: product.image_url
        ? `${req.protocol}://${req.headers.host}/uploads/${product.image_url}`
        : null,
    }));
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get product by ID (unchanged)
exports.getProductById = async (req, res) => {
  try {
    const [rows] = await db.pool.query("SELECT * FROM products WHERE id = ?", [
      req.params.id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = rows[0];
    const response = {
      ...product,
      keywords: JSON.parse(product.keywords || "[]"),
    };

    if (product.image_url) {
      response.image_url = `${req.protocol}://${req.headers.host}/uploads/${product.image_url}`;
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get distinct categories (unchanged)
exports.getCategories = async (_, res) => {
  try {
    const [rows] = await db.pool.query(
      "SELECT DISTINCT category FROM products"
    );
    const categories = rows.map((row) => row.category);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search products with filters (unchanged)
exports.searchProducts = async (req, res) => {
  try {
    const { query, category, minPrice, maxPrice, sort } = req.query;
    let sql = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (query) {
      sql +=
        " AND (name LIKE ? OR description LIKE ? OR JSON_CONTAINS(keywords, JSON_QUOTE(?)))";
      params.push(`%${query}%`, `%${query}%`, query);
    }

    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }

    if (minPrice) {
      sql += " AND price >= ?";
      params.push(minPrice);
    }

    if (maxPrice) {
      sql += " AND price <= ?";
      params.push(maxPrice);
    }

    if (sort === "price_asc") {
      sql += " ORDER BY price ASC";
    } else if (sort === "price_desc") {
      sql += " ORDER BY price DESC";
    } else if (sort === "newest") {
      sql += " ORDER BY created_at DESC";
    }

    const [rows] = await db.pool.query(sql, params);

    const products = rows.map((product) => {
      const formatted = {
        ...product,
        keywords: JSON.parse(product.keywords || "[]"),
      };

      if (product.image_url) {
        formatted.image_url = `${req.protocol}://${req.headers.host}/uploads/${product.image_url}`;
      }

      return formatted;
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new product (updated to match route)
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock_quantity = 0,
      keywords = [],
    } = req.body;

    // Handle image upload from fields()
    const mainImage = req.files?.mainImage?.[0]?.filename || null;

    const sql = `
      INSERT INTO products 
        (name, description, price, category, image_url, stock_quantity, keywords)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      name,
      description,
      parseFloat(price),
      category,
      mainImage,
      parseInt(stock_quantity),
      JSON.stringify(keywords),
    ];

    const [result] = await db.pool.query(sql, values);

    res.status(201).json({
      message: "Product created successfully",
      productId: result.insertId,
      imageUrl: mainImage
        ? `${req.protocol}://${req.headers.host}/uploads/${mainImage}`
        : null,
    });
  } catch (err) {
    console.error(err);

    // Clean up uploaded file if there was an error
    if (req.files?.mainImage?.[0]?.path) {
      fs.unlink(req.files.mainImage[0].path, (err) => {
        if (err) console.error("Error deleting uploaded file:", err);
      });
    }

    res.status(500).json({ message: err.message });
  }
};

// Update a product (updated to match route)
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      name,
      description,
      price, // Could be string or number
      category,
      stock_quantity, // Could be string or number
      keywords = [],
    } = req.body;

    // ===== ADD VALIDATION HERE =====
    // Convert and validate numbers
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      return res.status(400).json({ message: "Price must be a number" });
    }

    const parsedStock = parseInt(stock_quantity);
    if (isNaN(parsedStock)) {
      return res.status(400).json({ message: "Stock must be an integer" });
    }
    // ===== END VALIDATION =====

    // Handle image upload if new image was provided
    const mainImage = req.files?.mainImage?.[0]?.filename || null;

    let sql = `
      UPDATE products 
      SET 
        name = ?, 
        description = ?, 
        price = ?, 
        category = ?,
        stock_quantity = ?,
        keywords = ?
    `;

    const values = [
      name,
      description,
      parsedPrice, // Use the validated number
      category,
      parsedStock, // Use the validated number
      JSON.stringify(keywords),
    ];

    if (mainImage) {
      sql += `, image_url = ?`;
      values.push(mainImage);
    }

    sql += ` WHERE id = ?`;
    values.push(productId);

    await db.pool.query(sql, values);

    res.json({
      message: "Product updated successfully",
      imageUrl: mainImage
        ? `${req.protocol}://${req.headers.host}/uploads/${mainImage}`
        : null,
    });
  } catch (err) {
    console.error(err);

    // Clean up uploaded file if there was an error
    if (req.files?.mainImage?.[0]?.path) {
      fs.unlink(req.files.mainImage[0].path, (err) => {
        if (err) console.error("Error deleting uploaded file:", err);
      });
    }

    res.status(500).json({ message: err.message });
  }
};

// Delete a product (updated to handle image cleanup)
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const [product] = await db.pool.query(
      "SELECT image_url FROM products WHERE id = ?",
      [productId]
    );

    if (product.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete associated image file if exists
    if (product[0].image_url) {
      const imagePath = path.join(
        __dirname,
        "../uploads",
        product[0].image_url
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await db.pool.query("DELETE FROM products WHERE id = ?", [productId]);

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Update product image only (updated to match route)
exports.updateProductImage = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // First get the old image to delete it
    const [product] = await db.pool.query(
      "SELECT image_url FROM products WHERE id = ?",
      [productId]
    );

    if (product.length === 0) {
      // Clean up the uploaded file since we won't be using it
      if (req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting uploaded file:", err);
        });
      }
      return res.status(404).json({ message: "Product not found" });
    }

    const newImage = req.file.filename;
    let oldImagePath = null;

    // Delete old image if exists
    if (product[0].image_url) {
      oldImagePath = path.join(__dirname, "../uploads", product[0].image_url);
    }

    const [result] = await db.pool.query(
      "UPDATE products SET image_url = ? WHERE id = ?",
      [newImage, productId]
    );

    if (result.affectedRows === 0) {
      // Clean up the uploaded file since we won't be using it
      if (req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting uploaded file:", err);
        });
      }
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete old image after successful update
    if (oldImagePath && fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }

    res.status(200).json({
      success: true,
      message: "Image updated successfully",
      imageUrl: `${req.protocol}://${req.headers.host}/uploads/${newImage}`,
    });
  } catch (error) {
    console.error(error);

    // Clean up uploaded file if there was an error
    if (req.file?.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting uploaded file:", err);
      });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const db = require("../config/db");

class Product {
  static async findAll() {
    const [rows] = await db.pool.query("SELECT * FROM products");
    return rows.map((row) => ({
      ...row,
      image_url: JSON.parse(row.image_url || "[]"),
      keywords: JSON.parse(row.keywords || "[]"),
    }));
  }

  static async findById(id) {
    const [rows] = await db.pool.query("SELECT * FROM products WHERE id = ?", [
      id,
    ]);
    const product = rows[0];
    if (product) {
      product.image_url = JSON.parse(product.image_url || "[]");
      product.keywords = JSON.parse(product.keywords || "[]");
    }
    return product;
  }

  static async getCategories() {
    const [rows] = await db.pool.query(
      "SELECT DISTINCT category FROM products"
    );
    return rows.map((row) => row.category);
  }

  static async search({ query, category, minPrice, maxPrice, sort }) {
    let sql = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (query) {
      sql +=
        " AND (name LIKE ? OR description LIKE ? OR JSON_CONTAINS(keywords, JSON_QUOTE(?)))";
      params.push(`%${query}%`, `%${query}%`, query);
    }

    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }

    if (minPrice) {
      sql += " AND price >= ?";
      params.push(minPrice);
    }

    if (maxPrice) {
      sql += " AND price <= ?";
      params.push(maxPrice);
    }

    if (sort === "price_asc") {
      sql += " ORDER BY price ASC";
    } else if (sort === "price_desc") {
      sql += " ORDER BY price DESC";
    } else if (sort === "newest") {
      sql += " ORDER BY created_at DESC";
    }

    const [rows] = await db.pool.query(sql, params);

    return rows.map((row) => ({
      ...row,
      image_url: JSON.parse(row.image_url || "[]"),
      keywords: JSON.parse(row.keywords || "[]"),
    }));
  }

  static async create({
    name,
    description,
    price,
    category,
    image_url, // Changed from image_urls
    stock_quantity = 0,
    keywords = [],
  }) {
    const sql = `
      INSERT INTO products 
        (name, description, price, category, image_url, stock_quantity, keywords) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      name,
      description,
      price,
      category,
      image_url, // No JSON.stringify here if storing as string
      stock_quantity,
      JSON.stringify(keywords),
    ];

    const [result] = await db.pool.query(sql, values);
    return result.insertId;
  }

  static async update(
    id,
    {
      name,
      description,
      price,
      category,
      image_urls = [],
      stock_quantity,
      keywords = [],
    }
  ) {
    const sql = `
      UPDATE products 
      SET 
        name = ?, 
        description = ?, 
        price = ?, 
        category = ?, 
        image_url = ?, 
        stock_quantity = ?, 
        keywords = ?
      WHERE id = ?
    `;
    const values = [
      name,
      description,
      price,
      category,
      JSON.stringify(image_urls),
      stock_quantity,
      JSON.stringify(keywords),
      id,
    ];

    await db.pool.query(sql, values);
  }

  static async delete(id) {
    await db.pool.query("DELETE FROM products WHERE id = ?", [id]);
  }
}

module.exports = Product;
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
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2/promise");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const multer = require("multer");

const app = express();
app.use("/uploads", express.static("uploads"));

// Middleware
app.use(
  cors({
    origin: "http://127.0.0.1:5500", // Adjust this to your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Database connection
const db = require("./config/db");
db.connect();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// Serve static files from frontend
app.use(express.static("backend/frontend")); // Adjusted to serve static files from the frontend folder

// Error handling middleware
// Replace your error handling middleware with this:
app.use((err, req, res, next) => {
  console.error("Error Stack:", err.stack);

  // Handle Multer errors specifically
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: "File upload error",
      error: err.message,
    });
  }

  // Handle other errors
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Set the PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
