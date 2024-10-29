# Database maintenance
Web applications get *deployed* in a lot of places.  They get deployed on the developer's machine, while they are creating and maintaining it.  They are often deployed on testing machines, and beta machines before moving to *production* machines. On each machine, it's not uncommon to have *different* settings and configurations enabled.  One of the most common things that is different from machine to machine is *which database is used*.

In the case of SQLite, the database is identified (in code) as a filename.  For other databases (for example, PostgresSQL), a more elaborate *connection string* might be used - one that includes the host name, port number, and **credentials** for accessing the database.  Maybe something like this:

```
postgresql://username:notarealpassword@guessinggamedb.com:5432/guess
```
There are a few rules that all software developer need to understand.  They are codified in what's called the [Twelve Factor App](https://12factor.net/), but really the ones we are talking about here have been well known in software development on their own for many decades.  **Do not break these rules**:

1.  Never, ever, put user credentials (usernames and password) in source code. **Never**.  **Ever**.
2.  Configuration variables are best kept in *environment variables* that the application reads, rather than within source code or other configuration files.

Rule 1 is the most important. Source code get's added to source code control (ie github).  Source code control creates a permenant record of changes - so once something is in source code, it's likely accessible through source code control even if the current revision no longer has it.  Anything you put in source code has a very real chance (accidental or otherwise) of being shared.  Usernames and passwords should **never** be in source code.  

There's a practical disadvantage of having user credentials is source code too however - beyond the *extremely serious security hazard it presents*.  When you deploy applications to developer environments, test environments, and production environments - it's very unlikely that user credentials will be the same in all of those places.  In fact, if they are, that's probably a sign of very poor security in it's own right!  If user credentials vary depending on where to code runs, putting those credentials in source code means you must edit source code to deploy the application.  **This is incredibly poor practice**, and leaves you at a tremendous disadvantage.

Rule 2 leads us to the solution for user credentials, along with other application configuration parameters.  Rule 2 is all about *where* applications settings should be stored - and the answer is *environment variables*.  Environment variables are key-value pairs set outside of an application code that the operating system manages and provides to running applications. They allow developers to configure an application’s behavior without changing its code, often storing sensitive information like API keys, database credentials, or configuration settings. Environment variables help make applications more flexible, as settings can be adjusted across different environments (e.g., development, staging, production) by simply changing the variable values in the environment, rather than modifying the code itself.

Environment variables are set typically using the operating system's shell (command line, terminal).  For example, in Linux or MacOS, you can set a variable by issuing the following command:

```bash
export MY_VARIABLE="my_value"
```
In Windows, it would be something like this:
```bash
set MY_VARIABLE=my_value
```
Once set, these variables are accessible to programs running within that shell.  In Node.js, environment variables can be accessed using the `process.env` object:

```js
console.log('MY VARIABLE is set to => ', process.env.MY_VARIABLE);
// Prints "my_value"
```
These envrionment variable can be set "permanently" for specific users by adding the appropriate commands to start up scripts (e.g. `~./bachrc`) or system-side (e.g. `/etc/envrionment`).

## DotEnv
It's common for application configuration variables to be set on test and production envionments through the facilites described above.  Those machines are typically provisioned infrequently, and so it makes sense to set these variables once, and have them available whenever the application is run.  This all ensures that configuration variables never appear in source code (actual code, or other files), and cannot be easily read by others.

On developer machines, in particular when the configuration variables may vary significantly, it's often more convenient to define *all* configuration variables in a single file.  The important caveat here is that this file *is never added to source code control*.  Typically, this file has a very specific name: `.env`.  In UNIX-like system, files that begin with *dot* are hidden, and in most `.gitignore` files `.env` is excluded from source control.  

`.env` files typically are placed at the root of a project directory.  They are simple text files, with one name/value pair per line.  For example, a configuration file may look something like this:

```bash
PORT=3000
DB=postgresql://username:notarealpassword@guessinggamedb.com:5432/guess
```

**Important:**: A `.env` file is not read *directly* by an application.  Instead, application code is always written such that configuration variables are read from environment variables (`process.env`). `.env` files are *imported* into the environemnt, and applciation code reads from the environment.   This distinction is critical - because it means that application code will receive configuration variables *regardless of how they were added to the environment* - the application is **not** dependent on a `.env` file.

To load a `.env` file into the environment, we typically use a third-party module.  In Node.js, that module is called `dotenv`.  It's very simple to install, and very easy to add to our code.

```bash
npm install dotenv
```

Inside our application, we can load our `.env` into the environment by doing the following code **first**, before any other code executes:

```js
require('dotenv').config();
console.log('MY VARIABLE is set to => ', process.env.MY_VARIABLE);
```
The code above will print the value of `MY_VARIABLE` under the following circumstances:

1. MY_VARIABLE was set using the command line (eg. `export MY_VARIABLE="my_value"`)
2. OR defined in `.env` file

Note, the code above *does not fail* if there is no `.env` file.  However, if there is no `.env` file, or `MY_VARIABLE` isn't defined in `.env`, **and** `MY_VARIABLE` wasn't defined through any othere means, *then it is undefined*.

## Integrating Database Connection Configuration
All of the above leads us to an important code change in our Guessing Game application.  Rather than having the following at the top of our code:

