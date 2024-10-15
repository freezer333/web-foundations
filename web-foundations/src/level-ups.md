# Part 2
Everything we've covered up to this chapter amounts to the **core** functionality of the web.  We can think of web development as two main branches of development: client-side (frontend) and serverside (backend), with HTTP being the network protocol that glues them together.  On the front end, HTML is foundational - we don't have web pages without HTML.  We'll need to look deeper into the front end to add interactivity (client-side JavaScript) and styling (CSS), but we have the basics.  On the backend, we've covered HTTP parsing and socket programming, but we are currently programming our backend like it's 1989... we need to do a lot better.  

The second part of this book focuses on *leveling up* our concepts of programming on the backend.  Most of the topics we cover will translate to *any* backend serverside programming language pretty well, although we are going to start out with some more nuts and bolts of JavaScript programming.  The chapters will be shorter, and more targeted to a specific aim - rather than covering entire languages and protocols.  

We are learning how to **do things better**:
1. Organizing our code (parsing, routing)
2. Persisting data (databases)
3. Smarter HTML generation (templates)
4. Managing state between requests/responses (sessions)

Along the way, we'll learn about *asynchronous* JavaScript, which is a prerequisite for interacting with databases, and leveraging so much of the JavaScript and Node.js ecosystem of libraries.  We'll also start to explore that ecosystem - the Nodejs Package Manager (`npm`).  We'll start replacing some of our own code with industry leading libraries and frameworks, like [](Express) too.  By the time we are done with the next half dozen chapters, you will be up to speed with how web server development actually works in modern web development, and will have the skills to start working on just about any Node.js backend.