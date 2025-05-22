-- Insert dummy users (passwords are all "Test@1234")
INSERT INTO users (username, email, password) VALUES 
('john_doe', 'john@example.com', '$2a$10$X8z5.5JbJ9Z6Z7Z8Z9ZA0e1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p'),
('jane_smith', 'jane@example.com', '$2a$10$X8z5.5JbJ9Z6Z7Z8Z9ZA0e1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p'),
('mike_johnson', 'mike@example.com', '$2a$10$X8z5.5JbJ9Z6Z7Z8Z9ZA0e1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p'),
('sarah_williams', 'sarah@example.com', '$2a$10$X8z5.5JbJ9Z6Z7Z8Z9ZA0e1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p');


-- Insert some orders
INSERT INTO orders (user_id, total_amount, status, shipping_info, payment_method) VALUES
(1, 1349.98, 'delivered', '{"name": "John Doe", "address": "123 Main St", "city": "New York", "state": "NY", "zip": "10001", "country": "USA"}', 'credit_card'),
(2, 89.98, 'shipped', '{"name": "Jane Smith", "address": "456 Oak Ave", "city": "Los Angeles", "state": "CA", "zip": "90001", "country": "USA"}', 'paypal'),
(3, 349.99, 'pending', '{"name": "Mike Johnson", "address": "789 Pine Rd", "city": "Chicago", "state": "IL", "zip": "60601", "country": "USA"}', 'credit_card');
-- Insert product categories
INSERT INTO products (id, name, description, price, category, image_url, stock_quantity, keywords) VALUES
-- Electronics
(1, 'iPhone 13 Pro', '6.1-inch Super Retina XDR display with ProMotion', 999.99, 'Electronics', 'iphone13pro.jpg', 50, '["apple", "smartphone", "mobile", "5g"]'),
(2, 'Samsung Galaxy S22', 'Dynamic AMOLED 2X, 120Hz refresh rate', 799.99, 'Electronics', 'galaxys22.jpg', 45, '["android", "smartphone", "samsung", "5g"]'),
(3, 'Sony WH-1000XM4', 'Industry-leading noise canceling headphones', 349.99, 'Electronics', 'sony-headphones.jpg', 30, '["headphones", "audio", "wireless", "noise-cancelling"]'),
(4, 'Apple Watch Series 7', 'Always-On Retina display, blood oxygen app', 399.99, 'Electronics', 'apple-watch.jpg', 25, '["smartwatch", "wearable", "fitness", "apple"]'),
(5, 'iPad Air', '10.9-inch Liquid Retina display, M1 chip', 599.99, 'Electronics', 'ipad-air.jpg', 20, '["tablet", "apple", "ios", "portable"]'),

-- Clothing
(6, 'Men\'s Casual Shirt', '100% cotton, comfortable fit', 29.99, 'Clothing', 'mens-shirt.jpg', 100, '["shirt", "men", "casual", "cotton"]'),
(7, 'Women\'s Summer Dress', 'Lightweight floral print dress', 49.99, 'Clothing', 'womens-dress.jpg', 80, '["dress", "women", "summer", "floral"]'),
(8, 'Unisex Hoodie', 'Soft fleece interior, adjustable drawstring', 39.99, 'Clothing', 'unisex-hoodie.jpg', 60, '["hoodie", "sweatshirt", "unisex", "casual"]'),
(9, 'Men\'s Jeans', 'Slim fit, stretch denim', 59.99, 'Clothing', 'mens-jeans.jpg', 75, '["jeans", "pants", "men", "denim"]'),
(10, 'Women\'s Running Tights', 'High-waisted, moisture-wicking', 34.99, 'Clothing', 'womens-tights.jpg', 90, '["tights", "leggings", "women", "fitness"]'),

-- Home & Kitchen
(11, 'Non-Stick Frying Pan', 'Ceramic coating, induction compatible', 24.99, 'Home', 'frying-pan.jpg', 40, '["cookware", "pan", "kitchen", "non-stick"]'),
(12, 'Electric Kettle', '1.7L capacity, auto shut-off', 29.99, 'Home', 'electric-kettle.jpg', 35, '["kettle", "appliance", "kitchen", "electric"]'),
(13, 'Air Fryer', '5.8QT capacity, digital controls', 89.99, 'Home', 'air-fryer.jpg', 25, '["fryer", "appliance", "healthy", "cooking"]'),
(14, 'Coffee Maker', '12-cup programmable coffee maker', 49.99, 'Home', 'coffee-maker.jpg', 30, '["coffee", "appliance", "kitchen", "brewing"]'),
(15, 'Blender', '1000W power, 6-speed control', 39.99, 'Home', 'blender.jpg', 20, '["blender", "appliance", "kitchen", "smoothie"]'),

-- Books
(16, 'The Midnight Library', 'Novel by Matt Haig', 14.99, 'Books', 'midnight-library.jpg', 50, '["fiction", "novel", "fantasy", "literature"]'),
(17, 'Atomic Habits', 'By James Clear', 16.99, 'Books', 'atomic-habits.jpg', 60, '["self-help", "productivity", "psychology", "non-fiction"]'),
(18, 'Dune', 'Science fiction novel by Frank Herbert', 12.99, 'Books', 'dune.jpg', 40, '["sci-fi", "fiction", "classic", "novel"]'),
(19, 'The Psychology of Money', 'By Morgan Housel', 18.99, 'Books', 'psychology-money.jpg', 35, '["finance", "psychology", "money", "non-fiction"]'),
(20, 'Where the Crawdads Sing', 'Novel by Delia Owens', 13.99, 'Books', 'crawdads-sing.jpg', 45, '["fiction", "novel", "mystery", "bestseller"]');

-- Insert order items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 999.99),  -- iPhone 13 Pro
(1, 3, 1, 349.99),  -- Sony Headphones
(2, 6, 2, 29.99),   -- Men's Shirt (2x)
(2, 8, 1, 39.99),   -- Unisex Hoodie
(3, 3, 1, 349.99);  -- Sony Headphones

-- Insert some cart items
INSERT INTO cart_items (user_id, product_id, quantity) VALUES
(1, 2, 1),  -- Samsung Galaxy in John's cart
(1, 5, 2),  -- iPad Air (2x) in John's cart
(2, 7, 1),  -- Women's Dress in Jane's cart
(3, 4, 1);  -- Apple Watch in Mike's cart
