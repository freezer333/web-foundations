# Working with Databases

-- What it's like to use a database

-- LInk to SQL stuff, we aren't going to really focus on this.

-- First - why.

    -- Recall back to last guess example.  
    -- When the app stops and restarts, the data is gone
    -- Make clear why can't that be a solution.  Apps always restart.

    -- Discuss breifly, scale.  One database, more web app processes.

-- We will use sqlite.  Hugely popular, but probably not as much on web apps.  However, it makes for simple examples, and our code design won't change with others like postgres.  The nice part is there is no separate process we need to deal with - it's managed entirely through the library we will install.

-- First let's create some tables, mimicking our last code example.  Game, Guess.  Creating the file inside the application directory. 

    --- install the CLI

    https://sqlite.org/download.html


   -- Tables


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


---- Data Cleanup, Data Bootstrapping, Createing a Guessing Game Wrapper

    - On start up, clear out incomplete games
        - Talk about the potential security problem here..  pro tip - public data entry is really bad.
        - Add the D in CRUD!
        - wrapping connect and clean up in a start up funciton
        - discuss why foreign keys should have been used, but they are not (Or can we just use them?)
    - On start, create the tables if they don't exist
        - Importance of keeping your programs PORTABLE
        - Maybe seperate scripts too.