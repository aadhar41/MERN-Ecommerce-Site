const express = require("express");
const router = express.Router();

// Import controllers
const { registerUser } = require("../controllers/authController");

// Register a user
router.post("/register", registerUser);

module.exports = router;