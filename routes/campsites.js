const express = require('express');
const router = express.Router();
const campsites = require('../controllers/campsites');
const catchAsync = require('../utils/catchAsync');
const Campsite = require('../models/campsite');
const { isLoggedIn, validateCampsite, isOwner } = require('../middleware');
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({ storage });

 
router.get('/', catchAsync(campsites.index));

router.get('/new', isLoggedIn, campsites.newForm);

router.post('/', isLoggedIn, upload.array('image'), validateCampsite, catchAsync(campsites.newCampsite));

router.get('/:id', catchAsync(campsites.showCampsite));

router.get('/:id/edit', isLoggedIn, isOwner, catchAsync(campsites.updateForm));

router.put('/:id', isLoggedIn, isOwner, upload.array('image'), validateCampsite, catchAsync(campsites.updateCampsite));

router.delete('/:id', isLoggedIn, isOwner, catchAsync(campsites.destroyCampsite));

module.exports = router;