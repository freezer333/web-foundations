# Cookies
Part 2 of this book (starting with Chapter 7, Asynchronous JavaScript) has thus far been mostly focused on *code*, and a lot less about concepts specifically related to web development.  We've leveled up in terms integrating databases (Model), working with HTML templates (View), and organizing our code around routes (Controller).  We've learned about bringing in third party dependencies, and finally creating a full fledged MVC design centered on Express.  

Now, in the last few chapters of Part 2, we return to learning about *new concepts* (for us) in web development.  The first set of concepts is covered in this chapter - cookies and sessions.  These are enabling technologies and strategies that provide *state management* to web applications - and ultimately lead us to being able to think more carefully about authentication and authorization in the next chapter.

## The *hidden* input field - the magic cookie
When we developed the very first version of the Guessing Game app, we confronted a problem.  The initial page load (an HTTP GET request to `/`) generated a secret number on the server, and subsequent guesses (HTTP POST requests sent to `/`) needed to be *compared* against the original secret number.  There was no way to do that entirely on the server however.  Every incoming HTTP request is independent.  We couldn't set a variable in the route code, since that route function terminates once the HTTP response is generated.  We couldn't set the secret in a global variable, since new HTTP GET requests could come in, generate new secret numbers, and overwrite the previous. There's no real way to differentiate requests belonging to one game sequence or another, even if we based it on IP address - the user might be running two browsers.  We may have contemplated things like assigning game IDs, and then somehow mapping requests to them - but it wasn't possible with out some coopoeration from the browser.  

The solution we landed on (at first) was to embed a *hidden* input field in the HTML form that was submitted.

```html
<form action='/' method='post'>
    <input name='secret' type='hidden' value=<the secret>/>
    <label for='guess'>
        Enter a Guess:
    </label>
    <input id='guess' name='guess' type='number'/>
    <button type='submit'>Guess</button>
</form>
```
This solution is clever.  The **server** generates that HTML, at the same time it generates the secret number.  It writes the secret number into the **value** of the hidden input.  When the user makes the guess, and submits the form, the *secret* and the *guess* are included in the HTTP POST message.  From there, the server can compare the two - and off we go.

This solution, at it's core, is relying on **the client** to send back information on a subsequent HTTP request.  In this particular solution, the way that information is being sent to the client is by way of being embedded in the HTML.  The mechanism that makes sure the client sends the data back is based on the form submission - the data to be returned is in the form.

We make the input field type *hidden* because it would be a less fun game if the secret was front and center.  The user, if they wanted to cheat, could view the HTML source code however.  In subsequent versions of the guessing game, we fixed this by including a game ID, rather than a secret.  The secret couldn't be derived from the ID, so the end user knowing the ID was meaningless.  On the server side, we could use the ID to *look up* the secret *for that game*.

The concept of recruiting *the client* towards facilitating *state* is not limited to HTML hidden input controls however.  The core concept is that we need to have the client *send along a token* of some kind, with subsequent requests.  The token - which was originally coined "the magic cookie" could be used by the server to look up data representing the sequence of request that have previously come from the client - be it shopping cart contents, a secret number, or literally *anything* else the server needed to keep track of.  The concept was so common,  the term *cookie* became ubiquitious in programming the web, and standard conventions emerged towards enabling *cookies*.

