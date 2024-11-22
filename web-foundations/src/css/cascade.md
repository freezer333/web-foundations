# *Cascading* Style Sheets
We're far from through looking at all of the different features of CSS - we've seen just the tip of the iceberg in terms of CSS attributes (ie. `color`, `background-color`, etc).  We'll introduce more and more over the next few sections of this chapter, but we need to deal with another important part of CSS first - the *cascading* part.

Cascading refers to the mechanism in which CSS decides *which rule* takes precedence when there are *multiple rules* applicable to an HTML element.

Let's start really simple, and then build.  Take the following CSS:

```css
p {
    font-style: italic;
    color:blue;
}
p {
    color: red;
}
```
Any `p` element on the page will have *two* applicable CSS rules governing the font color.  This is a pure "tie", the rules are specified exactly the same.  As we've already seen, in this case, *the last rule wins*.  Whatever the browser sees *last* will take precendance.  It's important to now that the ordering rule applied for *where* the CSS came from too.  For example:

```html
<head>
    <!-- Let's assume style.css has a p { color: blue } rule in it-->
    <link href="style.css"/>
    <style>
        p {
            color: red;
        }
    </style>
</head>
<body>
    <p>Paragraph 1</p>
    <section><p>Paragraph 2</p></section>
</body>
```
<p style='font-style: italic;background-color:red'>Paragraph 1</p>
<section><p style='font-style: italic;background-color:red'>Paragraph 2</p></section>

Neither of the `p` elements will be colored blue, since the `link` was found *before* the style element.  The rule in the `style` element takes precedence.  Note that Paragraph 2 will be yellow, not blue - as the `style` attribute  is always considered "last", and will always win.

**Here's the important point however**:  The *ordering* rule only matters when the rules in question were specified in the same way.  The more dominant principle in *rule cascade* is to determine precedance based on **specificity**.

For example:

```css
section p {
    color:blue;
    font-style: italics;
}
p {
    color: red;
}
```

```html
<head>
    <!-- Let's assume style.css has a p { color: blue } rule in it-->
    <link href="style.css"/>
    <style>
        p {
            color: red;
        }
    </style>
</head>
<body>
    <p>Paragraph 1</p>
    <section><p>Paragraph 2</p></section>
</body>
```
The CSS rules above are both selecting `p` elements, however one (`section p`) is *more specific* than the other (`p`) rule.  The second (`color: red`) selects any `p` element, where the first (`color:blue`) selects only `p` elements found within `section`.  When this is the case, *both* rules match "Paragraph 2", and paragraph 2 will be colored *blue* since the first CSS rule is more specific.  **Specificity takes precedance over order**.

<p style='font-style: italic;background-color:red'>Paragraph 1</p>
<section><p style='font-style: italic;background-color:blue'>Paragraph 2</p></section>

The *selector* always determines **specificity**, and the calculation of *specificity* happens at the *attribute* level, not the declaration block level.  You can see this happening with the text style of Paragraph 2 - note it is **still in italics**.  The less specific block (`p {...}`) is not ignored when rendering Paragraph 2, and still supplies the value for the `font-style`.  It's not in conflict with any other rule, so it is honored.  

**Pro Tip**&#128161; This is worth repeating.  Cascading / tie breaking - it all happens at the level of a specific *attribute*.  Think of the browser making an completely individual calculation for each attribute - `color`, `font-style`, `background-color`, etc.  Each decision is completely independent from the others.  The browser makes the calculation **for every CSS attribute**, whether your CSS specifies them or not.  The algorithm starts with the HTML element, and loops through all available attributes for that HTML element - it **does not** start with your CSS, trying to find each HTML element it refers to.  If you think about this the correct way, you'll find CSS *a lot more predictable*.

## Selector Sorting
The following CSS *deterministally* styles the associated HTML:

```css
p {color: red}
#p1 {color: green}
.special {color: blue}
```
```html
<p>Paragraph 1</p>
<p id="p1" class="special">Paragraph 2</p>
<p class="special">Paragraph 3</p>
```
<p style="color:red">Paragraph 1</p>
<p style="color:green">Paragraph 2</p>
<p style="color:blue">Paragraph 3</p>

When we say *deterministically*, we mean - it's not guess work.  There are multiple rules matching multiple elements, but the by learning the specificity rules, we can be 100% certain of the outcome, and thus use those rules to our advantage.

