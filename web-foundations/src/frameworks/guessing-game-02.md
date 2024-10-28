# Guessing Game - Version 2
Without further delay, let's revisit the **Guessing Game** from previous chapters.  As mentioned, we will *continue* to keep coming back to this example each time we "level up" in how we are implementing code.  This allows you to see how things change - and also how some thing continue to remain the same.



**You are encouraged to review the Guessing Game Version 1 code, in conjunction with the code below**.  The *difference* is really what is important!




```js

// Contents of guess.js - with framework.js in the same directory
const Framework = require('./framework');
const http = require('http');

// The following three functions are prime candidates for a framework too, 
// and we will be moving them into something soon!
const heading = () => {
    const html = `
        <!doctype html><html><head><title>Guess</title></head>
        <body>`;
    return html;
}

const footing = () => {
    return `</body></html>`;
}

const send_page = (res, body) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(heading() + body + footing());
    res.end();
}

const make_guess_page = (secret, result) => {
    const message = result === undefined ?
        `<p>I'm thinking of a number from 1-10!</p>` :
        `<p>Sorry your guess was ${result}, try again!</p>`;
    return `
        <form action="/" method="POST">
            ${message}
            <label for="guess">Enter your guess:</label>
            <input name="guess" placeholder="1-10" type="number" min="1" max="10"/>
            <input name="secret" type="hidden" value="${secret}"/>
            <button type="submit">Submit</button>
        </form>
        <a href="/history">Game History</a>
    `;
}

const start = (req, res) => {
    const secret = Math.floor((Math.random() * 10 - 0.1)) + 1;
    send_page(res, make_guess_page(secret));
}

const guess = async (req, res) => {
    if (req.body.guess < req.body.secret) {
        send_page(res, make_guess_page(req.body.secret, 'too low'));
    } else if (req.body.guess > req.body.secret) {
        send_page(res, make_guess_page(req.body.secret, 'too high'));
    } else {
        send_page(res, `<h1> Great job!</h1> <a href="/">Play again</a>`);
    }
}

const schema =[
    { key: 'guess', type: 'int' },
    { key: 'secret', type: 'int' }
];

const router = new Framework.Router();
router.get('/', start);
router.post('/', guess, true, schema);

http.createServer((req, res) => { router.on_request(req, res) }).listen(8080);
```

## Game History - and no cheating!
In order to make things a little more intersting, let's add a game *history* page.  Each time a game is played, we will create a new game *object* and store it in memory.  The history is *global*, and will contain a record of **every** game played.  The history object also allows us to start preventing people from *cheating* by viewing the source code.  Let's see how!

Recall, in the example above, if you do a "View Source" in your web browser, you'll see the "secret" number - it's in the HTML of the form field.  Now let's imagine that each game gets it's own object in a history list.  We can assign each game object an identifier (maybe an integer).  The game object can *contain* the secret number, the identifier, and even additional information such as *the number of guesses attempted* and whether the came is complete or now.  We could, in fact, make a `Game` class:

```js
class Game {
    #secret;
    constructor (id) {
        this.id = id;

        // Create the secret number
        this.#secret = Math.floor(Math.random() * 10) + 1;
        this.guesses = [];
        this.complete = false;
    }

    guess_response (user_guess) {
        if (user_guess > this.#secret) {
            return "too high";
        } else if (user_guess < this.#secret) {
            return "too low";
        } else {
            return undefined;
        }
    }

    make_guess (user_guess) {
        this.guesses.push(user_guess);
        if (user_guess === this.#secret) {
            this.complete = true;
            this.time = new Date();
        }
        return this.guess_response(user_guess);
    }
}
```

With this class, we can start to implement the entire workflow a little differently.  When we create a *new* game, as long as the identifier is unique to the individual game, we no longer need to send the *secret* to the web server, but rather, we can sent the game's identifier.  If the identifer is simply a numeric ID, with no relationship to the secret, then allowing a web browser user to view source, and see the identifier, **doesn't tell the user what the secret is**!

This is a core concept, and we will be expanding on it later.   We are changing the application to pass a *non-useful* identifer to the client (web browser), and that identifier maps **server side** to useful information.  This prevents the user from seeing the userful data, no matter what - because **it never gets rendered to the HTML**.

Let's look at the adjustments, and then we'll add the history pages.

```js
// Global repository of games, held in memory.
const games = [];

