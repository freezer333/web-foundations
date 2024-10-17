# What's in a Framework?
A *framework* is a set of common tasks, implemented in a reusable way.  A *framework* is slightly different than a *library* because a library generally contains modules and functions that can be used independently - where a framework usually is a more cohesive set of routines.  Another way to think about the difference is this:  parts of libraries get plugged into a developer's overall program; the same library will be found in programs with very different purposes and architectures.  Frameworks tend to cover one specific purpose, and *define* the architecture.  Developer's plug their code *into* the framework.



We've now learned enough about JavaScript itself to start creating *reusable* components for web servers - whether we are talking about libraries or frameworks.  Let's start thinking a bit about what sort of reusable components make sense, and how we can organize them.

Every web server we write is going to likely need to do the following things (at a minimum):

1. Parse HTTP request query strings and request bodies
2. Map a URL and HTTP verb to a particular chunk of code to handle the request
3. Probably work with a stateful data and persistent data
4. Create HTTP responses, often with associated HTML content


In this chapter, we are going to look at 1 & 2.  In particular, those two components are part of an overall architecture of a *web server*.  If you think about it, you could design every web server you write using the *same* parser and the *same* methods of defining mappings from requests to handling code.  The only thing that would change between various web servers, for various web applications, would be *what* the handling code did!  This suggests we are dealing with a *framework* - and there's a reason web development is so often the target for frameworks.  A lot of web development *is exactly the same* regardless of what the web application is actually doing.  Frameworks let us avoid doing the same things over and over again!


## Request Parsing
We've already learned how to effectively *parse* query strings using the `querystring` module in Node.js.  We've also learned that the format, once assembled, of the request body can also be parsed using the `querystring` library.  In the previous chapter, we saw how we could create a reusable asynchronous function that could assemble the request body by incrementally reading the body using the `req.on` method.

```js
const qs = require('querystring');

const request_body = (req) => {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => {
            resolve(body)
        });
    })
}

const handle_get_request = (req, res) => {
    // Parsing a query string
    const query = qs.parse(req.url.split('?')[1]);
}


const handle_post_request = async (req, res) => {
    // Parsing a request body (note the async marker)
    const body = await request_body(req);
    const data = qs.parse(body);
}
```

We could consider creating a set of objects to make this process more clear, and potentially more extensible however.  Let's create a base class `Parser`, which has specializations - a `QueryParser` and a `BodyParser`, which are constructed and used in the same way.


```js
const qs = require('querystring');

const Parser {
    constructor() {
        // Nothing to do yet
    }
}
class QueryParser extends Parser {
    constructor() {
        super();
    }
    parse(req) {
        if (req.url.indexOf("?") >= 0) {
            const query = qs.parse(req.url.split('?')[1]);
            return query;
        }
        else {
            return {}
        }
    }
}
class BodyParser extends Parser {
    constructor() {
        super();
    }
    async parse(req) {
        return new Promise((resolve, reject) => {
            let body = "";
            req.on('data', (chunk) => {
                body += chunk;
            });
            req.on('end', () => {
                body = qs.parse(body);
                resolve(body)
            });
        });
    }
}

```
This was a bit more work, but it will pay off soon.  Now, both the `handle_get_request` and `handle_post_request` end up looking more similar to each other.

```js

const qp = new QueryParser();
const bp = new BodyParser();

const handle_get_request = (req, res) => {
    const query = qp.parse();
}

const handle_post_request = async (req, res) => {
    const body = await bp.parse();
}
```

## Validating Query and Body
We need to build applications on top of these parsing routines.  These applications depend on data sent from the browser, and depend on that data being present, and correct.  Currently, our implementation of both parses just sort of returns the data sent from the browser "as is".  We can do better. 

For example, the guessing game we built in a previous chapter needed to process forms with a secret number and a guess.  If either were not present, we'd have problems.  Likewise, both needed to be numbers in order for the application to work.  We should be validating this data before trying to process it, and now that we are building a reusable parser, now is a great time to do this.

Validating form (or query string) data is usually done by defining a *schema*.  A *schema* is a set of rules describing what we expect data to look like.

Let's think about a form that collects user information:  first name, last name, and age (in years).  Let's assume first and last name are required, but age isn't.  Finally, let's also accept a country of origin for the person, and make the default the "United States".

So, we have the following rules:
- must contain first name (string)
- must contain last name (string)
- may contain age (number)
- may contain country, with default = "United States"

We can represent this as an array of objects, where each object describes a particular field

```js
const schema = [
    {
        key: 'first',
        type: 'string',
        required: true
    },
    {
        key: 'last',
        type: 'string',
        required: true
    },
    {
        key: 'age',
        type: 'number'
    },
    {
        key: 'country',
        type: 'string',
        default: 'United States'
    }
]
```

