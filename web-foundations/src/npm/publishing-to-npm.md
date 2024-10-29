# Publishing to NPM
We have two reusable modules from the previous chapter:

1. Game - the game logic for the guessing game
2. GuessDb - the database code for the guessing game

It's a stretch to think that other people (who aren't reading this book) might want to use these packages - but I suppose it's possible. It's very possible *we* will use these modules in a different versions of the guessing game though - so they are pretty decent examples to think about *distributing* or *publishing*.

Let's get started with the game logic - the `Game` class first. We'll learn how to prepare our module for NPM, and publish it.  Then we will do the same for the database, and finally we will create a new version of our app, using those dependencies installed directly from NPM!

First let's create a directory structure to work within:
```
/guess-packages
    - /app   --- this will have our actual runnable app
    - /game  --- this will have the Game class, and be a separate npm module
    - /db    --- this will have the GuessDatabase class, and also be a separate module.
```

**Pro Tip**&#128161; You **do not** need to do all the actions described in this section.  If you don't want to publish your version of the guessing game, that is totally fine - just follow along so you understand how to do it.  At some point, if you write enough Node.js code, you are likely to want to publish *something*!

## Preparing the Game module
Go ahead and get the [game class code](https://github.com/freezer333/web-foundations/blob/main/code/guessing-game-03-db/game.js) from the previous example, and add it to `/guess-packages/game`, you can keep the filename as `game.js` too.  The `Game` class is exported from `game.js`, and has zero dependencies - so it's very simple to prepare it for NPM.

In order to create a package, the directory must contain a `package.json` file that describes the package.  The easiest way to start that is to type the following from within the `/guess-packages/game` directory:

```bash
npm init
```
This command will prompt you for some information.  First is the *package name*.  It will default to "game", but we probably want to be more specific, since we will want to use the same name to identify it on NPM's global registry.  Let's choose `wf-guess-game`

```
package name: (game) guess-game
```
Next `npm init` will ask for a version number, description - we can keep the default version (1.0) and enter anything we'd like for description.

The **entry point** will use the default `game.js`, and since we haven't written any automated tests, we'll leave the *test command* blank.  For the git repository, I used the book's git repository in my example, and you can use something else if you wish.  Keywords, author, and license is up to you (I chose MIT license).

Once you choose the license, `npm init` will show you the `package.json` file it will create, and as you to confirm it.

```json
{
  "name": "wf-guess-game",
  "version": "1.0.0",
  "description": "Logic for Foundations of Web Development guessing game",
  "main": "game.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/freezer333"
  },
  "author": "",
  "license": "MIT"
}

```

At this point, you should have a `package.json` and a `game.js` file within the `/guess-packages/game` directory.


**Before moving on, please RENAME the package (the name inside the `package.json` file) to have something specific to you, if you intend on uploading this yourself. Otherwise, if you keep the same name, you won't be able to upload - as it will be in conflict!**

### Sign Up and Log In to npm
If you don’t already have an npm account, you’ll need to create one on [npm’s website](https://www.npmjs.com/signup). 

Once you have an account, log in to npm through the command line:  `npm login`.  You will be prompted to enter your user credentials.

### Publishing
It's critical that when you publish to NPM you are sure you aren't publishing any sensitive information.  NPM is *public*.  Check for any `.env` files (we don't have one right now for Game).

The command to publish is `npm publish`.  If all goes well, it should print out a notice that the module was published.  

```
npm publish
npm notice 
npm notice 📦  wf-guess-game@1.0.0
npm notice === Tarball Contents === 
npm notice 995B game.js     
npm notice 350B package.json
npm notice === Tarball Details === 
npm notice name:          wf-guess-game                           
npm notice version:       1.0.0                                   
npm notice filename:      wf-guess-game-1.0.0.tgz                 
npm notice package size:  670 B                                   
npm notice unpacked size: 1.3 kB                                  
npm notice shasum:        d58566cfcbf0d56e183b94d309148ce3d21d919a
npm notice integrity:     sha512-osmeudGc/J6fI[...]AYuD1FtfMAVcw==
npm notice total files:   2                                       
npm notice 
npm notice Publishing to https://registry.npmjs.org/ with tag latest and default access
+ wf-guess-game@1.0.0
```

Head over to [https://www.npmjs.com/package/wf-guess-game](https://www.npmjs.com/package/wf-guess-game) - it's there!  I added a readme.md file, but otherwise it's exactly what we've created over the past few sections.

## Preparing the Database module
Now copy the [database code](https://github.com/freezer333/web-foundations/blob/main/code/guessing-game-03-db/guess-db.js) into the `/guess-packages/db` folder, and do another `npm init`.  This will create the `package.json`.

Again, we will want to pick a rather unique name.  I'm going to use `wf-guess-db`, and if you plan to publish the code yourself you need to publish as something different.


```
npm init
package name: (db) wf-guess-db
version: (1.0.0) 
description: Database wrapper code for the Foundations of Web Development guessing game database
entry point: (guess-db.js) 
test command: 
git repository: 
keywords: 
author: 
license: (ISC) 
About to write to /Users/sfrees/projects/web-foundations/code/guessing-packages/db/package.json:

{
  "name": "wf-guess-db",
  "version": "1.0.0",
  "description": "Database wrapper code for the Foundations of Web Development guessing game database",
  "main": "guess-db.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/freezer333"
  },
  "author": "",
  "license": "ISC"
}


Is this OK? (yes) 
```

**Important**: the guessing game database wrapper code uses `better-sqlite3` as a dependency.  This will need to be added to `package.json` as well.

```
npm install better-sqlite3
```

You can ensure that it is properly installed by viewing the modified `package.json` file, which should now have it listed as a dependency.

```json
{
  "name": "wf-guess-db",
  "version": "1.0.0",
  "description": "Database wrapper code for the Foundations of Web Development guessing game database",
  "main": "guess-db.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "better-sqlite3": "^11.5.0"
  }
}
```

Note again, there **should be no `.env` file or any other sensitive information** when you execute `npm publish`.

```
npm publish
npm notice 
npm notice 📦  wf-guess-db@1.0.0
npm notice === Tarball Contents === 
npm notice 2.5kB guess-db.js 
npm notice 350B  package.json
npm notice === Tarball Details === 
npm notice name:          wf-guess-db                             
npm notice version:       1.0.0                                   
npm notice filename:      wf-guess-db-1.0.0.tgz                   
npm notice package size:  1.1 kB                                  
npm notice unpacked size: 2.8 kB                                  
npm notice shasum:        70fe5526b90752d19d12860ce79ce21065051a3a
npm notice integrity:     sha512-KPezdgZskc8ZQ[...]dohHUanLmXIWQ==
npm notice total files:   2                                       
npm notice 
npm notice Publishing to https://registry.npmjs.org/ with tag latest and default access
+ wf-guess-db@1.0.0
```

## Using our modules
Now for the exciting part!  Copy three files from the previous example into the `/guess-packages/app` directory - the `.env` file, `framework.js` and `guess.js` files.  **These should be the only files in the directory**.

```bash
# contents of .env file

```

In the `guess.js` file, note that the original `require` statements are referencing *relative* file paths for `Game` and `GuessDatabase`.

```js
const Framework = require('./framework');
const http = require('http');

// Relative Requires
const Game = require('./game').Game;
const GuessDatabase = require('./guess-db').GuessDatabase;

require('dotenv').config();

...

```

We are now going to change these, because we will be installing these dependencies from NPM.  They will go into `node_modules`, and will be referenced like any other package we install.  We refer to them using the name we published to NPM - `wf-guess-game` and `wf-guess-db`.

```js
// We didn't publish framework, we just copied it in. We'll leave it like this for now.
const Framework = require('./framework');
const http = require('http');

// Relative Requires
const Game = require('wf-guess-game').Game;
const GuessDatabase = require('wf-guess-db').GuessDatabase;

require('dotenv').config();
...

```
If we run the `guess.js` file now, we **should** receive an error, since we haven't installed our dependencies.

```
node guess.js 
node:internal/modules/cjs/loader:1073
  throw err;
  ^

Error: Cannot find module 'wf-guess-game'
Require stack:
...
```

Let's install them, and try again.  We will also need `dotenv` while we are at it.  We will **not** need to install `better-sqlite3` because it will automatically get pulled in by `wf-guess-db`.

```
npm install wf-guess-game wf-guess-db dotenv
node guess
```
That should work, and the application should be up and running!

## Some finishing touches
Since we have a `dotenv` file, it's good practice to use it to define the PORT number the web application runs on.  We can modify the last line of `guess.js` to use the environment variable, if it is present:

```js
http.createServer((req, res) => { router.on_request(req, res) }).listen(process.env.PORT || 8080);
```

Finally, having `./framework.js` be a relative dependency seems counter to what we've been doing - and certainly a web framework would be reusable!  We've been copying it over between examples for a while now. 

The framework code is also published to NPM, under `wf-framework`. We can edit the code to use that, and remove the `framework.js` file from the `guess-packages/app` directory, and do an `npm install wf-framework`.

Our final code, in **its entirety** is as follows:

```js

```

The framework, Game class, and GuessDatabase classes are all pulled in from NPM.  We will start our next Guessing Game application by simply installing them again!



