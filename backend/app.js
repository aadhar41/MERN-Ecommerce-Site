const express = require("express");
const app = express();

app.use(express.json());

// Import all routes
const products = require("./routes/products");

// Route Middleware

app.use(express.json());
app.use("/api/v1", products); // To test this on Postman, send requests to `http://localhost:YOUR_PORT/api/v1/products` with the appropriate HTTP method (e.g., GET, POST) and body, depending on the routes defined in `products.js`.

module.exports = app;