```js
const db = sql('guess.db');
```
It's better practice to use a `.env` file:

```bash
# comments start with #, this is the inside of our .env file
DB_FILENAME=guess.db
```
We will install `dotenv` - 

```bash
npm install --save dotenv
```
And finally, in our code we will use the value found in the environment:

```js
require('dotenv').config();

...

if (!process.env.DB_FILENAME) {
    console.error(`DB_FILENAME environment variable is required.`);
    process.exit(1);
}
const db = sql(process.env.DB_FILENAME);

```
It's good practice to fail, and print out an appropriate error message if a configuration variable is missing.  Sometimes, we might use default values (for example, port 8080 for the web server port if not specified) - however for things like database credentials it is generally advisable to just fail.

## Database Cleanup
Our guessing game application has a problem, one that can only *partially* be solved in this chapter.  The problem is that it is **wide open** to attack - in the form of *data creation*.

Remember, your web server receives *all* web requests - whether those web requests are the ones you expect or not.  Also recall that literally *any* program can send a web request.  With this in mind, let's take a look at a specific web request that we *expect* to receive:

```
POST /guess HTTP/1.1
Host: guessinggame.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 20

gameId=123&guess=5
```
That's a guess.  It's generated when a user submits our form, entering in a guess.   However, that's not the only way we can receive that HTTP request.  In fact, a malicious attacker could write a program that generates that request and sends it to our web servers *thousands* of times a minute.  That type of program is typically called a *bot*.

**Why is that a problem?**  It's a problem because we are saving guesses to the database, directly.  The number of guesses is unbounded, and an attacker could easily cause our database to grow to many gigabytes.  This problem cannot be entirely prevented unless we require login, or at the very least put in place some type of bot deterrent.  We'll discuss CAPTCHAs later in the book, which are a deterrent for this type of security risk.

**Pro Tip**&#128161; Do not underestimate the likelyhood you will encounter malicious bots. As soon as you put an application on the web, in a matter of days, the URL will be noticed - whether you advertise it or not.  It's only a matter of time that a bot finds it, and probes it by generating requests.  These bots are not necessarily exploiting anything, but they are probing - and they **will** submit forms.  Your code needs to be careful, it needs to validate form data (and not crash when it's nonesense, since bots usually submit nonsense).  You need to avoid data creation in response to bots, otherwise you could easily end up with a database full of nonsense.

Assuming we prevented automated bots from blasting the guessing game application with bogus guesses however, we still have a data hygene problem.  Users may play the guessing game, and given it's difficulty, give up without completing.  Over time, the number of guess game *attempts* might start to get really large - and we might want to consider *clearing* uncompleted games.  This might be done by a separate script, or it could just be done on application startup - as a way to ensure it at least happens every once and a while.

Here's some code that we might want to execute on application start up (in `guess.js`) to sweep out all the uncompleted games.  Note, since `guesses` contains a foreign key refrence to the `game` table, the guesses will automatically get deleted when the corresponding game is.

```js
const router = new Framework.Router();
router.get('/', start);
router.post('/', guess, true, schema);
router.get('/history', history);
router.get('/history', game_history, true, [{ key: 'gameId', type: 'int', required: true }]);

// Delete all the incomplete games on startup.
db.prepare('delete from game where completed = ?').run(0);

http.createServer((req, res) => { router.on_request(req, res) }).listen(8080);
```

This isn't rocket science. The goal here is to get you used to thinking about database maintenance as being *part of the application*.  The days have having a separate person designated as "Database Administrator" are gone.   In most cases, software developers are responsible for maintaining databases, along with their applications - and typically there is a benefit if routine tasks are performed *by code* in the application - rather as separate jobs.

## Database Bootstrapping
Speaking of performing routine database tasks... recall that we created the database, and the tables, using the `sqlite3` command line tool.  The schema (table names, column types, constraints) were never actually captured in our code.  **This is a true anti-pattern**.  We want our applications to be *deployable*, and we want that deployment to be repeatable, predictable, and easy.  If each time we want run the program on a new machine, we need to *manually create the database*, we have a brittle and cumberson deployment process - and we have failed!

Database schema (table names, columns, constraints) go hand in hand with code.  Our code clearly depends on the database table names, the column names and data types, and the constraints between them.  Modern software development manages the database *schema* **as code**, and that code is right along side the rest of the application code.

**Your application should include code to build your database**.  In many cases, the code that builds your database can actually be run *automatically* on start up - carefully checking to see if the database has been created already or not.   If so, then nothing to do - if not, then the code can create it. This way, your application is easily deployed *anywhere*, because it will create it's own database as needed.

Recall how we created our tables:

```sql

```

Those are just plain old SQL statements. We can execute them through our application code too.  SQL even contains a nice addon to the `CREATE TABLE` statement to only create the table if it doesn't exist - avoiding any need to check to avoid overwriting data.


```js


```

We can add this to our startup procedure, and our application is now fully able to *bootstrap* itself when starting up for the first time.

Alternatively (and more commonly), application code will exist within the main application to create a database, and also to peform changes to it.  In most cases, that code is run *on deploy*, but not necessarily *on startup*. Nevertheless, for simple apps like Guessing Game, creating the database on startup makes a lot of sense.


