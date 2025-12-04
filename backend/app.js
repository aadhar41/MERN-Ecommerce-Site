const express = require("express");
const app = express();

app.use(express.json());

// Import all routes
const products = require("./routes/products");
const auth = require("./routes/auth");

// Route Middleware

app.use(express.json());
app.use("/api/v1", products);
app.use("/api/v1", auth);

// Middleware to handle errors
const errorMiddleware = require("./middlewares/errors");
app.use(errorMiddleware);

module.exports = app;
