# HTML Templates
Let's take a look at one of the routes in the *main* program file from our last guessing game example:

```js
const history = (req, res) => {
    const records = GameDb.get_games();
    const games = records.map(r => Game.fromRecord(r));

    const html = heading() +
        `
        <table>
            <thead>
                <tr>
                    <th>Game ID</th>
                    <th>Num Guesses</th>
                    <th>Completed</th>
                </tr>
            </thead>
            <tbody>
                ${games.filter(g => g.complete).map(g => `
                    <tr>
                        <td><a href="/history?gameId=${g.id}">${g.id}</a></td>
                        <td>${g.guesses.length}</td>
                        <td>${g.time}</td>
                    </tr>
                `).join('\n')}
            </tbody>
        </table>
        <a href="/">Play the game!</a>
        `
        + footing();
    send_page(res, html);
}
```

Notice how much of it is dedicated to writing HTML.  Also, notice how awkward it is!  We are creating HTML using a JavaScript string.  Put simply - we are writing one language (HTML) inside another (JavaScript) - and *that's never great*.  We aren't getting the advantages of a dedicated editor, with syntax highlighting.  We aren't getting any auto-complete features we'd expect when writing HTML in a programming editor.  

There's more to this that is problematic.  While we've been able to factor out a lot of the game logic, and the database logic, we haven't really factored out anything related to rendering *the view* of our app.

## Model View Cotnroller - MVC
The Model View Controller architecture has been around for decades, and it comes in many forms.  It's an overall philosophy of *seperating* the code responsible for the *model*, the *controller* and the *view* from eachother.

- **Model** - the data to be viewed and manipulated.  This usually also includes the code that queries and creates that data (the database code)
- **View** - *declaritively* written presentation / user interface code.  In our case, this is the *code that generates the HTML, and the HTML itself*.
- **Controller** - the procedural code that orchestrates the entire thing, implementing the *actions* and *logic* around manipulating the data.  In our case, this is JavaScript code (Node.js).

The separation is not always strict, and certainly not always perfect - however it is a far better approach (and goal) than writing monolithic code.  In particular, when we mix controller, model, and view code we get the *wrong representation*, and the *wrong language* for the job.

The focus on this chapter is the *view* part of MVC, and the *view* code is best written *declaritively*.  When we say *declaritively*, we mean that HTML itself is easier to think about writing as static, straight text - not lines of code to be executed one by one.  We want to move towards to a programming environment similar to what we'd have when writing *static HTML*, even when we are writing *dynamic* HTML.

## What's a template?
A template is *mostly* static text, with placeholders for data.  A JavaScript *template literal* string is actually already that:

```js
const t = `This is mostly static text with one variable with value = to ${variable} - which is pretty cool.`;
```
An HTML *template* is **mostly** HTML, with hooks (placeholders) for data and some logic.  We'll first take a look at **EJS**, which stands to *Embedded JavaScript*.  **EJS** is probably best thought of as the *opposite* of how we've been putting HTML in JavaScript.  With **EJS**, we are putting JavaScript **inside** HTML.

```html
<p>This is mostly static html, with one variable with value = to <%= variable %> - which is pretty cool.</p>
```
The `variable` in that HTML is a *JavaScript* variable.  The `<%=` symbol creates an *embedded assignment*.

In order to *render* HTML from EJS, we use JavaScript.

```js
const ejs = require('ejs'); // Hypothetical EJS library

const ejs_template = `<p>This is mostly static html, with one variable with value = to <%= variable %> - which is pretty cool.</p>`;
const html = ejs.render(ejs_template, {variable: 10});
console.log(html)
// Prints <p>This is mostly static html, with one variable with value = to 10 - which is pretty cool.</p>
```
What's so powerful about this?  Isn't is the same as our JavaScript template literals, with back tick marks and `${` and `}`?  Well, if we kept it like that, sure - but **EJS** is a lot more powerful.

First - the **EJS** text can be stored *outside* the program's source code - a level of separation not possible with JavaScript template literals.


```html
<!--Contents of view.ejs -->
<p>This is mostly static html, with one variable with value = to <%= variable %> - which is pretty cool.</p>
```
```js

const ejs = require('ejs'); // Hypothetical EJS library
const html = ejs.renderFile('./view.ejs', {variable: 10});
console.log(html)
```

Beyond moving **EJS** to files, we can also embed *any JavaScript* - which means we can use logic!  For example, suppose we had a list of "posts", which were objects with `title` and `text` representing blog posts.  If we had an array, we could generate HTML using that array:

```js
const ejs = require('ejs'); // Hypothetical EJS library
const posts = database.findPosts(); // Pulls blog posts from a database
const html = ejs.renderFile('./blog.ejs', {posts: posts});
console.log(html)
```

