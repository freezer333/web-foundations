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


**Pro Tip**&#128161; Over many years of teaching Web Development to students, one of the most common "mistakes" I've seen students make is choosing *not* to embrace pug templates, and instead continuing to create HTML in JavaScript strings, or trying to use EJS.  Most of the time, its because students don't see the benefit, compared to the effort required to learn it.  **It's a huge mistake**.  Pug is not a hard language to pick up, and it's *tailored* towards making HTML easier to write.  Once you've gotten comfortable (and it won't take long), your productivity is going to multiply!  Web Development has a lot of "level ups", and this is one of the biggest.  Don't be foolish!

## Syntax Highlights
Pug templates offer a shorthand for HTML authoring, combined with logic primitives for assignment, branching, and loops.  They also give us more powerful mechanisms for attribute generation, and as we will see later, for CSS definitions within HTML.

First, a few highlights:

- There are no `<` and `>` requirements.  Elements are simple written with their names - `h1` instead of `<h1>`.
- Element names are the first thing (normally) on a line.  New lines **are meaningful**.
- There are no closing delimiters - the *new line* is the delimiter.
- Indentation is **meaningfull**, it defines the nesting structure of HTML.  This avoid errors, but giving the text more structure.
- Common attributes can be written as shortand, for example `<p id="hey">Hi</p>` can be written as `p(id="hey") Hi`, or even shorter as `p#hey Hi`.
- Grouping elements - `div` and `span` have even more shortened forms when they are used with `id` attributes (and class attributes).  Rather than `<div id="hey">Hi</div>` we can actually just write `#hey Hi` and the `div` is *implied*.  This is because the `div` element is so commonly used, and so often used with `id` and `class`.

## Using Pug
**PUG** is 100% server side.  This is so critical for you to understand!  Pug templates are *rendered* by server-side code to produce HTML.  The HTML is sent over the network socket to the web browser.  The web browser **never** sees PUG, and generally speaking would never know it was used to create the HTML it receives.

As the first step, we'll need to install `pug` - the library responsible for reading `.pug` templates and transforming them into HTML.

```bash
npm install pug
```
Pug can use simple strings (of pug syntax), but usually our pug template text will be stored in `.pug` files.  These files are *compiled* by the `pug` library into templates, which are then rendered with data (the model).  Here's s simple example:

```js
const pug = require('pug');
const template = pug.compileFile('./demo.pug');

const model = {
  title: 'Web Dev', 
  areYouUsingPug: true
}
const html = template(model);
```
```pug
doctype html
html(lang="en")
  head
    title #{title}
  body
    h1 PUG Demo
    if areYouUsingPug
      p You are amazing!
    else
      p This could have been easier for you
```

Here's the resulting HTML
```html
<!DOCTYPE html>
<html>
    <head>Web Dev</head>
    <body>
        <h1>PUG DEMO</h1>
        <p>You are amazing!</p>
    </body>
</html>
```
That's it - we *compile* a template file, and the result is a *function*.  Calling that function, with a data model (a JavaScript object) returns HTML text.  That HTML text can be sent to the web browser, or anywhere else we want to send HTML.

## HTML Generation
Now let's look at some more of the features of the PUG language.  We've seen the main ones - in terms of how elements and attributes work.

Intead of the following:
```html
<p>Hello</p>
<section id="foo">
    <article>
        <p>World</p>
        <img src="picture.jpeg" height="500" width="500"/>
    </article>
</section>
```
We write the following:
```jade
p Hello
section#foo
    articl
        p World
        img(src="picture.jpeg", height="500", width="500")
```
The key differences - attributes are comma separated, and within parenthesis.  Elements are written as their names, with no special angle symbols.  No closing elements are needed, because new lines represent the end of the element.

Unlike the HTML example, *indentation* matters.  The following pug renders a parent/child relationship:

```jade
section
    article
        p Hello
```
Resulting in the following HTML:
```html
<section>
    <article>
        <p>Hello</p>
    </article>
</section>
```
However, the following pug renders something very different!
```jade
section
article
p Hello
```
Resulting in the following HTML:
```html
<section></section>
<article></article>
<p>Hello</p>
```

The fact that indentation matters might feel like a nuisance - but it isn't!  It'a feature, not a bug!  It **forces** you to write clear pug code, and to use whitespace deliberately.  It reduces errors, and makes it much easier to catch them.

### Attributes
Attributes have simple rules in pug, they are surrounded by parenthesis, and separated by commas.  There are some helpful features for edge cases however.

For example, let's consider the *boolean* attibute `checked` on an `input` checkbox element.

