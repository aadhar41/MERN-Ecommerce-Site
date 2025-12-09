// backend/controllers/orderController.js
const Order = require("../models/order");
const Product = require("../models/product");
const logger = require("../utils/logger")("orderController");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

/**
 * @desc    Create new order
 * @route   POST /api/v1/orders/new
 * @access  Private (authenticated user)
 */
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
            updatedAt,
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
            updatedAt,
        });
        logger.log("success:", "Order created successfully");
        res.status(201).json({ success: true, order });
    } catch (error) {
        logger.log("error:", "Error creating order", error);
        next(error);
    }
});

/**
 * @desc    Get single order by ID
 * @route   GET /api/v1/orders/:id
 * @access  Private (owner or admin)
 */
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    try {
        logger.log("info:", "Fetching order by ID:", req.params.id);
        const order = await Order.findById(req.params.id)
            .populate("user", "name email")
            .populate("orderItems.product", "name price image");
        if (!order) {
            return next(new ErrorHandler("Order not found with this ID", 404));
        }
        logger.log("success:", "Order fetched successfully");
        res.status(200).json({ success: true, order });
    } catch (error) {
        logger.log("error:", "Error fetching order", error);
        next(error);
    }
});

/**
 * @desc    Get logged‑in user's orders
 * @route   GET /api/v1/orders/me
 * @access  Private
 */
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    try {
        logger.log("info:", "Fetching orders for user:", req.user.id);
        const orders = await Order.find({ user: req.user.id })
            .populate("user", "name email")
            .populate("orderItems.product", "name price image");
        logger.log("success:", "Orders fetched successfully");
        res.status(200).json({ success: true, orders });
    } catch (error) {
        logger.log("error:", "Error fetching orders", error);
        next(error);
    }
});

/**
 * @desc    Get all orders (admin only)
 * @route   GET /api/v1/orders
 * @access  Private (admin)
 */
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    try {
        logger.log("info:", "Fetching all orders");
        const orders = await Order.find()
            .populate("user", "name email")
            .populate("orderItems.product", "name price image");
        logger.log("success:", "Orders fetched successfully");
        const totalAmount = orders.reduce((acc, order) => acc + order.totalPrice, 0);
        res.status(200).json({ success: true, totalAmount, orders });
    } catch (error) {
        logger.log("error:", "Error fetching orders", error);
        next(error);
    }
});

/**
 * @desc    Update / process order – admin only
 * @route   PUT /api/v1/orders/:id
 * @access  Private (admin)
 */
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    try {
        logger.log("info:", "Fetching order for update");
        const order = await Order.findById(req.params.id);
        if (!order) {
            return next(new ErrorHandler("Order not found", 404));
        }
        if (order.orderStatus === "Delivered") {
            return next(new ErrorHandler("Order already delivered", 400));
        }
        // Update stock for each product in the order
        for (const item of order.orderItems) {
            logger.log("info:", "Updating stock for product:", item.product);
            await updateStock(item.product, item.quantity);
        }
        // Apply status changes
        order.orderStatus = req.body.orderStatus || order.orderStatus;
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        await order.save();
        logger.log("success:", "Order updated successfully");
        res.status(200).json({ success: true, order });
    } catch (error) {
        logger.log("error:", "Error updating order", error);
        next(error);
    }
});


/**
 * @desc    Delete order
 * @route   DELETE /api/v1/orders/:id
 * @access  Private (admin)
 */
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    try {
        logger.log("info:", "Fetching order for delete");
        const order = await Order.findById(req.params.id);
        if (!order) {
            logger.log("error:", "Order not found");
            return next(new ErrorHandler("Order not found", 404));
        }
        await order.deleteOne(); // Use deleteOne() instead of the deprecated remove()
        logger.log("success:", "Order deleted successfully");
        res.status(200).json({ success: true, message: "Order deleted successfully" });
    } catch (error) {
        logger.log("error:", "Error deleting order", error);
        next(error);
    }
});

/**
 * @desc    Update order to paid
 * @route   PUT /api/v1/orders/:id/pay
 * @access  Private (admin)
 */
exports.updateOrderToPaid = catchAsyncErrors(async (req, res, next) => {
    try {
        logger.log("info:", "Updating order to paid:", req.params.id);
        const order = await Order.findById(req.params.id);
        if (!order) {
            return next(new ErrorHandler("Order not found with this ID", 404));
        }
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentInfo = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address,
        };
        await order.save();
        logger.log("success:", "Order marked as paid");
        res.status(200).json({ success: true, order });
    } catch (error) {
        logger.log("error:", "Error marking order as paid", error);
        next(error);
    }
});

/**
 * Helper: reduce product stock.
 */
const updateStock = async (productId, quantity) => {
    logger.log("info:", "Updating stock for product:", productId);
    const product = await Product.findById(productId);
    if (!product) {
        throw new ErrorHandler("Product not found with this ID", 404);
    }
    product.stock -= quantity;
    await product.save({ validateBeforeSave: false });
    logger.log("success:", "Stock updated for product", productId);
};