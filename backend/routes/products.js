const express = require("express");
const router = express.Router();
const fs = require('fs');
const path = require('path');

const logDirectory = path.join(__dirname, '../../logs');
const logFile = path.join(logDirectory, 'products.log');

// Ensure the log directory exists
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

// Create a write stream for appending logs
const accessLogStream = fs.createWriteStream(logFile, { flags: 'a' });

// Override console.log and console.error to also write to the file
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = function (...args) {
    originalConsoleLog(...args);
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    accessLogStream.write(`[INFO] ${new Date().toISOString()} ${message}\n`);
};

console.error = function (...args) {
    originalConsoleError(...args);
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    accessLogStream.write(`[ERROR] ${new Date().toISOString()} ${message}\n`);
};


const { getProducts, createProduct, getProductById, updateProduct, deleteProduct } = require("../controllers/productController");

const validate = (req, res, next) => {
    // This is a placeholder for your actual validation logic.
    // You would typically use a library like 'express-validator' or 'Joi'.
    // For example, if using express-validator:
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return res.status(400).json({ success: false, errors: errors.array() });
    // }

    // If validation passes, call next() to proceed to the controller
    // For demonstration, let's assume no validation errors for now.
    next();
};

router.route("/products").get(getProducts).post(validate, createProduct);
router.route("/products/:id").get(getProductById).put(validate, updateProduct).delete(deleteProduct);

// Error handling middleware specific to this router (optional, but good for validation errors)
router.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    if (err.name === 'ValidationError') { // Assuming specific error type for validation
        return res.status(400).json({ success: false, message: err.message, errors: err.errors });
    }
    // If it's not a validation error, pass it to the next error handler (e.g., a global one)
    next(err);
});

module.exports = router;