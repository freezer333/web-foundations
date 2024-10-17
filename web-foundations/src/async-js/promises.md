# Promises
JavaScript, and thus Node.js were dominated by the callback style of coding whenever there was I/O work to be done (and sometimes other types of work) for quite a time.  At the same time however, other languages, and some JavaScript libraries as well, promoted a different take on the idea of "call this later".  Instead of treating the idea as purely *function oriented*, an effort was made to think of the problem from a more *object oriented* perspective.

Take the following:

```js
const when_complete = (err, result) => {
    if (err) {
        // handle error
    } else {
        // handle result
    }
}

long_task(when_complete);
```
The code above is clearly modeling the idea that *whenever* the long task completes, we want to do something with the result.  Whether that is an error state, or an actual result - we have more work to do.  In the callback style of code above, we model what we want to do simply by providing a function that `long_task` *promises* to call when it's done.

There are also other styles of doing this too.  `long_task`, could accept *two* functions - one that should get called when there is an error, and another when there is a true result.  The commonality though is that `long_task` presumably *produces* either an error or data, but since we are using asynchronous programming, `long_task` doesn't *return* that result - it has to give it to the caller indirectly, through a callback.  It's sort of awkward to return anything from an asynchronous function that uses callbacks, because the function is returning *before* the computation is complete!

A *Promise* object, as proposed within the JavaScript community in 2009, represents the *future* result of a function or computation.  A *Promise* is really truly an *object*.  The idea behind it is that an asynchronous function returns a *Promise* to the caller.  The *Promise* is something that the caller can inspect, and can also wait for (by attaching callbacks).  Truly, a *Promise* decouples the asynchronous function from the *result* - which enables us to write code in a bit more clean way.

## Promise States
Promises have *states*, that are actually pretty intuitive.  At any given time, a promise is:

- **fullfilled**:  completed successfully, presumably with a resulting value
- **rejected**:  completed with error.  The operation failed, and presumably there's an error associated with this.
- **pending**:  Neither fulfilled or rejected.  The computation is not done.

A promise is said to be *settled* when it has reached either the **fullfilled** or the **rejected** state.  While it's possible to inspect the state directly, typically we just want to know **when** it's state reaches either fullfilled or rejected - and to do that, we can attach callbacks to the promise.  

### Fullfillment
We attach callbacks to the promise fullfillment using it's `then` method.  Any callback attached via `then` will be called whenever the promise resolved without error.  Importantly, **even if the promise is already fullfilled when the callback is added with `then`, the callback is called**!

### Rejection
We can attach a callback to handle the promise rejection using the `catch` method.  The catch method is called if the promise when the promise is rejected.

### Settlment
If you want something to happen after fullfillment **or** rejection - meaning, regardless of whether the promise's computation succeeds or fails, you can register a callback with `finally`.

### Promise Example
Now let's suppose the original `long_task` function uses promises instead of callbacks.

```js
const on_success = (result) => {
    // Handle result
}
const on_fail = (err) => {
    // Handle error
}

// Long task returns a Promise object
const p = long_task();

p.then(on_success)
p.catch(on_fail);
```
Promises are *chainable*, and errors *propogate*.  For example, while the example above attaches a fullfillment callback and reject callback to promise `p`, we can take advantage of chaining and propagation to write the same thing this way:

```js
const p = long_task();
p.then(on_success).catch(on_fail);
```
The above attaches fullfillment `on_success` to `p`.  `then` returns *a new promise* associated with the code inside `on_success`.  That promise is fulfilled when `on_success` executes.  The `catch` method is called *on that second promise*, but it will catch errors on `p` and the `on_success` promise due to error propagation.

In fact, most developers don't even bother to store the promise as a variable - although there is absolutely nothing wrong with doing so (some would argue its actually more clear to do so!).

```js
long_task().then(on_success).catch(on_fail);
```
Since developers typically like to embed anonymous functions when they are fairly short, you will also commonly see the following:

```js
long_task.then((result) => {
    // Handle the result (success)
}).catch((err) => {
    // Handle the error
});
```
It's a matter of preference, but the last example is most common.

## Sequencing
We saw earlier how attempting to do multiple asynchronous calls in sequence creates a nightmare with callbacks.  

