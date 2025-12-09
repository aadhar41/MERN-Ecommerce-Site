const express = require("express");
const router = express.Router();
const {
    newOrder,
    getSingleOrder,
    myOrders,
    getAllOrders,
    updateOrder,
    deleteOrder,
    updateOrderToPaid,
} = require("../controllers/orderController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const createLogger = require("../utils/logger");
const logger = createLogger("order");

// Global logger – logs every request hitting this router
router.use((req, res, next) => {
    logger.log(`[${req.method}] ${req.originalUrl}`);
    next();
});

// Validation placeholder (replace with real validation later)
const validate = (req, res, next) => {
    next();
};

// -------------------- Public routes (admin & user) --------------------
router
    .route("/order/new")
    .post(isAuthenticatedUser, authorizeRoles("admin", "user"), validate, newOrder);

router
    .route("/order/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin", "user"), validate, getSingleOrder);

router
    .route("/orders/me")
    .get(isAuthenticatedUser, authorizeRoles("admin", "user"), validate, myOrders);

// -------------------- Admin‑only routes (mounted under /api/v1/admin) --------------------
router
    .route("/orders")
    .get(isAuthenticatedUser, authorizeRoles("admin"), validate, getAllOrders);

router
    .route("/order/:id")
    .put(isAuthenticatedUser, authorizeRoles("admin"), validate, updateOrder);

router
    .route("/order/:id")
    .delete(isAuthenticatedUser, authorizeRoles("admin"), validate, deleteOrder);

router
    .route("/order/:id/pay")
    .put(isAuthenticatedUser, authorizeRoles("admin"), validate, updateOrderToPaid);

// Router‑specific error handler
router.use((err, req, res, next) => {
    logger.error(`routes/order.js: ${err.stack}`);
    if (err.name === "ValidationError") {
        return res.status(400).json({ success: false, message: err.message, errors: err.errors });
    }
    next(err);
});

module.exports = router;