The *rule cascade* is performed **for each CSS attribute** on **each HTML element** independently and in **two stages**:

- Stage 1:  Origin and Importance
- Stage 2:  Specificity

### The Cascade - Stage 1
There are 3 potential *origins* of a CSS rule.  
1. Author:  The author of the web page (the web developer!).  It doesn't matter if the CSS is from an external stylesheet, and embedded `style` element, or a `style` attribute - if it's coming from the code itself, it's considered to be specified by the "Author".  The vast majority of CSS rules will of course come from the author, however...
2. User-Agent:  The User-Agent - a.k.a the *web browser* will also provide some *default* CSS rules.  Generally these are very plain rules - like setting the color to black, background color to white, and font to something like Times New Roman.  They are rules, nonetheless.  
3. User:  Typically, web browsers will let the user (the person using the web browser) set some defaults.  They might not realize they are interacting with CSS, usually there is a nicer user interface, but they are.  The user might set default font sizes, colors, etc - and these are relavent to the rule cascade as well.

A second factor plays a role in Stage 1 cascading, and that is *importance*.  Each CSS rule may be marked as *important* using `!important` at the end of the rule.

```css
p {
    font-size: larger !important;
}
```
The `!important` flag shouldn't be abused, especially by the web author, but it plays a critical role.  Styles sometimes aren't "preference", but "necessities."  Consider a user who is vision impaired.  Specifying a larger font size isn't just a personal preference, it's necessary for them to view the page.  The `!important` flag is really meant to communicate the difference between asking for the font style to be `Comic Sans` because you think it's cool, and asking for the color to be black and background to be white because *you are color blind*.  

Combined, the *origin* and *importance* dictates the precedence of CSS rules.  When the browser finds more than one CSS rule associated with an HTML element and CSS attribute - no matter where it comes from, it sorts the rules by placing them in **bins** - based on the following:

- Bin 1:  Rules provided by *user* and marked as **important**
- Bin 2:  Rules provided by *author* and marked as **important**
- Bin 3:  Rules provided by *author* (not important)
- Bin 4:  Rules provided by *user* (not important)
- Bin 5:  Rules provided by *user agent* (browser). Agent's do no use `!important`

Observe the philosophy behind this order.  The lowest level is simply browser defaults.  If neither the author or the user specify, the browser *always* specifies a default.  When there is conflict between the user and the author, the decision depends on importance.  If the rule is marked important by both - the *user* wins.  This makes sense, because the user is communicating that this rule is critical - perhaps due to a disability, or some other aspect that clearly takes precedence.  When neither rule is marked as important however, deference is given to the page's author.  The user's preference isn't considered in this case.  

Note that in this first stage, *specificity* is not being considered.  Suppose a *user* provides the following CSS:

```css
p {
    color: red !important;
}
```
However the page author defines:
```css
article p {
    color: blue !important;
}
```
The author's rule is more specific, but it doesn't matter.  The user's rule is `!important`, and is placed in Bin #1.  The author's rule is placed in Bin #2.  The rule in Bin #1 takes precedence.  If there are multiple rules in the highest *bin*, then those rules are compared using **Stage 2** - *specificity.

### The Cascade - Stage 2
The *majority* of CSS rules are *author* specified, and not marked as `!important`.  While the Stage 2 specificity sort takes place *whenever* there are more than one rule in the highest Stage 1 bin, we find ourselves in Stage 2 sort most often because we as web developers have written several rules that apply to a given HTML element.  This is a normal, expected, and encouraged scenario - and everything works great as long as you understand the specificity rules!

Once we've reached Stage 2, we sort rules into one of 4 **bins**:

1. ID Selectors - these identify one and only one element, and are the most specific
2. Class and pseudo-class selectors
3. Descendant and Type Selectors
    - The more types and levels in the descendent, the more specific
4. Universal selectors (`*`)

Critically, rules that have more than one of the above characteristics *are placed in both bins*.

Let's look at a few examples:

1. `#myelement` - Bin #1
2. `.myclass` - Bin #2
3. `.myclass > p` - Bins 2 and 3
4. `div:last-child` - Bins 2 and 3
5. `section p` - Bin 3
6. `div section article p` - Bin 3

Let's assume all of those selectors specify the `color` attribute.  If we have an HTML element that is matched by Bins 1 and 2, then the styling specifies in Bin 1 clearly wins.  What about when an element matches  rules found in two bins though?

