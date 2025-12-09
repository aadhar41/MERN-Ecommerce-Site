const express = require("express");
const router = express.Router();
const { newOrder, getSingleOrder, myOrders } = require("../controllers/orderController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const createLogger = require("../utils/logger");
const logger = createLogger('order');

// Logging middleware for this router
router.use((req, res, next) => {
    logger.log(`[${req.method}] ${req.originalUrl}`);
    next();
});

// Validation middleware
const validate = (req, res, next) => {
    // This is a placeholder for your actual validation logic.
    next();
};

// Error handling middleware specific to this router
router.use((err, req, res, next) => {
    logger.error(`routes/order.js: ${err.stack}`);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: err.message, errors: err.errors });
    }
    next(err);
});

router.route("/order/new").post(isAuthenticatedUser, authorizeRoles("admin", "user"), validate, newOrder);
router.route("/order/:id").get(isAuthenticatedUser, authorizeRoles("admin", "user"), validate, getSingleOrder);
router.route("/orders/me").get(isAuthenticatedUser, authorizeRoles("admin", "user"), validate, myOrders);

module.exports = router;