const express = require('express');
const router = express.Router({mergeParams: true});
const Campsite = require('../models/campsite');
const Review = require ('../models/review');
const { validateReview, isLoggedIn, isReviewOwner} = require('../middleware');
const reviews = require('../controllers/reviews')

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.newReview))

router.delete('/:reviewId', isLoggedIn, isReviewOwner, catchAsync(reviews.destroyReview))

module.exports = router;