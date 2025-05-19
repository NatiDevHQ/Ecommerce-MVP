const db = require("../config/db");

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await db.pool.query("SELECT * FROM products");

    const products = rows.map((product) => {
      const formatted = {
        ...product,
        keywords: JSON.parse(product.keywords || "[]"),
      };

      if (product.image_url) {
        formatted.image_url = `http://${req.headers.host}/uploads/${product.image_url}`;
      }

      return formatted;
    });

    res.json(products);
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

    const product = rows[0];
    const response = {
      ...product,
      keywords: JSON.parse(product.keywords || "[]"),
    };

    if (product.image_url) {
      response.image_url = `http://${req.headers.host}/uploads/${product.image_url}`;
    }

    res.json(response);
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
    const categories = rows.map((row) => row.category);
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
        formatted.image_url = `http://${req.headers.host}/uploads/${product.image_url}`;
      }

      return formatted;
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new product
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
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      name,
      description,
      price,
      category,
      stock_quantity,
      keywords = [],
    } = req.body;
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
      parseFloat(price),
      category,
      parseInt(stock_quantity),
      JSON.stringify(keywords),
    ];

    if (mainImage) {
      sql += `, image_url = ?`;
      values.push(mainImage);
    }

    sql += ` WHERE id = ?`;
    values.push(productId);

    await db.pool.query(sql, values);

    res.json({ message: "Product updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Delete a product
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

    await db.pool.query("DELETE FROM products WHERE id = ?", [productId]);

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Update product image (MySQL version)
exports.updateProductImage = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const imageUrl = req.file.filename;

    const [result] = await db.pool.query(
      "UPDATE products SET image_url = ? WHERE id = ?",
      [imageUrl, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Image updated successfully",
      imageUrl: `http://${req.headers.host}/uploads/${imageUrl}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
