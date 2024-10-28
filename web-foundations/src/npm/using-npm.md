# Using NPM
In the previous chapter we create a *module* for a web framework with some simple routing and parsing.  Modules promote *code reuse*, and since so much of the logic of web applications is shared between every web application you write, *there tends to be a lot of code reuse*.

Our module for parsing request bodies is very simplistic - it doesn't cover some of the edge cases involved.  Request body parsing is such a common core feature of web applications, it seems to make sense that it's *worth the time* to get it perfect though.  For such a critical piece of code, we could spend a lot of time writing our own module - but we should also consider the fact that there is a community of developers all working on web applications.  We should consider what's out there!

## Node Package Manager
The **N**ode **P**ackage **M**anager - `npm` - is our gateway into the wider development community in Node.js.  `npm` gives you access to *hundreds of thousands* of open source modules (packages) that you can use within your own program.  These modules do the mundane (i.e. parse request bodies) the the much more exciting (we'll see some soon!).

**Pro Tip**&#128161; The ease in which you can install `npm` packages, *and the ease in which you can publish your own packages* is a double-edged sword.  Not every package on `npm` is a good package - in fact, most are not!  There is controversy within the developer community as to whether or not it's actually a good idea to be installing packages written by strangers.  Common sense goes a long way here though.  If you can write something yourself without a lot of effort, then don't install something from `npm` - just write it yourself.  If it's a lot of effort, or you know there are edge cases that would take a lot of skill to handle - **and the job isn't a core part of the program you are creating** - then take a look at `npm`.  Be cautious - if you find a package that has very little usage, be skeptical - and review the code.  If you find a package that's downloaded and used by millions every week, have more confidence.  Generally speaking, a heavily used `npm` package has been vetted a lot more than an obscure one.

To get started, let's focus on request body parsing.  

## `npm install`

## `package.json` and the `node_modules` directory