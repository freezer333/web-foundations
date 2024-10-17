# Async and Await
Promises are critical to JavaScript.  They *standardize* the concept of *future results* and create a dependable API for attaching callbacks for fullfillment and errors.  Having a standardized model of asynchronous computations allows the language to evolve further, around that standard.  This evolution led us to the adoption of the `async` and `await` keywords.

## Understanding `await`
Let's examine the following code:

```js
// Create a promise that resolves right away
const result = new Promise ((resolve, reject) => {
    resolve("Hello");
});

console.log(result);
```
The code above prints `Promise { 'Hello' }`.  `result` is indeed a *promise*, it's not the string `Hello`.  Since the code above resolves *immediately* however, the `Hello` result is already present inside the promise being printed - the promise is already fulfilled.  Nevertheless, we cannot do anything useful with `result`.

Let's modify the code within the promise to explicitely wait a while before resolving - let's say 5 seconds.  We can do that with `setTimeout`, a function that executes a given function after a specified number of milliseconds. 


```js
// Create a promise that resolves in 5 seconds
const result = new Promise ((resolve, reject) => {
    setTimeout(() => {
        resolve("Hello");
    }, 5000);
    
});

console.log(result);
```
It we run that code, we see the print statement executes *immediately*, and will print `Promise { <pending> }`.  This should make sense.  The promise won't resolve for another 5 seconds.  We can certainly get the result after 5 seconds, but we need to use the `then` callback.


```js
// Create a promise that resolves in 5 seconds
const result = new Promise ((resolve, reject) => {
    setTimeout(() => {
        resolve("Hello");
    }, 5000);
    
});

console.log(result);
result.then((v) => {
    console.log(v);
})
```
That code will first print `Promise {<pending>}`, and then 5 seconds later print "Hello".

Now let's look at how the `await` keyword can transform our code into something that looks more straightforward:


```js
// Create a promise that resolves in 5 seconds
const promise = new Promise ((resolve, reject) => {
    setTimeout(() => {
        resolve("Hello");
    }, 5000);
    
});

console.log(promise);
const result = await promise;
console.log(result);
```

This code will print out exactly the same thing as the previous snippet.  The `await` keyword is a *replacement* for using `then` - it **blocks** until the promise resolves, and yeilds the value that would normally be passed to the `then` callback.

In fact, it's actually useful to think about the `await` keyword simply being syntactical sugar, that the JavaScript runtime uses to *rewrite* your code into a promise structure.

Take the following:
```js
const fs = require('fs');
const read_file = (filename) => {
    return new Promise ((resolve, reject) => {
        fs.readFile(filename, 'utf8', (err, file) => {
            if (file) resolve(file);
            else reject(err);
        })
    })
}

const file = await read_file('file.txt');
console.log(file);
```
The above code, particularly the line with `await` **and the line(s) after it**, are transformed into:

```js

const fs = require('fs');
const read_file = (filename) => {
    return new Promise ((resolve, reject) => {
        fs.readFile(filename, 'utf8', (err, file) => {
            if (file) resolve(file);
            else reject(err);
        })
    })
}

read_file('file.txt').then((file) => {
    console.log(file);
});
```
This transformation happens at runtime, and as a developer you can trust (due to the standardization of promises) that this will be an accurate transformation.  

While `await` provides the "look and feel" of a traditional *blocking* call, **it is not blocking Node.js**.  

Let's prove this by using `setInterval` - which is similar to `setTimeout` but executes a function at a given interval of time, over and over again.  The interval can be stopped with `clearInterval`, which takes the identifier returned by `setInterval`.

```js
const promise = new Promise ((resolve, reject) => {
    setTimeout(() => {
        resolve("Hello");
    }, 5000);        
});

let v = 0;
const i = setInterval(()=> {
    console.log('Interval', v++);
}, 1000);

const result = await promise;
console.log(result);
clearInterval(i);
```

When run*, that code will print the following:

```
Interval 0
Interval 1
Interval 2
Interval 3
Interval 4
Hello
```

Look closely at the code.  It *proves* the `await` keyword is not blocking the Node.js event loop - Node.js is still able to execute the interval code at each 1 second interval.  Yet, the program is *also* waiting at the `result = await promise;` line of code, and only resumes `console.log(result)` when the 5 second timeout promise resolves.  

**We are getting the best of both worlds**, our code is free of callback chains and appears as a nice linearly written program, but is *still asynchronous* and *non-blocking*.  The callback passed to `setInterval` is executed 5 times, every second, **while** the code is "awaiting" the `setTimeout` promise!

## The catch... `async`
If you tried to run the code above, you might be scratching your head.  It didn't actually work - you'd see a syntax error:

```
SyntaxError: await is only valid in async functions and the top level bodies of modules
```
That's why I wrote the * next to the word "run" at the beginning of the section above.  You can't quite run it yet, because the JavaScript runtime *only* rewrites code to use `await` and promises if you explictely tell it to.  There's only one way to do so - the `await` keyword must be:

