const db = require("../config/db");

exports.createOrder = async (req, res) => {
  try {
    const { shippingInfo, paymentMethod } = req.body;

    // Get cart items
    const [cartItems] = await db.pool.query(
      `
      SELECT ci.product_id, p.price, ci.quantity 
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `,
      [req.userId]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate total
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Start transaction
    const connection = await db.pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create order
      const [orderResult] = await connection.query(
        "INSERT INTO orders (user_id, total_amount, shipping_info, payment_method) VALUES (?, ?, ?, ?)",
        [req.userId, total, JSON.stringify(shippingInfo), paymentMethod]
      );

      const orderId = orderResult.insertId;

      // Add order items
      for (const item of cartItems) {
        await connection.query(
          "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
          [orderId, item.product_id, item.quantity, item.price]
        );

        // Update product stock
        await connection.query(
          "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
          [item.quantity, item.product_id]
        );
      }

      // Clear cart
      await connection.query("DELETE FROM cart_items WHERE user_id = ?", [
        req.userId,
      ]);

      await connection.commit();
      res.status(201).json({ orderId, message: "Order created successfully" });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    // First get all orders for the user
    const [orders] = await db.pool.query(
      `
      SELECT id, total_amount, status, created_at, shipping_info
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
    `,
      [req.userId]
    );

    // Then get items for each order
    for (const order of orders) {
      const [items] = await db.pool.query(
        `
        SELECT 
          oi.product_id,
          p.name,
          oi.price,
          oi.quantity,
          p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
        `,
        [order.id]
      );
      order.items = items;

      // Parse shipping_info if it's a string
      if (typeof order.shipping_info === "string") {
        order.shipping_info = JSON.parse(order.shipping_info);
      }
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // Get order basic info
    const [order] = await db.pool.query(
      `
      SELECT id, total_amount, status, created_at, shipping_info
      FROM orders
      WHERE id = ? AND user_id = ?
      `,
      [orderId, req.userId]
    );

    if (order.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Get order items
    const [items] = await db.pool.query(
      `
      SELECT 
        oi.product_id,
        p.name,
        oi.price,
        oi.quantity,
        p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      `,
      [orderId]
    );

    // Prepare response
    const result = {
      ...order[0],
      items: items,
    };

    // Parse shipping_info if it's a string
    if (typeof result.shipping_info === "string") {
      result.shipping_info = JSON.parse(result.shipping_info);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
