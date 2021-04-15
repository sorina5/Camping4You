const Campsite = require('../models/campsite');
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxTk = process.env.Mapbox_token;
const geocoder = mbxGeocoding ({ accessToken: mapboxTk});


//index page, find all campsites and render campsites/index
module.exports.index = async (req, res) => {
    const campsites = await Campsite.find({});
    res.render('campsites/index', { campsites })
}

//render a new form for creating a campsite
module.exports.newForm =  (req, res) => {
    res.render('campsites/new');
}

//creating a new campsite
module.exports.newCampsite = async (req, res, next) => {
    const position  = await geocoder.forwardGeocode({
        query: req.body.campsite.location,
        limit: 1
    }).send()
    const campsite = new Campsite(req.body.campsite);
    campsite.geometry = position.body.features[0].geometry;
    campsite.images = req.files.map(f => ({ url: f.path, filename: f.filename}));
    campsite.owner = req.user._id;
    await campsite.save();
    req.flash('success', 'The campsite was successfully created!');
    res.redirect(`/campsites/${campsite._id}`)
}

//show page for a campsite
module.exports.showCampsite = async (req, res) => {
    const campsite = await Campsite.findById(req.params.id).populate({path:'reviews', populate: {path:'owner'}}).populate('owner');
    if(!campsite){
        req.flash('error', 'Campsite not found');
        return res.redirect('/campsites');
    }
    res.render('campsites/show', { campsite });
}

//render edit form for editing a campsite
module.exports.updateForm = async (req, res) => {
    const { id } = req.params;
    const campsite = await Campsite.findById(id)
    if(!campsite){
        req.flash('error', 'Campsite not found');
        return res.redirect('/campsites');
    }
    res.render('campsites/edit', { campsite });
}

//update campsite
module.exports.updateCampsite = async (req, res) => {
    const { id } = req.params;
    const campsite = await Campsite.findByIdAndUpdate(id, { ...req.body.campsite });
    const images = req.files.map(f => ({ url: f.path, filename: f.filename}));
    campsite.images.push(...images);
    await campsite.save()
    if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campsite.updateOne({ $pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }
    req.flash('success', 'The campsite was successfully updated!')
    res.redirect(`/campsites/${campsite._id}`)
}

//remove campsite
module.exports.destroyCampsite = async (req, res) => {
    const { id } = req.params;
    await Campsite.findByIdAndDelete(id);
    req.flash('success', 'The campsite was deleted!');
    res.redirect('/campsites');
}
