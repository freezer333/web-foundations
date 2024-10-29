# Using NPM
In previous chapters we created a *module* for a web framework with some simple routing and parsing.  Modules promote *code reuse*, and since so much of the logic of web applications is shared between every web application you write, *there tends to be a lot of code reuse*.

We also created some more specific modules in the last chapter - one for the guessing game *logic* and one for the database. While these are much more specific to our efforts, they are possibly reusable later as well.

Reusable code is made far more valuable when it is *distributable*.  The ability to pull reusable modules into your code with ease is a tremendous "power up", because it allows you to make use of high quality components maintained by the wider community.  One of the biggest strengths (although sometimes it's a weakness!) of Node.js is the ease of accessing and contribnuting to this ecosystem of reusable code modules.



## Node Package Manager
The **N**ode **P**ackage **M**anager - `npm` - is our gateway into the wider development community in Node.js.  `npm` gives you access to *hundreds of thousands* of open source modules (packages) that you can use within your own program.  We already saw two such modules: `dotenv` and `better-sqlite3`.  At the time of this writing, the `dotenv` modules is being  downloaded over 42 *million* times per week, and there are over 50,000 known `npm` modules that depend on it.  `better-sqlite3` is downloaded over 750 thousand times per week.  There are many modules with sort of broad adoption.

**Pro Tip**&#128161; The ease in which you can install `npm` packages, *and the ease in which you can publish your own packages* is a double-edged sword.  Not every package on `npm` is a good package - in fact, most are not!  There is controversy within the developer community as to whether or not it's actually a good idea to be installing packages written by strangers.  Common sense goes a long way here though.  If you can write something yourself without a lot of effort, then don't install something from `npm` - just write it yourself.  If it's a lot of effort, or you know there are edge cases that would take a lot of skill to handle - **and the job isn't a core part of the program you are creating** - then take a look at `npm`.  Be cautious - if you find a package that has very little usage, be skeptical - and review the code.  If you find a package that's downloaded and used by millions every week, have more confidence.  Generally speaking, a heavily used `npm` package has been vetted a lot more than an obscure one.

## `npm install`
`npm` is a command line tool installed on your machine when you install Node.js.  The npm install command is used to download and install packages (modules) and their dependencies to a project. It enables developers to add new libraries or tools to their project, simplifying code management by avoiding the need to manually download and link external JavaScript libraries. The command can be used to install packages locally within a specific project or globally to make them accessible across your system.


## Basic Usage

To install a package locally, run:

```bash

npm install package-name
```

This downloads the package and creates a `node_modules` directory if it doesn’t already exist in the project root. The installed package will be added to the dependencies section of `package.json` (if it’s set up), ensuring that it’s automatically installed when others set up the project. For instance:

```bash

npm install dotenv
```

This command installs the `dotenv` locally and adds it as a dependency in package.json.  If we are to take a look at the `package.json` file of our last guessing game application, which also used `better-sqlite3`, we'd see the following:

```json
{
  "dependencies": {
    "better-sqlite3": "^11.5.0",
    "dotenv": "^16.4.5"
  }
}

```
Note the specific version listed.  By default, when we use `npm install` it will install the latest version of the module - however we can also install different versions.  To install a specific version of a module with npm, you can specify the desired version number after the package name using the @ symbol. This is useful when you need to ensure compatibility with other parts of your project or avoid potential breaking changes in newer versions.

```bash
npm install package-name@version
```
For example, if for some reason we wanted an older version of `better-sqlite3`, we could install it as follows:

```bash
npm install better-sqlite3@7.6.2
```
If you want flexibility but still want to avoid breaking changes, you can specify version ranges:

- Caret (^): Installs the latest minor/patch updates, but not major updates. For example, ^1.2.3 allows updates up to, but not including, 2.0.0.

```bash

npm install dotenv@^16.0.0
```
- Tilde (~): Installs the latest patch updates within the same minor version. For example, ~1.2.3 allows updates up to, but not including, 1.3.0.

```bash
npm install better-sqlite3@~7.6.0
```

##  Dependencies of Dependencies.
Modules that you install might depend on *other* modules. When you do an `npm install` on a particular module, you also install that module's dependencies.

Let's take a look at `better-sqlite3`.  It actually uses two *other* packages - `bindings` and `prebuild-install`. These modules assist in compilation of the sqlite C lanaguge libraries, which needs to happen when installing `better-sqlite3`.  The beauty of `npm` is that you do not need to know this - it automatically install **all** dependencies, recursively.

## Installing all your dependencies
Perhaps the nicest thing about `npm install` is that it *always* adds the package being installed to `package.json`.  Thus, `package.json` becomes a complete listing of all your dependencies.  Typically, when you distribute your program (or add it to `git`), you leave out your dependencies (leave out `node_modules`), and **only** include your `package.json` file.  

To install all dependencies listed in package.json for a project, simply use npm install without specifying a package name:

```bash
npm install
```
This command reads the package.json file, downloads all listed dependencies, and places them in node_modules. This is particularly useful for setting up a project from a version-controlled repository where the dependencies are listed in package.json but aren’t included directly.


Going forward, we will start adding *lots* of dependencies to our projects. We will start gaining a tremendous set of features this way.  We will *never* distribute our application with the `node_modules` directory however, just the `package.json` file.  

## Where are all these modules coming from?
You might be wondering... how do you know which packages are out there?  `npm` works (by default) with the official Node.js package registry - [www.npmjs.com](https://www.npmjs.com).  The site is fully searchable, and contains thousands and thousands of packages.  One of the reasons it has so many is that it's actually *really* easy to publish to.  In the next section, we'll see how easy it is - and publish some of our guessing game components to it. 