```html
<!-- Render with checkmark -->
<input type="checkbox" checked/>
<!-- Render without checkmark -->
<input type="checkbox"/>
```
Typically, you'd have a *variable* that is true or false, controlling whether the checkbox should be rendered.  Pug allows you to write the attribute normally, with a true or false value.

```jade
input(type='checkbox', checked)
input(type='checkbox', checked=true)
input(type='checkbox', checked=false)
```
The above three checkboxes will render the following HTML:
```html
<input type='checkbox' checked/>
<input type='checkbox' checked/>
<input type='checkbox'/>
```
Unlike plain HTML, the *presense* of `checked` doesn't necessarily mean the attribute will be present in the HTML.  If the value resolves to the boolean `false` value, then it is omitted entirely from the HTML.

We also saw earlier how some *special* attributes can be written more concisely.

```jade
p(id="foo") Bar
p#foo Bar
```
```html
<p id="foo">Bar</p>
<p id="foo">Bar</p>
```
The `class` attribute is also extremely common, although we won't make use of it as much until we cover CSS later.  The `class` attribtue can be written more conciselyh using the `.` notation:

```jade
p(class="foo") Bar
p.foo Bar
```
```html
<p class="foo">Bar</p>
<p class="foo">Bar</p>
```

It's common to define *multiple* classes for an element, and we can use standard array syntax for this - which is helpful when we think about the array being in the *model* variable being transformed to HTML.

```js
const template = pug.compileFile('./demo.pug');

const model = {
  classes = ['foo', 'bar', 'bazz'];
}
const html = template(model);

```
```jade
//- demo.pug
p(class=classes) Three classes!
```
```html
<p class="foo bar bazz">Three classes!</p>
```

The `style` attribute is also "leveled up", allowing you to define it using an *object*.  Again, in the context of building a *model*, this syntax is very helpful.

```js
const template = pug.compileFile('./demo.pug');

const model = {
  mystyle: {
    color: "red",
    width: "100%",
    margin: "10px"
  }
}
const html = template(model);
```
```jade
//- demo.pug
p(style=mystyle) Stylish Text!
```
```html
<p style="color:red; width: 100%; margin:10px">Stylish Text!</p>
```

You might have noticed that `//-` is used for comments.  Those comments only appear in your pug template, it is not forwarded into the HTML produced.  To actually include the comment in the HTML itself, you can use `//` without the `-`

```jade
//- This doesn't end up in the HTML
p Hey
// This is added to the HTML
p There
```

```html
<p>Hey</p>
<!-- This is added to the HTML -->
 <p>There</p>
 ```

*Note, using `//` isn't common* - remember comments in HTML go to the end user, as plain text.  Most comments are for developers, not users - the exception being licensing text, or hidden "easter egg" comments that the developer wants to allow a (clever) user to see.

### Nesting
Normal pug usage requires us to add new lines and indentation when creating nested parent/child relationships between elements:

```jade
article
    section
        p Hi
```
```html
<article>
    <section>
        <p>Hi</p>
    </section>
</article>
```
For situations where we have *a single* element within another parent element, we are permitted to use `:` syntax to make the code more concise.  The following will render the same HTML as before:

```jade
article: section: p Hi
```
### Plain Text
You might be wondering... what happens when you have a lot of text within an element?  New lines and indentation matter, so writing a long string of text within a paragraph would *ordinarily* require you to write it all on **one line**.

```jade
p Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation  llamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint  ccaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. 
```
That's obviously not great.  One option is to use the `|` command, which allows you to create multi-line, *untransformed* text:

```jade
p 
    | Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
    | incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
    | nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
    | Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore 
    | eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,
    | sunt in culpa qui officia deserunt mollit anim id est laborum.
```
Another option, which is slightly more commonly used is to use the `.` syntax:
```jade
p. 
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
    nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore 
    eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,
    sunt in culpa qui officia deserunt mollit anim id est laborum.
```
If HTML elements must be within the plain text, for example, as a `<span>`, it must be placed as HTML within the text.  
```jade
p 
    | Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
    | incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
    | nostrud exercitation <span style="color:red>ullamco</span> laboris nisi ut 
    | aliquip  ex ea commodo consequat.  Duis aute irure dolor in reprehenderit 
    | in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur 
    | sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt 
    | mollit anim id est laborum.
```

If none of those options appeal to you - good!  The truth is that having long strings of text *within* pug templates like this is not generally a good sign.   Recall, pug templates *render* data - and long text feels like *data*.  The more common situation is that the long text (maybe the text of a blog post) lives in a database - not in a template.  It is added to the *model*, and the template simply refers to it!

