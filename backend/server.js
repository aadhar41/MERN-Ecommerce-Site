// Handle Uncaught Exceptions FIRST (e.g., ReferenceError, TypeError)
// This must be at the very top before any other code
process.on("uncaughtException", (err) => {
    console.error(`Error: ${err.message}`);
    console.error(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
});

const app = require("./app");
const dotenv = require("dotenv");
dotenv.config({ path: "backend/config/config.env" });
const port = process.env.PORT || 3000;
const connectDB = require("./config/database");
connectDB();


const server = app.listen(port, () => {
    console.log(`Server is running on port ${port} in ${process.env.NODE_ENV} mode.`);
});

// Handle Unhandled Promise Rejections (e.g., MongoDB connection errors)
process.on("unhandledRejection", (err) => {
    console.error(`Error: ${err.message}`);
    console.error(`Shutting down the server due to Unhandled Promise Rejection`);
    server.close(() => {
        process.exit(1);
    });
});

module.exports = server;