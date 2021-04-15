const Campsite = require('../models/campsite');
const Review = require ('../models/review');

//create a review
module.exports.newReview = async (req, res) => {
    const campsite = await Campsite.findById(req.params.id);
    const review = new Review(req.body.review);
    review.owner = req.user._id;
    campsite.reviews.push(review);
    await review.save();
    await campsite.save();
    req.flash('success', 'Your review was created!');
    res.redirect(`/campsites/${campsite._id}`);
}

//delete a review
module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campsite.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'The review was deleted!');
    res.redirect(`/campsites/${id}`);
}