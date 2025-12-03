const express = require("express");
const app = express();

app.use(express.json());

// Import all routes
const products = require("./routes/products");

// Route Middleware

app.use(express.json());
app.use("/api/v1", products);

// Middleware to handle errors
const errorMiddleware = require("./middlewares/errors");
app.use(errorMiddleware);

module.exports = app;