const make_guess_page = (game, result) => {
    // Important, we are writing gameId into the form as hidden field, 
    // not the secret number!

    const message = result === undefined ?
        `<p>I'm thinking of a number from 1-10!</p>` :
        `<p>Sorry your guess was ${result}, try again!</p>`;
    return `
        <form action="/" method="POST">
            ${message}
            <label for="guess">Enter your guess:</label>
            <input name="guess" placeholder="1-10" type="number" min="1" max="10"/>
            <input name="gameId" type="hidden" value="${game.id}"/>
            <button type="submit">Submit</button>
        </form>
        <a href="/history">Game History</a>
    `;
}

const start = (req, res) => {
    // Create a game, with the identifer set to the current count of games, which 
    // will always be increasing.
    const game = new Game(games.length);
    games.push(game);
    send_page(res, make_guess_page(game));
}

const guess = async (req, res) => {
    const game = games.find((g) => g.id === req.body.gameId);
    if (!game) {
        res.writeHead(404);
        res.end();
        return;
    }
    const response = game.make_guess(req.body.guess);
    if (response) {
        send_page(res, make_guess_page(game, response));
    } else {
        send_page(res, `<h1> Great job!</h1> <a href="/">Play again</a>`);
    }
}

// Secret isn't in the form anymore, instead, gameId
const schema =[
    { key: 'guess', type: 'int' },
    { key: 'gameId', type: 'int' }
];

const router = new Framework.Router();
router.get('/', start);
router.post('/', guess, true, schema);

http.createServer((req, res) => { router.on_request(req, res) }).listen(8080);

```

This is a vastly improved application.  Users can no longer cheat!  We are storing guessing games in memory, which isn't ideal - but we will soon learn to fix this as well.

Now let's add a history page, which lists all the games played. It will **not** list incomplete games however - where the user either stopped playing, or they haven't finished yet.


```js

// ... all the other functions from before...

const history = (req, res) => {
    const html = heading() +
        `
        <table>
            <thead>
                <tr>
                    <th>Game ID</th>
                    <th>Num Guesses</th>
                    <th>Completed</th>
                </tr>
            </thead>
            <tbody>
                ${games.filter(g => g.complete).map(g => `
                    <tr>
                        <td><a href="/history?gameId=${g.id}">${g.id}</a></td>
                        <td>${g.guesses.length}</td>
                        <td>${g.time}</td>
                    </tr>
                `).join('\n')}
            </tbody>
        </table>
        <a href="/">Play the game!</a>
        `
        + footing();
    send_page(res, html);
}

const router = new Framework.Router();
router.get('/', start);
router.post('/', guess, true, schema);
router.get('/history', history);

http.createServer((req, res) => { router.on_request(req, res) }).listen(8080);

```

You can start to see that adding each new page, when armed with our framework, just becomes an exercise of creating HTML in response to data.

Notice the table we've output - the first column **has a link**.  The link has a query string, `gameId`, the purpose of which is to allow a user to view the **details** of a game - such as which specific guesses were made.  This page is at `/history?gameId=X`, where `X` is the game ID.

We can easily add this page, taking advantage of the fact that our framework can match URLs with query strings differently than urls without.

```js

const game_history = (req, res) => {
    const game = games.find((g) => g.id === req.query.gameId);
    if (!game) {
        res.writeHead(404);
        res.end();
        return;
    }
    const html = heading() +
        `
        <table>
            <thead>
                <tr>
                    <th>Value</th>
                    <th>Time</th>
                </tr>
            </thead>
            <tbody>
                ${game.guesses.map(g => `
                    <tr>
                        <td>${g}</td>
                        <td>${game.guess_response(g) ? game.guess_response(g) : 'success'}</td>
                    </tr>
                `).join('\n')}
            </tbody>
        </table>
        <a href="/history">Game History</a>
        `
        + footing();
    send_page(res, html);
}

const router = new Framework.Router();
router.get('/', start);
router.post('/', guess, true, schema);
router.get('/history', history);

// The new page requires a query string, and requires a query string with gameId in it.
// Note, we are inlining a different schema, just used for this page.
router.get('/history', game_history, true, [{key: gameId, type: 'int', required: true}]);

http.createServer((req, res) => { router.on_request(req, res) }).listen(8080);
```

Take a look at the [source code](guessing-game-framework.zip) for this program in it's entirety.  It's extremely informative, and we will be building up on these idea throughout the next chapters!