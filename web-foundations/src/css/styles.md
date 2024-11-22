# Styles
From the beginning, HTML was ment to describe *document structure*, not document style.  Even in the very first implementations of browsers (ie Tim Berners-Lee's NeXT), the concept of *style sheets* existed - where styling for HTML was specified as separate documents.   In these early days, there was no standard convention around the *language* of the style sheet, or how the browser *found* the stylesheet that was appropriate for the given HTML page.  There were no real conventions for styling at all.  There was, understandably, a large demand among web authors to control how their documents appeared to users - font styles, colors, alignment, spacing - however up until 1994, there was essentially *no* movement in this area.

In 1994, Marc Andreessen and others released *Mozilla*, which later was renamed as *Netscape Navigator*.  Netscape supported *new HTML elements* to move the ball forward on *styling* - including the `center` element that centered text within a horizontal space.  During the same year, Håkon Wium Lie - while working at CERN (recall, that very same CERN where Tim Berners-Lee created HTTP and HTML earlier) - began working on a very different mechanism for styling.  This mechansims was inspired by the earlier concepts in separate stylesheets - rather than the creation of new HTML elements to specify styling.  The proposal grew into what we now call *Cascading Style Sheets* - CSS.  During the middle 1990s, CSS was not the "no brainer" it is today for styling - it was an *alternative*.  Web browses (Netscape and Internet Explorer) continue to push new HTML elements that covered styling - `font`, etc.  Other stylesheet langauges were also promoted.  By the end of the decade, however, CSS had become both the predominent stylesheet langauge, and alse the recognized *future* of styling on the web.  

## Styles vs Elements
Before we move forward on CSS, it's worth spending some time highlighting the difference in philosphy behind styles and elements.  Let's use Mozilla's original example - *centering text*.

To approach this as an HTML element problem, we might create the following:

```html
<div>
    <center>
        <h1>Centered Heading</h1>
    </center>
    <p>Lots of text, left aligned</p>
</div>
```
<hr/>
<div>
    <center>
        <h1>Centered Heading</h1>
    </center>
    <p>Lots of text, left aligned</p>
</div>
<hr/>
The document is fairly simple, but you can recognize the *mixing* of concepts.  `h1` and `p` have semantic meaning - headers, and paragraphs.  `center` has no semantic meaning - it's purely formatting.  It's straightforward, and certainly easy to understand - the `h1` heading text is centered on the page.

Now let's look at this from the perspective of *styling*.  We'll focus on the syntax in a bit, here's an example:

```html
<div>
    <h1 style='text-align:center'>Centered Heading</h1>
    <p>Lots of text, left aligned</p>
</div>
```
<hr/>
<div>
    <h1 style='text-align:center'>Centered Heading</h1>
    <p>Lots of text, left aligned</p>
</div>
<hr/>

There's no difference in visual appearance.  The centering above is acheived using the `style` attribute and a CSS rule - `text-align`.  Which technique is better?

The answer comes down to flexibility.  The `style` attribute can hold many different styling directives, and can appear on *any* HTML element.  However, the flexibility goes further.  CSS stylesheets **do not** rely on `style` attribtues.  CSS rules can be moved completely *outside* the HTML document itself, and can target elements within a document, or many documents.  This allows developers to address two *cross cutting* concerns - document structure, and document style - without mixing the syntax.

```css
h1 {
    text-align: center;
}
```
```html
<div>
    <h1>Centered Heading</h1>
    <p>Lots of text, left aligned</p>
    <h1>Another Centered Heading</h1>
    <p>Lots of text, left aligned</p>
</div>
```
<hr/>
<div>
    <h1 style='text-align:center'>Centered Heading</h1>
    <p>Lots of text, left aligned</p>
    <h1 style='text-align:center'>Another Centered Heading</h1>
    <p>Lots of text, left aligned</p>
</div>
<hr/>

As CSS grew more functional, developers gravitated towards this mechanism.  Web browsers iterated on CSS support.  For a solid decade, CSS support among major browsers was a controversial top.  Internet Explorer supported a subset of CSS, while Mozilla (Netscape, then later Firefox) tended to support more to the standard, quicker.  By the mid 2000's, most major browser did however support the majority of the current (at the time, CSS 2) standard.  There is a deep, and interesting history of how browsers evolved around a *changing* CSS standard - it was a messy process!  Today we reap the benefits of these efforts though.  Today, the modern CSS standard (CSS 3) is supported fully on nearly every major web browser, on every major platform.  There are of course some obscure edge cases, but life as a web developer, specifically a *front end* web developer is immeasurably better today than it was just 10 years ago!

For the rest of this chapter and the next, we will be focusing on CSS fundamentals, and everything we see is fully supported by virtually all browsers.  We won't get to everything in CSS - it's a lot - but we'll cover all of the basic principles.

## Styling rules
A styling rule in css has a simple syntax - it is a property or attribute, followed by a colon, followed by a value.  The CSS language defines many properties - each of which is used to specify *something* about how an element is to be rendered.  This might control colors, borders, spacing, position on the screen, visibility, animation, and more.  We won't try to list every one of them in this book, that's better handled by other [resources](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference#index).  

Each **property** or **attribute** has a *set* of valid *values* that can be specified.  Let's take a look at a few examples:

```
color: red
```
The `color` property controls the color of the text of a given HTML element.  The *value* can be any valid CSS specification of color - of which there are many.  Colors can be specified by using one of a list of 140 *named colors* - which you can review [here](https://www.w3schools.com/cssref/css_colors.php).  CSS colors can also be written as hexidecimal numbers, RGB/A, and HSL/A.

```html

```

The example above uses the `style` attribute.  That attribute is available on *any* HTML element, and the styling rules you add will govern specifically that element, along with it's children (assuming the CSS property is *inherited*, which most are.

The style attribute can be used to include *multiple* rules as well - delimited by *semi-colons*.  Here', we set  `div` element's `width`, `background-color`, and `color` all in the same `style` attribute:

```html
<div style='width:200px; background-color: Navy; color: white'>
    <p>Hello</p>
</div>
```
<div style='width:200px; background-color: Navy; color: white'>
    <p>Hello</p>
</div>

## Don't use the `style` attribute!
Before proceeding any further, we need to talk about the `style` attribute more closes.  It's been part of HTML for a long long time, and it isn't going anywhere - *however* it is **not** the recommended way to specify CSS.  Using the `style` attributes has several downsides:

1. Each element within an HTML document that you want to have a certain style must specify the `style` attribute the same way.  In HTML documents with many elements sharing the same styling, this is incredibly wasteful, error prone, and redundant.
2. Using the `style` attribute short-circuits much of the *cascading* part of *Cascading Style Sheets*.  While not always a limiting issue, you do lose much of expressive power of CSS by relying on the `style` attribute.
3. Your HTML documents become *littered* with CSS, making them increasingly difficult to read and understand.

#1 and #3 are the most readily understandable problems with the `style` attribute at this point, for most readers.  Let's see how we can overcome this, first by using `<style>` elements to specify CSS *seperately* from the HTML structure, and then by specifying CSS in completely distinct CSS files.  In both scenarios, we must move past the simple `attribute:value` syntax and include *selectors* which identify **which** HTML elements the rules we write should apply to.

## Style elements
A `<style>` element is a special HTML element found within the `<head>` that can be used to write CSS rules.

```html
<!DOCTYPE html>
<html>
    <head>
        <title>HTML with CSS</title>
        <style>
            /* All paragraphs are colored red */
            p {
                color: red;
            }
        </style>
    </head>
    <body>
        <p>Hello</p>
        <p>World</p>
    </body>
</html>
```
<p style="color:red">Hello</p>
<p style="color:red">World</p>
<hr/>

It should be clear why the `style` element is superior to the `style` attribute, just by the simple repetition above.  Both our `p` elements are colored red, covered by a *single* CSS rule specified in the `style` element.  If we had 5 paragraphs, the difference is more stark:

Instead of the following:
```html
<p style="color:red">Paragraph 1</p>
<p style="color:red">Paragraph 2</p>
<p style="color:red">Paragraph 3</p>
<p style="color:red">Paragraph 4</p>
<p style="color:red">Paragraph 5</p>
```
We have this instead:
```html
<style>
    p {
        color: red;
    }
</style>
<p>Paragraph 1</p>
<p>Paragraph 2</p>
<p>Paragraph 3</p>
<p>Paragraph 4</p>
<p>Paragraph 5</p>
```
The advantage of this approach is that if we want to *change* the color of `p` elements, we change one thing - the *css rule*, rather than changing five different rules.  Another advantage is the absense of repetitive `style` attributes keeps our HTML cleaner, and easier to read.  

We introduced an important part of syntax in the `style` elements above - *the selector*.  

### Selectors
A CSS *selector* is used to identify which HTML elements in a document are affected by a given set of CSS rules.  The CSS *selector* groups a set of CSS rules, which are delimited by semicolons.  Thus, a complete declaration block of CSS to change the background and font color of all `p` elements might look as follows:

```css
p {
    background-color:blue;
    color:yellow;
}
```
The *selector* is `p` - meaning the block of rules that follow will apply to **all** `p` elements in the document.  Withing the `{` and `}` can appear *any* number of CSS rules - each containing property names and values.

When a web browser encounters an HTML element in a document, it must make choices concerning *how it will render* the element.  Each time is draws an element, it must make a decision along **each** property.  For example, when a web browser begins to draw a `p` element, it must decide on the background color, font color, width, etc.  When it finds another element (let's say, an `h1` element), it must make all the same decisions - once again.  

In order to make these rendering decisions, the browser examines *all* the CSS that it has already seen.  This is why the `style` element belongs in the `head`, it should be processed by the web browser *before* all the elements it renders.  

### Type Selectors
The browser searches the CSS blocks by matching *selectors*.  We've seen one kind of selector - *the type* selector. The following blocks of CSS specify rules for both `p` elements and `h1` elements.  They use *type selectors* to identify this.

```css
p {
    background-color:blue;
    color:yellow;
}
h1 {
    color:orange;
}
```
Type selectors can include *multiple* types.  For example, we could set both `h1` and `h2` elements to have colored font:

```css
h1, h2 {
    color: orange
}
```
The **comma** is critical, it defines the type selector as matching **either** `h1` or `h2`.  It's important to understand that more than one selector block may apply to a given element.  For example:

```css
p {
    background-color:blue;
}
h1, p {
    color:orange;
}
```
```html
<h1>Heading</h1>
<p>Paragraph</p>
```
<h1 style='color:orange;'>Heading</h1>
<p style='color:orange;background-color:blue;'>Paragraph</p>

Notice how the `p` element was rendered with blue background, **and** font color of orange.  The browser finds *all* matching CSS blocks, and applies all the rules found within them. We will discuss more when we cover *cascading*, but if multiple blocks define the *same* property, the last one processed by the browser wins.

```css
p {
    background-color:blue;
    color:green;
}
h1, p {
    color:orange;
}
```
<p style='color:orange;background-color:blue;'>Paragraph</p>
The paragraph is still rendered with orange, even though the first CSS declaration block specified `green`.  The second block was processed *last*, and so it was used.  This example is critical to your understanding - notice that the `background-color` rule was not skipped, just because there was another matching CSS block.  ALl rules, in all blocks, are considered, and when there are multiple rules for the **same** property, the last rule wins.

Type selectors apply CSS rules based on *element type*.  There are many situations where you want to identify HTML elements, and style them, based on other factors - not simply their type.  CSS provides a wealth of additional *selector types*, once you master them you can reliably *select* exactly the elements you want, and nothing more - and style them any way you want!

### ID selectors
The ID selector allows you to specify a specific HTML element *by it's `id` attribute*.

```css
p { 
    color:black;
    background-color: yellow;
}
#p1 {
    background-color:white;
}
#p3 {
    background-color: aqua;
}
```

```html
<p id="p1">Paragraph 1</p>
<p id="p2">Paragraph 2</p>
<p id="p3">Paragraph 3</p>
<p id="p4">Paragraph 4</p>
<p>Paragraph 5</p>
```

<p style='background-color:white;color:black'>Paragraph 1</p>
<p style='background-color:yellow;color:black'>Paragraph 2</p>
<p style='background-color:aqua;color:black'>Paragraph 3</p>
<p style='background-color:yellow;color:black'>Paragraph 4</p>
<p style='background-color:yellow;color:black'>Paragraph 5</p>

Of course, you can use the id selector with *any* element type.  In fact, use of the `#` selection is completely separate from HTML element types.

```html
<p id="p1">Paragraph 1</p>
<p id="p2">Paragraph 2</p>
<div id="p3">Div 3</div>
<p id="p4">Paragraph 4</p>
<p>Paragraph 5</p>
```

<p style='background-color:white;color:black'>Paragraph 1</p>
<p style='background-color:yellow;color:black'>Paragraph 2</p>
<div style='background-color:aqua;color:black'>Div 3</div>
<p style='background-color:yellow;color:black'>Paragraph 4</p>
<p style='background-color:yellow;color:black'>Paragraph 5</p>

The HTML specification dictates that no HTML page shall have more than one element with the *same* value for it's ID attribute.  Based on that, you might think that since `id` selectors can, by definition, only affect one element on a web page - they aren't that helpful.  Students just learning CSS are prone to even make the argument that putting the CSS in the element's `style` attribute is more straightforward.  This is **incorrect**.

The use of the `id` selector in your CSS keeps the styling rules all in one place (remember, you'll have a bunch of them!).  It's *always* worth it to keep styling clutter *out* of your HTML.  Likewise, specifying styling of special elements with specific ID values in proper CSS allows you to change the HTML at will - even removing the element in question (temporarily), without causing any changes to your styling specifications.

Perhaps the biggest reason why `id` selectors are more powerful than you think though, is that *the same* CSS is often applied across **many** pages in your application.  Each one of those 

### Stylesheets - External CSS
We already saw two places CSS can be specified:

1. Inside the `style` **attribute**.  This is a particularly poor method, and should be used sparingly (or never)
2. Inside a `style` element, which can be part of the `head` of an HTML page.  This method is very powerful, since you can specify styling rules in one place, and control the styling of the *entire* page.

Now we see a third method - and it relates to the use of `id` selectors.  CSS can be written in *it's own file*, and linked into an html page.  This link is done through the `link` element, which operates similarly to `img` and other elements with a `src` attribute (although the `link` element uses `href` to specify the external resourcs.)

Let's assume we have a web server at `http://styling-example.com`, and we've loaded `http://styling-example.com/home.html`.  Here's the contents:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Styling</title>
        <link rel = "stylsheet" type = "text/css" href="styles.css"/>
    </head>
    <body>
        <p>Hello World</p>
    </body>
</html>
```
When the HTML page loads, the `link` element is processed, along with all of the other elements.  For that brief time, there is no styling available.  Just like with `img` elements however, the browser now generates a **new HTTP GET request** to the server - `http://styling-example.com/styles.css`.  The web server must serve that file (with a MIME extension of `text/css`).  We'll discuss, at the end of this chapter, how our Express server might respond to requests for CSS - it's very easy, we'll put our CSS in a file and simply have Express serve it!

Once the browser receives the full text contained in `styles.css`, it will parse the CSS and apply the rules to the entire loaded HTML page.

Why would we use *external* style sheets?  The answer is simple - we frequently have lots of pages involved in our web application, and a lot of the styling *should be* consistent across all the pages.  Circling back to `id` selectors, we might have many pages, and *each* page has an element with a specific id (for example, #main-menu).  Using `id` selectors in an *external* CSS stylesheet, that is linked from many pages, allows you to consistently style all elements across the site.

So, we have **three** ways to include CSS now:

1. Inside the `style` **attribute**.  This is a particularly poor method, and should be used sparingly (or never)
2. Inside a `style` element, which can be part of the `head` of an HTML page.  This method is very powerful, since you can specify styling rules in one place, and control the styling of the *entire* page.
3. Linked from an **external** stylesheet.  This method is the most powerful, as it allows you to style *across* pages.

Note - you can use a combination.  It's very common to create an external stylesheet to contain your common styles across your web application, and then for each page to have an embedded `<style>` element defining *additional* rules for the specific page.  Normally, `link` goes first, then the page-specific rules.  This is to take advantage of the tie-breaking mechanism - last rule wins.  In most cases, it makes sense for the styles you specify in the page itself to override the ones in the external stylesheet.

As an example, let say we have an external `style.css`:

```css
p {
    background-color:yellow;
}
div {
    color:black;
}
```
We might have an HTML page as such:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Styling</title>
        <link rel = "stylsheet" type = "text/css" href="style.css"/>
        <style>
            div {
                color:blue;
            }
        </style>
    </head>
    <body>
        <div>
            <p>Hello World</p>
        </div>
    </body>
</html>
```
<div style='color:blue'>
    <p style='background-color:yellow'>Hello World</p>
</div>

In this example, the background-color will be set to yellow on the paragraph element, from the external stylesheet.  The font color is set to blank by the external stylsheet as well, however it's overridden by the `style` element's specification of blue.  If we were to put the `style` element first, it would have been overridden by the external stylesheet.

### Class Selectors
Often, you want to specify a group of elements when styling.  It's a group of elements - not just one - so `id` selectors don't make sense.  Likewise, the group of elements might not all be of the same type, or even if they are - you might not want to style *all* of the elements of a given type - just a subset.  This is where the most flexible CSS selector comes into play - and it's something we've already seen tangentially.  The `class` selector works a lot like `id` selectors, but instead of using the `id` attribute, it uses the `class` attribute.  Classes can be any identifier we want, and any number of HTML elements (of any type) can have the same class assigned to it.

Here's a simple example:

```css
body {
    background-color:#DDDCCC;
}
p {
    color: black;
}
.normal {
    background-color:white;
}
.quoted {
    font-style: italic;
}
.special {
    background-color:yellow;
}
```
```html
<body>
    <p class='normal'> Paragraph 1 </p>
    <p class='quoted'> Paragraph 2 </p>
    <p class='normal'> Paragraph 3 </p>
    <p class='special'> Paragraph 4 </p>
</body>
```
<div style='background-color:#DDDCCC'>
    <p style='background-color:white;color:black'> Paragraph 1 </p>
    <p style='font-style: italic;color:black'> Paragraph 2 </p>
    <p style='background-color:white;color:black'> Paragraph 3 </p>
    <p style='background-color:yellow;color:black'> Paragraph 4 </p>
</div>

Those same class selectors relate to all types - we aren't limited to `p` elements:

```html
<body>
    <p class='normal'> this is my paragraph
    with some <span class="special">special text</span>
    embedded in it. </p>
    <p class="special">Paragraph 4</p>
</body>
```
<div style='background-color:#DDDCCC'>
    <p style='background-color:white;color:black'> this is my paragraph
    with some <span style="background-color:yellow;">special text</span>
    embedded in it. </p>
    <p style="background-color:yellow;color:black">Paragraph 4</p>
</div>

We can also **combine** selectors.  For example, let's say we wanted all elements of class *special* to stil have a background color of yellow, but we wanted `p` elements of class special, in particular, to have really large font.  We can do this by keeping our original `.special` block, which applies to *all* elements with the special class, and we can **add** a new rule that specifically applies to *special paragraphs*:

```css
body {
    background-color:#DDDCCC;
}
p {
    color: black;
}
.normal {
    background-color:white;
}
.quoted {
    font-style: italic;
}
.special {
    background-color:yellow;
}
/* Here's the new rule */
p.special {
    font-size: x-large;
    font-weight: bold;
}
```
<div style='background-color:#DDDCCC'>
    <p style='background-color:white;color:black'> this is my paragraph
    with some <span style="background-color:yellow;">special text</span>
    embedded in it. </p>
    <p style="background-color:yellow;color:black;font-size: x-large;font-weight: bold">Paragraph 4</p>
</div>

As you can see, the yellow background applies to all `.special` elements, and the larger font applies to the `p` element with the `.special` class.

You can also add *multiple* class values to an HTML element.  For example:

```css
.text-subtle {
    font-style:italic;
}
.text-loud {
    font-size: x-large;
}
.back-soft {
    background-color:gray;
}
.back-special {
    background-color: red;
}
```
```html
<p class='text-loud'>Paragraph 1</p>
<p> Paragraph 2</p>
<p class='text-subtle back-special'>Paragraph 3</p>
<p class='text-loud back-soft'>Paragraph 4</p>
```
<p style='font-size: x-large;'>Paragraph 1</p>
<p> Paragraph 2</p>
<p style='text-subtle background-color: red;'>Paragraph 3</p>
<p style='font-size: x-large; background-color:gray;'>Paragraph 4</p>

Class names are separated by *spaces* when multiple classes appear on the same HTML element.

### Comments
We've used comments a few times.  Comments in CSS follow the multiline syntax for C-styled languages, starting with `/*` and ending with `*/`.  There are no single line comments in CSS (ie no `//`).  Comments in CSS have the same principles of HTML comments, in that *they are visible to users*.  Therefore, never put anything in CSS comments you don't want a random stranger on the internet to see!

Comments tend to be a little more common in CSS than HTML, only because CSS can be a little more complex.  

### Wildcard Selectors
There are ways of specifying *all* elements - using the *wildcard* selector:

```css
* {
    color: black;
}
```
That rule sets all elements to have black font color.  The wildcard is useful for setting up defaults, although keep in mind that many CSS properties *inherit* from their parent element.  For example, if we set `body` color to be `black`, then all elements *within* body will have their color be `black` as well - unless they specify otherwise.  

Commonly, developers will set defaults using type selectors on either `html` or `body` elements, **or** they will use the `*` selector.  Note, when setting defaults, make sure you think carefully about the "last one wins" principle!  Set defaults in external stylesheets that are linked *first*.  Set defaults at the *top* of `style` elements.

## Pseudoclasses
CSS defines several *pseudoclasses*.  Rules that use these can specifying styling for elements when they are very specific states. 

For example, a hyperlink (`a`) might normally be colored one specific way.  However, if we want to style them differently *when they are clicked*, or *when they have already been visited*, then we use pseudoclasses to faciliate this.

```css
a:visited {
    /* Links that have already been visited on this browser */
    color: purple;
}
a:link {
    /* Links that have NOT been visited */
    color: blue;
}
a:active {
    /* Links that have been clicked, but the mouse (or finger) has not released */
    color: pink;
}
a:hover {
    /* Links that are being hovered over by the mouse*/
    color: green;
}
```
The above CSS sets *visited* links to have purple text, unvisited links to have blue text, links that have been clicked by not released to have pink text, and links being hovered over by a mouse (but not clicked) to have green color.  The `:hover` modifier works with lots of HTML elements in fact.  For example, you can make a `div` appear to be "clickable" by using the `:hover` modifer, and setting the `cursor` property:

```css
div:hover {
    text-decoration:underline;
    cursor: pointer;
}
```
```html
<div>Fooled you, you can't actuall click this</div>
```
<article>
    <style>
        #d:hover {
            text-decoration:underline;
            cursor: pointer;
        }
    </style>
    <div id='d'>Fooled you, you can't actuall click this</div>
</article>

You can read about other pseudoclasses on the [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes).

## Child, sibling, descendent selectors
When just learning CSS, it's easy to fall into the trap of limiting yourself to simple *type*, *id*, and *class* selectors - and over-relying on them.  This generally leads to two symptoms of poor CSS design.  You can think of them as *code smells*.  They aren't a problem in small doses, but they generally point towards *something* being not quite right:

1. You are choosing HTML elements specifically to help you differentiate them when creating CSS rules
2. Your HTML elements are getting cluttered with *lots* of class attributes and ids.

Often these are symptoms of not being able to adequately use CSS selections to properly identify HTML elements in a complex page.  The solution many fall back on is short-cutting the selection process and turning to `id` and `class` selectors right away (and exclusively).  Overlooked however, is that CSS offers much more powerful selection techniques that simple type/id/class selectors - through combinator, descendent, sibling, and attribute-based selection.  


### Descendents and sibling selectors
Let's assume we have the following HTML structure:

```html
<section>
    <h1>Articles</h1>
    <p>Explanation of the Articles</p>
    <article>
        <h1>Article 1 Heading</h1>
        <p>Paragraph 1</p>
        <p>Paragraph 2</p>
        <p>Paragraph 3</p>
        <p>Paragraph 4</p>
        <footer>Final notes</footer>
    </article>
    <article>
        <h1>Article 2 Heading</h1>
        <p>Paragraph 1</p>
        <p>Paragraph 2</p>
        <p>Paragraph 3</p>
        <p>Paragraph 4</p>
        <footer>Final notes</footer>
    </article>
</section>
```

#### Descendant
What if we want to make article headings have red font, while leaving the "Articles" main heading the default color.  One solution is to change the HTML, perhaps making the `h1` inside the `article` element and `h2` instead.  Another solution is to add a `class` to the article heading `h1` element.  There's an easier approach though:

```css
article h1 {
    color:red;
}
```
The above CSS is a *descendant* selector.  Note, there is no comma `,` between `article` and `h1` - and the absense of the comma means that we are specifically references `h1` elements that are *inside* `article` elements.  The effect is that **only** the Article 1 Heading and Artical 2 Heading are colored red by this rule.

#### `>` Direct Child 
In the HTML above, `p` elements are found at the top ("Explanation of Articles"), and in the articles themselves.  Assuming there are paragraphs elsewhere in the page, what if we want to style **only** the `p` elements inside our main `section` element?  Then this would be perfect:

```css
section p {
    color:blue;
}
```
That will capture the `p` element "Explanation of Articles" and **also** all the paragraphs in the articles themselves.  But what if we wanted to **only** capture the "Explanation of Articles" part, and not the paragraphs within the articles?  Here, we could use the *direct child* selector:

```css
/* Only matches p elements that are direct children
   of section elements
*/
section > p {
    color: blue;
}
```
#### `+` Next sibling 
What if we wanted to style **only the first paragraph** inside each article?  The *descendant* selector and the direct child `>` won't due here, because there are potentially many paragraphs within each `article`.  Here, we can take advantage of the `+` selector combinator, which selects the very **next** adjacent sibling element.

```css
/* will select only the first p following an h1 */
h1 + p {
    font-style: italics;
}
```
There's an assumption built in above that the only place `h1` elements are followed by `p` elements is inside `articles` however - which isn't true.  In fact, the CSS above will capture the `p` elements that says "Explanation of Articles" too, since it is an immediate (following) sibling of the "Articles" heading.  We can refine our rule by *combining* a descendant and direct child selector:

```css
/* will select only the first p following an h1, as
   long as the h1 is found within an article element
*/
article h1 + p {
    font-style: italics;
}
```
**Pro Tip**&#128161; Part of the power of CSS is the ability to *combine* concepts.  All of the selectors we cover can be combined with others.  We can use descendant selectors with classes (ie `.myclass p` would select `p` elements within any element with the `myclass` class), ids, pseudoclasses, etc.  The combinations are essentially limitless and allows *most* css rules to be applied without modification to HTML.  As always, judgement is key.  If you find yourself creating long, complex selectors that require comments, you should consider shortcutting and using classes or something else, to simplify.  If you find your HTML littered with ids and classes, you should consider making better use of CSS selector combinations.  It's all about balance!

#### `~` Siblings (all of 'em) 
It's also possible to select all the siblings of an element - no matter if they come before, after, right next to, or far away. 

While this isn't the *only* way we could do this - here's a way to select all the elements inside the article **except** the `h1` - using sibling:

```css
article h1 ~ * {
    /* Selects the siblings (regardless of type) of
       each h1 inside an article. */
    text-decoration: underline;
}
```
Notice the use of `*`.  When used within descendent and siblings selectors, the `*` is a lot more useful.  It can select all element types.  If we wanted to instead *only* select footers that were siblings of `h1` elements inside `article`, we could use the following:

```css
article h1 ~ footer {
    /* Selects the sibling footer of
       each h1 inside an article. */
    text-decoration: underline;
}
```
Clearly, given the HTML we started with, a simple type selector on `footer` could have achieved the same thing, since `footer` is only found in the HTML inside articles.  We always want to use the *simplest* CSS as possible - however the above is being used merely to demonstrate how the `~` operator can be used.

### `[attribute]` selectors 
There are many situations where you want to select specific elements *based on what attributes they have*.  Attribute selectors are extremely powerful selection mechanisms that let you achieve this.

Let's use an example basedon an HTML form:

```html
<form>
    <p><input name='first' type='text'/></p>
    <p><input name='last' type='text'/></p>
    <p><input name='age' type='number' placeholder="Enter your age in months"/></p>
</form>
```
How could we style the `input` element for *first name* specifically?  All the elements in the form are of type `input`, and they don't have any classes or ids.  The *attribute* selector will let us do this, as follows:

```css
input[name="first"] {
    /* selects input elements with name = first */
    color:blue;
}
input[type="number"] {
    /* selects only inputs of type number (the age element above) */
    color: red;
}
```
We could also find elements based on whether or not they have an attribute - not just the attribute's value itself. 

```css
input[placeholder] {
    /* selects only inputs that have a placeholder, regardless of what
       the placeholder value is.  This selects the age and last name 
       inputs */
    background-color: yellow;
}
```
<form>
    <p><input name='first' style="color:blue;" type='text'/></p>
    <p><input name='last' style="background-color: yellow;" type='text'/></p>
    <p><input name='age' type='number' style="color: red;background-color: yellow;" placeholder="Enter your age in months"/></p>
</form>

**Pro Tip**&#128161; Often, we **do** have ids on form elements.  We also often have the opportunity to put classes on the elements.  We are covering CSS selectors, and demonstrating all the ways you can select elements.  As has been repeated several times now however, there is nothing inherently wrong with using class and id selectors, which may very well be more convenient in this particular example.  It's all about knowing how to use all the tools CSS provides, so you can choose the best one given your specific circumstance!

Attribute selection can also leverage basic regular expressions, to select elements with attribute values matching specific text patterns.  There's much more to see - and you can read more on the [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors).

## Nesting Selector
Nesting CSS rules is a *new* feature that grew from features in CSS preprocessors like SASS and LESS.  Nesting became widely available in most major browers in 2023, so you do need to be careful using it.  Nesting allows you to write descendent-like rules using what many feel is a more convenient and clear style.  Let's take the following example:

```css
article {
    color: blue;
}
article p {
    font-style: italics;
}
```
The rules above are telling the browser that all text within `article` elements should be colored blue, and all `p` elements inside `article` elements should be in italics.  Many developers find the following syntax more convenient - *especially when they have lots of CSS rules*:

```css
article {
    color: bluw;

    & p {
        font-style: italics;
    }
}
```
The nested rule is nice because the rules that are governing things *inside* `article` are actually written *inside* the `article` rule.  When you have lots of CSS rules, this is more important - because related CSS rules tend to get scattered, making things a lot harder to manage.  The web browser actually simply transforms the above nested rule into the first set of rules - there is no difference in outcome.  

Read more on the [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Nesting_selector)

## More psuedo things!
Modern CSS features a slew of additional *pseudo class* and *pseudo function* selectors to make life easier when building complex selectors.  Again, these additions to the languages are following a pattern of allowing developers to rely *less* on class and id selectors, keeping HTML clean and simple.  Here's some useful ones, and you are encouraged to learn more on the [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS).

### Positional functions
We covered descendant, child, and sibling selectors earlier.  While those selectors cover *most* of the use cases you'll encounter, there are more complex cases where additional CSS positional selectors can make things easier.  These include:

- `:last-child`
- `:last-of-type`
- `:first`
- `:first-child`
- `:first-of-type`
- `:nth-child()`
- `:nth-last-child()`
- `:nth-last-of-type()`
- `:nth-of-type()`

As an example, to select *second* paragraph in an article, and the *last* paragraph within an `article` element, you could use the following CSS:

```css
article p:nth-child(2) {
    /* Selects the second paragraph inside an article*/=
}
article p:last-of-type {
    /* Selects the last paragraph inside an article*/
}
```

### Form input states
While you can use attribute selectors to cover most things with form elements, element state psuedoclasses make things much easer.  The following can be used with `input` elements (and other form elements) for styling, and the styling selection is updated in realtime.  

- `:checked` 
- `:disabled`
- `:focus`
- `:invalid`
- `:required`
- `:readonly`

For example, if you want to make the `label` element associated with a checked input box red, you can write a rule that leverages both sibling selectors and the `:checked` pseudoclass.
```css
input:checked  ~ label{
    /* Sets the background color of checkboxes to red when checked*/ 
    background-color:red;
}
```
```html
 <p>
    <input name="red-check" type='checkbox'/>
    <label for='red-check'>Check me to see</label>
</p>
```
<div>
    <style>
        .red-check:checked ~ label {
            /* Sets the background color of checkboxes to red when checked*/ 
            background-color:red;
        }
    </style>
    <p>
        <input name="red-check" class="red-check" type='checkbox'/>
        <label for='red-check'>Check me to see</label>
    </p>
</div>

The above highliths an important concept with *descendant* selections.  When we write a selector such as `A ~ B`, it is the element identifies as `B` that gets selected - if and only if it is a sibling of `A`.  Students often are confused, and think `A` is getting selected if it has sibling `B`, when the opposite is the case.  In the example above, `label` is selected and styled, but only if the `label` is a sibling of a checked input.

### Functions
This brings us to a couple of convience functions, that can help address some of the more awkward types of selections.  For example, what if we actually want to select `div` that has a `:checked` input within it?

```css
/* This doesn't work, it selects the :checked
   input INSIDe the div, not the div itself*/
div :checked {
    background-color:yellow;
}
```
The `:has()` function is a newly created CSS function that makes this easy.  Note, it has only become widely available since 2023, so it's possible that support is spotty on some platforms.

```css
/* Selects the div element that has a :checked element within it*/
div:has(:checked) {
    background-color:yellow;
}
```
<section>
    <style>
        .t div:has(:checked) {background-color:yellow;}
    </style>
    <article class='t'>
        <div>
            <input type='checkbox'/>
            <label>Check me to see</label>
        </div>
        <div>
            <input type='checkbox' checked/>
            <label>Check me to see</label>
        </div>
    </article>
</section>

Theres a number of useful utility functions like `:has`.  In particular, `:is()` allows you to more conveniently form what normally would by complex expression:

```css
/* Find p or span inside article, section, or div */
section p, section span, article p, article span, div p, div span {
    color:blue;
}
/* Also finds p and span inside article, section or div - but easier on the eyes!*/
:is(section, article, div) :is(p, span) {
    color: blue;
}
```
The `:not()` function makes it easier to write rules that exclude specific things.  Let's say you wanted to style all elements to have font color of blue *except* lists, `ul`, `ol`, `dl`.  You could use wildcards:

```css
* {
    color:blue;
}
/* Unlcear what to set these colors to though, what was the default color originally? */
ul, ol, dl {
    color: ???
}
```

To sidestep this problem, we can use `:not()`!

```css
:not(ol, ul, dl) {
    color: blue;
}
```
<hr/>

Again, your are highly encourage to use the [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS) and other online resources that more exhaustively cover all of the selector types supported by CSS.  They are numerous, but one you master the concept - applying your skills to new selectors is intuitive and natural!