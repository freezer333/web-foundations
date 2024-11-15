# Authentication - Revisited
At the beginning of this chapter, we saw HTTP Basic Authentication.  We observed the following shortcomings:
1. **The "encryption"**:  The *encryption* involved with HTTP Basic Authentication is not **in any way** effective.  
2.  **The UX**: The dialog box the browser displays to the user is ugly, limited.

Problem #1 is rendered obsolete by HTTPs/TLS.  Theoretically, we could use HTTP Basic Authentication and be 100% secure.  We'd have very little to do - the browser handles the user interface, and also handles sending the authentication data on **every HTTP request** once the user enters the credentials once.  The user won't be asked to reenter credentials for some (reasonably long) time.  This allows authentication to be *stateless*, from the perspective of the web server.  

There are situations where HTTP Authentication (both Basic and others such as [Digest](https://en.wikipedia.org/wiki/Digest_access_authentication)) are very useful and practical, *as long as it's used with HTTPS*.  The main area where it is used today is in authenticating and securing *APIs* - where web requests are being executed by applciations, without live users.  We'll discuss APIs later in this book - they are incredibly powerful, common, and critical to the modern web.

When live users are driving the requests, HTTP Authentication loses some of it's appeal.  For one, we haven't solved problem #2 - the User Experience (UX).  Secondly, one of the biggest benefit of HTTP Authentication - *statelessness* isn't as big of a deal when live users are involved because, usually, we already have *other* stateful aspects of the application.  In short, we probably *already have sessions*, in which case it's not hard to add login status to the state we are already tracking.

## Authentication - In Practice
In practice, it's rare to use HTTP Authentication.  The overwelming majority of web applications instead do the following:

1.  Use HTTP/TLS - under no circumstances should you ever build a web application that asks the user for a password, and doesn't use HTTPs.  Even if you assume the user will use silly passwords, because your website is silly - don't do it.  Inevitably, one of your users will use the same username and password they use for their bank account.  They will be unknowningly sending that data unencrypted at their local coffee shop.  **It's not your fault, but it's your responsibility - you know better.**
2.  Use sessions - meaning, a session is always created (using cookies) and maintained, whether the user has "logged in" or not.
3.  If a request arrives that requires authentication, and the session indicates the user *has not logged in*, the web server issues a `302` redirect to a `/login` page.  This can be *any* page - `/account`, `/signin`, whatever - the point is that it's a special page with a `form`, and text boxes for username and password.
4.  The `form` can have all the bells and whistle we want - it's just an HTML form.  This is in contrast to the browser-supplied *dialog* which we don't have control over.  The user will fill the form out, click a button, and the data will be sent (likely via POST) to the web server.  It's sent over HTTPs, so all is well.
5.  The web server will check the user credentials, and if successfull, record the login status in the session.  This might be by setting a boolean value, or adding a user record, or something else.  It's totally up to the application.

## Authentication - Example
Let's examine how we could do this in our Guessing Game application.  Again, still - we will only have one login - username is `guess` and password is `who`.  In the next section, we'll expand things to have multiple accounts.  We will of course remove the password from the source code as well.  For now, we are still focusing on the mechanics of performing authentication with the browser.

First off, we will revise the middleware.  Instead of checking for the `Authorization` header, we will now check for the session variable - `authenticated`.  We have a problem though.  In order for the user to authenticate, we need a page of our application that accepts their username and password.  Earlier, we didn't need this because the browser handled it for us.  This means that some parts of our application will require authentication, and other parts will not (at the very least, the login page can't require authentication!).

This is where Express shines, it's easy to attach logic to some areas of the application and not others.  However, most web frameworks support similar strategies.  While the organization of our program is dictated by our choice of using Express, the *concept* remains across any web server environment.  In express, we will add new routes *before* adding the routers for our game play and historical data.  These will serve (and receive) the login data.  Critically, these routes will not be subject to our middleware.  This is because Express evaluates and executes routes and middleware *in order*, so once our login routes execute (and send responses), all further middleware (such as the login check) are skipped.

```js
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
```
The login page can be pretty straightforward:

```jade
extends layout

block content
    h1 Welcome! 
    form(action='/login', method='post')
        div
            input(type='text', name='username', placeholder='Username')
        div     
            input(type='password', name='password', placeholder='Password')
        div     
            input(type='submit', value='Login')
```
This is an incredibly simplistic login workflow.  There are no messages provided to the user if they mis-type their login.  There is no way to create an account, reset a password, etc.  We can't even log out! As we progress through this chapter, we'll see more of this - be patient!

<hr/>
The next limitation we need to address is how to have multiple user accounts.  This means we need to keep track of users, on the server.  That means we need to keep track of passwords for individual users.  Perhaps nothing in this book is more important than understanding how to do this responsibly!