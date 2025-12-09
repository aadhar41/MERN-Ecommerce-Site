const ErrorHandler = require("../utils/errorHandler");
const logger = require('../utils/logger')('error');

module.exports = (err, req, res, next) => {
    // 1️⃣ Log the full error (stack, request info)
    logger.error({
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        // you can add user id if you have it:
        userId: req.user ? req.user._id : undefined,
    });

    // 2️⃣ Determine status code
    const status = err.statusCode || 500;

    // 3️⃣ Hide internal details for 5xx errors
    const response = {
        success: false,
        message:
            status >= 500
                ? 'Internal Server Error' // generic for production
                : err.message,
    };

    // 4️⃣ Optionally include validation details
    if (err.name === 'ValidationError' && err.errors) {
        response.errors = err.errors;
    }

    let error = { ...err };

    error.message = err.message;

    // Wrong Mongoose Object ID Error
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        error = new ErrorHandler(message, 400);
    }

    // Handling Mongoose Validation Error
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map((value) => value.message);
        error = new ErrorHandler(message, 400);
    }

    // Handling Mongoose duplicate key errors
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered. Please use a different value.`;
        error = new ErrorHandler(message, 400);
    }

    // Handling wrong JWT error
    if (err.name === "JsonWebTokenError") {
        const message = "JSON Web Token is invalid. Try Again!!!";
        error = new ErrorHandler(message, 400);
    }

    // Handling Expired JWT error
    if (err.name === "TokenExpiredError") {
        const message = "JSON Web Token is expired. Try Again!!!";
        error = new ErrorHandler(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
    });
};