This schema can be used to validate query strings and request bodies.  It can be used as input to a parser.  Let's adapt our parsers to use this sort of schema.  We will enhance the base class to accept an optional array of field describptions.  The base class will also have a protected method `_apply_schema` which will validate and parse the data, throwing an exception if the data does not adhere to the schema rules.

```js

const qs = require('querystring');

const Parser {
    constructor(schema = []) {
        this.#schema = schema;
    }
    _apply_schema(payload) {
        for (const item of this.#schema.filter(i => payload[i.key])) {
            if (item.type === 'int') {
                payload[item.key] = parseInt(payload[item.key])
            } else if (item.type === 'float') {
                payload[item.key] = parseInt(payload[item.key])
            } else if (item.type === 'bool') {
                payload[item.key] = payload[item.key] === "true"
            }
        }

        // Now check that each requried field is present
        for (const item of this.#schema.filter( i => i.required)) {
            if (payload[item.key] === undefined) {
                throw Error(`Schema validation error:  ${item.key} is not present`);
            }
        }

        // Finally, set defaults.
        for (const item of this.#schema.filter( i => i.default)) {
            if (payload[item.key] === undefined) {
                payload[item.key] = item.default;
            }
        }
        return payload
    }
}
```
With this functionality in the base class, the individual parsers can make use of it:

```js
class QueryParser extends Parser {
    constructor() {
        super();
    }
    parse(req) {
        if (req.url.indexOf("?") >= 0) {
            const query = qs.parse(req.url.split('?')[1]);
            return this._apply_schema(query);
        }
        else {
            return {}
        }
    }
}
class BodyParser extends Parser {
    constructor() {
        super();
    }
    async parse(req) {
        return new Promise((resolve, reject) => {
            let body = "";
            req.on('data', (chunk) => {
                body += chunk;
            });
            req.on('end', () => {
                body = qs.parse(body);
                resolve(this._apply_schema(body));
            });
        });
    }
}

```
A `GET` and `POST` handler function can use these schemas with the parser, and handle validations errors more easily.


```js
const schema = [
    {
        key: 'first',
        type: 'string',
        required: true
    },
    {
        key: 'last',
        type: 'string',
        required: true
    },
    {
        key: 'age',
        type: 'number'
    },
    {
        key: 'country',
        type: 'string',
        default: 'United States'
    }
]

const qp = new QueryParser(schema);
const bp = new BodyParser(schema);

const handle_get_request = (req, res) => {
    try {
        const query = qp.parse();
        ...
    } catch (e) {
        // send a 401 error, bad query string
    }
}

const handle_post_request = async (req, res) => {
    try {
        const body = bp.parse();
        ...
    } catch (e) {
        // send a 401 error, bad request body
    }
}
```

Hopefully you see the value in both `QueryParser` and `BodyParser`.  You might even be thinking about a lot of potential enhancements - as there are many that may come to mind!  That's a good sign that you are developing a sense of code reusability.  Right now these are just classes in our program file, but we will soon learn how to tuck them away in separate files - promoting even more reuse.  Even still, we will eventually learn how to *publish* them so people anywhere around the world can use them - in seconds!

## Matching, Routing
If we recall our guessing game from a while ago, and some of our other HTTP server programs, you'll recall that we had to implement a fair amount of *branching* based on HTTP verb and url being requested.  We needed to create `if` conditions to figure out which code should execute, based on if the incoming request was a `GET` or `POST`, and to which url it was sent to.  This activity is called *matching* URLS and *routing* requests to the appropriate handler.

Here's some code that responds to three different requests:
1. `GET` request to the root `/` page, which welcomes the user with an HTML welcome page and has a link to `/person`
2. `GET` request to the `/person` page, which serves HTML with a user form
3. `POST` requests to the `/person` url, which parses the form data and displays it.

I've omitted the code to generate the HTML for now, to keep us focused on the matching and the routing.

```js
const http = require('http');

const handle_request = async (req, res) => {

    if (req.url === '/' && req.method.toUpperCase() === 'GET') {
        // serve the / HTML 
    }
    else if (req.url === '/person' && req.method.toUpperCase() === 'GET') {
        // serve the person form
    }
    else if (req.url === '/person' && req.method.toUpperCase() === 'POST') {
        // Parse the body, and build the response page with the person data
    } 
    else {
        // Send a 404 - Not Found message
    }
}

http.createServer(handle_request).listen(8080);
```
Every web server you write is going to look the same. You'll have many more urls to support, and *what* you do within each url / verb combination will differ, but the structure will be the same.  You will have *matching* against url and verb in order to *route* requests to appropriate code.

Now let's think about generalizing this a bit, by creating a `Route` class - which represents a url and verb to match against, and a `Router` class to execute the logic required to to *find* the right route.

