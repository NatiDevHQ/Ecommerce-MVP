const db = require("../config/db");

class Product {
  static async findAll() {
    const [rows] = await db.pool.query("SELECT * FROM products");
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.pool.query("SELECT * FROM products WHERE id = ?", [
      id,
    ]);
    return rows[0];
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
    return rows;
  }

  static async create({ name, description, price, category, images }) {
    const sql = `
      INSERT INTO products (name, description, price, category, image1, image2, image3, image4, image5, image6)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [name, description, price, category, ...images];
    await db.pool.query(sql, values);
  }
}

module.exports = Product;
