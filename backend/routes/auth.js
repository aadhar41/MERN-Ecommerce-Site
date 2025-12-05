const express = require("express");
const router = express.Router();
const createLogger = require("../utils/logger");
const logger = createLogger('auth');

const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const { isAuthenticatedUser } = require("../middlewares/auth");


// Import controllers
const { registerUser, loginUser, logoutUser, forgotPassword, resetPassword } = require("../controllers/authController");

// Register a user
router.post("/register", catchAsyncErrors(registerUser));

// Login a user
router.post("/login", catchAsyncErrors(loginUser));

// Logout a user
router.post("/logout", isAuthenticatedUser, catchAsyncErrors(logoutUser));

// Forgot password
router.post("/forgotPassword", catchAsyncErrors(forgotPassword));

// Reset password
router.post("/resetPassword/:token", catchAsyncErrors(resetPassword));

// Error handling middleware specific to this router
router.use((err, req, res, next) => {
    logger.error(`routes/auth.js: ${err.stack}`);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: err.message, errors: err.errors });
    }
    next(err);
});


module.exports = router;