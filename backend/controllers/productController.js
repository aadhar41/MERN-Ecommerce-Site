const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger");


// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private/Admin
exports.createProduct = asyncHandler(async (req, res, next) => {
    logger.info("Request Body:", req.body);
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
    logger.success("Product created successfully");
});

// @desc    Fetch all products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
    logger.info("Fetching all products");
    const products = await Product.find();
    res.status(200).json({
        success: true,
        count: products.length,
        data: products,
    });
    logger.success("Products fetched successfully");
});


// @desc    Fetch single product
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProductById = asyncHandler(async (req, res, next) => {
    logger.info("Fetching product by ID:", req.params.id);
    const product = await Product.findById(req.params.id);
    res.status(200).json({
        success: true,
        data: product,
    });
    logger.success("Product fetched successfully");
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res, next) => {
    logger.info("Updating product by ID:", req.params.id);
    let product = await Product.findById(req.params.id);

    if (!product) {
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
    logger.success("Product updated successfully");
});

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res, next) => {
    logger.info("Deleting product by ID:", req.params.id);
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }

    await product.remove();

    res.status(200).json({
        success: true,
        message: "Product is deleted.",
    });
    logger.success("Product deleted successfully");
});





