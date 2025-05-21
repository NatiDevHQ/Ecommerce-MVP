const db = require("../config/db");

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const [cartItems] = await db.pool.query(
      `
      SELECT 
        ci.product_id, 
        p.name, 
        p.price, 
        p.image_url, 
        ci.quantity,
        (p.price * ci.quantity) AS subtotal
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
      `,
      [req.userId]
    );

    res.json(cartItems);
  } catch (err) {
    console.error("getCart error:", err);
    res.status(500).json({ message: "Failed to retrieve cart items" });
  }
};

// POST /api/cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid product or quantity" });
    }

    // Check if product exists
    const [product] = await db.pool.query(
      "SELECT * FROM products WHERE id = ?",
      [productId]
    );

    if (product.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if item already exists
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
      // Insert new item
      await db.pool.query(
        "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [req.userId, productId, quantity]
      );
    }

    res.json({ message: "Product added to cart" });
  } catch (err) {
    console.error("addToCart error:", err);
    res.status(500).json({ message: "Failed to add item to cart" });
  }
};

// PUT /api/cart/:productId
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const productId = req.params.productId;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const [result] = await db.pool.query(
      "UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?",
      [quantity, req.userId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ message: "Cart item updated" });
  } catch (err) {
    console.error("updateCartItem error:", err);
    res.status(500).json({ message: "Failed to update cart item" });
  }
};

// DELETE /api/cart/:productId
exports.removeFromCart = async (req, res) => {
  try {
    const productId = req.params.productId;

    const [result] = await db.pool.query(
      "DELETE FROM cart_items WHERE user_id = ? AND product_id = ?",
      [req.userId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ message: "Cart item removed" });
  } catch (err) {
    console.error("removeFromCart error:", err);
    res.status(500).json({ message: "Failed to remove cart item" });
  }
};
