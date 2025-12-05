// auth.js
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const User = require("../models/user");
const logger = require("../utils/logger")("auth");

// Auth middleware
exports.isAuthenticatedUser = async (req, res, next) => {
    try {
        const { token } = req.cookies; // Assuming token is stored in cookies

        if (!token) {
            return res.status(401).json({ success: false, message: "Login first to access this resource." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your JWT secret
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({ success: false, message: "User not found." });
        }

        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ success: false, message: "Invalid Token. Please Login again." });
        }
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Token has expired. Please Login again." });
        }
        next(error); // Pass other errors to the error handling middleware
    }
};

// Middleware to authorize user roles
exports.authorizeRoles = (...roles) => {
    return catchAsyncErrors(async (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            logger.log("info:", "Unauthorized access attempt");
            return next(new ErrorHandler(`Role (${req.user ? req.user.role : 'unauthenticated'}) is not allowed to access this resource.`, 403));
        }
        next();
    });
};