## Review:  HTTP Headers
Recall that every HTTP request and response may contain *header* data.  This header data *is not visible* to the casual user (it's of course accessible, if they really want to see it).  HTTP Headers offer a very convenient and sensible way for the server and client to exchange *cookies* just like we saw with hidden input field, but in a more transparent way - without altering HTML.

Let's say a web server receives a request from a client, and wants to associate a unique ID with this client.  The server can add an **HTTP header** to the *response* sent back to that client.

```
HTTP/1.0 200 OK
Content-type: text/html
Set-Cookie:  id=12345
...rest of response...
```

The `Set-Cookie` HTTP *response* header is instructing the web client (the browser) to set a cookie with a name of `id` to be the value `12345`.  A web server can set many cookies, and can also *advise* the client of an expiration date for the cookies.

```
HTTP/1.0 200 OK
Content-type: text/html
Set-Cookie:  id=12345
Set-Cookie:  something=else; Expires=Thu, 30 Feb 2029 12:49:12 GMT
...rest of response...
```

## Cookies, and choice
When an HTTP response is genrated with the `Set-Cookie` header, you **must** understand that the web server *is simply asking* the client to use this cookie.  The web client is being *asked* by the server to store the cookie value, *and to send the cookie back* on all further requests (until the expiration date, if specified).  If the web browser honors this request, *all subsequent HTTP requests* will contain the cookie as an HTTP header:

```
GET /another.html HTTP/1.1
Host: www.example.com
Cookie:  id=12345; something=else
...
```
The operative word above is **if**.  The web browser does not need to store the cookie, and it certainly doesn't need to send the cookie with future requests.  Perhaps, the application won't work well if the browser doesn't honor the cookie requests - perhaps it will.  That's really up to the server, and what it's using the cookies for in the first place!

## A simple example - Guessing Game
Now we have a new mechanism to keep track of the *game id* associated with the guessing game each web client is participating in.  Rather than including the game id in the form rendered, we can simply set it as a cookie.  We can inspect subsequent requests and lookup the secret number using it.  

**Note**: When the user plays a new game, we just set the cookie again.  Browsers are expected to **overwrite** a cookie value when they receive new values.

There's not much that changes with this new version, so we'll only show the relevant code.  First off, the pug template used to create the HTML form no longer needs a hidden input field at all.

```jade
form(action="/", method="POST")
    label(for="guess") Enter your guess: 
    input(name="guess", placeholder="1-10", type="number", min="1", max="10")
    button(type="submit") Submit
```

The code that generates the first page now needs to be changed just so it consistently sets the `guess` cookie.   

```js
router.get('/', async (req, res) => {
    const game = req.GameDb.add_game(new Game());

    res.set('Set-Cookie', `gameId=${game.id};`);
    res.render('guess', { game });
});

```

The code that receives the guess request must now extract the game id from the *cookie* instead of the request body.

```js
router.post('/', async (req, res) => {
    const cookies = req.headers.cookie;
    if (!cookies) {
        res.status(400).end();
        return;
    }
    const gameId = cookies.split(';').find(cookie => cookie.includes('gameId'));
    const record = req.GameDb.get_game(parseInt(gameId.split('=')[1]));
    if (!record) {
        res.status(404).end();
        return;
    }
    // create a game instance from the record found in the db
    const game = Game.fromRecord(record);
    const response = game.make_guess(req.body.guess);
...
```
That's it.  The guessing game now exchanges game id between browser and server using a cookie instead of a hidden form field.

## Cookies - design
The concept of a cookie allows for many different designs and applications.  A simple example is a *shopping cart* on a website.  Even if you haven't logged in, normally when you visit a stores web page and add somethign to your shopping cart, if you close your browser and come back to the site a few days later, your items are still in your cart.  How does this happen?

1. The first time you visit the store's web site, an ID is assigned - a random ID.
2. That ID is then associated with a record in the web site's database.
3. That ID is sent to your web browser *as a cookie*.
4. Whenever you issue requests (probably an HTTP POST) to add something to your shopping cart, the ID identifying you is sent to the site with the request.  That ID ties to a database record, and the item you are adding is added to the record.
5. Whenever you visit the "shopping cart" page, that's an HTTP GET request, and it will have the ID in the request too.  The ID is used to look up the cart in the database, and the page is rendered with all your items.

Note, the design above doesn't need a login.  The web site doesn't know who you are (yet).  Likewise, unless your cookies are syncing across multiple devices (some web browsers provide this service, so cookies are synced across your phone, tablet, and laptop - for example), opening the store's website on a different device will not result in your shopping cart being full - since that device never received the cookie.

Many, many features can be added to web sites using cookies to uniquely identify a user.  Many of these features are great - like shopping carts.  Some of these "features" are just for the programmers of those sites to do things more easily - which is fair enough!  Sometimes, these "features" are really about *tracking* you - and this is where cookies get a bad reputation.

## Cookies and Privacy
So - how do cookies relate to privacy?  In and of themselves, cookies do not create any privacy concerns whatsoever.  There is an important ingredient to the privacy picture that we need to add to the mix before we have problems.

First off, recall that a web browser only sends cookies it has received *from the same website*.  This means, that if `https://example-1.com` sets a cookie `hi=there`, any futre HTTP requests sents to `https://example-1.com` will include `hi=there` as a cookie - **however** requests to `https://example-2.com` would **NOT** have that cookie attached.  Web browsers *only* sends cookies to a website when they were received from that web site.

### Third Party Content
The missing incredient in the privacy issue is *third party content*, which is inherently part of the design of the web.  Take, for example, the following small HTML page.  Let's assume that this web page is hosted on `https://example.com/third-party.html`:

```html
<!DOCTYPE html>
<html>
    <body>
        <img src="https://images.com/myimage.jpeg"/>
    </body>
</html>
```
The important thing about the example above is we have an HTML page that is loaded from `example.com`, which has an `img` element whose source is from another web site - `images.com`.  No big deal, the image will be rendered without issue.  This is the web working as intended!  An HTTP GET request will load the inital HTML, and a **new** HTTP GET request will be issued to `images.com` to fetch the image.  Two HTTP GET messages, sent to two different places.  Same page load.

As another example, one that involves user intervention:

```html
<!DOCTYPE html>
<html>
    <body>
        <a href="https://links.com/interesting-article.html">Click here</a>
    </body>
</html>
```

Again, there's nothing strange about this - we have a link in our HTML that goes to another site - `links.com`.  This is fundamentally **appropriate** and expected.

So, where's the issue?  The issue is that in both the cases, web browsers will *usually* tack on a simple piece of data that can result in us losing some privacy:  the `Referrer` header.

#### Referrer Header
When an HTTP request is made by the browser, the web browser will often attach an additional header to the request - `Referrer`.  Think about it, unless you type in a URL **directly** into the browser's address bar, or click on a bookmark, *most* HTTP requests are generated by one of two actions:

1. The user clicks a link, to navigate to the page - from another.
2. The HTML loaded contains references to another resource - an image, audio file, video file, iframe, a CSS file, JavaScript file.

Whenever one of those two things happen, the browser *automatically* attaches the `Referrer` header onto the request, and lists the URL the user *was on, when this request was generated**.

Let's re-examine the use case.  A web page is hosted on `https://example.com/third-party.html`:

```html
<!DOCTYPE html>
<html>
    <body>
        <img src="https://images.com/myimage.jpeg"/>
    </body>
</html>
```
When that page loads, a **NEW** HTTP GET request is generated:

```
GET /myimage.jpeg HTTP/1.1
Host: images.com
Referrer:  https://example.com/third-party.html
...

```
We've leaked some information, haven't we.  Now, the web application running `images.com` knows something - it knows we have visited `example.com`, specifically the `third-party.html` page.  

OK - is that really a problem?  It depends.  If `images.com` images are linked from `example.com`, and only `example.com`, not a lot has been learned.  The `images.com` web site doesn't know who you are, personally - and it may not be that interesting that it knows you've also viewed `example.com`.

The example is rather innocent.  Let's now add some details.

- Let's assume that instead of `images.com` being the site that hosts the image that was embedded, the image embedded is an advertisement - and it's hosted on `amazon.com`.  

Why does this suddenly make things different?  First off, Amazon.com is a site you've probably visited.  When you've visited that site, you've definately been assign a cookie - an ID number.  Whether you have an account with Amazon or not, you've received the cookie ID number.  This isn't so bad - you might have a shopping cart to keep track of!

However, now when you visit `example.com`, the HTML instructs the web browser to request an image (and advertisement) from `amazon.com`.  The web browser attaches **two** headers - the `Referrer` - `example.com/third-party.html` **and** the cookie Amazon asked it to use.

Now Amazon knows something.  It nows the person with this ID number visited `example.com`.  Now, let's expand on this idea:

`example.com` (in this hypothetical example) is probably not the only website that embeds advertisements from Amazon.  Let's say you visit 20 website during the course of an afternoon, and 5 of them contain images, audio, video - whatever - from Amazon.  Now Amazon.com knows more about you.  Remember, **every time** you visit one of these sites, the `Referrer` is sent, and the amazon cookie.  If you don't clear your cookies, and you let your web browser do this - Amazon starts to learn a lot about your internet history - because Amazon just so happens to be advertising on *lots of them*.  Carrying this further - Amazon probably knows more about that ID cookie - it's not just for shopping carts.  It's more than likely you actually *do* have an Amazon account.  That ID cookie is associated with your account.  Amazon knows who you are, where you live, what you purchase, *and at least a subset of your internet history*.  Ever wonder how it's so good at showing you advertisements?

It's not just Amazon.  Google is actually *an advertising business*.  Google makes most of it's money off selling ads to businesses.  Those business pay Google a small amount of money each time Google serves their ad on a web page, and a larger amount of money when a user clicks on their ad.  Google, in turn, pays the website that embedded the ad (albeit a smaller amount of money).  This allows website to make money off advertising - while Google takes a cut.  The reason it's worth using Google is because Google is *everywhere*, and can learn *a lot* about you.  The more it knows about you, the easier it is to show you ads that may interest you.  You might click.  Money is made.  Almost every internet advertisment company works on these principles.

Advertising and cookies are a part of the web - whether we like it or not.  We can ask our web browsers to disable cookies, and that will enhance our privacy - since cookies play a critical role in the tracking described above.  Cookies also make shopping carts work, they make guessing games work, and they make logins work.  You can't interact with most of the web if you disable *all* cookies.  We will discuss security a bit more later in this book, and there are things we as developers can do to work with cookies and headers in a way that is safe - and cannot be abused.  These methods will allow our functionality to be enabled on a wide array of browsers - even the privacy strict ones.  The bottom line however - cookies are only a problem when intentially used in a way the user perceives there to be a problem.  Cookies are not dangerous, it's how they are used!

## Cookies - other security considerations
Cookies are HTTP headers.  HTTP headers are plain text.  Cookies are stored on the client machine, and sent over the network on each HTTP request.  Let's consider the implications for a moment:

1. If Cookies are stored on the client, that means cookies leave a trail *on your machine* of potentially what sites you've accessed.  This is separate from your browser's history (although typically when you opt to clear history, you also clear cookies).  Cookies are typically stored in either `txt` files, or in many browser's cases, an SQLite database locally stored on your machine.  *Cookies are viewable* by anyone with access to the machine you visit the sites on.
2. Cookies are transmitted as plain text, they are just part of the HTTP message.  This means that if the Cookie itself contains sensitive data, unless the network traffic is secured over `https`, the cookie values are susceptable to prying eyes.  Packet / Network sniffing *is a real thing*.  When you connect to a public Wifi, or even the Wifi at work, remember that unless you are visiting `https` sites only, the cookies your are sending and receiving can be seen by others.  On an untrusted network, `https` isn't foolproof either - but it's substantially better.

All of the above goes to say - *don't store anything in cookies that is sensitive*.  Cookies can store IDs, and IDs can be associated to sensitive data *on* and *by* the server - but the IDs themselves shouldn't be giving a potential attacker any information.

As a *serverside* web developer, your responsibility is to design your applications in such a way that (1) the *maximum* amount of functionality can  be delivered without cookies as reasonably possible, (2) the server does not always trust cookies sent to it (recall, we can write clients to pretend to send real HTTP requests, with bogus cookies!), and (3) use HTTPs **always**.  More on HTTPs later.

Let's discuss a few other ways we can use cookies more responsibly, as web server developers:

### Preventing Cross Site Request Forgery
Let's imagine you, the consumer, logs into `https://awesomebank.com` - your bank.  Youv'e logged in, so the bank's website knows it's you.  The web site sets a cookie, which associates the client with a logged in status - certain actions can now be taken via HTTP requests, like transfering money - based on the presense of this cookie.  Perhaps the cookie is associating an ID with a bank account.

Now, you (the consumer) accidentially visit `https://awesome-bank.com`.  It's not your bank's website, but it looks like it.  The URL is pretty much the same.  The link came in an email, and it looks *just like your bank*.  When the page loads though, you suspect something is wrong.  You get an alert on your phone - **your transfer to account number `434524589542798` for $500 was successfull...  You don't know that account number.

What happened?  Well, *cookies* are always sent with HTTP requests - no matter how those HTTP requests are generated.  As we will see soon, *client side JavaScript* can run when you load a web page.  In this case, the malicious website `https://awesome-bank.com` had some JavaScript code that issued an HTTP request to **your actual bank**:

```
POST https://awesomebank.com/sendMoney

to:434524589542798
amount: 500
```
The HTTP request was received by your bank, and with it - the cookie that was stored on your machine!  Your bank's website sees the cookie, and blindly trusts that this was a legitamate action.  All the while, the malicious site that had the JavaScript that executed this request is keeping this activity quite.

So - how do we, as web developers, protect our users from this?  It's not good enough to tell them not to visit nasty web sites.  The solution is two parts:

1) Important actions, especially involving money, should require *reauthentication*.  Try to limit how much you trust cookies!
2) Always set `SameSite='strict'`  when setting your cookies.  This tells the web browser that the cookie you are setting should **only** be sent if the web browser is currently at one of your pages.  Essentially, this prevents the cookies (that prove authentication) from being sent when JavaScript *from another website* issues a request to you site.