1. Used within a function
2. Used within a function marked explicitely as `async`

We can't have global code using `await`.  Here's a version that will work:

```js
const run = async () => {
    const promise = new Promise ((resolve, reject) => {
        setTimeout(() => {
            resolve("Hello");
        }, 5000);
        
    });

    let v = 0;
    const i = setInterval(()=> {
        console.log('Interval', v++);
    }, 1000);

    const result = await promise;
    console.log(result);
    clearInterval(i);
}

run();
```

We've wrapped the code into a function, called `run`.  Critically, we have also marked the function itself with the `async` keyword.  **These are the requirements**.  When done correctly, we are instructing the JavaScript runtime to rewrite `await` code into Promise `then` and `catch` callbacks, transparently.


### `try`, `catch` and `finally`
We learned that Promises have `then`, `catch` and `finally` callback registration.  This allows us to run code when the promise fullfills, errors, or either (settles).  

```js
const run = () => {
    promise.then ((result) => {
        // Code that runs when the promise is fulfilled
    }).catch( (e) => {
        // Code that runs when the promise errors (rejected)
    }).finally (() => {
        // Code that runs after promise is fulfilled or errors - it always runs
    });
}
run();
```

The `async` and `await` keywords allow us to write this same code in a traditional `try` and `catch` block - which most developers find far superior.

```js
const run = async () => {
    try {
        const result = await promise;
        // Code that runs when the promise is fulfilled
    } catch (e) {
        // Code that runs when the promise errors (rejected)
    } finally {
        // Code that runs after promise is fulfilled or errors - it always runs
    }
}
run();
```
Again, look closely - the two `run` functions are the same - they are just written differently.  The code is being moved around.  The `async`/`await` example, as a matter of style, is probably more appealing to you.  There are real objective benefits as well - the biggest being that other code that works with exceptions now plays nicely with the same `try`/`catch` block as the asynchronous code.  That said, remember that the JavaScript runtime **rewrites** the `async`/`await` code into the former promise based code!



## The effects of `async`
Students are often a little confused about what the `async` keyword actually does.  It's helpful to see a few contrived examples:

```js
const v1 = () => {
    return 42;
}
const v2 = () => {
    return new Promise ((resolve, reject) => {
        resolve(42);
    })
}

const v3 = async () => {
    return 42;
}
const v4 = async () => {
    return new Promise ((resolve, reject) => {
        resolve(42);
    })
}

// Mark test so we can await things.
const test = async () => {

    console.log(v1());
    console.log(v2());
    console.log(v3());
    console.log(v4());

    // Now let's call them with await
    const r1 = await v1();
    const r2 = await v2();
    const r3 = await v3();
    const r4 = await v4();
    console.log(r1);
    console.log(r2);
    console.log(r3);
    console.log(r4);
}

test();
```
Here's the printout, with explanation below.
```
42  
Promise { 42 }
Promise { 42 }
Promise { <pending> }

42
42
42
42
```
- `v1()` - prints 42, because `v1` isn't a promise at all, it's just returning a value
- `v2()` - prints a promise, which has already resolved - but is a promise nonetheless
- `v3()` - prints a promise!  The `async` keyword actually transforms the function itself into a promise, which will resolve when all the `await` calls within it have executed.  `v3` has already resolved, but it's still a promise.
- `v4()` - prints a promise too - since the function itself has been transformed to return a promise.  However, the function returned a promise in the first place!  This sounds odd, but now `v4` returns a promise of a promise.  It hasn't resolved yet however, but that's just because JavaScript hasn't gotten to it yet.  When you call `new Promise`, the function you pass is immediately called - in the current code execution cycle (recall our event loop discussion from the beginning of this chapter).  Calling `v4` *implicitely* wraps the code within it in a `new Promise` call, so calling it results in a promise created, which contains code that creates a promise.  That promise (the inner, retrurn 42) promise is created, but is not yet invoked.  Only after the current code is executed will JavaScript get around to invoking that inner promise.  We will come back to this in a moment - it's pretty painful ;)

- `await v1()` - prints 42 - if you `await` a non-promise, it's not an error, it just has no effect.
- `await v2()` - prints 42 - the result of `v2` is a promise, and `await` "blocks" until it resolves.
- `await v3()` - prints 42 - the function returns 42, but recall the `async` keyword turns it into a promise.  The promise is awaited, and we get the resolved result.
- `await v4()` - prints 42 too!  This one is the "magic" one.  We saw when printing the result of `v4` directly, without the await, we ended up with a promise wrapping another promise.  We saw that that inner promise wasn't resolved initially.  `await` unwraps **all** the promises though - so calling `await` on a promise wrapping another promise *resolves both*.  This feels confusing, but it's in almost every case exactly what you want.

