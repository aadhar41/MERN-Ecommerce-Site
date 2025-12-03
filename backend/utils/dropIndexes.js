const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("../config/database");
const Product = require("../models/product");

// Setting dotenv file
dotenv.config({ path: "backend/config/config.env" });

connectDB();

const dropIndexes = async () => {
    try {
        await Product.collection.dropIndexes();
        console.log("Indexes dropped successfully");
        process.exit();
    } catch (error) {
        console.log(error.message);
        process.exit();
    }
};

dropIndexes();