```
HTTP/1.0 200 OK
Content-type: text/html
Set-Cookie:  id=31241234;SameSite='strict'
```
**Pro Tip**&#128161; The use of `SameSite` inherently distrups Amazon and Google's advertising scheme we described above too, by the way.  Since ads served by other websites will now no longer have the cookies used by the advertising giants to track you, the tracking scheme falls apart.  Alas, Amazon, Google, and all the rest of course know this.  They don't use `SameSite` on their tracking cookies.

### Preventing Cross Site Scripting
Cross Site Scripting - or XSS - is another security threat that can take advantage of cookies.  Let's imagine now that your bank's website - `awesomebank.com` uses third party dependencies.  JavaScript dependencies.  This wouldn't be unusual, we will learn a lot about client-side JavaScript later - and most web sites do indeed use third party JavaScript.  

JavaScript, on the client side, *has access to cookies* by default.  The JavaScript that is loaded with the `awesomebank.com` page *has access to the cookies set by* `awesomebank.com`.  

```js
// This is CLIENT side JavaScript, running in your browser
// We will learn all about it soon
const cookies = document.cookies;
```
The code,  controlled by the 3rd part, now dumped all the cookies - and can use them.  If you trust the third party code, OK - but if you don't - then this is a huge problem.  Note, if the third party code *is hosted elsewhere* then this is a huge security problem.  Anyone could change the JavaScript you are loaded - perhaps the third party get's attacked, and the good code is replaced with malicious!

