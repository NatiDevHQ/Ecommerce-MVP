const { connectToDatabase } = require("../config/db");

class User {
  static async findByUsername(email) {
    const connection = await connectToDatabase();
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const connection = await connectToDatabase();
    const [rows] = await connection.execute(
      "SELECT id, username, email, created_at FROM users WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  static async create({ username, email, password }) {
    const connection = await connectToDatabase();
    const [result] = await connection.execute(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, password]
    );
    return result.insertId;
  }

  static async updateUser(id, updatedFields) {
    const connection = await connectToDatabase();

    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updatedFields)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }

    values.push(id);

    const query = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
    const [result] = await connection.execute(query, values);
    return result;
  }

  static async deleteUser(id) {
    const connection = await connectToDatabase();
    const [result] = await connection.execute(
      "DELETE FROM users WHERE id = ?",
      [id]
    );
    return result;
  }

  static async getAllUsersExcept(excludedId) {
    const connection = await connectToDatabase();
    const [rows] = await connection.execute(
      "SELECT id, username, email FROM users WHERE id != ?",
      [excludedId]
    );
    return rows;
  }
}

module.exports = User;
