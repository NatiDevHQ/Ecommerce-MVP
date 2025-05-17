const db = require("../config/db");

class Order {
  static async create(userId, { totalAmount, shippingInfo, paymentMethod }) {
    const [result] = await db.pool.query(
      "INSERT INTO orders (user_id, total_amount, shipping_info, payment_method) VALUES (?, ?, ?, ?)",
      [userId, totalAmount, JSON.stringify(shippingInfo), paymentMethod]
    );
    return result.insertId;
  }

  static async addOrderItem(orderId, { productId, quantity, price }) {
    await db.pool.query(
      "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
      [orderId, productId, quantity, price]
    );
  }

  static async findByUser(userId) {
    const [orders] = await db.pool.query(
      "SELECT id, total_amount, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    return orders;
  }

  static async findById(userId, orderId) {
    const [orders] = await db.pool.query(
      "SELECT id, total_amount, status, created_at, shipping_info FROM orders WHERE id = ? AND user_id = ?",
      [orderId, userId]
    );
    return orders[0];
  }

  static async getOrderItems(orderId) {
    const [items] = await db.pool.query(
      `SELECT oi.product_id, p.name, oi.price, oi.quantity, p.image_url 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [orderId]
    );
    return items;
  }
}

module.exports = Order;
