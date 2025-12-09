const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

// Import all routes
const products = require("./routes/products");
const auth = require("./routes/auth");
const order = require("./routes/order");

// Route Middleware

app.use(express.json());
app.use("/api/v1", products);
app.use("/api/v1", auth);
app.use("/api/v1/admin", order); // restored original mount; use /api/v1/admin if you prefer admin namespace

// Middleware to handle errors
const errorMiddleware = require("./middlewares/errors");
app.use(errorMiddleware);

module.exports = app;
