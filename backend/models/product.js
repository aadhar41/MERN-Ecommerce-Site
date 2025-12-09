const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
        maxlength: [100, "Product name must be at most 100 characters long"],
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
        trim: true,
        maxlength: [5, "Product price must be at most 5 characters long"],
        default: 0.00,
    },
    description: {
        type: String,
        required: [true, "Product description is required"],
    },
    ratings: {
        type: Number,
        default: 0,
    },
    images: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
        }
    ],
    category: {
        type: String,
        required: [true, "Product category is required"],
        lowercase: true,
        enum: {
            values: [
                "electronics",
                "cameras",
                "laptops",
                "accessories",
                "headphones",
                "food",
                "books",
                "clothing",
                "footwear",
                "beauty/health",
                "sports",
                "outdoor",
                "home"
            ],
            message: "Please enter a valid category"
        }
    },
    seller: {
        type: String,
        required: [true, "Product seller is required"],
    },
    stock: {
        type: Number,
        required: [true, "Product stock is required"],
        maxlength: [5, "Product stock must be at most 5 characters long"],
        default: 0,
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                required: true,
            },
            comment: {
                type: String,
                required: true,
            }
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Product", productSchema);