Let's return to that `v4` call without the `await`.  We can see it resolve, but we need to allow JavaScript to get around to it.  This is less about giving it time to do so, and more about *giving it a chance*.  Recall the event loop executes a chunk of code, in it's entirety, and returns all the "I/O calls".  Well, that's not 100% true - it returns all the *promises* that aren't resolved.  `v4` resolved the outer promise, but the inner promise is a byproduct.  That is queued, and will execute *after* all the current code is executed (the rest of the `test` function).  

We can use `setTimeout` to demonstrate:

```js

const test = async () => {

    const _v4 = v4();
    console.log(_v4); // Promise <pending>

    setTimeout(() => {
        console.log(_v4); // Promise <42>
    }, 1)

    // Now let's call them with await
    ...
}

test();

```
In the code above, all of `test` executes in it's entirety.  The promise *returned* by `v4` is queued, and exectutes **after** `test` completes, resolving immediately to `42`.  The amount of time we call `setTimeout` with is inconsequential - even 1 millisecond is fine.  The important point is that it is *queueing* the `console.log` code in the `setTimeout` call to be **after** the promise inside `v4` is resolved.

The above is hard to grasp, and it's ok if it feels very confusing.  In most cases, you will `await` any function that is marked as `async`, and whether it explicityly returns a promise or not, the `await` call unwraps and resolves *all* of them.  So in practice, this oddity rarely comes into play.

## Promises and `async` / `await`
`async` and `await` operate on promises.  Everywhere we use promises, we *can* use `async` and `await` if we choose.  They all play nicely with eachother.

For example, let's look at the `Promise.all` example from the previous section.

```js
const fs = require('fs');
const read_file = (filename) => {
    return new Promise ((resolve, reject) => {
        fs.readFile(filename, 'utf8', (err, file) => {
            if (file) resolve(file);
            else reject(err);
        })
    })
}

const promises = [read_file('file-1.txt'), read_file('file-2.txt')];
Promise.all(promises).then((files) => {
    combined = append(files[0], files[1])
}).catch((err) => {
    console.error(err);
}
```

We can rewrite the part that waits for all the `read_file` promises to resolve:

```js

const promises = [read_file('file-1.txt'), read_file('file-2.txt')];
try {
    const files = await Promise.all(promises)
} 
catch (err) {
    console.error(err);
}
```
Really the only caveat is that the above code, since it uses the `await` keyword, needs to be in a function, and that function needs to be marked with `async`.  `read_file` need not be changed in any way at all.

**Pro Tip**&#128161; This brings up an important point:  Writing functions that return Promises is a very effective pattern, as the *caller* can choose to use the `then` style of processing **or** `async`/`await`.  If you learn to create promises effectively, you can write very reusable code for asynchronous activites that would be much harder to do with callbacks.


##  Putting it all together
We `await` promises, but only when we are inside `async` functions.  Keep repeating that in your head, and you will be able to put together asynchronous code correctly.  Let's take a look at what started this all, the `parse_body` function we wanted to create for processing HTTP request bodies.

The callback version looked like this:


```js
// The second parameter (done)is a FUNCTION, a callback
// that the caller wants parse_body to call when the 
// body has been parsed. 
const parse_body = (req, done) => {
    let body = "";
    req.on('data', (chunk) => {
        body += chunk;
    });
    req.on('end', () => {
        form_data = qs.parse(body);
        // Call the function we were provided, with 
        // the parsed form data
        done(form_data)
    });
}
const handle_request = (req, res) => {
    parse_body(req, (data) => {
        req.form_data = data;
        serve_page(req, res);
    })
}

http.createServer(handle_request).listen(8080);
```
The promise version looked very similar.

```js
const parse_body = (req) => {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => {
            form_data = qs.parse(body);
            resolve(form_data)
        });
    })
}
const handle_request = (req, res) => {
    parse_body(req).then((data) => {
        req.form_data = data;
        serve_page(req, res);
    });
}

http.createServer(handle_request).listen(8080);
```

Now we can write the promise version using the `async` / `await` syntax:

```js

const parse_body = (req) => {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => {
            form_data = qs.parse(body);
            resolve(form_data)
        });
    })
}
const handle_request = async (req, res) => {
    req.form_data = await parse_body(req);
}

http.createServer(handle_request).listen(8080);
```

A few things should draw your attention in the example above.  First, `parse_body` is identical.  It has not changed in any way.  It is a function that returns a promise.  The result of calling the function is a promise.  Note that it is *not* marked as `async`, because it doesn't `await` anything.  If it were marked as `async`, it wouldn't hurt anything, but it doesn't need to be.

The second thing to note is that `handle_request` **IS** modified in two ways.  The most obvious is that it uses `req.form_data = await parse_body(req)` instead of the promise `then` syntax.  The second change is that it is marked as `async`.  This *allows* it to `await` the promise returned from `parse_body`.