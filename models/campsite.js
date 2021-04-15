const mongoose = require('mongoose');
const Review = require('./review');

const ImageSchema = new mongoose.Schema ({
        url: String,
        filename: String
})

ImageSchema.virtual('resize').get(function(){
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true} };

const CampsiteSchema = new mongoose.Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String, 
            enum: ['Point'], 
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CampsiteSchema.virtual('properties.link').get(function(){
    return `<a href="/campsites/${this._id}">${this.title}</a>`
});

CampsiteSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campsite', CampsiteSchema);
