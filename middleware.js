const { campsiteSchema, reviewSchema }  = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campsite = require ('./models/campsite');
const Review = require ('./models/review');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    };
    next();
}

module.exports.validateCampsite = (req, res, next) => {
    const { error } = campsiteSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//middleware for authorization for a campsite
module.exports.isOwner = async (req, res, next) => {
    const {id} = req.params;
    const campsite = await Campsite.findById(id);
    if(!campsite.owner.equals(req.user._id)){
        req.flash('error', 'Sorry, you are not allowed to access this!') 
        return res.redirect(`/campsites/${id}`)
   }
   next();
}

//middleware for authorization for a review
module.exports.isReviewOwner = async (req, res, next) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.owner.equals(req.user._id)){
        req.flash('error', 'Sorry, you are not allowed to access this!') 
        return res.redirect(`/campsites/${id}`)
   }
   next();
}

module.exports.validateReview = (res, req, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(element => element.message).join(',')
        throw new ExpressError(msg, 400)
    } else{
        next();
    }
}
