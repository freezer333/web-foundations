# Guessing game Version 6 - Express
Let's dive right into developing the guessing game once more, but instead of using `wf-framework` to do our parsing and routing, we'll level up to Express.

To follow along, create a new application folder and *copy* the `/views` folder from Guessing Game - Version 5, along with the `.env` file.  We'll be using the **exact same template files**, so we won't spend a lot of time discussing them here.  The `.env` file should have the path to the db file (ie. `DB_FILENAME=guess.db`).

```
-- guessing-game-06-express
    -- views
        -- layout.pug
        -- mixins.pug
        -- guess.pug
        -- complete.pug
        -- history.pug
        -- game_history.put
    -- .env
    -- guess.js (blank).
```

We'll install dotenv, wf-guess-game, and wf-guess-db, but let's hold of installing wf-framework.  We will still use pug (not quite a directly though), so we'll install that too.

```bash
npm install dotenv wf-guess-game wf-guess-db pug
```
That will create a `package.json` file, and add the referneces to our first first four dependencies.

Now we'll install Express. 

```bash
npm npm install express
```

## Creating the Application
Within `guess.js`, we are going to start with some of our familiar setup code.  This includes requiring the game and database code, and loading the `.env` file itself. **We'll also include a `require` statement for Express.**  Next, rather than configuring the framework code associated with `wf-framework`, we'll begin configuring the express object itself.

```js
const Game = require('wf-guess-game').Game;
const GuessDatabase = require('wf-guess-db').GuessDatabase;
const express = require('express');
require('dotenv').config();

const GameDb = new GuessDatabase(process.env.DB_FILENAME);

// This is the core express instance, which 
// runs the route handling of our application
const app = express();

// This enabled a request body parser for form
// data.  It works a lot like our BodyParser
app.use(express.urlencoded({ extended: true }))

// Express will assume your pug templates are
// in the /views directory
app.set('view engine', 'pug');

// Let's create a silly GET handler to start with...
app.get('/', (req, res) => {
    res.status(200).send('Guess!');
});

app.listen(process.env.PORT || 8080, () => {
    console.log(`Guessing Game app listening on port 8080`)
});
```

If you run that code (`node guess.js`) and visit `http://localhost:8080`, you should see a simple web page with the "Guess!" message.

Now let's start creating the game playing routes.  In the last example (before Express), the *start* route just looked like this:

```js
const start = (req, res) => {
    // add_game returns the same game it adds, with an id
    const game = GameDb.add_game(new Game());
    render(res, 'guess', { game });
}
```
We aren't changing a lot.  Really, the only tweak is that instead of using the `render` function we wrote ourselves in the last chapter, we are using express's implementation, which has been attached to the `req` object.  So, adding the route and implementing it will look like this:

```js
const start = (req, res) => {
    const game = GameDb.add_game(new Game());
    res.render('guess', {game});
}

app.get('/', start);

app.listen(process.env.PORT || 8080, () => {
    console.log(`Guessing Game app listening on port 8080`)
});
```

While we're at it - most of the time we define routes as inline (anonymous) functions passed to `app.get` and `app.post`.  Let's adopt that style of code as our *default* from now on, when working with Express routes.

```js
app.get('/', (req, res) => {
    const game = GameDb.add_game(new Game());
    res.render('guess', {game});
});
```

We make the same small tweaks to the *guess* and *complete* routes - simply using `res.render` rather than the obsolete `render` function.  Since Express attaches `req.query` and `req.body` the same way as we did in `wf-frameowrk`, the logic is all pretty much exactly the same. **The one change** however is that express does not allow us to define a *typed schema* to parse, so we need to make sure we parse the secret number and the user's guess to integers explicitely.  This is one nice thing about `wf-framework` that express doesn't do out of the box - but overall express is *far* more feature rich.

```js
app.post('/', async (req, res) => {
    const record = GameDb.get_game(parseInt(req.body.gameId));
    if (!record) {
        res.writeHead(404);
        res.end();
        return;
    }
    // create a game instance from the record found in the db
    const game = Game.fromRecord(record);
    const response = game.make_guess(req.body.guess);

    // add_guess returns a guess record with a game id, guess, and time.
    const guess = GameDb.add_guess(game, req.body.guess);
    game.guesses.push(guess.guess);
    GameDb.update_game(game);

    if (response) {
        res.render('guess', { game, response });
    } else {
        res.render('complete', { game });
    }
});
```
Finally, let's add both the game listings (`/history`) page and the individual game history page.  The game listings page is staightfoward:

