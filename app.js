if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash'); 
const passport = require('passport'); 
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const campsiteRoutes = require('./routes/campsites');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet'); 
const MongoStore = require("connect-mongo")(session);

// const dbAtlas = process.env.db_cloud;

const dbUrl = process.env.db_cloud || 'mongodb://localhost:27017/camps';

//connecting to the database
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const app = express();

//configuration for app
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

app.use(helmet());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];

const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dvb4i1rwn/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const store = new MongoStore({
    url: dbUrl,
    secret: 'secret' || process.env.SECRET,
    touchAfter: 24 * 60 * 60 //update every 24h
})

//sessions
const sessionConfig = {
    store,
    name: 'webapp',
    secret: 'secret' || process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure:true;
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //the cookie will expire in one week, not to be able to stay sign in forever.
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
} 

app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

//passport uses LocalStrategy and authenticate method will be in the user model
passport.use(new LocalStrategy(User.authenticate())); 

//telling passport how to serialize a user (how do we store data (user) in the session)
passport.serializeUser(User.serializeUser());

//telling passport how do you get the data (user) out of the session
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.loggedInUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes)
app.use('/campsites', campsiteRoutes)
app.use('/campsites/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home')
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Something went wrong!'
    res.status(statusCode).render('error', { err })
}) 

app.listen(3000, () => {
    console.log("Listen on port 3000")
})