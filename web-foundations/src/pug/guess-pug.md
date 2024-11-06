# Guessing Game Version 4 - Templates
We've come a long way, and we are about to write one of our *shortest* versions of the Guessing game, at least in terms of the number of lines of code within our main JavaScript code file.  We'll make use of our `Game` class logic, the `GuessingDatabase` class to do database work, and now the `pug` library to move the HTML generation out of our JavaScript code.  The result will be a far more readable program!

Let's start by listing out what we will be using from before.  In the last chapter, we created three packages and published to npm, we'll use them now.

- `wf-guess-game` - includes the `Game` class that performs the logic of the guessing game.  It generates a *secret* number and evaluates guesses.
- `wf-guess-db` - the SQLite wrapper code to interact with the guessing game database, providing persistant storage
- `wf-framework` - the web framework we've been working on - for parsing request query strings, bodies, and routing requests.

Let's install them all, in a clean directory:

```bash
mkdir guessing-game-04-pug
cd guessing-game-04-pug
npm install wf-framework wf-guess-db wf-guess-game pug dotenv
```
Those three packages, plus `pug` are going to do a lot of the heavy lifting for us.  Let's review the code, and we'll inspect each *route* in more detail when we look at the associated pug templates.

The first few lines are just our requires, along with reading the `dotenv` configuration.

```js
const http = require('http');

// Modules we've already written, and published on NPM!
const Game = require('wf-guess-game').Game;
const GuessDatabase = require('wf-guess-db').GuessDatabase;
const Framework = require('wf-framework');

// Now let's include pug too
const pug = require('pug');

// Load the .env environment variables for the database.
require('dotenv').config();
```

Next, a utility function to *render* views.  This function will accept a response object, so it can write data back to the socket.  It also accepts a file name - which is assumed to be in the `/views` directory and have a `.pug` extension.  The parameter `file` is used to construct a full path.  For example, if `file` is `"guess"`, then the function will render the `/views/guess.pug` template.  Finally, the third parameter is the *model* - the data to be rendered with the template.  We'll use this function in each of our routes - which are now only responsible for creating the model object.

```js
const render = (res, file, model) => {
    const html = pug.renderFile(`./views/${file}.pug`, model);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(html);
    res.end();
}
```
We have **four** routes - the *start* page, the *guess* page, and two history pages - one that lists all the previous games, and another that displays the specific guesses associated with a specific game.

The start route is the simplest - we just create a new game instance, add it to the database, and render a form.
```js
const start = (req, res) => {
    // add_game returns the same game it adds, with an id
    const game = GameDb.add_game(new Game());
    render(res, 'guess', { game: game });
}
```
We've created model with just `game`, and instance of the `Game` class.  The render function will take that model and render the `guess` template.  Let's take a look (remember, if you are following along, the templates should be in a `views` directory, which is customary).

```jade
doctype html
html 
    head 
        title Guessing Game 
    body 
        if response === undefined 
            p I'm thinking of a number from 1-10!
        else 
            p Sorry, your guess was #{response}, try again! 
        
        form(action="/", method="POST")
            label(for="guess") Enter your guess: 
            input(name="guess", placeholder="1-10", type="number", min="1", max="10")
            input(name="gameId", value=game.id, type="hidden")
            button(type="submit") Submit
        div
            a(href="/history") Game History
```
This isn't much different than when we generated the same form using JavaScript code.  If you recall, from previous examples, we had a function called `make_guess_page` which performed fairly similar logic.

```js
// This is from previous examples, NOT the current code!
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
```
The same pug template is used after a user has made a guess - and the guess is incorrect.  The `guess` route is used when the form is posted, and will either render the `guess` template with a message (too high, or too low), or render a completion page.

```js
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
        render(res, 'guess', { game, response });
    } else {
        render(res, 'complete', { game });
    }

    // add_guess returns a guess record with a game id, guess, and time.
    const guess = GameDb.add_guess(game, req.body.guess);
    game.guesses.push(guess);
    GameDb.update_game(game);
}
```
We saw the `guess` pug template - which when called from this route will have a response (a message to tell the user if the guess was too low or too high).  If the guess was correct though, we render the `complete` template instead.  

```jade
doctype html
html 
    head 
        title Guessing Game 
    body 
        h1 Great job!
        p: a(href="/") Play again!
        p: a(href="/history") Game History
```
Next up, we have the two routes that generate the history pages. Here's the JavaScript, and the associated templates.

```js

const history = (req, res) => {
    const records = GameDb.get_games();
    const games = records.map(r => Game.fromRecord(r));
    render(res, 'history', { games: games.filter(f => f.complete) });
}

const game_history = (req, res) => {
    const record = GameDb.get_game(req.query.gameId);
    const game = Game.fromRecord(record);

    if (!game) {
        res.writeHead(404);
        res.end();
        return;
    }
    render(res, 'game_history', { game });
}
```

