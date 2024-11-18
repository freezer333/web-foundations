# Guessing game Version 8 - Logging in
In this chapter we've learned a lot about handling passwords, which is the most crucial part of *authentication* and *authorization*.  In this section, let's put it all together in a practical example.  Along the way, we'll point you towards additonal areas of development that would normally take place on more complete and larger scale web applications.

Currently, our guessing game allows anyone to play, anyone to complete a game, and anyone to review the game history.  Let's change things up a bit:

1. People can still play the game without authenticating, but their game won't be recorded in the database.
2. People can create an account, by entering a username and password.  The sign up page will ask them to type their password twice to confirm it.  The password will be saved in an account record, salted and hashed.  The signup form will be accessible from all pages, and will be highlighted after the user completes a game while they aren't logged in.
3. If the user is logged in, games are recorded.  Each game is recorded with a *foreign key* to the user table, so we know who played the game.
4. The history page will be modified to display the games in order of number of guesses - the least guesses first - it took to complete the game.  It will also list the username associated with the game.
5. Only logged in users can see the history pages.
6. Users can logout anytime.

We started some of this towards the beginning of this chapter.  We implemented session-based logins - but only with a fixed username/password combination - `guess/who`. As a first step, we need to upgrade the database and the database code.  

## Account table
The account table will hold user information.  This app is pretty limited in terms of what it collects.  We'll just have a `username` field, and a `hash` field.  The `hash` field will contain both the *salt* and the *hash* concatenated - which is common practice. The other change to our database is that our `game` table needs a new column - a foreign key into the `account` table. 

Recall that we created `wf-guess-db` as a wrapper module around our database though.  Since we now have users, we're going to need to upgrade that module.  Our new database schema is incompatable with the schema that didn't have accounts.  Rather than create a code-breaking version change, let's *clone* `wf-guess-db` and name a new version `wf-guess-dba` - the `a` standing for "accounts".

