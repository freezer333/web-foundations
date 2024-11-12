# Sessions
Cookies are stored client-side.  Cookies should be *small*, and they shouldn't contain anything particularly sensitive.  So, what about when we want to associate a lot of data with a set of requests made by a client over time.  For example, what if we have a shopping cart with lots of things in it.  What if we are writing a web app where people write lots of text - like a blog creator or something like that?

We've already seen the basic concept.  The cookie can simply be *an identifier* that points to a larger record.  That record could contain *anything*.  That record **doesn't get transmitted over the network, necessarily* - only the *identifier*.  For point of reference, that "record" might actually be an entry in a physical database - just like we did with `gameId` for the Guessing Game.

What we have is an *arbitrarily* structured and stored *blob* of data, accessible using an *identifer*.  The *identifier* is held onto and kept between requests using *cookies*.  **The concept we are describing is called a *session**.

## What are sessions?
Sessions refer to blobs of data - which generally are somewhat structured - that stay *on the server*.  They might have data about the current user, their application data, etc.  Sessions are accessed using a *session id*, which is created on the first request seen by a particualr client.  When the session id (and empty session) is created, the session id is *set* as a cookie on all future responses to the client.  All future client requests will contain the session id cookie, and thus when we receive a request on the server, the server code can *find* the correct **session** for the request by examining the session id cookie.

Sessions are optional (from the user's perspective), because cookies are optional.  Sessions can be attacked in all the same ways as cookies - because cookies facilitate sessions.  For example, if you can steal someone's cookies, you might find one of them is a session id.  That doesn't give you access to the session data - but you might be able to craft a new HTTP request to the server to at least trick it into giving you some of it!

Generally speaking, you as the web developer can put anything - secret, sensitive, or otherwise - in a session, because you aren't sending the session data to the client.  The exceptions to this are (1) if you add session data to the response's HTML, then all bets are off and (2) if the server is hacked, the attacker may be able to see session data.

Enabling sessions is really easy - we could implement them ourselves.  To be honest, we already almost did!  Sessions are so common however, they are included in just about every web framework imaginable.  In Express, we can *enable* sessions as such:

```bash
npm install express-session
```

```js
const app = express();

app.use(session({
  secret: 'this is used to protect your data',
  cookie: { secure: true }
}))

```
The `express-session` middleware has other options, which you are encouraged to [review](https://www.npmjs.com/package/express-session).  This includes the ability to have a session *expire*, which is pretty standard fair.  This is partially accomplished by setting the underlying session ID cookie to expire, but the module also ensure that the server side session data is purged after the expiration time as well.  The session implementation is using cookies to implement the session.  The `secret` attribtue is used to encyrpt the session data to thwart a subset of potential attacks (this does not mean the session data is every transmitted).  Most importantly, `express-session` can be extended to work with *persistant* storage rather than the default *in-memory* session storage.  This allows session data to be *transparently* saved and retrieved by the middleware to and from databases.  That means when a web server restarts, session data isn't lost. It also means that as you grow, and need multiple web servers behind load balancers, your sessions will still work!  **Almost never, should you use in-memory sessions**.  You can view the list of supported *session stores* on the  `express-session` [npm site](https://www.npmjs.com/package/express-session).  There's even a `better-sqlite3` session store :)

Access sessions is a breeze.  Since the middleware automatically creates a session if there is no session id cookie with an incoming request, you can always assume there is a session object created on the `req` object your route receives.  The session might be empty, but it will be there:


```js
router.get('/', (req, res) => {
    req.session.foo = "we can add anythign to this!"
}
router.get('/foo', (req, res) => {
    console.log(req.session.foo);
})

```