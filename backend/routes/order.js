const express = require("express");
const router = express.Router();
const { newOrder, getSingleOrder, myOrders } = require("../controllers/orderController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const createLogger = require("../utils/logger");
const logger = createLogger('order');

// ---------- 1️⃣ Global logger (runs for every request) ----------
router.use((req, res, next) => {
    logger.log(`[${req.method}] ${req.originalUrl}`);
    next();
});


// ---------- 2️⃣ Validation placeholder ----------
const validate = (req, res, next) => {
    // TODO: add real validation (e.g. Joi, express‑validator)
    next();
};


// ---------- 3️⃣ Routes (auth runs after the global logger) ----------
router
    .route("/order/new")
    .post(isAuthenticatedUser, authorizeRoles("admin", "user"), validate, newOrder);

router
    .route("/order/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin", "user"), validate, getSingleOrder);

router
    .route("/orders/me")
    .get(isAuthenticatedUser, authorizeRoles("admin", "user"), validate, myOrders);


// ---------- 4️⃣ Router‑specific error handler ----------
router.use((err, req, res, next) => {
    logger.error(`routes/order.js: ${err.stack}`);
    if (err.name === "ValidationError") {
        return res.status(400).json({ success: false, message: err.message, errors: err.errors });
    }
    next(err);
});

module.exports = router;