The original `wf-guess-db` is [here](https://github.com/freezer333/web-foundations/tree/main/code/guessing-packages/db), and we'll start by updating the bootstrapping code that creates the tables:
```js
/** Creates the tables */
#bootstrap() {
    const account = `create table if not exists account (id integer primary key, username text unique, hash text)`;
    const game = `create table if not exists game (
                    id integer primary key, 
                    secret integer, 
                    completed integer,
                    time text, 
                    account integer,
                    foreign key(account) references account(id) on delete cascade)`;
    const guess = `create table if not exists guesses (
                    game integer, 
                    guess integer, 
                    time integer, 
                    foreign key(game) references game(id) on delete cascade
                )`;
    this.#db.prepare(account).run();
    this.#db.prepare(game).run();
    this.#db.prepare(guess).run();
}
```
Note, we've instructed the datbase to ensure that `username` is unique - any attempt to create a duplicate account will fail and generate an exception in our code.  This is a good safety mechanism, but we'll need to check for duplication in the application code ourselves too, in order to handle the situation more gracefully.

It's been a while since we've looked at this module, and when looking at the code you'll see the `#sweep_incomplete` function, which is automatically called everytime a new instance of `GuessDatabase` is created.   This actually isn't necessary anymore - we no longer save incomplete guessing games to the database at all (we made that change when we introduced sessions earlier).  Let's go ahead and delete that entirely.

We'll need to expose an `add_account` method to call when a user signs up:

```js
add_account(username, password) {
    const stmt = this.#db.prepare('insert into account (username, hash) values (?, ?)');
    const info = stmt.run(username,???);
    const account = {};
    account.id = info.lastInsertRowid;
    account.username = username;
    return account;
}
```
That code is incomplete though.  Within this function, we need to do our *hashing*.  It's time to bring in `argon2`.

```bash
npm install argon2
```

Before adding `argon2` to the guessing game, let's just play around with it for a moment.  

```js
const argon2 = require('argon2');

const test = async () => {
    const hash = await argon2.hash("hello");
    console.log(hash);
}

test();
```
The output of that code is something *similar* to as follows (the salt is randomized, so if you run it yourself it won't be the same!):

```
$argon2id$v=19$m=65536,t=3,p=4$R107YvZlHmy0Q4/VhmnvuQ$LK//zvfVSON6F5H1j/pxxKI1nCbqFm0ZfpAc/dZC3/0
```
The first part - `$argon2id` is identifying the algorithm - there are three variants of argon - d, i, and id.  The `v=19` is unsurprisingly a version number.  There are several parameters used in the argon algorithm to control the memory and compute costs for calculating a hash.   The higher the cost, the more robust the algorithm is to brute force attacks (since it requires more memory and CPU to calculate each hash).  The default parameters were used - `m=65536,t=3,p=4` are specifying memory, time, and parallelization parameters.  The next parameter - `R107YvZlHmy0Q4/VhmnvuQ` is the random salt that was assigned.  We don't need to create the salt string ourselves - the library does it for us.  It's not hard to do ourselves, but since the library is attempting to force developers to use these algorithms *correctly*, it takes that responsibility itself.  Finally, the hash - `LK//zvfVSON6F5H1j/pxxKI1nCbqFm0ZfpAc/dZC3/0`.  The entire `$` delimited string is what we want to store in the database - the library will be able to use that compare hashes later.

**Pro Tip**&#128161; That install process might not have gone so easily for you.  Pay attention to error messages!  Argon2 actually is implemented in C++.  In order for the module to be properly installed, the Node.js subsystem *might* need to *compile* the Argon2 source code.  This means your machine has to have a compatable C++ build system installed.  If there were problems installing, read the discussion [here](https://www.npmjs.com/package/argon2#prebuilt-binaries), your platform might be out of date.

Let's get back to our `add_account` function.  It needs to be `async`, because the argon2 hashing function is asynchronous.  This is because it's a compute-intensive operation, and technically it's actually done *off the Node.js event loop*.

```js
async add_account(username, password) {
    const hash = await argon2.hash(password);
    const stmt = this.#db.prepare('insert into account (username, hash) values (?, ?)');
    const info = stmt.run(username,hash);
    const account = {};
    account.id = info.lastInsertRowid;
    account.username = username;
    return account;
}
```

It will also be helpful to *look up* accounts, by username.  Let's add a simple `get_account` function that returns an account associated with a username.  Importantly, this function **will not** return the `hash`.  It's only used to check the existence of an account.

```js
async get_account(username) {
    const stmt = this.#db.prepare('select id, username from account where username = ?');
    const account = stmt.get(username);
    // Returns null if there was no account matching that username.
    return account;
}
```

Since our database package is handling hashing, it should also be the part of the application that *compares* hashes.  Let's add one more function to **check** a password entered by a user with what we have on record:

```js
async authenticate(username, password) {
    const stmt = this.#db.prepare('select id, username, hash from account where username = ?');
    const account = stmt.get(username);
    if (!account) return undefined;

    const match = await argon2.verify(account.hash, password);
    if (match) {
        return {
            id: account.id,
            username: account.username
        };
    } else {
        return undefined;
    }
}
```
This function accepts a username and password *entered by a user*.  It looks up the record, and return `undefined` if the user does not exist.  If the user does exist, it will verify the password using `argon2`.  Once again, the argon library proves very easy to work with - it accepts the entered password, hashes it using the same salt it sees in the hash provided, and then compares the hash values.  This is why storing the algorithm, parameters, salt, and hash in the same string is so helpful - the library can discover all it needs from the hash string in order to perform the very same hash on the provided password.

The insert statement to create a game must be updated to include the account associated with the game:

```js
add_game(game) {
    const stmt = this.#db.prepare('insert into game (secret, completed, account) values (?, ?, ?)');
    const info = stmt.run(game.secret, game.complete, game.account);
    game.id = info.lastInsertRowid;
    return game;
}
```

Finally, the historical query functions - where games are taken from the database - need to be updated to grab the username.  This requires SQL join, and for the purposes of this discussion you can just take them as they are.

```js

```


We can publish that package to npm now - as `wf-guess-dba`.

The last change before we move forward is occurs in the `wf-guess-game` package.  We just need to add the `username` attribute to the game class itself, so it can be displayed on pages:

```js
static fromRecord(record) {
    const game = new Game();
    game.id = record.id;
    game.secret = record.secret;
    game.guesses = record.guesses;
    game.complete = record.completed;
    game.time = record.time;
    game.guesses = record.guesses;
    game.username = record.username;
    return game;
}
```
This will bump the version number on this, so we will re-publish to `npm`.

## Unauthenticated Access
Next up, let's work with the actual game play, starting with *preventing* unauthenticated access to the following parts of the application:

- Do not save games to the database if the user is not logged in
- Do not allow user to access `/history` pages (the game listing, or the indiviudal game page with a list of guesses).

Before going forward, we need to update the require statement at the top of `guess.js` to be the following:

```js
const GuessDatabase = require('wf-guess-dba').GuessDatabase;
```
As a first step, let's modify the code that handles *game completion* such that it branches to avoid saving games to the database when there is no logged in users.  While we haven't implemented the login process yet, **let's assume that a logged in account will result in a session variable - `account_id` being set inside the session**.  That bit of code was handled in the *game* route - `routes/game.js`.

```js
router.post('/', async (req, res) => {
    if (req.session.game === undefined) {
        res.status(404).end();
        return;
    }

    const game = Game.fromRecord(req.session.game);
    const response = game.make_guess(req.body.guess);
    game.guesses.push(req.body.guess);

    if (response) {
        res.render('guess', { game, response });
    } else {
        // Branch on account_id - which is our flag for being logged in
        // Here's where we can add the account id to the game object too.
        if (req.session.account_id) {
            game.account = req.session.account_id;
            req.GameDb.record_game(game);
        }
        res.render('complete', { game });
    }
});
```
Next, let's *limit* unauthenticated access.  Earlier in this chapter we say an *application* level middleware that redirected all traffic to routes defined after it when the session was unauthenticated.  This isn't the typical approach however, usually we opt to attach middleware to *specific* routers or individual routes.  In our case, everything in the game play route is fair game for both authenticated and unauthenticated sessions, but the *history* route is off limits until you log in.  Let's go into the history route itself (`routes/history.js`) and add that middleware.

```js
// This is added to the top of the routes/history.js file, before
// the route handlers.
router.use((req, res, next) => {
    if (!req.session.account_id) {
        return res.redirect('/login');
    }
    return next();
});
```

Now, whenever the `/history` or `/history/:gameId` routes are accessed, if the session is not authenticated, the browser will receive a redirect to the login page.

## Logging in
Earlier in this chapter we started authentication by using a built-in hardcoded `guess/who` account.  Now, let's do things more effectively.  We will need a `/login` page, but we also need a `/signup` page to allow people to create new accounts.  Both pages will contain forms - so there's a minimum of *four* routes that will be handling the account process:

1. `GET /login` displays the login form, with a link to create an account
2. `POST /login` receives the login credentials, and either logs the user in (and redirects to `/`), or displays a login failure message
3. `GET /signup` displays a form to create a new account - collecting a username and password (password entered twice)
4. `POST /signup` receives the account creation data, verifies the password was entered correctly (same password entered twice), and creates the account.  This will also log the user in, and redirect them to the `/` page.

All of this belongs in a new *router*, rather than cluttering up our `guess.js` main application code.  Let's create `/routes/account.js`, and get started:

```js
const express = require('express')
const router = express.Router();
const Game = require('wf-guess-game').Game;

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/login', async (req, res) => {
    // Handle login
});

router.post('/signup', async (req, res) => {
    // Handle account creation
});

module.exports = router;
```

This route is mounted to the app at `/`, because `/login` and `/signup` don't have a common root path. 

```js
app.use('/', require('./routes/account'));
app.use('/', require('./routes/game'));
app.use('/history', require('./routes/history'));

app.listen(process.env.PORT || 8080, () => {
    console.log(`Guessing Game app listening on port 8080`)
});
```
### Sign up
We can't really do much with logins until we can create accounts. 

Usernames **must** be unique.  We specified this in the database - which instructs the database to reject any attempt to create a record in the account table that has the same username as some other record.  We don't want that rejection (exception) to actually happen though - instead it would be best to handle it more gracefully.  We can make use of our `get_account` function to check to see if an account exists with the same username, and display an error message.

Let's create a simple signup page, starting with the pug template.  It contains an *optional* error message that our code can use to display any errors that happen when creating the account.1

```jade
extends layout

block content
    h1 Signup! 
    form(action='/signup', method='post')
        p Please create a username, and a strong password.  We'll trust you will create a good password, but we really should check!
        if error 
            p Whoops - #{error}
        div
            label(for='username') Username:
            input(type='text', name='username', placeholder='Username')
        div     
            label(for='password') Password:
            input(type='password', name='password', placeholder='Password')
        div     
            label(for='password-conform') Password Confirmation:
            input(type='password', name='password-conform', placeholder='Confirm Password')
        div     
            input(type='submit', value='Sign up')
```

Now, when we receive the account creation `POST` data, we can check for *two* error conditions - a duplicate username, and a mismatched password confirmation.  If an error occurs, we will simply render the template again - this time with an error field.  Otherwise, we'll create the account and redirect.

```js
router.post('/signup', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    if (!username || !password || !password2) {
        return res.render('signup', { error: 'All fields are required' });
    }

    if (password !== password2) {
        return res.render('signup', { error: 'Passwords do not match' });
    }

    const existing = await req.GameDb.get_account(username);
    if (existing) {
        return res.render('signup', { error: 'Account already exists' });
    }

    const account = await req.GameDb.add_account(username, password);
    req.session.account_id = account.id;
    res.redirect('/');
});
```

### Login 
Finally, let's handle the login process.  The template is largely the same from earlier in this chapter, with the addition of a link to create an account.  We'll also include an optional error message that we can use if the user enters invalid credentials.

```jade
extends layout

block content
    h1 Welcome! 
    if error
        p Whoops - #{error}
    form(action='/login', method='post')
        div
            input(type='text', name='username', placeholder='Username')
        div     
            input(type='password', name='password', placeholder='Password')
        div     
            input(type='submit', value='Login')

    p Don't have an account?  Please <a href='/signup'>signup</a>!
```
When this form submits, we need to check if an associated account matches the username.  If not, we can display an error message.  If an account exists, we then can then check the password.

```js
router.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.render('login', { error: 'All fields are required' });
    }

    const account = await req.GameDb.authenticate(username, password);
    if (!account) {
        return res.render('login', { error: 'Invalid username or password' });
    }
    req.session.account_id = account.id;
    // We can put this in the session too - maybe enhance our template to indicate the user is logged in
    // by displaying their name.  
    req.session.account_username = account.username;
    res.redirect('/');
});
```
Note, we've displayed the same error message regardless of why the login failed - according to best practices.  If this were a more full featured application, we might include a mechanism to reset a password if it was forgotten - likely via email or text message.  We could also implement two factor authentication, and other common security layers.



## Loggin out
It's always a good idea to indicate whether the user is logged in or not, and allow the user to sign out.  This will be available on all pages.

Let's take advantage of a nice feature of the templating system in express and add a middleware that adds the username to the `res.locals` object.  The `res.locals` object is available in *all* templates rendered.  We can then add some logic in `layout.pug` to display a login status at the bottom of *every* page, along with a logout link.

```js
// guess.js - the main app
app.use((req, res, next) => {
    // The locals object is available in all templates.
    res.locals.username = req.session.account_username;
    next();
});

```
By the way, now is a good time to remind you of the importance of calling `next()`.  Failure to do so, in middleware, means your other route handlers won't be called.  When this happens, your page will never render - your browser will just hang, waiting for a response that never comes!  Don't forget to call `next()`!

```jade
doctype html
html 
    head 
        title Guessing Game 
    body 
        block content
        if username 
            p 
                span Logged in as <b>#{username}</b>
                br
                
                a(href='/logout') Logout
        else 
            p: a(href='/login') Login
```
We can add a route for `/logout` that clears the session and redirects back to the game again.

```js
// account.js
app.get('/logout', (req, res) => {
    req.session.account_id = null;
    req.session.account_username = null;
    res.redirect('/');
});
```

## Viewing Users
As a final quick change, let's add the username to the guessing game history page's template, so we can see who played games.  We can also include a sort, by least number of guesses.

```jade
extends layout

block content
    table
        thead
            tr
                th Game ID
                th Num Guesses
                th Started
                th User
        tbody
            each g in games.sort((a, b) => a.guesses.length - b.guesses.length)
                tr
                    td
                        a(href="/history/"+g.id) #{g.id}
                    td #{g.guesses.length}
                    td #{g.time}
                    td #{g.username}
    a(href="/") Play the game!
```
<hr/>

And there we have it - a simple, yet secure login system for the guessing game!  This example can be 
[found here](https://github.com/freezer333/web-foundations/tree/main/code/guessing-game-08-logins).  [TODO - GITHUB CODE]