In most cases, there isn't any reason for cookies to be *directly* accessed by JavaScript code.  Yes, the browser will send the cookies with any requests made via JavaScript, but needing JavaScript to be able to directly interact with them is unusual.  You, as the web developer, can prevent all of this by *disabling* JavaScript's access to the cookies you set.  *They are still sent when JavaScript initiates requests*, and when combined with `SameSite` this is perfectly acceptable.

You can prevent JavaScript access with the `HttpOnly` flag:

```
HTTP/1.0 200 OK
Content-type: text/html
Set-Cookie:  id=31241234;SameSite='strict';HttpOnly
```
As mentioned above, one of the best things that you as a developer can do is ensure *all* of your web application works **only** via HTTPs.  HTTP requests are sent over networks in plain text - and your users will use unsecured networks - a lot.  It's just incredibly easy to attack this network traffic.  You do your users a tremendous disservice by allowing any part of your web application to work on plain old `http` rather than `https`.

**Pro Tip**&#128161; Don't worry about *local* development.  Of course, you don't need `https` when you are running web applications locally and doing your development work.  When we say *everything* should be `https`, we mean everything *public* - the production application!

Sometime, there are aspects of your application that simply cannot work with `http`.  These situations become more rare every year - but they exist.  To protect yourself - or protect your cookies - you can *prevent* cookies from being included with request that are sent over unsecured `http`.  This gives you backup - in case there is some reason a request is made without `https`.  The web browser will specifically avoid sending cookies over unsecured requests when the `Secure` flag is specified:

