const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator'); 
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

/* Connect to database */
mongoose.connect(config.database, config.options);
let db = mongoose.connection;

/* check for connection */
db.once('open', () => {
    console.log('Hello Planetfunk!!!');
});

/* Check for db errors */
db.on('error', () => {
    console.log('error');
});

/* Init app */
const app = express();

/* Bring in models */
let Article = require('./models/article');

/* Load view engine */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

/* Body parser middleware // Parse application/x-www-form-urlencoded*/
app.use(bodyParser.urlencoded({ 
    extended: false 
}))
/* Parse application/json */
app.use(bodyParser.json())

/* Set public folder */
app.use(express.static(path.join(__dirname, 'public')));

/* Express session middleware */
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

/* Express messages middleware */
app.use(require('connect-flash')());
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

/* Express validator middleware */
app.use(expressValidator({
    errorFormater: (param, msg, value) => {
        var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param   : formParam,
            msg     : msg,
            value   : value
        };
    }
}));

/* Passport config */
require('./config/passport')(passport);
/* Passport middleware */
app.use(passport.initialize());
app.use(passport.session());

/*  */
app.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

/* Home route */
app.get('/', (req, res) => {
    Article.find({}, (err, articles) => {
        if(err) {
            console.log('err');
        } else {
            res.render('index', {
                title: 'Articles',
                articles: articles
            });
        }       
    });    
});

/* Route files */
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

/* Start server */
app.listen(3000, () => {
    console.log('Server started on port 3000...');
});