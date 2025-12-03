const Product = require("../models/product");
const dotenv = require("dotenv");
const connectDB = require("../config/database");
const products = require("../data/products");

dotenv.config({ path: "backend/config/config.env" });
connectDB();

const seedProducts = async () => {
    try {
        console.log("Seeding products...");
        await Product.deleteMany();
        console.log("Products deleted successfully.");

        await Product.insertMany(products);
        console.log("Products seeded successfully.");
        process.exit();
    } catch (error) {
        console.log("Error seeding products:", error.message);
        process.exit();
    }
};

seedProducts();