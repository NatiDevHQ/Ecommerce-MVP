const db = require("../config/db");

class User {
  static async findByUsername(username) {
    const [rows] = await db.pool.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.pool.query(
      "SELECT id, username, email, created_at FROM users WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  static async create({ username, email, password }) {
    const [result] = await db.pool.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, password]
    );
    return result.insertId;
  }
}

module.exports = User;
