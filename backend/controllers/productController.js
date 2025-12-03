const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger")('productController');


// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private/Admin
exports.createProduct = asyncHandler(async (req, res, next) => {
    logger.log("info:", "Request Body:", req.body);
    const { name, price, description, ratings, images, category, seller, stock, numOfReviews, reviews } = req.body;
    const product = await Product.create({
        name,
        price,
        description,
        ratings,
        images,
        category,
        seller,
        stock,
        numOfReviews,
        reviews,
    });
    res.status(201).json({
        success: true,
        data: product,
    });
    logger.log("success:", "Product created successfully");
});

// @desc    Fetch all products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
    logger.log("info:", "Fetching all products");
    const products = await Product.find();
    res.status(200).json({
        success: true,
        count: products.length,
        data: products,
    });
    logger.log("success:", "Products fetched successfully");
});


// @desc    Fetch single product
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProductById = asyncHandler(async (req, res, next) => {
    logger.log("info:", "Fetching product by ID:", req.params.id);
    const product = await Product.findById(req.params.id);
    res.status(200).json({
        success: true,
        data: product,
    });
    logger.log("success:", "Product fetched successfully");
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res, next) => {
    logger.log("info:", "Updating product by ID:", req.params.id);
    let product = await Product.findById(req.params.id);

    if (!product) {
        logger.log("info:", "Product not found");
        return res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: product,
    });
    logger.log("success:", "Product updated successfully");
});

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res, next) => {
    try {
        logger.log("info:", "Deleting product by ID:", req.params.id);
        const product = await Product.findById(req.params.id);

        if (!product) {
            logger.log("info:", "Product not found");
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Use deleteOne (or findByIdAndDelete) instead of deprecated remove
        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: "Product is deleted.",
        });
        logger.log("success:", "Product deleted successfully");
    } catch (err) {
        // Log error details to file and forward to error middleware
        logger.error("Error deleting product:", err);
        return next(err);
    }
});





