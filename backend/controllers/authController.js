const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const logger = require("../utils/logger")("authController");
const sendToken = require("../utils/jwtToken");


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
    // Send token to client
    sendToken(user, 201, res);
});


// @desc    Login a user
// @route   POST /api/v1/login
// @access  Public
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    logger.log("info:", "Logging in user:", email);
    // Validate input
    if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password", 400));
    }
    // Find user by email and select password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }
    // Compare password
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }
    // Send token to client
    sendToken(user, 200, res);
});

// @desc    Logout a user
// @route   POST /api/v1/logout
// @access  Private
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: Date.now(),
        httpOnly: true,
    });
    res.status(200).json({
        success: true,
        message: "User logged out successfully",
    });
});

// @desc    Forgot password
// @route   POST /api/v1/forgotPassword
// @access  Public
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetPasswordUrl = `${req.protocol}://${req.get(
        "host"
    )}/api/v1/resetPassword/${resetToken}`;
    const message = `Your password reset token is as follow:\n\n${resetPasswordUrl}`;
    try {
        await sendEmail({
            email: user.email,
            subject: "ShopIt Password Reset",
            message,
        });
        res.status(200).json({
            success: true,
            message: "Password reset token sent to your email",
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message, 500));
    }
});

// @desc    Reset password
// @route   POST /api/v1/resetPassword/:token
// @access  Public
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
        return next(new ErrorHandler("Invalid reset password token", 400));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(200).json({
        success: true,
        message: "Password reset successfully",
    });
});

