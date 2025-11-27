const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    rating: Number,
    clientID: {
        type: mongoose.Schema.ObjectId,
        required: true,
    },
    comments: String
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
