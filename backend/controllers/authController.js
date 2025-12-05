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
    logger.log("info:", "Registering user:", req.body.email);
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


// @desc    Get logged in user info
// @route   GET /api/v1/me
// @access  Private
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
    logger.log("info:", "Getting logged in user info:", req.user.id);
    const user = await User.findById(req.user.id);
    logger.log("success:", "User info retrieved successfully");
    res.status(200).json({
        success: true,
        user,
    });
});


// @desc    Update logged in user password
// @route   PUT /api/v1/password/update
// @access  Private
exports.updateUserPassword = catchAsyncErrors(async (req, res, next) => {
    logger.log("info:", "Updating logged in user password:", req.user.id);
    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    // Compare password
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    if (!isPasswordMatched) {
        logger.log("error:", "Invalid old password");
        return next(new ErrorHandler("Invalid old password", 401));
    }
    user.password = req.body.password;
    await user.save();
    logger.log("success:", "User password updated successfully");
    // Send token to client
    user.message = "Password updated successfully";
    sendToken(user, 200, res);
});


// @desc    Update logged in user info
// @route   PUT /api/v1/update/userprofile
// @access  Private
exports.updateUserProfile = catchAsyncErrors(async (req, res, next) => {
    logger.log("info:", "Updating logged in user info:", req.user.id);
    const user = await User.findById(req.user.id);
    user.name = req.body.name;
    user.email = req.body.email;
    await user.save();
    logger.log("success:", "User info updated successfully");
    res.status(200).json({
        success: true,
        user,
    });
});


// @desc    Logout a user
// @route   POST /api/v1/logout
// @access  Private
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
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
    logger.log("info:", "Forgot password:", req.body.email);
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        logger.log("error:", "User not found");
        return next(new ErrorHandler("User not found", 404));
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetPasswordUrl = `${req.protocol}://${req.get(
        "host"
    )}/api/v1/resetPassword/${resetToken}`;

    const message = `Your password reset token is as follow:\n\n${resetPasswordUrl}\n\n If you have not requested this password reset, please ignore this email.`;

    try {
        await sendEmail({
            email: user.email,
            subject: "ShopIt Password Reset",
            message,
            template: "passwordReset.md",
            context: {
                name: user.name,
                resetUrl: resetPasswordUrl,
            },
        });
        logger.log("info:", "Password reset token sent to your email: " + user.email);
        res.status(200).json({
            success: true,
            message: "Password reset token sent to your email: " + user.email,
        });
    } catch (error) {
        logger.log("error:", "Error sending password reset token");
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
    logger.log("info:", "Reset password:", req.params.token);
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
        logger.log("error:", "Invalid reset password token");
        return next(new ErrorHandler("Invalid reset password token", 400));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    logger.log("info:", "Password reset successfully");
    res.status(200).json({
        success: true,
        message: "Password reset successfully",
    });
});

// Admin Routes

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
    logger.log("info:", "Getting all users");
    const users = await User.find();
    if (!users) {
        logger.log("error:", "Users not found");
        return next(new ErrorHandler("Users not found", 404));
    }
    logger.log("success:", "Users retrieved successfully");
    res.status(200).json({
        success: true,
        users,
    });
});


// @desc    Get user details
// @route   GET /api/v1/admin/user/:id
// @access  Private
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    logger.log("info:", "Getting user details:", req.params.id);
    const user = await User.findById(req.params.id);
    if (!user) {
        logger.log("error:", "User not found");
        return next(new ErrorHandler("User not found", 404));
    }
    logger.log("success:", "User details retrieved successfully");
    res.status(200).json({
        success: true,
        user,
    });
});


// @desc    Update admin user
// @route   PUT /api/v1/admin/user/:id
// @access  Private
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
    logger.log("info:", "Updating user:", req.params.id);
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };

    if (!newUserData.name || !newUserData.email || !newUserData.role) {
        logger.log("error:", "Invalid user data");
        return next(new ErrorHandler("Invalid user data", 400));
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    if (!user) {
        logger.log("error:", "User not found");
        return next(new ErrorHandler("User not found", 404));
    }

    logger.log("success:", "User updated successfully");
    res.status(200).json({
        success: true,
        user,
    });
});

// @desc    Delete admin user
// @route   DELETE /api/v1/admin/user/:id
// @access  Private
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    logger.log("info:", "Deleting user:", req.params.id);
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        logger.log("error:", "User not found");
        return next(new ErrorHandler("User not found", 404));
    }
    logger.log("success:", "User deleted successfully");
    res.status(200).json({
        success: true,
        // user,
    });
});
