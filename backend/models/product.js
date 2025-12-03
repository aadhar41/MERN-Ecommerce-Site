const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
        lowercase: true,
        minlength: [3, "Product name must be at least 3 characters long"],
        maxlength: [100, "Product name must be at most 100 characters long"],
        index: true,
        unique: true
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
        trim: true,
        lowercase: true,
        min: [0, "Product price must be at least 0"],
        max: [1000000, "Product price must be at most 1000000"],
        maxlength: [10, "Product price must be at most 10 characters long"],
        default: 0.00,
        index: true,
        unique: true
    },
    description: {
        type: String,
        required: [true, "Product description is required"],
        trim: true,
        lowercase: true,
        minlength: [10, "Product description must be at least 10 characters long"],
        maxlength: [1000, "Product description must be at most 1000 characters long"],
        index: true,
        unique: true
    },
    ratings: {
        type: Number,
        required: [true, "Product ratings is required"],
        trim: true,
        lowercase: true,
        min: [0, "Product ratings must be at least 0"],
        default: 0,
        index: true,
        unique: true
    },
    // ratingsAverage: {
    //     type: Number,
    //     required: [true, "Product ratings average is required"],
    //     trim: true,
    //     lowercase: true,
    //     min: [0, "Product ratings average must be at least 0"],
    //     default: 0.00,
    //     index: true,
    //     unique: true
    // },
    // ratingsQuantity: {
    //     type: Number,
    //     required: [true, "Product ratings quantity is required"],
    //     trim: true,
    //     lowercase: true,
    //     min: [0, "Product ratings quantity must be at least 0"],
    //     default: 0,
    //     index: true,
    //     unique: true
    // },
    images: [
        {
            public_id: {
                type: String,
                required: [true, "Product images public id is required"],
            },
            url: {
                type: String,
                required: [true, "Product images secure url is required"],
            },
        }
    ],
    category: {
        type: String,
        required: [true, "Product category is required"],
        trim: true,
        lowercase: true,
        minlength: [3, "Product category must be at least 3 characters long"],
        maxlength: [100, "Product category must be at most 100 characters long"],
        index: true,
        unique: true,
        enum: {
            values: [
                "electronics",
                "clothing",
                "footwear",
                "accessories",
                "home & kitchen",
                "beauty & health",
                "sports & fitness",
                "books",
                "toys & games",
                "others"
            ],
            message: "Please enter a valid category"
        }
    },
    seller: {
        type: String,
        required: [true, "Product seller is required"],
        trim: true,
        lowercase: true,
        minlength: [3, "Product seller must be at least 3 characters long"],
        maxlength: [100, "Product seller must be at most 100 characters long"],
        index: true,
        unique: true
    },
    stock: {
        type: Number,
        required: [true, "Product stock is required"],
        trim: true,
        lowercase: true,
        min: [0, "Product stock must be at least 0"],
        maxlength: [5, "Product stock must be at most 5 characters long"],
        default: 0,
        index: true,
        unique: true
    },
    numOfReviews: {
        type: Number,
        required: [true, "Product number of reviews is required"],
        trim: true,
        lowercase: true,
        min: [0, "Product number of reviews must be at least 0"],
        maxlength: [5, "Product number of reviews must be at most 5 characters long"],
        default: 0,
        index: true,
        unique: true
    },
    reviews: [
        {
            // user: {
            //     type: mongoose.Schema.Types.ObjectId,
            //     ref: "User"
            // },
            name: {
                type: String,
                required: [true, "Review name is required"],
                trim: true,
                lowercase: true,
                minlength: [3, "Review name must be at least 3 characters long"],
                maxlength: [100, "Review name must be at most 100 characters long"],
                index: true,
                unique: true
            },
            rating: {
                type: Number,
                required: [true, "Review rating is required"],
                trim: true,
                lowercase: true,
                min: [0, "Review rating must be at least 0"],
                maxlength: [5, "Review rating must be at most 5 characters long"],
                default: 0,
                index: true,
                unique: true
            },
            comment: {
                type: String,
                required: [true, "Review comment is required"],
                trim: true,
                lowercase: true,
                minlength: [10, "Review comment must be at least 10 characters long"],
                maxlength: [1000, "Review comment must be at most 1000 characters long"],
                index: true,
                unique: true
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
