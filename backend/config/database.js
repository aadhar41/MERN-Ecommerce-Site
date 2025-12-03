const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_LOCAL_URI).then((con) => {
            console.log(`MongoDB connected with HOSTS: ${con.connection.host}`);
        });
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
};

module.exports = connectDB;