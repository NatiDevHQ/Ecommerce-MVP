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
    image_urls = [],
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
      JSON.stringify(image_urls),
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
