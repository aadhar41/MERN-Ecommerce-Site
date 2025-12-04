const express = require("express");
const router = express.Router();
const createLogger = require("../utils/logger");
const logger = createLogger('products');

const { getProducts, createProduct, getProductById, updateProduct, deleteProduct } = require("../controllers/productController");

const validate = (req, res, next) => {
    // This is a placeholder for your actual validation logic.
    next();
};

// Logging middleware for this router
router.use((req, res, next) => {
    logger.log(`[${req.method}] ${req.originalUrl}`);
    next();
});


router.route("/admin/products").post(validate, createProduct);
router.route("/admin/products/:id").get(getProductById).put(validate, updateProduct).delete(deleteProduct);
router.route("/products").get(getProducts); // Keep public GET for all products
router.route("/products/:id").get(getProductById); // Keep public GET for single product


// Error handling middleware specific to this router
router.use((err, req, res, next) => {
    logger.error(err.stack);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: err.message, errors: err.errors });
    }
    next(err);
});

module.exports = router;