const db = require("../config/db");

exports.getCart = async (req, res) => {
  try {
    const [cartItems] = await db.pool.query(
      `
      SELECT ci.product_id, p.name, p.price, p.image_url, ci.quantity 
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `,
      [req.userId]
    );

    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Check if product exists
    const [product] = await db.pool.query(
      "SELECT * FROM products WHERE id = ?",
      [productId]
    );

    if (product.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if item already in cart
    const [existing] = await db.pool.query(
      "SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?",
      [req.userId, productId]
    );

    if (existing.length > 0) {
      // Update quantity
      await db.pool.query(
        "UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?",
        [quantity, req.userId, productId]
      );
    } else {
      // Add new item
      await db.pool.query(
        "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [req.userId, productId, quantity]
      );
    }

    res.json({ message: "Product added to cart" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const productId = req.params.productId;

    await db.pool.query(
      "UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?",
      [quantity, req.userId, productId]
    );

    res.json({ message: "Cart updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const productId = req.params.productId;

    await db.pool.query(
      "DELETE FROM cart_items WHERE user_id = ? AND product_id = ?",
      [req.userId, productId]
    );

    res.json({ message: "Product removed from cart" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
