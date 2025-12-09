const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger")('productController');
const loggerReview = require("../utils/logger")('productControllerReview');
const { isValidObjectId } = require("../utils/objectIdValidator");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const ErrorHandler = require("../utils/errorHandler");


// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private/Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    logger.log("info:", "Request Body:", req.body);
    req.body.user = req.user._id;
    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        data: product,
    });
    logger.log("success:", "Product created successfully.");
});

// @desc    Fetch all products
// @route   GET /api/v1/products?keyword=phone&page=1&sortBy=-price
// @access  Public
exports.getProducts = catchAsyncErrors(async (req, res, next) => {
    logger.log("info:", "Fetching all products");
    const resPerPage = 8; // Number of products per page

    const apiFeatures = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter();

    // Handle sorting
    let sortBy = {};
    if (req.query.sortBy) {
        const sortField = req.query.sortBy.startsWith('-')
            ? req.query.sortBy.substring(1)
            : req.query.sortBy;
        const sortOrder = req.query.sortBy.startsWith('-') ? -1 : 1;
        sortBy[sortField] = sortOrder;  // Use bracket notation to use variable as key
    } else {
        sortBy = { createdAt: -1 }; // Default: newest first
    }

    const products = await apiFeatures.query
        .sort(sortBy)
        .limit(resPerPage)
        .skip(resPerPage * ((Number(req.query.page) || 1) - 1));

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(apiFeatures.query.getFilter());

    res.status(200).json({
        success: true,
        totalProducts,
        resPerPage,
        data: products,
    });
    logger.log("success:", "Products fetched successfully");
});


// @desc    Fetch single product
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProductById = catchAsyncErrors(async (req, res, next) => {
    logger.log("info:", "Fetching product by ID:", req.params.id);
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
        logger.log("info:", "Product not found");
        return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({
        success: true,
        data: product,
    });
    logger.log("success:", "Product fetched successfully");
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    logger.log("info:", "Updating product by ID:", req.params.id);
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
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
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    try {
        logger.log("info:", "Deleting product by ID:", req.params.id);
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }
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


// @desc    Create new review
// @route   PUT /api/v1/products/:id/review
// @access  Private
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
    loggerReview.log("info:", "Creating product review by ID:", productId);
    const product = await Product.findById(productId);
    if (!isValidObjectId(productId)) {
        return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    if (!product) {
        loggerReview.log("info:", "Product not found");
        return res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }
    const isreviewed = product.reviews.find((review) => review.user && review.user.toString() === req.user._id.toString());
    if (isreviewed) {
        loggerReview.log("info:", "Product already reviewed");
        // Update
        product.reviews.forEach((review) => {
            if (review.user && review.user.toString() === req.user._id.toString()) {
                review.rating = rating;
                review.comment = comment;
            }
        });
    } else {
        // Create
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        data: review,
    });
    loggerReview.log("success:", "Product review created successfully.");
});


// @desc    Get product reviews
// @route   GET /api/v1/reviews?id=<productId>
// @access  Private
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    loggerReview.log("info:", "Fetching product reviews by ID:", req.query.id);
    if (!req.query.id) {
        loggerReview.log("info:", "Invalid product ID");
        return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    const product = await Product.findById(req.query.id);
    if (!product) {
        loggerReview.log("info:", "Product not found");
        return res.status(404).json({ success: false, message: "Product not found" });
    }
    const reviews = product.reviews;
    res.status(200).json({
        success: true,
        data: reviews,
    });
    loggerReview.log("success:", "Product reviews fetched successfully.");
});


// @desc    Delete Product review
// @route   DELETE /api/v1/products/:id/review
// @access  Private
exports.deleteProductReview = catchAsyncErrors(async (req, res, next) => {
    loggerReview.log("info:", "Deleting product review by ID:", req.query.productId);
    if (!isValidObjectId(req.query.productId)) {
        return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    const product = await Product.findById(req.query.productId);
    if (!product) {
        loggerReview.log("info:", "Product not found");
        return res.status(404).json({ success: false, message: "Product not found" });
    }
    const reviews = product.reviews.filter((review) => review._id.toString() !== req.query.id.toString());
    if (reviews.length === product.reviews.length) {
        return res.status(404).json({ success: false, message: "Review not found" });
    }
    const numOfReviews = reviews.length;
    const ratings = numOfReviews === 0 ? 0 : reviews.reduce((acc, item) => item.rating + acc, 0) / numOfReviews;
    await Product.findByIdAndUpdate(req.query.productId, {
        reviews, numOfReviews, ratings
    }, {
        new: true, runValidators: false, validateBeforeSave: false, useFindAndModify: false
    });
    res.status(200).json({
        success: true,
        data: reviews,
    });
    loggerReview.log("success:", "Product review deleted successfully.");
});
