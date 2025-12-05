const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "User name is required"],
        trim: true,
        maxlength: [50, "User name must be at most 50 characters long"],
    },
    email: {
        type: String,
        required: [true, "User email is required"],
        trim: true,
        unique: true,
        validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
        type: String,
        required: [true, "User password is required"],
        minlength: [8, "User password must be at least 8 characters long"],
        select: false,
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

// Hash password
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: (parseInt(process.env.JWT_EXPIRE, 10) || 7) * 24 * 60 * 60 * 1000
    });
};

// Generate reset password token
userSchema.methods.getResetPasswordToken = function () {
    // Generate a random reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash the reset token
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // Set the reset password expire time
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

    // Return the reset token
    return resetToken;
};

module.exports = mongoose.model("User", userSchema);
