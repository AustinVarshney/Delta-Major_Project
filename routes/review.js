const express = require("express");
const router = express.Router({ mergeParams: true });   //Preserve the req.params values from the parent router.
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
let { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

//Reviews - Post Route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//Reviews - Delete Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;