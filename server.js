require('./config/config');

//THIRD PARTY MODULES
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
//CUSTOM MODULES FILES
const { mongoose } = require('./db/mongoose');
const notes = require('./routes/notes');
const users = require('./routes/users');
require('./config/passport').passportLocal(passport);

//HANDLEBARS HELPERS
const truncate = (str, length, ending) => {
      if (str.length > length) {
        return str.substring(0, length - ending.length) + ending;
      } else {
        return str;
      }
};

//MIDDLEWARES
app.engine('handlebars', exphbs({
    helpers: {truncate},
    defaultLayout: 'main' 
}));
app.set('view engine', 'handlebars');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
//GLOBAL VARIABLES FOR FLASH MESSAGES
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});
//ROUTES

//GET / - Landing Page
app.get('/', (req, res) => {
    res.render('index');
});

//GET - /about - About Page
app.get('/about', (req, res) => {
    res.render('about');
});



app.use('/users', users);
app.use('/notes', notes);
//LISTEN
app.listen(process.env.PORT, () => {
    console.log('Server AT', process.env.PORT);
});