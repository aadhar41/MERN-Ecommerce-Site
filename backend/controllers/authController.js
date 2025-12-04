const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const logger = require("../utils/logger")("authController");


// @desc    Register a user
// @route   POST /api/v1/register
// @access  Public
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;
    logger.log("info:", "Registering user:", req.body);
    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: "avatars/default",
            url: "https://via.placeholder.com/150",
        },
    });
    logger.log("success:", "User registered successfully");
    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
    });
});
