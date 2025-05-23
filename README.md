

# 🛒 E-Commerce API Testing Guide

## 📌 Before You Start
1. **Ensure backend is running** at `http://localhost:5000`
2. **Install Postman** (or use any API testing tool)
3. **Set up environment**:
   - Create variable `base_url = http://localhost:5000`

## 🔐 Authentication APIs

### 1. Register User
```http
POST {{base_url}}/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test@1234"
}
```

✅ **Expected Response** (201 Created):
```json
{
  "message": "User registered successfully"
}
```

### 2. Login User
```http
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
    "email": "test@example.com",
  "password": "Test@1234"
}
```
✅ **Expected Response** (200 OK):
```json
{
  "token": "eyJhbGciOi...",
  "userId": 1,
  "username": "testuser"
}
```
💡 **Save the token** for authenticated requests!

## 📦 Product APIs

### 3. Get All Products
```http
GET {{base_url}}/api/products
```
✅ **Expected Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "iPhone 13",
    "price": 999.99,
    "category": "Electronics"
  }
]
```

### 4. Get Single Product
```http
GET {{base_url}}/api/products/1
```
✅ **Expected Response** (200 OK):
```json
{
  "id": 1,
  "name": "iPhone 13",
  "description": "Latest smartphone",
  "price": 999.99,
  "category": "Electronics"
}
```

## 🛍️ Cart APIs

### 5. Add to Cart (Authenticated)
```http
POST {{base_url}}/api/cart
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}
```
✅ **Expected Response** (200 OK):
```json
{
  "message": "Product added to cart"
}
```

### 6. View Cart (Authenticated)
```http
GET {{base_url}}/api/cart
Authorization: Bearer {{token}}
```
✅ **Expected Response** (200 OK):
```json
[
  {
    "productId": 1,
    "name": "iPhone 13",
    "price": 999.99,
    "quantity": 2
  }
]
```

## 💳 Order APIs

### 7. Create Order (Authenticated)
```http
POST {{base_url}}/api/orders
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "shippingInfo": {
    "address": "123 Main St",
    "city": "New York"
  },
  "paymentMethod": "credit_card"
}
```
✅ **Expected Response** (201 Created):
```json
{
  "orderId": 1,
  "message": "Order created successfully"
}
```

### 8. View Orders (Authenticated)
```http
GET {{base_url}}/api/orders
Authorization: Bearer {{token}}
```
✅ **Expected Response** (200 OK):
```json
[
  {
    "id": 1,
    "total": 1999.98,
    "status": "pending",
    "items": [
      {
        "productId": 1,
        "name": "iPhone 13",
        "quantity": 2
      }
    ]
  }
]
```

## 🧪 Test Cases to Verify Group

### Happy Path Tests:
1. Register → Login → Add to Cart → Create Order → View Orders
2. Browse products without login
3. Update cart quantities

### new added things on the test:
1. logout
2. me
3. upload img
 

### Error Cases:
1. Register with existing username (should fail)
2. Add invalid product to cart (should fail)
3. Checkout with empty cart (should fail)

## 📝 Postman Tips
1. **Save requests** in a collection
2. **Set environment variables** for `token` after login
3. **Add tests** to verify responses automatically

Example test script (add to Login request):
```javascript
pm.test("Status is 200", () => pm.response.to.have.status(200));
pm.test("Has token", () => pm.expect(pm.response.json()).to.have.property('token'));
```




for the front-end visit here:-https://github.com/eyob-030/E-commerce-Frontend
