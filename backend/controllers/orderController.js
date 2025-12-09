const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");
const logger = require("../utils/logger")('orderController');
const { isValidObjectId } = require("../utils/objectIdValidator");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const ErrorHandler = require("../utils/errorHandler");

// @desc    Create new order
// @route   POST /api/v1/orders/new
// @access  Private
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    try {
        logger.log("info:", "Creating new order");
        const {
            orderItems,
            shippingInfo,
            paymentInfo,
            itemPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
            isPaid,
            paidAt,
            orderStatus,
            isDelivered,
            deliveredAt,
            createdAt,
            updatedAt
        } = req.body;
        const order = await Order.create({
            orderItems,
            shippingInfo,
            paymentInfo,
            itemPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
            isPaid,
            paidAt,
            user: req.user._id,
            orderStatus,
            isDelivered,
            deliveredAt,
            createdAt,
            updatedAt
        });
        logger.log("success:", "Order created successfully");
        res.status(201).json({
            success: true,
            order
        })
    } catch (error) {
        logger.log("error:", "Error creating order", error);
        next(error);
    }
});

// @desc    Get single order
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    try {
        logger.log("info:", "Fetching order by ID:", req.params.id);
        const order = await Order.findById(req.params.id).populate("user", "name email").populate("orderItems.product", "name price image");
        if (!order) {
            return next(new ErrorHandler("Order not found with this ID", 404));
        }
        logger.log("success:", "Order fetched successfully");
        res.status(200).json({
            success: true,
            order
        })
    } catch (error) {
        logger.log("error:", "Error fetching order", error);
        next(error);
    }
});

// @desc    Get logged in user orders
// @route   GET /api/v1/orders/me
// @access  Private
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    try {
        logger.log("info:", "Fetching orders for user:", req.user._id);
        const orders = await Order.find({ user: req.user._id }).populate("user", "name email").populate("orderItems.product", "name price image");
        logger.log("success:", "Orders fetched successfully");
        res.status(200).json({
            success: true,
            orders
        })
    } catch (error) {
        logger.log("error:", "Error fetching orders", error);
        next(error);
    }
});


