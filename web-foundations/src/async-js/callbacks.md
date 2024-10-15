# Why Callbacks?
One of the strangest concepts for most students just starting out with JavaScript is the *callback* function.  We learned about it when we saw a few of our very first JavaScript programs - the networking examples in Chapter 2.  Given callback were present in such early examples, it shouldn't be shocking to learn that *callback* are related to JavaScript at a deeply fundamental way. 

Let's refresh with an example we've already seen:

```js
const http = require('http');

const handle_request = (req, res) => {
    // Intepret the request, build 
    // and send a response
}

const server = http.createServer(handle_request);
server.listen(8080, 'localhost');
```
The above example is how we write HTTP server code.  We define a function, and then tell the http server *instance* we created to call it, whenever an HTTP request arrives on the underlying network socket.  `handle_request` is a *callback function*.  

Take some time to think about the following:

1. When will that function get called?
2. How many times will that function get called?
3. Can that function get called twice, at the same time?

The answer to #1 is... **who knows!**.  The server (which is where this code is running) doesn't control *when* an HTTP request is received.  That depends on when a web browser, on a computer potentially across the globe, creates such a request!  We know the `handle_request` function gets called **if and when** an HTTP request is received, but we have absolutely no way of knowing *if and when* such a request will be received.

Could we instead have a function to just wait for a request, and return a corresponding object (containing the parsed request, and a ready-to-use response object)?

```js
const rr = httpServer.waitForRequest();
handle_request(rr.req, rr.res)
```

This seems more deterministic, and more natural to someone who is more accustomed to programming in other languages.  The code implies (by the function name) that we want to *wait* for an incoming request, and then once it arrives we want to process it.  Notice that we still don't know how long we will wait.  It's the same situation, it's just written differently.  It does seem a little easier to think about, since it's a *linear* style of programming.

On to question 2 - how many times will it be called?  Again, we can't answer this question.  We may receive one request, we could receive ten thousand requests.  We might even recieve *zero* requests.  The code we started with isn't concerned - it's just telling `server` that *whenever*, and *everytime* a request is received, call `handle_request`.  

To do the same with our hypothetical `waitForRequest` function, we'd need some sort of loop:

```js
while (true) {
    const rr = server.waitForRequest();
    handle_request(rr.req, rr.res);
}
```
The loop above is explicetly waiting and processing, in sequence, over and over again.  It's important that you keep thinking back to the callback example at the beginning of this section - *it's doing the same things*, the difference is that the loop isn't in your code, **it's somewhere else**!  Let that sink in - they are the same, it's just that you've passed `handle_request` to the `server` object, and *somewhere* in the server object's code, there's a loop that is calling it!

Now what about question 3 - will we receive two requests at the same time?  The answer is... *maybe*.  We can't control whether two people click a button on their phone at the same time, and generate two HTTP requests to our web server at the same time.  It's just luck.

Taking the looping example above, where we call `waitForRequest` then `handle_request`, what happens when `handle_request` is called?  It takes **some** amount of time to do the request processing and generating the response.  How much time?  Hard to say.  Let's take it to an extreme, and say it takes **one second**.  What happens when we receive a *second* request during the time we are processing the first?

**This gets us to the core of the problem**.  By definition, in the looping code, we are **either** waiting for a request or we are handling a request.  If a request comes in while we are handling another, what happens to the request?  There are two possibilities:

1.  The incoming request is queued *by some other process*
2.  The incoming request is dropped.

Option 1 seems way better, but in order for that to happen, it means *some other* process (program) on your computer is reading the incoming network bytes, and is willing to *hold on to them* until you decide to "wait" for another request - at which point it hands it over to you.

In reality, there is a program doing this already - it's your **operating system**.  It will cache *some* network traffic - but not much.  Making matters more difficult is that each time more requests arrive while you are processing the previous ones, **you will fall further and further behind**.  A queue of incoming requests will build, and eventually the operating system will begin dropping the network traffic.  Worse yet, clients will stop waiting, and abandon the request.  

The solution is to **build your own queue**, and figure out a way to process things "faster", usually by processing multiple requests *in parallel*.  Without getting into too much detail, we end up with something like this:

