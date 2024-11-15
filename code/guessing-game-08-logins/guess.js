const GuessDatabase = require('wf-guess-db').GuessDatabase;
const express = require('express');
require('dotenv').config();

const GameDb = new GuessDatabase(process.env.DB_FILENAME);

// This is the core express instance, which 
// runs the route handling of our application
const app = express();

const session = require('express-session');
app.use(session({
    secret: 'guessing game'
}));

// This enabled a request body parser for form
// data.  It works a lot like our body parsing code
// for wf-framework
app.use(express.urlencoded({ extended: true }))

// Express will assume your pug templates are
// in the /views directory
app.set('view engine', 'pug');

app.use((req, res, next) => {
    req.GameDb = GameDb;
    next();
});

app.get('/login', (req, res) => {
    res.render('login');
});
app.post('/login', (req, res) => {
    if (req.body.username === 'guess' && req.body.password === 'who') {
        req.session.authenticated = true;
    }
    // Logged in or not, redirect to front page.  If the login
    // failed, we just end up redirecting right back to GET /login!
    return res.redirect('/');
});

// Middleware to redirect to /login if not already logged in
app.use((req, res, next) => {
    if (!req.session.authenticated) {
        return res.redirect('/login');
    }
    return next();
});

// These are the routes that require authentication, 
// added AFTER the middleware that checks for this has
// been attached.
app.use('/', require('./routes/game'));
app.use('/history', require('./routes/history'));

app.listen(process.env.PORT || 8080, () => {
    console.log(`Guessing Game app listening on port 8080`)
});