```js
task1((err, result) => {
    if (err) {
        console.log(err);
        return
    }
    task2(result, (err, second_result) => {
        if (err) {
            console.log(err);
            return
        }
        task3(second_results, (err, third_result) => {
            if (err) {
            console.log(err);
            return
        }
            console.log(third_result);
        });
    });
});
```
Each call  to `then` on a promise *creates a new promise`.  This allows for more succinct chaining.

```js
task1(result).then((result) => {
    task2(result);
}).then((second_result) => {
    task3(second_result);
}).then((third_result) => {
    console.log(third_result)
}).catch((e) {
    console.error(e);
});
```
The syntax above is more succinct, which is nice.  More importantly, there is one error handler instead of three separate handlers - which is more than nice, it's signifcantly better design.

Here's a more concrete example from the previous section. We are fetching variables from a database, in a sequence with a dependency.  Here's how we did it with callbacks:

```js
db.fetch('a', (err1, v1) => {
    if (err1 ) {
        console.error(err1);
        return;
    }
    if (v1 % 2 === 0) {
        db.fetch('b', (err2, v2) => {
            if (err2 ) {
                console.error(err2);
                return;
            }
            db.fetch('d', (err3, v3) => {   
                if (err3 ) {
                    console.error(err3);
                    return;
                }
                console.log((v1 + v2) * d);
            })
        })
    }
    else {
        db.fetch('c', (err2, v2) => {
            if (err2 ) {
                console.error(err2);
                return;
            }
            db.fetch('d', (err3, v3) => {   
                if (err3 ) {
                    console.error(err3);
                    return;
                }
                console.log((v1 + v2) * d);
            })
        })
    }
}
```
Here's how we might accomplish the same with promises, assuming `db.fetch` returned a promise rather than accepted a callback.

```js
let a, bc;
db.fetch('a').then(
    (v1) => {
        a = v1;
        if (a %2 === 0) {
            return db.fetch('b');
        } else {
            return db.fetch('c');
        }
    }
).then((v2) => {
    bc = v2;
    return db.fetch('d');
}).then((v3) => {
    console.log((a + bc) * v3);
}).catch ((err) => {
    console.error(err);
});
```

## 1st Class Promises
Promises are built right into JavaScript.  This wasn't always the case, and some older libraries do have compatablity issues - however most modern JavaScript makes full use of the built in Promise object.  The beauty of this is that you can rely on how Promises work, from library to library.  Perhaps the biggest advantage of the `Promise` over callbacks is exactly this - **standardization**.

## Making Promises
A promise is actually just an object that maintains three lists of callbacks - one that should be called when the promise is fullfilled, one list of callbacks to be called when it fails, and one list of callbacks for when it settles - no matter what it's state.  A *consumer* of a `Promise` object usually will use `then`, `catch`, and `finally` to add callbacks to the list - since the *consumer* will want to do something when the computation resolves.

If you are *producting* a `Promise`, you are creating a promise that you will need to eventually *resolve* or *reject*, indicating the computation has completed.  In addition, you will need to actually *do the things you are promising to do!*.

To create a promise, you create a new instance of `Promise`, which *requires* you to pass in a function.  This function represents *the thing you are promising to do*.  It is *the long running task*.  The function will automatically get called for you, as soon as the promise is created.  The function is called with two *callbacks* - `resolve` and `reject` - that your code should call if it wants to indicate the promise has been fulfilled or rejected!

Let's take a look at what `long_task` might look like.

```js
const long_task = () => {
    const p = new Promise( (resolve, reject) => {
        let retval;
        // .. Do something for a long time... and if 
        // we succeed, set retval, otherwise set retval to null.

        if (retval) {
            resolve(retval);
        } else {
            reject('No value was produced');
        }
    })

    return p;
}

```
The code above *creates* a promise.  We didn't actuall define what the long running task was, instead just describing in comments.  The point is that after doing the long running task, we can choose to either call the `resolve` function or the `reject` function.  After creating the promise, we return it.

After the promise is created, the function we wrote (the one with the commends about retval) is actually called.  If `resolve` is called, then any callbacks added with `then` will be called.  If the `reject` function is called, then any callbacks added with `catch` are called.

Let's make this less abstract though - and look at the `readFile` example from the last section.  This can be our long running task.

```js
const fs = require('fs');

const long_task = () => {

    const p = new Promise( (resolve, reject) => {
       fs.readFile('bigfile.txt', 'utf8', (err, file) => {
            if (err) reject(err);
            else resolve(file);
        });
    })

    return p;
}

long_task().then((f) => {
    console.log("File Data");
    console.log(f);
}).catch((e) => {
    console.error(e);
}
```
We effectively wrapped the call to `readFile`, which is callback-based, in a promise.

## Body Parsing, with Promises
We motivated some of this discussion with our example of using request body parsing.  Let's take a look at what that looks like with promises.


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
It's not that different!  The real benefit of Promises are that they are more easily chainable - where we add many callbacks to the same promise with `then`, and easier to create control flows with.

## Utilities for Control Flow
We've already seen how *sequences* of promises is a bit easier to express compared to sequences of callbacks.  Another area where promises shine is when we want to do something after *all* of a set of promises complete, or *any* of a set of promises complete.  This is fairly challenging to do well with callbacks, since every callback needs to check the state of all the rest - leading to code duplication.  This was evident in one of the examples from the last section - where we started reading two files, and wanted to append them together once they **both** had been read:

```js
const fs = require('fs');
let file1 = null;
let file2 = null;

fs.readFile('file-1.txt', 'utf8', (err, f1) => {
    // Error handling omitted for readability
    file1 = f1;
    if (file2) {
        combined = append(file1, file2);
    }
});
fs.readFile('file-2.txt', 'utf8', (err, f2) => {
    // Error handling omitted for readability
    file2 = f2;
    if (file1) {
        combined = append(file1, file2);
    }
});

```

Let's design this better now, taking advantage of promises, and the global promise functions - `Promise.all`, which creates a promise that is fulfilled when *every* promise passed (as an array) is fullfilled.

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
The `Promise.all` function accepts an array of promises.  Notice how we created those - we createed an array, with two elements - *the results of calling read_file*.  `read_file` returns a promise, so the `promises` array has two promises.

`Promise.all` creates a new promise, which is fulfilled when each of the promises in the given array are fullfilled.  The `then` callback receives these results as an array, and processing can continue from there.  If any of the promises fall, the associated `catch` is called. 

Similar workflows can be defiend with `Promise.any`, which fullfills when any (one) of the promises passed as an array is fullfilled.  If you are only interested in completion - either fullfillment or rejection, you can also use `Promise.allSettled` and `Promise.race`.

## Almost there...?
When promises began replacing callbacks, there were two camps of JavaScript developers.  One camp felt like promises were amazing, and a huge step forward.  Others (the author included)  sort of shrugged.  They change things a bit, and certainly for the better, but the code still sort of looks similar.  There is less nesting, but all the `then` and `catch` stuff is still awkward to anyone who learned to program with other languages.

There was one killer feature of promises however, and once peeople saw it, there was no going back.  It's a lot easier to standardize around a *built in* object representing future results, with a *standard* API, then it is to enforce standards in callbacks.  

The **standardization** of the `Promise` object **was a game changer** in JavaScript, because it allowed the language to *continue* to evolve and introduce two kewords that would drastically improve developer ergonomics:  `async` and `await`.  With those keywords, we can write JavaScript code that handles `Promise` objects *as if* they were blocking code - while still **not being blocking code**.  With that change, we can start writing code the way we do in blocking languages, while **still maintaining many of the benefits** of asynchronous coding.  We can also start handling errors in ways that we are more accustomed to - *as exceptsion*.

Promises took us from this:

```js
long_task((err, f) => {
    if (err) {
        console.error(err);
    }
    else {
        console.log("File Data");
        console.log(f);
    }
})

```

To this:

```js
long_task().then((f) => {
    console.log("File Data");
    console.log(f);
}).catch((e) => {
    console.error(e);
}

```

And `async` and `await` take us here:

```js
try {
    const f = await long_task();
    console.log("File Data");
    console.log(f);
} 
catch (e) {
    console.error(e);
}

```

## More reading
You can learn a lot more about Promises.  While for the most part, they are hidden once we move to usins `async` and `await`, those keywords **require** Promises to work - so there's no escaping them!

- [Promises - Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [Using Promises - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
- [Promises - States and Fates](https://github.com/domenic/promises-unwrapping/blob/master/docs/states-and-fates.md)