```js
// Will continue to receive http requests, and
// put each on a queue.  This happens in a new thread
server.start_receiving();
while (true) {
    // Blocks until there is a request in the queue
    const rr = server.next();

    // Handles the request in a new thread, allowing
    // the loop to return to the top immediately.
    new Thread(handle_request(rr.req, rr.res))'
}
```
If you aren't familiar with multithreaded code, this might seem complex.  If you *are* familiar with multithreaded code, this *should* seem complex.  Multithreaded code allows the programmer to execute sequences of code in parallel, with each sequence running independently of each other.  They don't wait for each other.  This makes it easier to do things faster, especailly on machines with multiple CPUs.  It also makes things harder to program - issues like race conditions and synchronization abound.  Creating new threads for each request can pay off, but it doesn't come for free either.  The operating system is required to create new threads, and that means we must make API calls to it - incurring additional time.

What is being described above is *dispatch*.  Dispatch is a situation where we are receiving incoming jobs, and each job is being independently handled by independent code.  There is logic required to *queue* incoming jobs and *dispatch* the jobs to appropriate code.  It's a simple concept, that becomes complex when dealing with high volume and performance requirements.  Webservers need to handle high volume, and users expect performance.

This is a huge topic, we could spend several chapters discussing the ins and outs of multithreaded programming.  The goal here however is to motivate *why* callaback functions exist.  Callback functions are an elegant encoding of the dispatch problem.  

```js
const handle_request = (req, res) => {
    // Intepret the request, build 
    // and send a response
}

const server = http.createServer(handle_request);
server.listen(8080, 'localhost');
```

The code above *is doing dispatch*, but dispatch is happening within `server`, not our own code.  We are simply saying - use `handle_request` when you dispatch a request.  We are giving `server` the function to call *in the loop*, but we are letting `server` deal with the loop itself.



## Multiple Streams
There's a secondary benefit to handling the dispatch problem with callbacks rather than a dedicated loop.  Let's create a new more abstract example.  Suppose you have **two** sources of incoming jobs (A and B).  Each time a job is received, the job must be dispatched to a separate handler - based on the type of job that is received - `handle_a`, `handle_b`.  You don't know when the jobs will arrive, and you can't assume they will arrive in any particular order.  You may recieve five jobs of type A before ever receiving a job of type B.

How can we replicate our dedicated loop?  


We can't have two loops, because we need to be able to handle a mix of incoming jobs.  We can't handle all the A jobs before B jobs!

```js
// This won't work!  We never leave
// the first loop!
while (true) {
    const a = server.waitForA();
    handle_a(a);
}
while (true) {
    const b = server.waitForB();
    handle_b(b);
}
```
We'd instead need to do something like this:

```js
while (true) {
    const a_or_b = server.waitForA_or_B();
    if (a_or_b is a)
        handle_a(a_or_b.a);
    else
        handle_b(a_or_b.);
}
```
Pretty awkward.  Now what if we have 5 different job types, with 5 different job sources?  We'd have to have all sorts of combinations of `waitFor` functions, and then big branches in our loop to figure out which event we need to process.

This is where callbacks start to really shine:

```js
const handle_a = (a) => {
    // ...
}

const handle_b = (a) => {
    // ...
}

server.onA(handle_a);
server.onB(handle_b);
```
Notice how that scales.  It's because the loop structure and the dispatch is *within* server. It's written once - with all the necessary complexity and care - and now the programmer may leverage all that work by simply registering callback functions.  `handle_a` and `handle_b` could be called thousands of times.  If we have more jobs types, we simply create more handlers.

The examples above are fairly abstract

### What is I/O, really?

### Blocking Model
Explain how I/O really works in C++.  OS, going to slepp.

### Non-Blocking Model
Node.js and Asynchronous I/O.  Your program isn't put to sleep.


## Advantages of Asynchronous Programming
When not serial, can do things naturally in parallel.

Can have a higher throughput on lots of I/O events, because process isn't being put to sleep

Many reasons for multi-threaded programming are because of IO blocking.  Without I/O blocking, no need
for threads.  Simpler programming.  Circular arguments - right?

## Events vs Results
Demonstrate the difference between socket.on(data) and socket.read() from a conceptual standpoint.  Explain that Node.js treats files, networks, etc as streams - where data and end are *events*.   


Some things are easier to think of as events.  Mouse clicks.  Requests from a client.  Other things might be easier (sometimes) to think of as results.  Read next byte.

## Callback Patterns and Anti-Patterns
Importance of handling errors.  Conventions (err, data)
Introduce callback hell.