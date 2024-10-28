# Reusable Modules
We built a lot of code in the last section that hopefully seems useful to you.  As in any language, code reuse is valued in JavaScript, and can be supported by allowing programs to be split up into multiple files.

JavaScript has a long and thorny history allowing developers to *include* other files however.  Unlike other langauges (C++ for example), the langauge itself originally lacked any mechanism for linking/including additional source code.  This is because JavaScript became a programming langauge *for web browsers*, and *for short programs*.  We will learn how we can add JavaScript to HTML pages loaded in a web browser later, but for now take a look at this HTML for some perspective:


```html
<!doctype html>
<html>
    <head>
        <title>Example</title>
        <script src='some_file.js'></script>
        <script src="some_other_file.js"></script>
    </head>
    <body>
    ...
    </body>
</html>
```

The HTML above references **two** JavaScript files.  These are loaded as new resources, a lot like the `src` attribute loads image data when the browser encounters an `img` element.  The JavaScript files are loaded via separate HTTP `GET` requests, and the server will need to return the JavaScript code.  

Importantly, the web browser treats *all* the JavaScript, from both files, as "executable".  They go directly into the global scope of the browsers runtime engine (ie. for Google Chrome, it's V8 again!).  This is how multiple files can be include in JavaScript within web browsers - you just link to them all.  

In Node.js however, we have a more structured environment.  We don't run this code in a web browser, we run it by typeing `node some_file.js`.  The Node.js program (a C++ program, containing operating system call inferfaces to the V8 JavaScript runtime) executes the code found in `some_file.js`.  Node provides a **Node.js specific** way to link a file, from your code - the `require` statement.

We've seen the `require` statement already, when including libraries like `http`, `fs`, and `querystring`.  Those are built in modules, but `require can also be used on local (relative) files.

## Requiring JSON
Let's start by recognizing that `require` can actually be a nice way to read structured data into a Node.js program.

Let's suppose you have a file called `data.json`, stored in the same directory as your code - `code.js`.  

```json
// contents of data.json
{
    "foo": "bar",
    "buzz": "bazz"
}

```
You can load the contents of `data.json` into your program, *synchronously*, using `require`.

```js
const data = require('./data.json');
console.log(data.buzz); // bazz
```
Note that *synchronously* means the `require` method is not like when we read from a file with the `fs` library.  It blocks the event loop, and loads the file.

The `./` prepended to `data.json` is **critical**.  The `.` indicates that the path being specified is *relative* to the current code file.  Doing `require('data.json')` would fail, as it would be indicating to `require` that `data.json` is a module registered to the Node.js runtime as a *package*.  We are going to cover packages in the next chapter - but `data.json` is certainly not that!

## Requiring code
The `require` method can also load *code* files - with an extension of `.js`.  Unlike when loading `.json` files, to specify a `js` code file we do not use the extension - we just use the filename.  The absense of the extension tips the `require` function off that you are trying to load a *code* file.

Code files that are meant to be *required* by other files are called *modules*.  **Modules** have well defined *exports* - functions, classes, and variables that are  available on the module.  When you *require* a code file, the result of the `require` is a *module object*, and the module object's properties correspond to the things the module *exports*.

Let's check it out in practice.  Suppose you have a `code.js` file, which you intend to hold reusable JavaScript functions:

```js
// Contents of code.js
const a = () => {
    console.log("A");
}
const b = () => {
    console.log("B");
}
const c = () => {
    console.log("C");
}
```
If we require this from another source code file in the same directory - `main.js` - we won't necessarily be able to use anything just yet

```js
//Contents of main.js
const code = require('./code');
code.a(); // Error, a is not defined on code
```

There is an error when attempting to call the `a` function because `a` was never *exported*.  Let's export each of the methods inside `code.js`:

```js
// Contents of code.js
const a = () => {
    console.log("A");
}
const b = () => {
    console.log("B");
}
const c = () => {
    console.log("C");
}
exports.a = a;
exports.b = b;
exports.c = c;
```

Inside the `code.js` module, we make use of a global variable (object) called `exports`.  `exports` is a standin, for the *current module's exports*.  We create three properties, `a`, `b` and `c` and set them accordingly.

Now, inside `main.js` we can use them:

```js
//Contents of main.js
const code = require('./code');
code.a(); // prints "A"
code.b(); // prints "B"
code.c(); // prints "C"
```

Note that modules can export whatever they want, by any name.  It's perfectly legal for `code.js` to export things in ways that might not be intuitive:

```js
// Contents of code.js
const a = () => {
    console.log("A");
}
const b = () => {
    console.log("B");
}
const c = () => {
    console.log("C");
}
exports.a = a;
exports.b = a;  // export a as b
exports.special = b;  // export b as special

```
When `main.js` calls the exports, the exports are mapped accordingly:

```js
//Contents of main.js
const code = require('./code');
code.a(); // prints "A"
code.b(); // prints "A"
code.special(); // prints "B"
code.c(); // Error, c is not in the code module's exports.
```

Any function, class, or variable that is *not* explicitely exported is considered private to the module.  In the example above, `code.js` still has the `c` function, but external files have no way of accessing it.  Inside `code.js` however, the function is still very much present.


```js
// Contents of code.js
const a = () => {
    console.log("A");
}
const b = () => {
    console.log("B");
    c();
}
const c = () => {
    console.log("C");
}
exports.a = a;
exports.b = a;  // export a as b
exports.special = b;  // export b as special

```
```js
//Contents of main.js
const code = require('./code');
code.special(); // prints "B", then prints C
```

Finally, a module can defined a *single* export by overwriting the `exports` variable itself.  This is sometimes done to clarify how a module might be used, when there is only one entry point and no other things to be exported.

```js
// Contents of code.js
const a = () => {
    console.log("A");
}
const b = () => {
    console.log("B");
    c();
}
const c = () => {
    console.log("C");
}
module.exports = b;
```
Now the module itself **is** the function b:
```js
//Contents of main.js
const code = require('./code');
code(); // Prints B, then C - since the module maps to the `b` function
```

## Our Framework, as a file
Let's move the parsing and routing code into a separate file now, called `framework.js` and define the necessary exports.  First let's start with the code:

```js
const qs = require('querystring');

class Parser {
    #schema;
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
    constructor(schema) {
        super(schema);
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
        this.has_body = body;
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
            if (route.matches(req)) {
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
That's a lot of code!  What would the module need to export though?  If you look back at the last section, the code we wrote that *used* `Router` never actuall created any instances of `Route`, or a parser.  The `get` and `post` methods on the `Router` class actually do this all.  Therefore, at least for now, we only have **one** export - the `Router` class itself.  We could export the module *as* the class, however we may eventually add more things to the framework - so we'll export it as a property.

```js
// Bottom of the framework.js file from above
exports.Router = Router
```

Without repeating all the HTML generation code, here's how are main file would end up looking:



```js
const Framework = require('./framework');

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
   ... serve the page ...
}

const serve_person_form = (req, res) => {
   ... serve the page ...
}

const render_person_response = (req, res) => {
    ... serve the page ...
}

const router = new Framework.Router();
router.get('/', serve_home_page);
router.get('/person', serve_person_form);
router.post('/person', render_person_response, true, schema);
http.createServer((req, res) => { router.on_request(req, res) }).listen(8080);
```
If we want to use Framework in another program, you just copy the file into that program's directory, and you're all set!


The full source code is [here](frameowrk)


## Native JavaScript Modules
At the time Node.js was created, the `require` statement was being used in a library called [CommonJS]() too.  There are other alternatives as well.  The JavaScript language standards commmitee recognized that the language really needed a *native* way of importing code however, so web browsers could standardize fully on one method.  The language *did not adopt* `require`, instead moving towards a slightly different syntax.  This has become known as **ES Modules**.

Node.js supports both the CommonJS syntax, and the newer ES Modules syntax - *however* they do not always play nicely together.  For the remainder of this text, we will stick to using `require`.  It's more common in Node.js, and it also helps keep the lines clear between browser based JavaScript and server-based JavaScript.  When you see `require`, you know you are looking at server code, *not browser code*.

Check out the [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) for more about modules.