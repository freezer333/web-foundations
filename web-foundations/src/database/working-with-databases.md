# Working with Databases
In the previous chapter, we enhanced our guessing game example to record games played, along with the guesses made by users.  We created a history page that let us view these past games.  There's one problem though - *whenever the server application restarts, that data is lost*!  We all know that's not a sustainable limitation.  We need **persistant** data storage - not just in web applications, but in *most* applications.

A few notes before we get started with databases:

## Why don't we just make sure the server doesn't restart?
If you are relatively new to programming, you might be asking - why would a web server application restart in the first place?  Why does the data need to be held somewhere other than memory?  You might be thinking that *real* web applications should be designed so they don't crash, and should be run on machines with backup power (or in the cloud!).  

**This isn't practical**, and it's not realistic.  **All programs eventually crash**, even programs [running on intersteller spacecraft](https://www.eejournal.com/article/jpl-software-update-rescues-failing-voyager-1-spacecraft/).  Your web application will need to be restarted.

Reliability is actually much more meaningfully achieved by designing applications that are robust *in the event of failure*.  This means that if you are aiming to make things reliable, your first mission is to make sure your application can smoothly *restart* and get right back up and running when something unexpected happens to kill it.  

It's called *resiliancy*.  You worry about limiting the number of times you need to be resiliant... after you are resiliant.

## Why Databases, Why not Files?
Students who do not know a whole lot about databases often reflexively turn to *files* instead of databases.  In fact, in the previous chapter we saw that the `require` statement can be used to read JSON files into our application.  It's easy to imagine combining that with `fs` to write modified JSON files back to disk in order to *persist* you data to JSON files.  JSON files are nice for structured data - so why not?  

The first part of the answer is that files have a number of limitations:  They can become corrupted - especially when multiple programs attempt to write to them at the same time.  They can also become quite large, and are typically very difficult to read *partially*.  For example, a small JSON file containing guessing game records might work well while you have had a few hundred people play the game.  Once the guessing game gains in popularity though (it's only a matter of time &#x1F61C;), the file you are storing the games in could become many gigabytes.  You won't want to read the entire file at once, and serve a page with billions of records - so you'd need to figure out how to read only *parts* of the JSON file.  Suddenly `require` isn't that great (it can't do this), and you start thinking about custom parsing.  You'll then start to question your decisions.

The second part of the answer is actually related to the first.  The main reason you shouldn't store application data in regular files (text, JSON, XML, or otherwise) is because files are *incredibly limited* in functionality when compared to databases!  Databases allow your application to read and edit data without caring whether other programs are doing the same.  Databases allow your application to read *exactly* the information you need - and *no more* - when you need it.  

Files can be good for storing config data (although lots of applications use databases for *most* config data), and files can be OK in some cases when you have data that is necessarily *readonly* and fairly small.  *For all other use cases*, those who design applications around file storage often end up implementing many of the same features (at least eventually) that databases would have given them in the first place - and those implementations tend to be much more limited and sometimes flawed.

The reality is that *persistant* and *editable* data is really hard to do well.  You need to worry about data durability (corruption), consistency (when multiple programs are reading and editing it) and scaling and efficiency.  The fields of **database design** has largely **solved** these problems - you just need to learn how to use  it!

## What is a database, really?
A database is data, but it is also **code**.  This book isn't about databases, you will be given a lot of links at the end of this section for further reading, but we need to understand some basic principles.

When we talk about data, we are talking about *application* data.  This data is *structured* - meaning it's not just plain text (although it of course is likely to contain lots of text too).  It's the user account data, it's the guessing game records, it's all the analytics keeping track of page views and clicks.  The data will be edited.  New data will be created, and sometimes deleted.  When you read the data, you aren't likely to ever need *all of it* at the same time, you usually just want specific parts of it.

*Databases* are the application data on disk (usually), but *databases* are also **the code** that implements all the creating, reading, updating, and deleting of the data.  It's the code that organizes the data on disk, such that it can be efficiently retrieved - indexed and queries.  It is also the code that implements *synchronization*, allowing multiple programs to read and edit the data simultaneously without data corruption.  A small amount of this code is the responsibility of the *application programmer*, but MOST of it is code *within* the database - either running as a separate process on the machine, or in a library of code embedded within the application code itself.

Let's look briefly at both designs, before turning our focus solely to the former:

### Databases as separate processes
Most database systems you've likely heard of fall into this category.  PostgreSQL, MS SQL Server, Oracle DB - these are all databases that run a separate programs.  The programs (they are typcally called databases "servers", in much the same way as our web applications have web "servers") are completely distinct from the applications that *connect* to them - the clients.

![Db processes](../images/db-processes.png)

In the diagram above, *clients* (for example, our web application server!) *connect* to the server and send **queries** to it.  The queries are structured text commands, describing the data being requested.  In most cases, that structured query is written in the **S**tructured **Q**uery **L**anguage - SQL.  The *connection* process might be through pipes if the client and database server are on the same machine, but can also (and often) be through network sockets when the database server is on a separate physical computer.  The network connection procedures are in many ways similar to web browsers and web servers - in that we need to know the IP address and the port number to connect to.

The critical thing to take away from this is that programs interact with the database server by sending SQL commands to it, and the database server sends back structured results in the form of *records*.  The client (and the application programmer, to some extend) is responsible for sending the correct SQL for the data it needs, and handling the results.  The database server is responsible for handling and fullfilling the request - including data consistency, synchronization, and efficiency.

### Databases as code library
While having the database implemented as a separate process is often required, there are many situations where it is not entirely necessary.  An alternative is having all the code responsible for handling and fullfilling SQL requests included in a *library* that the application you are writing simply calls.  Think of this like doing `require` or `#include`, with a set of function calls to invoke SQL, rather than sending SQL over a socket or pipe connection to a separate process.  

The difference in design is important, however from a purely code perspective, the differences aren't dramatic.  Since the library needs to know where the database files are, there is still some sort of *initialization* where you "open" a connection to the database - but this time there is no pipe or socket involved.  At that point, you send SQL and receive results back, the fact that the SQL and results aren't crossing a process boundary or a network boundry is largely hidden.

![Db in proicess](../images/database-in-process.png)

The most notable in-process database is [SQLite](https://www.sqlite.org/).  SQLite is a C library that implements a full featured SQL relational database.  [It is the the most widely used and deployed database i\n the world](https://www.sqlite.org/mostdeployed.html).  It is exceptionally fast, easy to install, runs everywhere and it's open source.  We are going to use it exclusively in this book.

Note, web applications generally use database *servers* - separate processes.  This is because web applications tend to scale quite large (or at least, they plan to).  This scaling normally requires the web application to be splintered into *many* web server applications all running identical code - with a load balancing application routing network traffic to different servers to handle the requests.  When you have multiple programs accessing the same database, having a separate server - generally on a different computer - is more attractive, and can provide more synchronization safety.  **Again**, this isn't a database book - and we'll leave this discussion alone for now.  Just understand that we are using SQLite in this book **for simplicity**, not because it's likely to be your choice when creating a full scale web application.  *Nothing* about SQLite in terms of application design, or SQL, is going to be any different than PostgreSQL, Oracle, MS SQLServer, etc - they are all relational databases and will function quite similarly *from a code perspective*.


## Getting Started with SQLite
We are going to cover databases entirely through example - and that example will be the *guessing game* application.  Before we do anything with our application code, we need to *create* a database using SQLite.  While eventually we will actually do this step *through Node.js code*, we are going to start out doing this outside of our application - using the SQLite command line tool itself.

First step - download SQLite and install on your platform.  You can find downloads and instructions for all major platforms [here](https://www.sqlite.org/download.html).  **Note**, download SQLite means downloading the SQLite command line tool - there is no "database server", there's just a C library.  The command line tool is a command line (terminal) user interface for creating SQL commands, and invoking the C library code to execute the SQL commands themselves.

Once you've downloaded it, you should be able to type the following on your command line or terminal:

```
% sqlite3
SQLite version 3.43.2 2023-10-10 13:08:14
Enter ".help" for usage hints.
Connected to a transient in-memory database.
Use ".open FILENAME" to reopen on a persistent database.
sqlite> 
```
You can type `Ctrl+D` to exit.  The prinout above explains that by just invoking `sqlite3` you've created (and connected to) a *transient* in-memory database.  This is nice for testing, but it's not why we are here - we want persistance!

We are going to create a *new* version of the guessing game application from the previous chapter(s).  Go ahead and create a folder on your machine called `guessing-db` (or whatever you wish), and navigate your command line / terminal to that location.  Now, let's actually create a *database file* in that directory:


```
% sqlite3 guess.db
SQLite version 3.43.2 2023-10-10 13:08:14
Enter ".help" for usage hints.
sqlite> 
```
Typing `sqlite3 guess.db` creates and opens a database file at the current working directory.  Let's create a *table* in our database - which is where we will hold all the game records for our application.  

```
sqlite> create table game (id integer primary key, secret integer, completed integer, time text);

```
Press enter after the `;`, and the table will be created.  This table will eventually hold one row per game played.

If you type `Ctrl+D` again, to exit, you can view the database file itself.  Do a `dir` or `ls` and you will see "guess.db" there.  It's a *binary* file, you won't really be able to view it just yet.

Before moving to the application code, let's get a feel for how data will be added to the database itself.  Let's again open up a connection to `guess.db` and this time insert a new game record.  Ordinarily, it's our application that would do this - but for now we will just make up some values to store:


```
sqlite3 guess.db
SQLite version 3.43.2 2023-10-10 13:08:14
Enter ".help" for usage hints.
sqlite> insert into game (secret, completed, time) values (5, 1, "yesterday");
```
Exit out again with `Ctrl+d`.  The `insert` statement above inserted a row into the the database file.  If you do a `dir` or `ls`, you might notice there are more bytes associated with the file now (although on some platforms there might not be any change, due to pre-allocation of disk space when the database file was created).

Open the database file again, and this time issue a `select` statement to view the current data held in the `game` table.  It's the same data we entered.

```
sqlite> select * from game;
1|5|1|yesterday
```
There's no reason to keep exiting `sqlite3`, you can continue to add things, and read things, and delete things.  Feel free to experiment if you want.  We are going to use SQL in simple ways throughout this chapter, nothing particularly fancy.  SQLite contains documentation for SQL (particularly, the dialect of SQL it understands) [here](https://www.sqlite.org/lang.html).  There are many resources for SQL on the web as well:

- [SQLite SQL Documentation](https://www.sqlite.org/lang.html)
- [WWW Schools Tutorial](https://www.w3schools.com/sql/)
- [SQL Zoo](https://sqlzoo.net/wiki/SQL_Tutorial)


## Accessing SQLite from Node.js
You should have already created a dedicated directory on your machine for the application we are building in this section, and `guess.db` should be the only file in it.

Next, copy the `framework.js` and `guess.js` files from the previous chapter's final example.  You can find that source code in it's entirety [here](../../../code/guessing-game-first-framework/)




First off, copy the application code from the previous example (LINK).



--- Connecting to the database from our code
    --- npm install sqllite

    --- dotenv - never put credentials and connection information in your code!
        --- source control
        --- deployment

    --- Reference next chapter -that's where we will use discuss npm install in more depth.

    --- Async because this is a file of course!

        --- 

---- Quickly review the create/read/update and the connect code.  Discuss the actual functions, and show that they are being put into a separate file.
    --- Separate section here... and make clear we aren't covering SQL.  Link out!

---- Start editing, removing the games variables, instead creating a database and connecting to it.
        --- no await outside functions... instant requests?

---- Update game_lookup
---- Update start (creating a game).
     --- Talk about automatic primary keys
---- Update places with await.-
---- Adding guesses to DB and marking as complete.
    - Add a guess list page for each game.

