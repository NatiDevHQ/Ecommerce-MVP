-- Create the database
DROP DATABASE IF EXISTS ecommerce_mvp;
CREATE DATABASE ecommerce_mvp;
USE ecommerce_mvp;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    image_url VARCHAR(255),
    stock_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'shipped', 'delivered') DEFAULT 'pending',
    shipping_info JSON,
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Cart items table
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert dummy users (passwords are all "Test@1234")
INSERT INTO users (username, email, password) VALUES 
('john_doe', 'john@example.com', '$2a$10$X8z5.5JbJ9Z6Z7Z8Z9ZA0e1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p'),
('jane_smith', 'jane@example.com', '$2a$10$X8z5.5JbJ9Z6Z7Z8Z9ZA0e1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p'),
('mike_johnson', 'mike@example.com', '$2a$10$X8z5.5JbJ9Z6Z7Z8Z9ZA0e1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p'),
('sarah_williams', 'sarah@example.com', '$2a$10$X8z5.5JbJ9Z6Z7Z8Z9ZA0e1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p');

-- Insert product categories
INSERT INTO products (name, description, price, category, image_url, stock_quantity) VALUES
-- Electronics
('iPhone 13 Pro', '6.1-inch Super Retina XDR display with ProMotion', 999.99, 'Electronics', 'iphone13pro.jpg', 50),
('Samsung Galaxy S22', 'Dynamic AMOLED 2X, 120Hz refresh rate', 799.99, 'Electronics', 'galaxys22.jpg', 45),
('Sony WH-1000XM4', 'Industry-leading noise canceling headphones', 349.99, 'Electronics', 'sony-headphones.jpg', 30),
('Apple Watch Series 7', 'Always-On Retina display, blood oxygen app', 399.99, 'Electronics', 'apple-watch.jpg', 25),
('iPad Air', '10.9-inch Liquid Retina display, M1 chip', 599.99, 'Electronics', 'ipad-air.jpg', 20),

-- Clothing
('Men\'s Casual Shirt', '100% cotton, comfortable fit', 29.99, 'Clothing', 'mens-shirt.jpg', 100),
('Women\'s Summer Dress', 'Lightweight floral print dress', 49.99, 'Clothing', 'womens-dress.jpg', 80),
('Unisex Hoodie', 'Soft fleece interior, adjustable drawstring', 39.99, 'Clothing', 'unisex-hoodie.jpg', 60),
('Men\'s Jeans', 'Slim fit, stretch denim', 59.99, 'Clothing', 'mens-jeans.jpg', 75),
('Women\'s Running Tights', 'High-waisted, moisture-wicking', 34.99, 'Clothing', 'womens-tights.jpg', 90),

-- Home & Kitchen
('Non-Stick Frying Pan', 'Ceramic coating, induction compatible', 24.99, 'Home', 'frying-pan.jpg', 40),
('Electric Kettle', '1.7L capacity, auto shut-off', 29.99, 'Home', 'electric-kettle.jpg', 35),
('Air Fryer', '5.8QT capacity, digital controls', 89.99, 'Home', 'air-fryer.jpg', 25),
('Coffee Maker', '12-cup programmable coffee maker', 49.99, 'Home', 'coffee-maker.jpg', 30),
('Blender', '1000W power, 6-speed control', 39.99, 'Home', 'blender.jpg', 20),

-- Books
('The Midnight Library', 'Novel by Matt Haig', 14.99, 'Books', 'midnight-library.jpg', 50),
('Atomic Habits', 'By James Clear', 16.99, 'Books', 'atomic-habits.jpg', 60),
('Dune', 'Science fiction novel by Frank Herbert', 12.99, 'Books', 'dune.jpg', 40),
('The Psychology of Money', 'By Morgan Housel', 18.99, 'Books', 'psychology-money.jpg', 35),
('Where the Crawdads Sing', 'Novel by Delia Owens', 13.99, 'Books', 'crawdads-sing.jpg', 45);

-- Insert some orders
INSERT INTO orders (user_id, total_amount, status, shipping_info, payment_method) VALUES
(1, 1349.98, 'delivered', '{"name": "John Doe", "address": "123 Main St", "city": "New York", "state": "NY", "zip": "10001", "country": "USA"}', 'credit_card'),
(2, 89.98, 'shipped', '{"name": "Jane Smith", "address": "456 Oak Ave", "city": "Los Angeles", "state": "CA", "zip": "90001", "country": "USA"}', 'paypal'),
(3, 349.99, 'pending', '{"name": "Mike Johnson", "address": "789 Pine Rd", "city": "Chicago", "state": "IL", "zip": "60601", "country": "USA"}', 'credit_card');

-- Insert order items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 999.99),  -- iPhone 13 Pro
(1, 3, 1, 349.99),  -- Sony Headphones
(2, 6, 2, 29.99),   -- Men's Shirt (2x)
(2, 8, 1, 39.99),    -- Unisex Hoodie
(3, 3, 1, 349.99);   -- Sony Headphones

-- Insert some cart items
INSERT INTO cart_items (user_id, product_id, quantity) VALUES
(1, 2, 1),  -- Samsung Galaxy in John's cart
(1, 5, 2),  -- iPad Air (2x) in John's cart
(2, 7, 1),  -- Women's Dress in Jane's cart
(3, 4, 1);  -- Apple Watch in Mike's cart