```
HTTP/1.0 200 OK
Content-type: text/html
Set-Cookie:  id=31241234;SameSite='strict';HttpOnly;Secure
```
Note, this is not preventing server side code from *setting* cookies - this is only telling the web browser that *if* it is makign a request over `http` and not `https`, not to include the `id` cookie.  It's up to the web server code to avoid setting cookies when working with `http`.

## Cookies - a better implementation
To close out this section, let's improve the way we wrote the Guessing Game code.  Cookies are ubiquitous, we don't need to parse cookies ourselves!  Let's install something to help us out - it will come in handy in later sections, when we use cookies for sessions and we learn more about cookies and security.

```bash
 npm install cookie-parser
```

```js
// Inside guess.js
const cookieParser = require('cookie-parser');

const app = express();
// parses cookie header
app.use(cookieParser());

// This parses request body (we've had this for a while)
app.use(express.urlencoded({ extended: true }))
```
The code above adds *middleware* to our express app.  This middleware is a lot like the `express.urlencoded({ extended: true })` middleware we use for request body parsing - calling `cookieParser()` returns middlware that will be called *before* routes.

Now, within the route that uses the cookie, we can use a much more simplified approach:

```js
router.post('/', async (req, res) => {
    if (!req.cookies || !req.cookies.gameId) {
        res.status(400).end();
        return;
    }
    const record = req.GameDb.get_game(parseInt(req.cookies.gameId));
    if (!record) {
        res.status(404).end();
        return;
    }
    // create a game instance from the record found in the db
    const game = Game.fromRecord(record);
    const response = game.make_guess(req.body.guess);
  ...

```

We still *set* the cookie the same way.

All and all - using cookies for the guessing game works well.  Since some users *do* prefer not to allow cookies, we'd probably still opt for using the hidden form field in the real world, just because it's still really easy to implement.  When it's easy *not* to use cookies, and still achieve your result - then don't use cookies.  Situations where it is difficult include any app that needs to send cookies *often*, via both GET and POST requests, and from many pages.  Hidden form fields only work of you have a form, after all!  

Now let's move on and see the cookie strategy to state management *expanded* - to include all sorts of data.  