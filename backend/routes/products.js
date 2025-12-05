const express = require("express");
const router = express.Router();
const createLogger = require("../utils/logger");
const logger = createLogger('products');

const { getProducts, createProduct, getProductById, updateProduct, deleteProduct } = require("../controllers/productController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

const validate = (req, res, next) => {
    // This is a placeholder for your actual validation logic.
    next();
};

// Logging middleware for this router
router.use((req, res, next) => {
    logger.log(`[${req.method}] ${req.originalUrl}`);
    next();
});


router.route("/admin/products").post(isAuthenticatedUser, authorizeRoles("admin"), validate, createProduct);
router.route("/admin/products/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getProductById) // Added authentication and authorization for admin GET
    .put(isAuthenticatedUser, authorizeRoles("admin"), validate, updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);
router.route("/products").get(isAuthenticatedUser, getProducts); // Keep public GET for all products
router.route("/products/:id").get(isAuthenticatedUser, getProductById); // Keep public GET for single product


// Error handling middleware specific to this router
router.use((err, req, res, next) => {
    logger.error(err.stack);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: err.message, errors: err.errors });
    }
    next(err);
});

module.exports = router;