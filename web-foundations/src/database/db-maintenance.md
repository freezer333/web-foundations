# Database maintenance
---- Data Cleanup, Data Bootstrapping, Createing a Guessing Game Wrapper

    - On start up, clear out incomplete games
        - Talk about the potential security problem here..  pro tip - public data entry is really bad.
        - Add the D in CRUD!
        - wrapping connect and clean up in a start up funciton
        - discuss why foreign keys should have been used, but they are not (Or can we just use them?)
    - On start, create the tables if they don't exist
        - Importance of keeping your programs PORTABLE
        - Maybe seperate scripts too.