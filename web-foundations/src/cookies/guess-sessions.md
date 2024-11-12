# Guessing game Version 7 - Session until complete
Let's put what we've learned in this chapter to use with the Guessing Game by making the following change:

1.  Associate the current game, and it's guesses with a *session* rather than storing in the database.  Only store in the database *after* the game was completed.  
2.  Remove all code (hidden input, and cookie) tracking the current game ID - since now it's in the session!

Change #1 is actually really important.  Recall, we mentioned that *creating a database record* every time the guessing game starting page is loaded leaves us vulnerable.  A bot could make HTTP GET requests to our Guessing Game page hundreds of times a second, and each time a new database record would be created!  In a matter of hours, our disk space could be exhausted, or cloud computing bill could hit six figures.  While certainly not foolproof, changing the application such that data is only put into a database *after the game is complete* makes it a lot safer.  A bot would need to actually play the game (successfully) in order to generate data.  It's very likely we all could write such a bot, but attackers are after the low hanging fruit usually, and this makes the guessing game *slightly less low hanging!*.

Change #2 becomes possible because of Change #1!  There is now a session being tracked, and the session has the current game.  No need for anything else!

## Updated View Code
The only change on the view code was already discussed - the guessing game secret is no longer tracked with a hidden input field.   Other than that, session are having absolutely no effect on our view code at all!  The completion page, history pages - they are all identical as the previous version.

```jade
extends layout
include mixins

block content
    if response === undefined 
        p I'm thinking of a number from 1-10!
    else 
        p Sorry, your guess was #{response}, try again! 
        
    form(action="/", method="POST")
        label(for="guess") Enter your guess: 
        input(name="guess", placeholder="1-10", type="number", min="1", max="10")
        button(type="submit") Submit
    
    +guess_list(game.guesses.reverse(), game.secret)   

    div
        a(href="/history") Game History
```

## Updating the server code
Our first change happens while we are creating the express app itself.  We need to enable sessions.  **Note**, `express-session` absolutely uses cookies to track the session ID, however we don't need to work with cookies directly.  The session middleware handles it all.  If we wanted to use cookies for some other reason, we certainly still could - but it's not necessary for sessions given we are using `express-session`.  If you inspect the code, and add some printouts, you'll actually see the session id being used.

```js
// guess.js
require('dotenv').config();
const GuessDatabase = require('wf-guess-db').GuessDatabase;
const GameDb = new GuessDatabase(process.env.DB_FILENAME);
const express = require('express');

const app = express();

// NEW:  Session middleware package (install with NPM)
const session = require('express-session');
app.use(session({
    secret: 'guessing game'
}));

app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'pug');
app.use((req, res, next) => {
    req.GameDb = GameDb;
    next();
});
app.use('/', require('./routes/game'));
app.use('/history', require('./routes/history'));


app.listen(process.env.PORT || 8080, () => {
    console.log(`Guessing Game app listening on port 8080`)
});
```

Next, we need to update how are routes process requests.  First, the *starting* route, where the secret number is created, needs to set the appropriate cookie, and also store the game object in the *session* rather than adding it to the database.  The database won't be used until the game is completed now.

```js
router.get('/', async (req, res) => {
    const game = new Game();
    req.session.game = game;
    res.render('guess', { game });
});
```

When guesses are being made, we similarly do not access the database (at least not right away).  There are a bunch of changes here, make sure you compare what's happening now, with what was happening before.  Neither approach is much harder than the other - but as discussed this one is a lot safer.

```js
router.post('/', async (req, res) => {
    if (req.session.game === undefined) {
        res.status(404).end();
        return;
    }

    // We still use the fromRecord function.  Classes are not persisted
    // as class, rather than serialized as objects.  This function transforms
    // the object stored in session back into a class instance of Game
    const game = Game.fromRecord(req.session.game);
    const response = game.make_guess(req.body.guess);
    // add_guess returns a guess record with a game id, guess, and time.
    game.guesses.push(req.body.guess);

    if (response) {
        res.render('guess', { game, response });
    } else {
        // NOW we need to store the data into the database!
        // Use the add_game function, which assigns a game id
        const completed = req.GameDb.add_game(game);
        game.time = new Date();
        game.complete = 1;
        // We need to also call update_game, since it sets the completed and time properties
        // on the database record.  With our new design, we may actually prefer a slightly different
        // interface for the database - one that does this all in one function.
        req.GameDb.update_game(completed);
        for (const guess of game.guesses) {
            req.GameDb.add_guess(completed, guess);
        }

        res.render('complete', { game });
    }
});
```
That's it!  History pages all work the same, since they were pulling things from the database anyway. 

## Updating the Guessing Game DB Package
As the comments mentioned above, it's actually a bit more helpful to edit the `wf-guess-db` package to include a better function for saving a fully played game.  Right now, we have sort of an awkward interface, where we call `add_game`, and then `update_game`, and then have a bunch of calls to `add_guess`.  One function - `record_game` would be much nicer!

The update the package (recall, it's on npm), we can go back into the source code and update the version number (1.1).  We'll just add a convenient function to the GuessDatabase class:

```js
record_game(game) {
    const completed = this.add_game(game);
    game.time = new Date();
    game.complete = 1;
    this.update_game(completed);
    for (const guess of game.guesses) {
        this.add_guess(completed, guess);
    }
}
```

Nothing fancy, it's basically just the code from before, pushed down into the database package now.

Now, we can update the `package.json` file inside the guessing game example to use version 1.1, and do an `npm install`.  Be sure to delete `package-lock.json` first.

```json
{
  "dependencies": {
    "cookie-parser": "^1.4.7",
    "dotenv": "^16.4.5",
    "express": "^4.21.1",
    "express-session": "^1.18.1",
    "pug": "^3.0.3",
    "wf-guess-db": "^1.1",
    "wf-guess-game": "^1.0.0"
  }
}

```

```bash
rm package-lock.json
npm install
```

Now we can change the code in our guessing game to use the new function, to make things look a little more straightforward.

```js


```