const User = require('../models/user');

//render the registration form/page
module.exports.registerForm = (req, res) => {
    res.render('users/register');
}

//register a new user
module.exports.register = async(req, res, next) => {
    try{
        const{email, username, password} = req.body;
        const user = new User({ email, username})
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err) return next (err);
            req.flash('success', 'Welcome to Camp4You!');
            res.redirect('/campsites');
        })

    } catch(e){
        req.flash('error', e.message);
        res.redirect('register')
    }
}

//render the log in form/page
module.exports.loginForm =  (req, res) => {
    res.render('users/login');
}

//log in
module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUser = req.session.returnTo || '/campsites';
    res.redirect(redirectUser);
}

//log out
module.exports.logout =  (req, res) => {
    req.logout();
    req.flash('success', "Logged Out Successfully");
    res.redirect('/campsites');
}