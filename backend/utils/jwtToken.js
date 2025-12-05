// jwtToken.js create and send token and save token in cookie

const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const sendToken = (user, statusCode, res) => {
    const token = user.getJwtToken();
    const options = {
        expires: new Date(Date.now() + (parseInt(process.env.COOKIE_EXPIRE, 10) || 7) * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    res.cookie("token", token, options);
    res.status(statusCode).json({
        success: true,
        message: user.message || "Login successful",
        // data: user,
        token,
    });
};

module.exports = sendToken;
