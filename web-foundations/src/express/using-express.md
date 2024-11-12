# Using Express
Over the past few chapters we've developed our own modules for doing common web application tasks - like parsing and routing - along with modules more specific to applications, like `wf-guess-game` and `wf-guess-db`.  We've also started to use community modules, like `dotenv` and `pug`.  In this chapter, we make the last majors *level up* on the server side - by adopting the [Express framework](https://expressjs.com/) as a replacement to the `wf-framework` we started.

Express is an extremely well established and heavily used web framework for Node.js.  It centers around functionality you already understand - parsing requests, routing requests, and rendering views.  It has a fairly small API, and is pretty easy to understand.  In this chapter we introduce ways to perform the *same* types of things we've already learned about.  In subsequent chapters we will expand on some of the features, but we won't cover *everything* Express has to offer in the book.  Make sure you check out the following resources for more:

- [Express Homepage](https://expressjs.com/)
- [Express API Documentation](https://expressjs.com/en/5x/api.html)
- [Express Quick Start](https://expressjs.com/en/starter/installing.html)

## Creating the app
We're going to explain parts of Express by relating it to the concepts we developed in `wf-framework`. Let's review that a bit now.  Each application we created with the framework had use create a new *router* object and register handler code to each URL we wanted to support.  Once that was completed, we could *start* the app by launching an `http` server, passing it a routing function defined within the `Framework.Router` class, and setting it to the listening state.

```js

const router = new Framework.Router();
router.get('/', start);
router.post('/', guess, true, schema);
http.createServer((req, res) => { router.on_request(req, res) }).listen(8080);
```

In Express, it's remarkably similar.  We can create an instance of an express server with one line of code.

```js
const app = express();
```
This app is actually a *wrapper* around the `http` module, so we won't need to directly `require` http anymore, nor call the `createServer` method.

To attach *routes*, we use a very similar syntax as we did with our own framework:

```js
app.get('/', start);
app.post('/', guess)
```
Express doesn't use anything like our schema system, so the route definitions are a bit simpler.

## Parsing Request Bodies
Unlike our framework, we don't tell Express ahead of time what request queries and bodies are going to look like. There are additional modules that you can work with that can replicate some of these features, but commonly we will include this type of validation in our own application code ourselves instead.

All express route functions have a fixed function signature, mimicking the expected function signature from `wf-framework`.

```js
const start = (req, res) => {
    console.log(req.query); // will be present by default
    console.log(req.body);  // will NOT be present by default
    ...
}
app.get('/', start) ;
```
Express automatically parses the incoming request's query string and attaches a `query` object to the `req` object before calling our handler (ie `start`).  By default, request bodies are not parsed, but we can easily enable this:

```js
app.use(express.urlencoded({extended:true}))
```
This enables form data to be posted within the request body.  The `express.urlencoded` function is *returning* a function, which Express will call **before** calling your route handlers. This function is referred to as *middleware* - in that it is a function that is called in the *middle* of a chain of possible calls.  In this case, the function `express.urlencoded` returns looks something like this (you never actually need to look at the code):

```js
const urlencoding_middleware = (req, res, next) => {
    // Parse the request body fully... using much the same 
    // type of code we've already written ourselves, in 
    // wf-framework!
    req.body = ...
    next();
}

```
Middleware functions receive three parameters - `req` and `res` - and the third being `next`.  The `next` function is called when the middleware wishes to commmunicate to Express that the *next* function (maybe your route handler) is ready to be invoked.  

You can think of Express as keeping a *list* of functions that it will call when it recieves and HTTP request. Some are general, registered with the `app.use` method.  They will be called regardless of the VERB, or URL. Others are more specific - added using functions like `app.get('/start')`.  Express *connects* a request to a sequence of function handlers - and calls each one, one by one, expecting each to call `next` when it's time to call the next. The last function in the chain (usually your route handler) generally doesn't call `next` - but it *could*.

```js
const start = (req, res, next) => {
    console.log(req.query); // will be present by default
    console.log(req.body);  // will NOT be present by default
    ...
    render(...)
    next()  // Probably not necessary, since this is probably last
}
app.get('/', start) ;
```

We will learn more about middleware in coming sections and chapters.  We can write our own middleware, and weave sequences of them together to create very elegant solutions to web application design patterns.

## Setting view engine
As we developed our `pug` code, we create the `render` function - which might have looks like a good candidate to move into `wf-framework`, since presumably it would be in most applications we wrote with `pug` in the future. Likewise, there were some other code snippets that tended to appear in all of our applications that governed sending *responses* - like writing `404` error codes and such.

Express has a number of convenience features to allow us to render responses more easily, particularly with tempaltes.  Express works with virtual *any* HTML templating solution on `npm`, and in our case we can enable `pug` with the following line of code:

```js
app.set('view engine', 'pug');
```
Using this requries that we have *installed* `pug`, but we do not need to reference the `pug` module itself in our code.

With that in place, we can *render* any template by calling the `render` function that express adds to **every** response object:

```js

const example = (req, res) => {
    res.render('myview', {foo: 'bar'});
} 
```
You guessed it... `myview` refers to `myview.pug`, and Express assumes it's in the `/views` directory of your application. Express *assumes* a lot of default places to look for things.  These assumptions are all overridable, but keeping with Express conventions is looked kindly upon by most software developers.  Basically, this is just a drop in replacement for the render function we wrote before!

```js
// From last chapter...
render(res, 'myview', {foo:"bar"});

// With express
res.render('myview', {foo: "bar"});
```

There's also some more convient was of writing HTTP resonses that we can start using:

```js
// Sending a 404 with regular http library
res.writeHead(404);
res.end();

// More common style with Express
res.status(404).end();
```
There's *a lot* more - see the APIs [here](https://expressjs.com/en/5x/api.html#res)


## Simple Example
Express is used for some of the most complex web applications deployed on the web, but it can be *really* simple to get started with.  Let's assume we have a few `pug` templates in the `views` directory, and we've installed `express`.  We can get a quick HTTP server up and running in very few lines of code:

```js
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'pug');

app.get('/foo', (req, res) => {
    res.render('foo', {a: 10, b: 12})
});
app.get('/bar', (req, res) => {
    res.render('bar', {x:3, yb: 42});
});
app.listen(8080, () => {
    console.log(`app listening on port 8080`)
});
```
That simplicity is a huge draw to Express, but you have a lot of powerful features at your disposal.

## Route parameters
Often times, we want to create route handlers for a *set* of URLS, usually matching some pattern.

Let's create a silly HTTP route that adds two numbers.  We could create the routes like this:

```js
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'pug');

app.get('/add', (req, res) => {
    const sum = parseInt(req.query.a) + parseInt(req.query.b);
    res.status(200).end(sum.toString());
});
app.listen(8080, () => {
    console.log(`app listening on port 8080`)
});

```
Visit `http://localhost:8080/add?a=5&b=8` and you'll see 13 in your web browser.

What if we *instead* wanted the URL structure to look like this:

```
http://localhost:8080/add/5/8
```
That URL looks nicer (to most).  But how could we write the Express code?  There isn't just one fixed URL string to match against - it's a pattern.  The same code would be attached to `/add/5/8` as `/add/9/34` and all of the other infinite combinations of integers!

The answer to this is URL *parameters*.  Parameters are placheholders in the URL definition that can be matched against different values.  Express nicely peforms the matching, and also gathers the *value* of the paramters and exposes them in the `req` object for you.  This enables you to write the following code to handle URLs list `http://localhost:8080/add/5/8` and `http://localhost:8080/add/78/96`

```js
app.get('/adds/:a/:b', (req, res) => {
    const sum = parseInt(req.params.a) + parseInt(req.params.b);
    res.status(200).end(sum.toString());
});
```
Parameter usage is particularly attractive when URLs represent heiarchical data.  For example, a book store might have URLs organizated by fiction, non-fiction, and then within them by genre, and then by perhaps an ID number.

```
https://books.com/fiction/mystery/32
https://books.com/nonfiction/biographies/238
```
In a URL like this, we might actually just have one handler - mapped to `/:classification/:genre/:id`, and those parameters would be matched against for [fiction, mystery, 32] and [nonfiction, biographies, 238] alike.

## Routers as Modules
Express applications can also be organized in more sophisticated ways, compared to the simple one-file small programs above.  Real-world web applications often have *hundreds* of routes, and so this is an area of the application that warrants better code organization.   For example, suppose you are building an application with users and products.  You might have three general groups of URLS associated with them. To keep all the routes separate, it's common to create a separate `routes` folder, with related routes in individual files within them:

```
/my-app
├── /routes
│   ├── users.js
│   ├── products.js
├── app.js
└── package.json
```

Each file in the routes folder can represent a different group of routes. For instance, users.js can handle all routes related to users, while products.js can handle product-related routes.  Within each file, routes are created using a `Router` class rather than the main `app` instance.  The routers are *exported*.

```js
// routes/users.js
const express = require('express');
const router = express.Router();

// Define routes for users
router.get('/', (req, res) => {
  res.send('List of users');
});

router.get('/:id', (req, res) => {
  res.send(`User with ID ${req.params.id}`);
});

module.exports = router;
```

Inside `products.js` you might have similar sets of URL and route handlers.  

```js
// routes/products.js
const express = require('express');
const router = express.Router();

// Define routes for users
router.get('/', (req, res) => {
  res.send('List of products');
});

router.get('/:id', (req, res) => {
  res.send(`Product with ID ${req.params.id}`);
});

module.exports = router;
```

In our main file, we *mount* those routes to specific **prefixes**:

```js
const express = require('express');
const app = express();
const routes = require('./routes');

app.use('/users', require('./routes/users'));
app.use('/products', require('./routes/products'));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

```
The application would provide responses to the following URLs:
```
/users
/users/32
/products
/products/54
```
Notice that the full URL matched by specific routes is the *concatenation* of the mounting prefix defined when the router is added to the app (`app.use('/users'...)`) and the URL specified on the route itself - `/` or `:id`, or something else.

Route files can include *other* route files, adding sub-routers to specific points using the same mounting mechanism.  This can create extremely complex URLs structures, while keeping the file structure manageable.

Read up on Express routing [here](https://expressjs.com/en/5x/api.html#router).

## Why Express?
In the next chapters we are going to round out *server side* application development, with cookies, essions, and authentication. These are standard parts of web applications, and express allows use to use them in an easier way than doing it ourselves - and so we are introducing Express here to support that. We will continue to add more features to servers too - and Express provides a solid foundation for those things.

Express isn't the only framework used to develop Node.js web applications - but it's the most well known, the most stable, and it's likely the most widely used.  In the next section we will write the Guessing Game *again*, using Express - instead of our `wf-framework` framework.  `wf-framework` is limited, but you'll notice that moving to Express doesn't change a lot of our design.  Likewise, you'll find that after learning Express, moving to *other* Node.js web frameworks is similarly straightforward - at least for most parts of the transition.