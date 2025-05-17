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
    const [orders] = await db.pool.query(
      `
      SELECT o.id, o.total_amount, o.status, o.created_at,
             JSON_ARRAYAGG(
               JSON_OBJECT(
                 'product_id', oi.product_id,
                 'name', p.name,
                 'price', oi.price,
                 'quantity', oi.quantity,
                 'image_url', p.image_url
               )
             ) AS items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `,
      [req.userId]
    );

    // Parse JSON items
    const result = orders.map((order) => ({
      ...order,
      items: JSON.parse(order.items),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const [order] = await db.pool.query(
      `
      SELECT o.id, o.total_amount, o.status, o.created_at, o.shipping_info,
             JSON_ARRAYAGG(
               JSON_OBJECT(
                 'product_id', oi.product_id,
                 'name', p.name,
                 'price', oi.price,
                 'quantity', oi.quantity,
                 'image_url', p.image_url
               )
             ) AS items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.id = ? AND o.user_id = ?
      GROUP BY o.id
    `,
      [orderId, req.userId]
    );

    if (order.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Parse JSON data
    const result = {
      ...order[0],
      shipping_info: JSON.parse(order[0].shipping_info),
      items: JSON.parse(order[0].items),
    };

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
