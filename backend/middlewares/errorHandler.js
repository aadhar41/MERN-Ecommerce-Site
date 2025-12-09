// backend/middlewares/errorHandler.js
const logger = require('../utils/logger')('error');

class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // distinguishes expected errors from bugs
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Express error‑handling middleware
 */
const errorMiddleware = (err, req, res, next) => {
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

    res.status(status).json(response);
};

module.exports = { errorMiddleware, ApiError };