For example, let's look at the following:

```html
<section class=myclass>
    <p>A</p>
</div>
```
The `p` element above (A) matches rule #3, it's a direct child of an element with class `myclass`.  It also matches rule #5 - since it is a `p` element inside a `section` element.  Since rule #3 is in Bin 2 (and 3), and Rule #5 is in Bin 3 only, Rule #3 wins a tie.  

```css
/* Rule #3 from above */
.myclass > p {
    color: blue;
}
/* Rule #5 from above*/
section p {
    color: green;
    background-color:yellow;
}
```
The (A) paragraph get's font color blue. The key reason - Rule #3 contained a class selector in it's descendent chain, so it was placed in Bin 2 - and Rule #5 did not.   Note, it still derives it's background color from Rule #5 (yellow).  The tie *only* occured when evaluating `color`, not `background-color`.  

Now let's look at another example:

```html
<div>
    <section>
        <article> 
            <p>B</p>
        </article>
    </section>
</div>
```
The `p` element matches Rule #5 - it's a `p` element within a `section` element.  It *also* matches Rule #6 - it's a `p` elmeent inside an `article`, inside a `section` inside a `div`.  Both rules are in Bin 3, so we have a tie, *within* bins.  The rule applicable rule is that the more types in descendant chains, the more specific - so **Rule 6** prevails.  

5. `section p` - Bin 3
6. `div section article p` - Bin 3

Note, if `article` had been marked with class `.myclass`, then Rule 3 would still be at play, and would  have prevailed over both Rules 5 and 6, regardless of the number of descendant levels Rule 6 had.

As a final example, let's consider two more rules:

1. `p.special {...}` - Bin 2 and 3
2. `*.special {...}` - Bin 2 and 4

Both rules land in Bin 2, and so when we encounter an HTML element that matches both, we have a tie in Bin #2.  Unlike the descendant example above, there's not differentiation - it's a tie in Bin #2.  The sort then looks **in the next bin**, and finds Rule #1 in Bin 3 - where Rule #2 is in Bin 4.  Rule #1 prevails.

If two rules have identical specificity, they occupy the same bins, same origin, same importance... *then* and only then does *ordering* factor into our decision.  If there is a true tie between rules - the **last rule** processed wins.

There are two additional caveats to precedance worth highlighting:

1. There are some situations where HTML and CSS both try to specify a property.  These circumstances are rare, because in most circumstances HTML and CSS are meant to cover *different* things.  A prime example is the HTML attribute `width` however - often specified on `img` elements.  The `width` element is *encouraged*, because it allows the browser to layout the page *before* seeing the image itself - avoiding text reflows.  CSS also can specify width though (`<img style='width: 400px' width="400"`).  When both HTML and CSS specify the same propery, **CSS is given precendence**.
2. The `style` attribute short-circuits the cascade entirely.  It blows out the `!important` and origin sorting, along with any notion of specificity.  It's a heavy-handed approach to CSS - so in addition to it cluttering up your HTML, it's just a bad idea to use.  It's a reasonable solution for odd-ball situations (maybe using CSS and HTML in the middle of a markdown page that gets rendered by something other than a web browser... for example) - but in most circumstances is just non-optimal.

## Rule Inheritance
There is a final aspect to understanding which CSS rules are going to effect your HTML - and that is *inheritance*.  Try not to mix your notion of object oriented programming with what we are talking about within the context of CSS - in this case, we are simply referring to the idea that HTML children *inherit* a lot of properties from their *parent* or containing elements - by default.

```css
section {
    color: red;
}
.purple {
    color: purple;
}
```
```html
<div>
    <p>Normal color</p>
</div>
<section>
    <p>Red</p>
    <p class='purple'>Purple</p>
</section>
```
In the example above, the first `p` element inside the `section` is colored red - since it's parent has font color red, and it doesn't have any rules that directly contradict this.  The red color is *inherited*.  The second paragraph inherits red too, but it has a rule associated with it's class - so the color is superceded with purple.  The paragraph inside the `div` element is unaffected by either CSS rule, and is colored by the user-agent's default (or the user's preference).

Most CSS properties are inherited, particularly related to colors, font styles, and font sizes.  CSS attributes that govern *layout* (see next chapter) generally *are not inherited*.  You can read more about which attributes are inherited, and how to more specifically control what is inherited by reading the [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Inheritance) discussion on the topic.
