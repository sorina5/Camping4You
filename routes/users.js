const express = require ('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const auth = require('../controllers/auth')
 

router.get('/register', auth.registerForm);

router.post('/register',catchAsync(auth.register));

router.get('/login',auth.loginForm);

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), auth.login);

router.get('/logout', auth.logout)

module.exports = router;