```js
class Route {
    // Method should be either GET or POSt
    // Path is the URL
    // Handler is a function to call when this route is requested
    // query and body are boolean flags, indicating if there is a query string or 
    // body to parse.
    // schema is the schema object to use to parse the query or body
    constructor (method, path, handler, query = false, body = false, schema = []) {
        this.method = method;
        this.path = path;
        this.handler = handler;
        this.has_query = query;
        this.has_body = false;
        this.schema = schema;

        if (this.has_query) {
            this.qparser = new QueryParser(schema);
        }
        if (this.has_body) {
            this.bparser =new BodyParser(schema);
        }
    }

    matches(req) {
        if (req.method.toUpperCase() !== this.method) return false;

        // We check the url differently if there is an expected query string, since it 
        // will be part of the url string itself.
        if (this.has_query) {
            return req.url.startsWith(this.path + "?");
        } else {
            return req.url === this.path;
        }
    }

    async serve(req, res) {
        let parser = null;
        if (this.qparser) {
            req.query = this.qparser.parse(req);
        }
        if (this.bparser) {
            req.body = await this.bparser.parse(req);
        }
        await this.handler(req, res);
    }
}
```
The `Route` class is actually pretty powerful now!  When constructed, it configures one (or both) of the parsers we've created already.  It has a function that returns true or false, based on the specified url and verb, depending on whether it is a match for the request.   It also has a `serve` function, that parses the query string and/or request body and then calls the `handler` function it was originally provided with.

A `Router` class can now be built, which is essentially just a collection of `Route` instances.  The `Router` class can have a method that examines an incoming request,  and calls the *correct* route handler - or returns a 401.  

Let's create this class, and allow users to add routes by calling either `get` or `post` to add routes for specific verbs.  These functions will handle creating the `Route` instances so the user of the `Router` class doesn't need to.

```js
class Router {
    constructor() {
        this.routes = [];
    }
    get(path, handler, has_query = false, schema = []) {
        const r = new Route('GET', path, handler, has_query, false, schema);
        this.routes.push(r);
    }
    post(path, handler, has_body = false, schema = []) {
        const r = new Route('POST', path, handler, false, has_body, schema);
        this.routes.push(r);
    }
    async on_request(req, res) {
        for (const route of this.routes) {
            if (route.match(req)) {
                route.serve(req, res);
                return;
            }
        }
        // No route matched, return not found.
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.write('<!doctype html><html><head><title>Not Found</title></head><body><h1>Not Found</h1></body></html>')
        res.end();
    }
}

```

## Using the Router Framework
We've thrown a lot of code down in this section, but built a set of classes that work together to make it *a lot* easier to create web servers.  Let's see what the person contact page application we alluded to earlier looks like, now with our `Router` class.


```js

const schema = [
    {
        key: 'first',
        type: 'string',
        required: true
    },
    {
        key: 'last',
        type: 'string',
        required: true
    },
    {
        key: 'age',
        type: 'number'
    },
    {
        key: 'country',
        type: 'string',
        default: 'United States'
    }
]

const http = require('http');

const serve_home_page = (req, res) => {
    html = `<!doctype html>
            <html>
                <head>
                    <title>Person Data</title>
                </head>
                <body>
                    <h1>Welcome!</h1>
                    <a href="/person">Get started</a>
                </body>
            </html>`;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(html);
    res.end();
}

const serve_person_form = (req, res) => {
    html = `<!doctype html>
            <html>
                <head>
                    <title>Enter Data</title>
                </head>
                <body>
                    <form action="/person" method="post">
                        <div><label for="first">First Name</label><input type="text" name="first" id="first"  required/></div>
                        <div><label for="last">Last Name</label><input type="text" name="last" id="last"  required/></div>
                        <div><label for="age">Age</label><input type="number" name="age" id="age" min="0" step="1"/></div>
                        <div><label for="country">Country</label><input type="text" name="country" id="country"/></div>
                    </form>
                </body>
            </html>`;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(html);
    res.end();
}

const render_person_response = (req, res) => {
    html = `<!doctype html>
            <html>
                <head>
                    <title>Enter Data</title>
                </head>
                <body>
                    <h1>Thank you!</h1>
                    <p>Name received:  ${req.body.first} ${req.body.last}</p>
                    <p>Age:  ${req.body.age ? req.body.age : 'Not provided'}</p>
                    <p>Country:  ${req.body.country}</p>
                </body>
            </html>`;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(html);
    res.end();
}


const router = new Router();
router.get('/', serve_home_page);
router.get('/person', serve_person_form);
router.post('/person', render_person_response, true, schema);
http.createServer(router.on_request).listen(8080);

```
Clearly, the above code listing is incomplete, since we'd also need to include the source code for the parsers, the route class, and the router.  But look at that code carefully.  **All of it is unique to the application**, very little of it would be considered "common" to all web server.  We've effectively *factored out* all of the HTTP parsing and routing.  You can easily imagine factoring out some of the HTML generation code (`writeHead`, `write`, `end` calls), as we've done in the past too.

Now let's see how we can avoid ever writing all that code again, by putting it into separate files.