```jade
//- history.pug
doctype html
html 
    head 
        title Guessing Game 
    body 
        table
            thead
                tr
                    th Game ID
                    th Num Guesses
                    th Started
            tbody
                each g in games
                    tr
                        td
                            a(href="/history?gameId="+g.id) #{g.id}
                        td #{g.guesses.length}
                        td #{g.time}
        a(href="/") Play the game!
```

```jade
//- game-history.pug
doctype html
html 
    head 
        title Guessing Game 
    body 
        ul
            each g in game.guesses
                li #{g}
                    
        a(href="/history") Back to game history!
```

The rest of the JavaScript is the same as the last example - just setting up the routes, and launching the server.

```js
const schema = [
    { key: 'guess', type: 'int' },
    { key: 'gameId', type: 'int' }
];

if (process.env.DB_FILENAME === undefined) {
    console.error('Please set the DB_FILENAME environment variable');
    process.exit(1);
}

const GameDb = new GuessDatabase(process.env.DB_FILENAME);

const router = new Framework.Router();
router.get('/', start);
router.post('/', guess, true, schema);
router.get('/history', history);
router.get('/history', game_history, true, [{ key: 'gameId', type: 'int', required: true }]);

http.createServer((req, res) => { router.on_request(req, res) }).listen(8080);
```
This example can be [found here](https://github.com/freezer333/web-foundations/tree/main/code/guessing-game-04-pug).  [TODO - GITHUB CODE]

## Version 5 - with Mixins and Includes
Currently the game history page simply lists out all the guesses the user made.  It's implied what the secret number was, because it's the last guess.  It would be nicer to actually list the message - *too high* or *too low* right next to the number. That's pretty easy to do - we know what the secret was in the first place!

The following pug syntax uses a `guess` and `secret` variable to render the correct message to the screen.
```jade
span #{guess} - 
if guess == secret
    span Correct!
else if guess < secret 
    span Too low! 
else 
    span Too high!
```
We could include this pug syntax in the `game_history.pug`, but instead let's think ahead a bit.  It would be nice to be able to display a running list of the guesses a user makes during a game while they are playing.  We have the list of guesses available to us inside the `guess.pug` template - the game object (the model) has it. So, there might be two templates where we wish to use the pug code above.  That should make us think about reuse.

In pug, reuse of snippets of template code is achieved through *mixins* - which are a lot like functions.  Let's create a mixin for rendering a guess, based on the secret number.

```jade
mixin guess(guess, secret)
    span #{guess} - 
    if guess == secret
        span Correct!
    else if guess < secret 
        span Too low! 
    else 
        span Too high!
```

To call this mixin, we use a `+` sign:

```jade
+guess(guess, secret)
```
The question of course, is - *where* do we put the mixin, and where are we calling it from!  Since the mixin will be used in multiple files, it's smart to put the mixin in a separate file that can be *included* from the others.

Let's create a `mixings.pug` file in the `views` directory.  Since in both the game history and the guess pages we will have a *list* of guesses, we'll actually create two mixins - one that renders and individual guess, and an other  (which call is) that render the entire list of guesses.

```jade
//- Contents of mixins.pug
mixin guess(guess, secret)
    span #{guess} - 
    if guess == secret
        span Correct!
    else if guess < secret 
        span Too low! 
    else 
        span Too high!

mixin guess_list(guesses, secret)
    ul
        each guess in guesses
            li
                +guess(guess, secret)
```

Now, from within the `game_history` pug template, we can use those mixins by *including* the `mixins.pug` file and calling them:


```jade
//- game-history.pug
include mixins 

doctype html
html 
    head 
        title Guessing Game 
    body 
        +guess_list(game.guesses, game.secret)    
        a(href="/history") Back to game history!

```
Now, inside `guess.pug` we can include the same file, and render a list of the *current* game's guesses.  We'll render those guesses in reverse order, so the most recently guessed value appears first while playing the game.

```jade
//- guess.pug
include mixins 

doctype html
html 
    head 
        title Guessing Game 
    body 
        if response === undefined 
            p I'm thinking of a number from 1-10!
        else 
            p Sorry, your guess was #{response}, try again! 
        
        form(action="/", method="POST")
            label(for="guess") Enter your guess: 
            input(name="guess", placeholder="1-10", type="number", min="1", max="10")
            input(name="gameId", value=game.id, type="hidden")
            button(type="submit") Submit
        
        +guess_list(game.guesses, game.secret)  

        div
            a(href="/history") Game History
```
As we look at each of the template files, some additional repetition reveals itself.  Each page begins exactly the same:

```jade
doctype html
html 
    head 
        title Guessing Game 
    body
        ... then every page is different!...

```

This is pretty common, and in fact most web applications have a lot more in the beginning of each page, that is exactly the same.  Many web application include dozens of resources from within this `head` element, and build toolbars and menus that require many elements at the beginning of the `body` element. It makes sense, usually, to define one (or many) different *layouts* that includes all this front matter - and `pug` lets us do that through *template inheritance*.

Let's create a `layout.pug` file inside the `views` directory.  It will create the beginning part of the HTML (and include mixin file(s)).  Lastly, it will define a specific location where blocks of code can be injected.

```jade
include mixins 
doctype html
html 
    head 
        title Guessing Game 
    body 
        block content
```

The key to understanding how template inheritance works is to relate it to the idea of inheritance in object oriented languages.  In an OO language, sub classes and parent classes model an *is a* relationship.  Likewise, we can create templates that *extend* our `layout.pug` file - making those templates instances of `layout.pug`.  Think of the `block` keyword as describing *abstract*, or *pure virtual* functions (dependon on which OO language you are most familiar with).  Every sub-class of `layout.pug` can provide an *implementation* of the block `content`, and that template code will be placed withing the `body` element.

Thus, we can have our `guess.pug` template now look like this:

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
        input(name="gameId", value=game.id, type="hidden")
        button(type="submit") Submit
    
    +guess_list(game.guesses.reverse(), game.secret)   

    div
        a(href="/history") Game History
```

We've used the `extends` keyword to specify that `guess.pug` *is a* instance of `layout`, and we've defined the `content` block.  When rendered, `guess.pug` is rendered as `layout.pug` - with the `content` block containing the template code withing `guess.pug`.

## Final Template Files
Here's the complete listing of all of our template files - inside the `views` directory.  The JavaScript code hasn't changed at all - we've just refactored our templates.  We've also included the uninterrupted JavaScript code at the end for completeness.  The full code is [here](https://github.com/freezer333/web-foundations/tree/main/code/guessing-game-05-pug) too.


### layout.pug
```jade
include mixins
doctype html
html 
    head 
        title Guessing Game 
    body 
        block content
```

### mixins.pug
```jade
mixin guess(guess, secret)
    span #{guess} - 
    if guess == secret
        span Correct!
    else if guess < secret 
        span Too low! 
    else 
        span Too high!

mixin guess_list(guesses, secret)
    ul
        each guess in guesses
            li
                +guess(guess, secret)
```

### guess.pug
```jade
extends layout

block content
    if response === undefined 
        p I'm thinking of a number from 1-10!
    else 
        p Sorry, your guess was #{response}, try again! 
        
    form(action="/", method="POST")
        label(for="guess") Enter your guess: 
        input(name="guess", placeholder="1-10", type="number", min="1", max="10")
        input(name="gameId", value=game.id, type="hidden")
        button(type="submit") Submit
    
    +guess_list(game.guesses.reverse(), game.secret)   

    div
        a(href="/history") Game History
```

### complete.pug
```jade
extends layout

block content
    h1 Great job!
    p: a(href="/") Play again!
    p: a(href="/history") Game History
```

### history.pug
```jade
extends layout

block content
    table
        thead
            tr
                th Game ID
                th Num Guesses
                th Started
        tbody
            each g in games
                tr
                    td
                        a(href="/history?gameId="+g.id) #{g.id}
                    td #{g.guesses.length}
                    td #{g.time}
    a(href="/") Play the game!
```
### game_history.pug
```jade
extends layout

block content
    +guess_list(game.guesses, game.secret)    
    a(href="/history") Back to game history!
```
### guess.js

```js
const http = require('http');

// Modules we've already written, and published on NPM!
const Game = require('wf-guess-game').Game;
const GuessDatabase = require('wf-guess-db').GuessDatabase;
const Framework = require('wf-framework');

// Now let's include pug too
const pug = require('pug');

// Load the .env environment variables for the database.
require('dotenv').config();

const render = (res, file, model) => {
    const html = pug.renderFile(`./views/${file}.pug`, model);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(html);
    res.end();
}

const start = (req, res) => {
    // add_game returns the same game it adds, with an id
    const game = GameDb.add_game(new Game());
    render(res, 'guess', { game });
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

    // add_guess returns a guess record with a game id, guess, and time.
    const guess = GameDb.add_guess(game, req.body.guess);
    game.guesses.push(guess.guess);
    GameDb.update_game(game);

    if (response) {
        render(res, 'guess', { game, response });
    } else {
        render(res, 'complete', { game });
    }
}

const history = (req, res) => {
    const records = GameDb.get_games();
    const games = records.map(r => Game.fromRecord(r));
    render(res, 'history', { games: games.filter(f => f.complete) });
}

const game_history = (req, res) => {
    const record = GameDb.get_game(req.query.gameId);
    const game = Game.fromRecord(record);

    if (!game) {
        res.writeHead(404);
        res.end();
        return;
    }

    render(res, 'game_history', { game });
}

const schema = [
    { key: 'guess', type: 'int' },
    { key: 'gameId', type: 'int' }
];

if (process.env.DB_FILENAME === undefined) {
    console.error('Please set the DB_FILENAME environment variable');
    process.exit(1);
}

const GameDb = new GuessDatabase(process.env.DB_FILENAME);

const router = new Framework.Router();
router.get('/', start);
router.post('/', guess, true, schema);
router.get('/history', history);
router.get('/history', game_history, true, [{ key: 'gameId', type: 'int', required: true }]);

http.createServer((req, res) => { router.on_request(req, res) }).listen(8080);
```