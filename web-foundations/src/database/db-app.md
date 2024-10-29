# Application Specific DB
Generally speaking we like to separate out code that directly depends on the database.  Opinions vary on just how important this is, and certainly over the decades the notion of "swapping out different databases" has been proven to not really be something to design for (it rarely happens, and is never easy anyway).  That said, it's often helpful because we often have *multiple* applications that access the same database - therefore separating out database logic into a component that can be reused has a real benefit.

Let's see if we can isolate our database logic into a separate *module*, in it's own file. This might help us later on, as we create new versions of the guessing game with the same database, but different application code.

The module should have all of the following:

1. Bootstrapping (create on launch)
2. Cleanup (remove all the incomplete games)
3. Game creation
4. Game listing (all games)
5. Game details (all guesses for a game)
6. Find Game (get one game, by id)
7. Update game (set it as completed, add a guess, etc).

The goal is to create a module that encapsulates the common uses of the guessing game application.

```js
// Contents of guess-db.js
const sql = require('better-sqlite3');

class GuessDatabase {
    #db
    constructor(db_filename) {
        this.#db = sql(db_filename);
        this.#bootstrap();
        this.#sweep_incomplete();
    }

    /** Creates the tables */
    #bootstrap() {
        const game = `create table if not exists game (id integer primary key, secret integer, completed integer, time text)`;
        const guess = `create table if not exists guesses (
                         game integer, 
                         guess integer, 
                         time integer, 
                         foreign key(game) references game(id) on delete cascade
                       )`;
        this.#db.prepare(game).run();
        this.#db.prepare(guess).run();
    }

    /** Deletes the incomplete games */
    #sweep_incomplete() {
        this.#db.prepare('delete from game where completed = ?').run(0);
    }

    /** inserts a game, assigns game.id to the created
     *  primary key
     */
    add_game(game) {
        const stmt = this.#db.prepare('insert into game (secret, completed) values (?, ?)');
        const info = stmt.run(game.secret, game.complete);
        game.id = info.lastInsertRowid;
    }

    /** Updates the completed, time values of the game */
    update_game(game) {
        const stmt = this.#db.prepare('update game set completed = ?, time = ? where id = ?');
        stmt.run(game.complete, game.time, game.id)
    }

    /** Adds a guess record for the game */
    add_guess(game, guess) {
        const g = this.#db.prepare('insert into guesses (game, guess, time) values (?, ?, ?)');
        g.run(game.id, guess, (new Date()).getTime());
    }

    /* Finds the game record for the game, by id - and populates
    *  the guesses array with the guesses for the game.
    */
    get_game(game_id) {
        const record = this.#db.prepare('select * from game where id = ?').get(game_id);
        record.guesses = this.#db.prepare('select * from guesses where game = ? order by time').all(record.id).map(g => g.guess);
        return record;
    }

    /** Returns all the (complete) games */
    get_games() {
        const records = this.#db.prepare('select * from game where completed = ?').all(1);
        for (const r of records) {
            r.guesses = this.#db.prepare('select * from guesses where game = ? order by time').all(r.id).map(g => g.guess);
        }
        return records
    }
}

exports.GuessDatabase = GuessDatabase;
```
This encapsulation cleans up a lot of our code within the core web app.  Similarly, we can put the `Game` class in a `game.js` file and export it as well.  Neither class depends on the other, and we can require them in our main file - which now 100% focused on web server logic.

```js
// game.js
class Game {

    static fromRecord(record) {
        const game = new Game();
        game.id = record.id;
        game.secret = record.secret;
        game.guesses = record.guesses;
        game.complete = record.completed;
        game.time = record.time;
        game.guesses = record.guesses;
        return game;
    }

    constructor() {
        // Create the secret number
        this.secret = Math.floor(Math.random() * 10) + 1;
        this.guesses = [];
        this.complete = 0;
    }

    guess_response(user_guess) {
        if (user_guess > this.secret) {
            return "too high";
        } else if (user_guess < this.secret) {
            return "too low";
        } else {
            return undefined;
        }
    }

    make_guess(user_guess) {
        if (user_guess === this.secret) {
            this.complete = 1;
            this.time = (new Date()).toLocaleDateString();
        }
        return this.guess_response(user_guess);
    }
}


exports.Game = Game;

```

Now we have clean separation of our application into three distinct parts:  (1) the game logic (the `Game` class in `game.js`), (2) the data model (`GuessDatabase` in `guess-db.js`), and the application glue - the routes, http, and page rendering - in the main file `guess.js`.

```js
// Loads the config params, like DB_FILENAME
require('dotenv').config();

const Framework = require('./framework');
const http = require('http');

// Game Logic
const Game = require('./game').Game;

// Game Data
const GuessDatabase = require('./guess-db').GuessDatabase;

if (process.env.DB_FILENAME === undefined) {
    console.error('Please set the DB_FILENAME environment variable');
    process.exit(1);
}

const GameDb = new GuessDatabase(process.env.DB_FILENAME);

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

const make_guess_page = (game, result) => {
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
    const game = new Game();
    GameDb.add_game(game);
    send_page(res, make_guess_page(game));
}

const guess = async (req, res) => {
    const record = GameDb.get_game(req.body.gameId);
    if (!record) {
        res.writeHead(404);
        res.end();
        return;
    }
    // create a game instance from the record found in the db
    const game = Game.fromRecord(record);
    const response = game.make_guess(req.body.guess);
    if (response) {
        send_page(res, make_guess_page(game, response));
    } else {
        send_page(res, `<h1> Great job!</h1> <a href="/">Play again</a>`);
    }

    GameDb.add_guess(game, req.body.guess);
    GameDb.update_game(game);
}

const history = (req, res) => {
    const records = GameDb.get_games();
    const games = records.map(r => Game.fromRecord(r));

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

const game_history = (req, res) => {
    const record = GameDb.get_game(req.query.gameId);
    const game = Game.fromRecord(record);

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


const schema = [
    { key: 'guess', type: 'int' },
    { key: 'gameId', type: 'int' }
];

const router = new Framework.Router();
router.get('/', start);
router.post('/', guess, true, schema);
router.get('/history', history);
router.get('/history', game_history, true, [{ key: 'gameId', type: 'int', required: true }]);

http.createServer((req, res) => { router.on_request(req, res) }).listen(8080);
```

## Towards Reusability
We saw `better-sqlite3` and the `dotenv` libraries in this chapter, and this should be hinting towards something - modules as distributable code.  In fact, our `Game` and `GuessDatabase` classes can be packaged up into distributable packages too - and they can even be installed with `npm install`.  In future versions of the Guessing Game, we'll do just that - but the end of this book, our application code for the many versions of Guessing Game won't have `Game` and `GuessDatabase` - they will just be included via `npm`!

In addition, you've seen how the game's logic can be factored out of the core HTTP application. This logic is often called the *business logic* or *business layer*.  We've also separated out the database - often called the *data layer*.  All that's left in our core application file is HTTP, routing, and rendering.  Over the next few chapters, we will start to carve away at this code - until it make use of new `npm` packages that give our code more and more power, with fewer and fewer lines of code!