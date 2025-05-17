# 🛍️ E-Commerce API - Team Guide

## 🌟 What We Built
We created a complete online store API with:
- User accounts (register/login)
- Product listings
- Shopping cart
- Order system

## 🛠️ Tech Stack
**Frontend**: HTML, CSS, Bootstrap, JavaScript  
**Backend**: Node.js, Express, MySQL  
**Tools**: Postman for testing

## 🚀 How to Test with Postman

### 1️⃣ First-Time Setup
1. Install Postman (https://www.postman.com/downloads/)
2. Create new workspace called "E-Commerce API"
3. Click "Environments" → "Create Environment"
   - Name: `E-Commerce Local`
   - Add variable: `base_url` = `http://localhost:5000`

### 2️⃣ Create Your Test User
**Register Request**:
1. New request → Name it "Register User"
2. Method: `POST`
3. URL: `{{base_url}}/api/auth/register`
4. Headers:
   - `Content-Type`: `application/json`
5. Body (raw JSON):
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test@1234"
}
```
6. Click "Send" - You should see "User registered" message

### 3️⃣ Login to Get Token
**Login Request**:
1. New request → Name it "Login"
2. Method: `POST`
3. URL: `{{base_url}}/api/auth/login`
4. Same headers/body as register (use same username/password)
5. In "Tests" tab, add:
```javascript
pm.test("Save token", function() {
    const jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
    pm.environment.set("userId", jsonData.userId);
});
```
6. Click "Send" - Token will auto-save for future requests!

### 4️⃣ Browse Products
**Get Products**:
1. New request → Name it "Get Products"
2. Method: `GET`
3. URL: `{{base_url}}/api/products`
4. Click "Send" - See all available products

### 5️⃣ Shopping Cart Time!
**Add to Cart**:
1. New request → Name it "Add to Cart"
2. Method: `POST`
3. URL: `{{base_url}}/api/cart`
4. Headers:
   - `Content-Type`: `application/json`
   - `Authorization`: `Bearer {{token}}`
5. Body:
```json
{
  "productId": 1,
  "quantity": 2
}
```
6. Click "Send" - Item added!

**View Cart**:
1. New request → Name it "View Cart"
2. Method: `GET`
3. URL: `{{base_url}}/api/cart`
4. Add `Authorization` header like above
5. Click "Send" - See your cart items

### 6️⃣ Checkout & Orders
**Create Order**:
1. New request → Name it "Create Order"
2. Method: `POST`
3. URL: `{{base_url}}/api/orders`
4. Headers (same as cart)
5. Body:
```json
{
  "shippingInfo": {
    "name": "Your Name",
    "address": "123 Street",
    "city": "Your City",
    "zip": "12345"
  },
  "paymentMethod": "credit_card"
}
```
6. Click "Send" - Order created!

**View Orders**:
1. New request → Name it "Get Orders"
2. Method: `GET`
3. URL: `{{base_url}}/api/orders`
4. Add `Authorization` header
5. Click "Send" - See your order history

## 💡 Pro Tips
- Click "Save" on each request to build your collection
- Use the "Runner" to test all requests in order
- If token expires (after 1 hour), just login again

## 🐛 Common Issues
**Problem**: Getting 401 errors  
**Fix**: Make sure to:
1. Include `Authorization` header
2. Use a fresh token (login again if needed)

**Problem**: Empty cart/orders  
**Fix**: Add items to cart first before checking out

## 🏁 Next Steps
1. Test all endpoints
2. Check response formats
3. Report any weird behavior

Happy testing! 🎉 Let me know if any steps
