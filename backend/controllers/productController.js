const db = require("../config/db");

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await db.pool.query("SELECT * FROM products");

    // Append full image URL
    const updatedRows = rows.map(product => {
      for (let i = 1; i <= 6; i++) {
        if (product[`image${i}`]) {
          product[`image${i}`] = `http://localhost:5000/uploads/${product[`image${i}`]}`;
        }
      }
      return product;
    });

    res.json(updatedRows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const [rows] = await db.pool.query("SELECT * FROM products WHERE id = ?", [
      req.params.id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Append image URLs
    const product = rows[0];
    for (let i = 1; i <= 6; i++) {
      if (product[`image${i}`]) {
        product[`image${i}`] = `http://localhost:5000/uploads/${product[`image${i}`]}`;
      }
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get distinct categories
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.pool.query(
      "SELECT DISTINCT category FROM products"
    );
    const categories = rows.map(row => row.category);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search products with filters
exports.searchProducts = async (req, res) => {
  try {
    const { query, category, minPrice, maxPrice, sort } = req.query;
    let sql = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (query) {
      sql += " AND (name LIKE ? OR description LIKE ?)";
      params.push(`%${query}%`, `%${query}%`);
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
    }

    const [rows] = await db.pool.query(sql, params);

    // Append full image URLs
    const updatedRows = rows.map(product => {
      for (let i = 1; i <= 6; i++) {
        if (product[`image${i}`]) {
          product[`image${i}`] = `http://localhost:5000/uploads/${product[`image${i}`]}`;
        }
      }
      return product;
    });

    res.json(updatedRows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const { name, description, price, category } = req.body;
    const imageFiles = req.files;
    const imagePaths = Array.from({ length: 6 }, (_, i) =>
      imageFiles[`image${i + 1}`]?.[0]?.filename || null
    );

    const sql = `
      INSERT INTO products (name, description, price, category, image1, image2, image3, image4, image5, image6)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [name, description, price, category, ...imagePaths];

    await db.pool.query(sql, values);
    res.status(201).json({ message: "Product created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
