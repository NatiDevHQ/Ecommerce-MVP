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