```html
<!-- Contents of blog.ejs-->
<h1>Blog Posts</h1>
<ul>
    <% for (const p of post) { %>
        <li>
            <h2> <%= p.title %> </h2>
            <p> <%= p.text %> </p>
        </li>
    <% } %>
</ul>
```
This is powerful - there might be three blog posts in the database, or there could be hundreds - the template will loop through them and render them all.  We can embed branches (if and else) and other parts of the JavaScript languages as well.f  We want to be somewhat carefull - embedding *too much JavaScript* in EJS code brings us full circle, writing JavaScript in an HTML file!  Rather than including a lot of logic in EJS, we want to keep logic **in** JavaScript.


```js
const ejs = require('ejs'); // Hypothetical EJS library
const posts = database.findPosts(); // Pulls blog posts from a database

// Do whatever logic we need to do to create the list of posts.
// Maybe this includes computing timestamps, doing language translation, 
// etc.  
do_post_processing(posts);
    
const html = ejs.renderFile('./blog.ejs', {posts: posts});
console.log(html)
```

In the example above, the `do_post_processing` function is a placeholder - use your imagination!  We might have any number of tasks to perform on the data before rendering it.  The important point here is that `posts` is our **MODEL**.  The JavaScript code that pulls the posts from the database, and performs post processing, filtering, transformation on `posts` before being rendered is the **Controller** code.  Inside the `ejs` file, our view code will be simple - and mostly HTML.

The thing about EJS is that it's JavaScript.  It requires you to use the same Javascript syntax as you would normally, but everywhere you need to write JavaScript, you must delimit it from the rest of the HTML with `<%` and `%>`.  Think of EJS as really just some text that is inverted upon render - where everything **outside** the `<%` and `%>` is converted to strings surrounded with quotes, being maniplated by the JavaScript that is inside the delmiters - which are pulled out.

For example, the the `blog.ejs` file is really being converted from this:

```html
<!-- Contents of blog.ejs-->
<h1>Blog Posts</h1>
<ul>
    <% for (const p of post) { %>
        <li>
            <h2> <%= p.title %> </h2>
            <p> <%= p.text %> </p>
        </li>
    <% } %>
</ul>
```
To this:

```js
let html = '';
html += `<h1>Blog Posts<h1>`;
html += ` <ul>`;
for (const p of post) {
    html += `<li><h2>`;
    html += p.title;
    html += '</h2>';
    html += '<p>';
    html += p.text;
    html += '</p></li>'
}
html += '</ul>';
```
EJS is a common type of syntax, but since it directly embeds JavaScript, it's not *necessarily* the best choice for the types of logic we typically want inside view templates - which generally is best to be *limited* and best to be focused on loops and simple branches.  Good view templates *sprinkle* a little logic into mostly HTML, and the JavaScript syntax isn't necesarily the best syntax for this.  Of course, there's no rule that says our *template language* needs to be JavaScript.  

## Template Language Choices
There are likely *hundreds* of different HTML templating languages and systems.  They are used both on the backend (which we are covering now), and also with front end JavaScript (we'll see that much later).  There are template langauges that are used in Node.js web servers, and others used in Java, C++, C#, Ruby, Python, etc.  Some template languages are cross-platform - meaning there are libraries to implement them in multiple programming languages, while some are a bit more specific.

Here's just a few - and really, there's no need to get too bogged down with them.  **All of them** are essentially the same in terms of what they can do.  The choice of using a particular one is usually mroe about your personal preference (or your team's preference), and of course your backend programming language and whether it supports it.

- [Apache Velocity](https://velocity.apache.org/) - Supported by Java and C#
- [Blade](https://laravel.com/) - Supported by PHP (Laravel)
- [EJS](https://ejs.co/) - Supported by a lot of languages - but in particular JavaScript
- [HAML](https://haml.info/) - Ruby, PHP - originally implemented for Ruby on Rails
- [Jinja](https://jinja.palletsprojects.com/en/stable/) - Python, widely supported by Python frameworks
- [Mustache](https://mustache.github.io/) - Supported by *many* languages
- [Pug](https://pugjs.org/api/getting-started.html) - Supported mainly in JavaScript
- [Razor](https://learn.microsoft.com/en-us/aspnet/core/mvc/views/razor?view=aspnetcore-8.0) - Supported by the .NET family of langauges

There are many others.  For the rest of this chapter, and for most of this book, we are going to focus on just one - **Pug**.  Much like the rationale behind choosing Node.js for server-side development, we're choosing to focus on Pug not because it's necessarily the best choice, or the most popular - but because it's the best for *learning*.  It is, indeed, very widely used - and it's syntax is quite representative of template syntax.  Pug provides a clean mechanisms of assignment, looping, and conditional branches, along with some helpful utlities like *mixins* to avoid repetition.  It's easy to write, and pretty easy to learn.