```js
app.get('/history', (req, res) => {
    const records = GameDb.get_games();
    const games = records.map(r => Game.fromRecord(r));
    res.render('history', { games: games.filter(f => f.complete) });
});
```

If we load up the history page, and hover over the URLS for the played games, we are reminded that we used *query strings* to identify a particular game to view when navigating from the listing table.  The URL linked to from the game history table is as follows (for game #4)

```
http://localhost:8080/history?gameId=4
```
While this is still perfectly fine, Express's *route parameters* are the preferred approach.  Semantically, having unique root URLs for each game (i.e. `http://localhost:8080/history/4` and `http://localhost:8080/history/5`) is considered a better design, as opposed to a single url `http://localhost:8080/history` that accepts a parameters `gameId` to render something completely different.  Since *games* are things, and URLs correspond to things (nouns), let's use this strategy.

Inside the `history.pug` let's change how the URL for each game is created.  We need to change the first column in the table from using a query string:

```jade
tbody
    each g in games
        tr
            td
                a(href="/history?gameId="+g.id) #{g.id}
```
To using a plain old URL path:
```jade
tbody
    each g in games
        tr
            td
                a(href="/history/"+g.id) #{g.id}
```
Now, inside our application, we will use Express's route notation to define a route handler for the url of `/history/:gameId` where gameId is a value.

```js
app.get('/history/:gameId', (req, res) => {
    // NOTICE we've change the parameter to the get_game
    // function from using the query parameter to the route
    // parameter value.  
    const record = GameDb.get_game(parseInt(req.params.gameId));
    const game = Game.fromRecord(record);

    // Use Express style code to send the 404.
    if (!game) {
        res.status(404).end();
        return;
    }

    res.render('game_history', { game });
})
```
If we run that program now, the guessing game is identical to the previous example. We have about a 10% code reduction, but much more importantly, we are now using **a best-practice** web framework, rather than our own homegrown attempt.  We have *everything* available to us that Express offers.   This includes easy ways of breaking our application down across separater files.  While this is **overkill** for the guessing game, it's the preferred design pattern for larger applications - so let's give it a shot.

## Separating Routes into Files
Let's defined *two* routers modules. The first will include the game play urls - `/` and `/guess`.  The second will contain this historical pages.  We'll start with gameplay - by creating `game.js` inside a new `routes` directory.  Inside this file, we will define a `router` and *export* it.  This router will be *mounted* at `/` by the core app.

```js
// game.js
const express = require('express')
const router = express.Router();


const Game = require('wf-guess-game').Game;
const GuessDatabase = require('wf-guess-db').GuessDatabase;

// PROBLEM:  In a second file, do we open a new connection to the datbase?

router.get('/', async (req, res) => {
    const game = GameDb.add_game(new Game());
    res.render('guess', { game });
});

router.post('/', async (req, res) => {
    const record = GameDb.get_game(parseInt(req.body.gameId));
    if (!record) {
        res.status(404).end()
        return;
    }
    // create a game instance from the record found in the db
    const game = Game.fromRecord(record);
    const response = game.make_guess(req.body.guess);

    // add_guess returns a guess record with a game id, guess, and time.
    const guess = GameDb.add_guess(game, req.body.guess);
    game.guesses.push(guess.guess);
    GameDb.update_game(game);

    if (response) {
        res.render('guess', { game, response });
    } else {
        res.render('complete', { game });
    }
});

module.exports = router;
```
In the main file, `guess.js` we are removing the `app.get('/', ...)` and `app.post('/guess', ...)` handlers, and replacing with `app.use` to attache the router exported by the new `game.js` file.
```js
// guess.js

// We remove the app.get('/', ...) and app.post('/guess', ... handlers, 
// since they are being mounted to the app as Routers)
app.use('/', require('./routes/game'));
```
**We have a major problem however**.  Look at the top of the code listing of `game.js`.  These routes use the database, they need the `GameDb` variable.  That variable is created inside `guess.js`

```js
const GameDb = new GuessDatabase(process.env.DB_FILENAME);
```
We have a decision - do we create the *same* variable in `game.js` too?  This is a bad idea - we'd have two referneces to the underlying (database) file open.  Recall, `GuessDatabase` is the SQLite wrapper code - creating two instances of that class would create two *competing* connections to the same database file.  That will end up creating problems for our application - where only one instance of `GuessDatabase` will be able to maniuplate the data, while the others are *readonly*. **We don't want that**.    Instead, we can utilize *middleware* to **pass** the instance of `GameDatabase` to the route, when it is called - **by attaching it to the `req` object!

Within the main application file, let's add a middleware function **before** we add the routes.  This function will simply attach the `GameDb` variable to the `req` object and call `next` - which allows Express to continue all the normal operation of the request handling, including calling the associated route handler.  

```js
app.use((req, res, next) => {
    req.GameDb = GameDb;
    next();
});
// Now the GameDb is available on the routes
app.use('/', require('./routes/game'));
```
Inside the `game.js` routes, now we need to instead use `req.GameDB` instead of the standalone variable.  We can also remove the `require` at the top, since we do not need to create our own database variables.


```js
//game.js
const express = require('express')
const router = express.Router();
const Game = require('wf-guess-game').Game;

router.get('/', async (req, res) => {
    const game = req.GameDb.add_game(new Game());
    res.render('guess', { game });
});

router.post('/', async (req, res) => {
    const record = req.GameDb.get_game(parseInt(req.body.gameId));
    if (!record) {
        res.status(404).end();
        return;
    }
    // create a game instance from the record found in the db
    const game = Game.fromRecord(record);
    const response = game.make_guess(req.body.guess);

    // add_guess returns a guess record with a game id, guess, and time.
    const guess = req.GameDb.add_guess(game, req.body.guess);
    game.guesses.push(guess.guess);
    req.GameDb.update_game(game);

    if (response) {
        res.render('guess', { game, response });
    } else {
        res.render('complete', { game });
    }
});

module.exports = router;
```

Following the same pattern, let's move the two history routes into their own file too - `routes/history.js`.  

```js
// history.js
const express = require('express')
const router = express.Router();
const Game = require('wf-guess-game').Game;

router.get('/', (req, res) => {
    const records = req.GameDb.get_games();
    const games = records.map(r => Game.fromRecord(r));
    res.render('history', { games: games.filter(f => f.complete) });
});

router.get('/:gameId', (req, res) => {
    const record = req.GameDb.get_game(parseInt(req.params.gameId));
    const game = Game.fromRecord(record);

    // Use Express style code to send the 404.
    if (!game) {
        res.status(404).end();
        return;
    }

    res.render('game_history', { game });
});

module.exports = router;
```
**There is an important change** to the `router.get` calls.  Notice the `/history` prefix to the URL that is being matched has been *dropped*. This is because we will *mount* this router at the `/history` path itself, within the main applicaiton. The `/history` prefix is *implied* on the `router` defined in `history.js` because of this.  This decoupling of routes and where they are mounted within the application is a good design principle - as it allows you to *move* where routes are mounted without changing code within the routes.  It also just simply cuts down on a lot of repetition!

```js
// guess.js
app.use('/', require('./routes/game'));
app.use('/history', require('./routes/history'));

```
Without repeating the code listings of the *route* files `game.js` and `history.js`, let's just look at the *entire* `guess.js` application file in it's final state name:

```js
const GuessDatabase = require('wf-guess-db').GuessDatabase;
const express = require('express');
require('dotenv').config();

const GameDb = new GuessDatabase(process.env.DB_FILENAME);

const app = express();
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

This is a big improvement.  The code is short.  Details about routes are moved elsewhere.  This might be our *shortest* main file, and we've at the same time brought the entire Express framework into the picture - opening up lots of new functionality for use to explore!

This example can be [found here](https://github.com/freezer333/web-foundations/tree/main/code/guessing-game-06-express).  [TODO - GITHUB CODE]