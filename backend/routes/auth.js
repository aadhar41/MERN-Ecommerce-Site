const express = require("express");
const router = express.Router();
const createLogger = require("../utils/logger");
const logger = createLogger('auth');

const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");


// Import controllers
const {
    registerUser, loginUser, logoutUser, forgotPassword,
    resetPassword, getUserProfile, updateUserPassword, updateUserProfile,
    getAllUsers, getUserDetails, updateUser, deleteUser
} = require("../controllers/authController");

// Register a user
router.post("/register", catchAsyncErrors(registerUser));

// Login a user
router.post("/login", catchAsyncErrors(loginUser));

// Logout a user
router.post("/logout", isAuthenticatedUser, catchAsyncErrors(logoutUser));

// Get logged in user info
router.get("/me", isAuthenticatedUser, catchAsyncErrors(getUserProfile));

// Update logged in user password
router.put("/password/update", isAuthenticatedUser, catchAsyncErrors(updateUserPassword));

// Update logged in user profile
router.put("/update/userprofile", isAuthenticatedUser, catchAsyncErrors(updateUserProfile));

// Forgot password
router.post("/forgotPassword", catchAsyncErrors(forgotPassword));

// Reset password
router.post("/resetPassword/:token", catchAsyncErrors(resetPassword));

// Admin routes
router.get("/admin/users", isAuthenticatedUser, authorizeRoles("admin"), catchAsyncErrors(getAllUsers));
router.get("/admin/user/:id", isAuthenticatedUser, authorizeRoles("admin"), catchAsyncErrors(getUserDetails));
router.put("/admin/user/:id", isAuthenticatedUser, authorizeRoles("admin"), catchAsyncErrors(updateUser));
router.delete("/admin/user/:id", isAuthenticatedUser, authorizeRoles("admin"), catchAsyncErrors(deleteUser));

// Error handling middleware specific to this router
router.use((err, req, res, next) => {
    logger.error(`routes/auth.js: ${err.stack}`);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: err.message, errors: err.errors });
    }
    next(err);
});


module.exports = router;