```js
const template = pug.compileFile('./demo.pug');

const model = {
  article_text : "... long text from the database ... "
}
const html = template(model);
```
```jade
p #{article_text}
```
```html
<p>... long text from the database...</p>
```

### Assignment
This brings us to the next important feature of `pug`, the ability to embed variables within the HTML element content.

There are two styles, one far more popular than the other.   Let's start with the simplest, but least popular - the `=` syntax:

```js
const template = pug.compileFile('./demo.pug');

const model = {
  a: "Hello",
  b: "World"
  
}
const html = template(model);
```

```jade
p= a
p= b
```
```html
<p>Hello</p>
<p>World</p>
```
The `=` syntax simply sets the interior (inner) text within an HTML element to the value of the variable being used.  The right hand side of the `=` is *JavaScript*.  If we want both variables, and a mix of other text, to be within an element, then we need to write that like JavaScript:

```jade
p= a + " " + b + "!"
```
```html
<p>Hello World!</p>
```
The awkwards of the string concatenation (which is why we moved away from JavaScript in the first place!) leads us to the *second* method - the `#{` `}` syntax - *which is a lot like JavaScript template literals*.

```jade
p #{a} #{b}!
```
```html
<p>Hello World!</p>
```
It's your choice whether you use the `=` or `#{` `}` syntax, either can get the job done.

Within attributes, we can also combine variables and text - however our options are more limited because the `#{` `}` syntax (called interpolation) is not available.

```jade
p(attribute=a+" " + b + "!")
```
```html
<p attribute="Hello World!"></p>
```
In this case, since the attribute value is just a JavaScript expression, you might be wise to use the newer JavaScript string interpolation itself:

```jade
p(attribute=`${a} ${b}!`)
```

## Control Flow
A huge part of a template language is it's ability to implement *control flow* - branches and loops.  HTML generation must be dynamic, based on the model data provided.  Pug provides simple and effective constructs for contol flow.

Let's take an example that renders different HTML based on whether a user is a logged in user, a guest, or unknown:

```js
const template = pug.compileFile('./demo.pug');

const model = {
  user : {description: "foo bar baz"},
  auth: false,
  guest: true
}
const html = template(model);
```

```jade
#user
    if user.description
        p #{user.description}
    if auth
        p Logged in
    else if guest
        p Guest
    else 
        p Who is this!?

```
```html
<div id="user">
    <p>foo bar baz</p>
    <p>Guest</p>
</div>
```
The `if` `else if` and `else` conditionals work basically exactly like you'd expect.  Anything indented within them are part of the block of conditional HTML generation.  The expression to the right of `if` is a boolean JavaScript expression.  It can reference model data, and can use any of the relational operators we know and love.

This is a good time to note what can go into the model data too.  Recall, JavaScript treats *everything* as data.  Including functions.

```js
const template = pug.compileFile('./demo.pug');

const model = {
  user : {description: "foo bar baz"},
  formatted: (text) => { 
    return text.toUpperCase();
  },
  auth: false,
  guest: true
}
const html = template(model);

```

```jade
#user
    if user.description
        p #{formatted(user.description)}
    if auth
        p Logged in
    else if guest
        p Guest
    else 
        p Who is this!?

```
```html
<div id="user">
    <p>FOO BAR BAZ</p>
    <p>Guest</p>
</div>
```

The model object you send to the rendering function, *everything* inside it is available.  This offers tremendous flexibilty and power.

As far as *repetition* or loops go, PUG templates will *typically* use the `each` command to loop through an array.  Although it's more rarely used, pug also has `while` loops - but since view code almost exclusively uses loops to render HTML sequences, based on data.

Here's an example of our blog posts, that we introduced EJS with - this time with pug.

```js
const posts = database.findPosts(); // Pulls blog posts from a database
const template = pug.compileFile('./demo.pug');

const model = {
  title: 'My Blog Posts',
  posts: posts
}
const html = template(model);
```
```jade
!doctype html
html
    head #{title}
    body
        ul
            each p in posts
                h2 #{p.title}
                p #{p.text}
```

The `each` syntax also allows you to access the *index* during iteration:

```jade
each p, i in posts
    h1 Post #{i}
    p #{p.text}
```



## More Features
We're going to learn more about `pug` as we go.  Pug allows use to reuse certain parts of our templates, through template *inheritance* and *includes*.  It also allows us to define somethign *similar* to functions - called *mixins*.  The [pug website]() provides a wealth of additional material, covering all the various features of the language.  The language is simple and small *on purpose*.  Remember, the entire point of moving view code out into templates is that view code *should* be simple - we shouldn't need a complex language to implement it in the first place!  If we need to perform a lot of logic to transform data into presentation, then we should do most of that work **before** rendering!