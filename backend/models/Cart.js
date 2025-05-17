const db = require("../config/db");

class Cart {
  static async getItems(userId) {
    const [items] = await db.pool.query(
      `SELECT ci.product_id, p.name, p.price, p.image_url, ci.quantity 
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.user_id = ?`,
      [userId]
    );
    return items;
  }

  static async addItem(userId, productId, quantity) {
    // Check if item exists
    const [existing] = await db.pool.query(
      "SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    if (existing.length > 0) {
      await db.pool.query(
        "UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?",
        [quantity, userId, productId]
      );
    } else {
      await db.pool.query(
        "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [userId, productId, quantity]
      );
    }
  }

  static async updateItem(userId, productId, quantity) {
    await db.pool.query(
      "UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?",
      [quantity, userId, productId]
    );
  }

  static async removeItem(userId, productId) {
    await db.pool.query(
      "DELETE FROM cart_items WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );
  }

  static async clear(userId) {
    await db.pool.query("DELETE FROM cart_items WHERE user_id = ?", [userId]);
  }
}

module.exports = Cart;
