# Credentials on the Server
We've managed to solve the problem of exposing plain text passwords on the network by using HTTPs encryption.  The next challenge we have is *storing* passwords, such that we can check a user's credentials when they are submitted.

We all know the basic structure of how a server must keep track of it's uses:

1. Users will have account identifiers, such as a username.  Often, the username is their email address - but it can be anything that *uniquely* identifies them within the appliction.
2. In order to *prove* the person is the real user, we ask the user to create a *password*.  Passwords should be secrets, that only the user knows.  We'll discuss password strength later - but the key here is that strictly speaking, *only the user should know their password*.
3. When the user attempts to login, they send (over HTTPS/TLS) their username and their password.  The server must verify that (1) the username exists, (2) that the supplied password is the correct password.

Points #2 and #3 appear to be in conflict.  If the user is sending a password over the internet, and the server must *verify* that the supplied password is the correct one - then clearly **the server must know the user's password**.  This violates #2 above though - which is no good.

## Where do we store passwords?

## How do we store passwords?

### Salt

## How secure is this strategy?
When done correctly, it's really secure!

## Anti-patterns
The first time students read this chapter, the curious ones immediately start to think of *other options*.  Here's a few that come up from time to time:

1. Why don't we hash the password *client side*, since then we never send the real password over the network anyway.  **Answer**:  In this scenario, we are sending a crypographic hash of the password over either a secure or insecure network.  If the network is *insecure*, then you can assume the hash can be stolen.  If the hash is stolen, and the attacker subsequently sends the username/hash combination, then the server (expecting usernames and hashes to be sent to it for authentication) happily checks the hash and lets the attacker in.  No problem has actually been solved - essentially the hash *has become the password*.  The answer is the network needs to be secure.  Of course, if the network is secure, you can simply send plain text over it.  

2. Why dont' we encrypt the password, so if the user forgets it, we can tell them what it was?  **Answer**:  All encryption is reversable, which means there must be a *decryption* key stored somewhere on the server.  In the discussion above, we noted that by using strong hashing, we could literally give an attacker the entire user database, and the attacker would *still* not be able to do anything with it (provided users picked decent passwords).  Using encrytion significantly weakens this, because in that case, if an attacker gained access they would likely also have the decryption key.  Recall, attackers can be employees, or people with legitimate access to the server.  Putting *everyones* password just one decryption key away from being known is terribly risky.  It's an unnecessary risk, and one that really isn't worth it.   Telling the user their original password means you need to display it to them in plain text, on a screen - and maybe in an email or text message.  This is risky.

3.  Should we hash the hash, or do X more times to make things more secure?  **Answer**:  It's not necessary.  If you follow the best-practices as described above, you are good.  Any additional encryption, re-hashing, etc is ultimately not really improving upon much.  

**Pro Tip**&#128161; An attacker who has gained access to the physical server presents serious risks.  The most critical risks are that (1) they can acquire the private HTTPs keys, and (2) can inspect application memory.  Obtaining the private key for HTTPs presents problems that we've described before - but recall that doing so would then still require the attacker to successfully perform a man-in-the-middle attack on someone.  In addition, assuming the breach became known, the HTTPs certificate could be revoked immediately, eliminating on going security risk.  If the attacker can inspect main memory, they can potentially intercept plain text passwords as well.  At some point, the plain text password will be contained in a *decrypted* message body, albeit briefly.  You as an application program can only minimize the attack opportunity.  **Never** store plain text passwords in sessions, or any other variable that survives a request/response cycle.  **Never** print plain text passwords to log files!  If the an attacker can inspect memory, and the breach is discovered, it's critical that *all* passwords are invalidated - and users are required to change their password.  The damage is done however.  Unlike HTTS private keys that no longer present a risk after they are revoked, stolen passwords are forever.  Most users (even though they shouldn't) reuse passwords.  Once an attacker knows a username/password combination, even if your application no longer uses the stolen credentials, the attacker will attempt to use the stolen credentials on hundreds of other sites.  If the user chose the same username and password on other sites, then it's bad news.

## Password Strength (and their importance).