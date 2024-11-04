# PUG Templates
There are many, many template languages.  The all mostly achieve the same ends.  Perhaps the most distinguishing feature of Pug, the templating language we will use in this book, is the fact that it not only **adds logic** to HTML, it also let's developers write the HTML itself in a more efficient way!

Let's take a look at some *static* HTML we've used for creating the Guessing Game form.  There's nothing dynamic here - it's just HTML.

```html
<!doctype html>
<html>
    <head><title>Guess</title></head>
    <body>
        <p>I'm thinking of a number from 1-10!</p>
        <form action="/" method="POST">
            <label for="guess">Enter your guess:</label>
            <input name="guess" placeholder="1-10" type="number" min="1" max="10"/>
            <button type="submit">Submit</button>
        </form>
        <a href="/history">Game History</a>
    </body>
</html>
```

HTML is an intersting language.  The syntax is **verbose**, requiring beginning and ending delimeters of elements.  Spacing, tabs, new lines don't matter.  This is all designed more for *novice* programmers than professionals.  Here's an *alternative*:

```jade
doctype html
html
    head
        title Guess
    body
        p I'm thinking of a nu,ber from 1-10!
        form(action="/", method="post")
            label(for="guess") Enter your guess
            input(name="guess", placeholder="1-10", type="number", min="1", max="10")
            button(type="submit") Submit
        a(href="/history") Game History
```
It's hard to argue that this is *harder* to understand.  It's also pretty easy to recognize that it's more *concise*.  Once you've gotten the hang of it, it's *faster* to write, and it's **a lot less error prone**.  This is the `pug` language - formerly known as `jade`.  Keep that in mind by the way - there's a lot of material on the web that refers to *jade templates* - which is just the older name for the same exact thing!

