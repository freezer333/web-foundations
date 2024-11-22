# Lists and tables
Most of the content within lists and tables is text, and so everything we've already covered applies.  Lists and table have some very specific characteristics to them however.

<ul>
<li>Unordered lists</li>
<li>have these bullet things</li>
<li>and have spacing / indentation</li>
</ul>
<ol>
<li>Ordered lists have similar</li>
<li>characteristics, and also have built in </li>
<li>numbering systems that can be controlled</li>
</ol>
<table>
<thead>
<tr>
<th>Tables have cells</th>
<th>and headers</th>
</tr>
<tbody>
<tr>
<td>Cells have spacing between</td>
<td>and within</td>
</tr>
<tr>
<td colspan="2">and also have borders</td>
</tr>
</tbody>
</table>

## List Bullets and Numbers
The choice of which symbol to use for individual list items is controlled with the `list-style-type` attribute.  For both unordered and ordered list, there are actually [quite a number](https://www.w3schools.com/cssref/pr_list-style-type.php) of choices.  The `list-style-type` is placed on the `ul`, `ol`, and `dl` elements, **not the `li` element**.  Here's some examples - using the *style attribute* only to save some space in the text.

<hr/>

```html
<ul style='list-style-type: square'>
```
<ul style='list-style-type: square'>
<li>Square Unordered Item 1</li>
<li>Square Unordered Item 3</li>
<li>Square Unordered Item 3</li>
</ul>

<hr/>

```html
<ul style='list-style-type: circle'>
```
<ul style='list-style-type: circle'>
<li>Circle Unordered Item 1</li>
<li>Circle Unordered Item 3</li>
<li>Circle Unordered Item 3</li>
</ul>

<hr/>

```html
<ul style='list-style-type: disc'>
```
<ul style='list-style-type: disc'>
<li>Disc Unordered Item 1</li>
<li>Disc Unordered Item 3</li>
<li>Disc Unordered Item 3</li>
</ul>

<hr/>

```html
<ul style='list-style-type: none'>
```
<ul style='list-style-type: none'>
<li>None Unordered Item 1</li>
<li>None Unordered Item 3</li>
<li>None Unordered Item 3</li>
</ul>

<hr/>

```html
<ol style='list-style-type: decimal-leading-zero'>
```
<ol style='list-style-type: decimal-leading-zero'>
<li>Leading Zero - 1</li>
<li>Leading Zero - 2</li>
<li>Leading Zero - 3</li>
</ol>

<hr/>

```html
<ol style='list-style-type: upper-alpha'>
```
<ol style='list-style-type: upper-alpha'>
<li>Upper Alpha - 1</li>
<li>Upper Alpha - 2</li>
<li>Upper Alpha - 3</li>
</ol>

<hr/>

```html
<ol style='list-style-type: lower-alpha'>
```
<ol style='list-style-type: lower-alpha'>
<li>Lower Alpha - 1</li>
<li>Lower Alpha - 2</li>
<li>Lower Alpha - 3</li>
</ol>

<hr/>

```html
<ol style='list-style-type: upper-roman'>
```
<ol style='list-style-type: upper-roman'>
<li>Lower Roman - 1</li>
<li>Lower Roman - 2</li>
<li>Lower Roman - 3</li>
<li>Lower Roman - 4</li>
<li>Lower Roman - 5</li>
<li>Lower Roman - 6</li>
</ol>

We can alse create and use our own symbols:

```css
ul {
  list-style-image: url('../images/star.png');
}
```

<ul style="list-style-image: url('../images/star.png')">
<li>Circle Unordered Item 1</li>
<li>Circle Unordered Item 3</li>
<li>Circle Unordered Item 3</li>
</ul>


## List indentation
List elements have clear indentation on the left side, and this is controlled by `padding`, which we will see in the next chapter in more detail.  We can alter the padding by specifying `padding-left` values, as a CSS height.

```html
<ul style="list-style-image: url('../images/star.png')">
<li style='padding-left: 10em'>Circle Unordered Item 1</li>
<li style='padding-left: 5em'>Circle Unordered Item 3</li>
<li>Circle Unordered Item 3</li>
<li style='padding-left: 0em'>Circle Unordered Item 3</li>
</ul>
```

<ul style="list-style-image: url('../images/star.png')">
<li style='padding-left: 10em'>Circle Unordered Item 1</li>
<li style='padding-left: 5em'>Circle Unordered Item 3</li>
<li>Circle Unordered Item 3</li>
<li style='padding-left: 0em'>Circle Unordered Item 3</li>
</ul>

We can also add padding to the `ul` or `ol` elements themselves, which creates consistent padding throughout the list:

```html
<ul style="padding-left: 10em; list-style-image: url('../images/star.png')">
<li>Circle Unordered Item 1</li>
<li>Circle Unordered Item 3</li>
<li>Circle Unordered Item 3</li>
<li>Circle Unordered Item 3</li>
</ul>
```

<ul style="padding-left: 10em; list-style-image: url('../images/star.png')">
<li>Circle Unordered Item 1</li>
<li>Circle Unordered Item 3</li>
<li>Circle Unordered Item 3</li>
<li>Circle Unordered Item 3</li>
</ul>

Notice that in when we set the padding of the `ul` element though, the *markers* move with the text, where when we set the padding of the `li` element it did not.  This is because by default, the markers are *part* of the `li` element.  When adding padding to the parent (`ul`), it's creating space between the interior of the `ul` and the exterior of the `li`.  That can be more easily seen when we draw borders around the elements (we'll also see a lot more on borders in the next chapter).

```html
<ul style="border: thin solid yellow; padding-left: 10em; list-style-image: url('../images/star.png')">
<li style='border: thin solid red'>Circle Unordered Item 1</li>
<li style='border: thin solid red'>Circle Unordered Item 3</li>
<li style='border: thin solid red'>Circle Unordered Item 3</li>
<li style='border: thin solid red'>Circle Unordered Item 3</li>
</ul>
```

<ul style="border: thin solid yellow; padding-left: 10em; list-style-image: url('../images/star.png')">
<li style='border: thin solid red'>Circle Unordered Item 1</li>
<li style='border: thin solid red'>Circle Unordered Item 3</li>
<li style='border: thin solid red'>Circle Unordered Item 3</li>
<li style='border: thin solid red'>Circle Unordered Item 3</li>
</ul>

Notice that the markers are *outside* the `li`, but move with the `li`.  We can also modify this, and specify that the dimensions should be calculated with the list markers *inside* the `li` elements using `list-style-position` - although this isn't all that common.

```html
<ul style="border: thin solid yellow; padding-left: 10em;list-style-position: inside; list-style-image: url('../images/star.png')">
<li style='border: thin solid red'>Circle Unordered Item 1</li>
<li style='border: thin solid red'>Circle Unordered Item 3</li>
<li style='border: thin solid red'>Circle Unordered Item 3</li>
<li style='border: thin solid red'>Circle Unordered Item 3</li>
</ul>
```

<ul style="border: thin solid yellow; padding-left: 10em;list-style-position: inside; list-style-image: url('../images/star.png')">
<li style='border: thin solid red'>Circle Unordered Item 1</li>
<li style='border: thin solid red'>Circle Unordered Item 3</li>
<li style='border: thin solid red'>Circle Unordered Item 3</li>
<li style='border: thin solid red'>Circle Unordered Item 3</li>
</ul>

To *color* list element, we can add `background-color` to the `li` elements, or the `ul`/`ol` containing elements.  This is also where the difference between *inside* and *outside* for markers plays a role in rendering.

```html
<ul style="background-color: green; padding-left: 10em;list-style-position: inside; list-style-image: url('../images/star.png')">
<li style='background-color: teal'>Circle Unordered Item 1</li>
<li style='background-color: teal'>Circle Unordered Item 3</li>
<li style='background-color: teal'>Circle Unordered Item 3</li>
<li style='background-color: teal'>Circle Unordered Item 3</li>
</ul>
```

<ul style="background-color: green; padding-left: 10em;list-style-position: inside; list-style-image: url('../images/star.png')">
<li style='background-color: teal'>Circle Unordered Item 1</li>
<li style='background-color: teal'>Circle Unordered Item 3</li>
<li style='background-color: teal'>Circle Unordered Item 3</li>
<li style='background-color: teal'>Circle Unordered Item 3</li>
</ul>

```html
<ul style="background-color: green; padding-left: 10em;list-style-position: outide; list-style-image: url('../images/star.png')">
<li style='background-color: teal'>Circle Unordered Item 1</li>
<li style='background-color: teal'>Circle Unordered Item 3</li>
<li style='background-color: teal'>Circle Unordered Item 3</li>
<li style='background-color: teal'>Circle Unordered Item 3</li>
</ul>
```

<ul style="background-color: green; padding-left: 10em;list-style-position: outide; list-style-image: url('../images/star.png')">
<li style='background-color: teal'>Circle Unordered Item 1</li>
<li style='background-color: teal'>Circle Unordered Item 3</li>
<li style='background-color: teal'>Circle Unordered Item 3</li>
<li style='background-color: teal'>Circle Unordered Item 3</li>
</ul>

By playing around with padding, marker positions, and the markers themselves, you can create a near infinite number of list designs with CSS>

## Table cells
Table sizing work the same way as sizing any other *block* element, and we'll discuss it more detail during the next chapter.  Table cells, the `td` elements also can have `padding`, which is common to all HTML elements (more in the next chapter).  Tables have some *unique* properties however, which govern the *spacing* between cells.

Like any other *block* element, we can use `text-align` on the `td`, `tr`, `th`, etc elements to control the *horizontal alignment* of text.  


```html
<table style="width:100%">
    <tbody>
        <tr>
            <td style="text-align: left">Left</td>
            <td style="text-align: center">Center</td>
            <td style="text-align: right">Right</td>
        </tr>
    </tbody>
</table>
```

<table style="width:100%">
    <tbody>
        <tr>
            <td style="text-align: left">Left</td>
            <td style="text-align: center">Center</td>
            <td style="text-align: right">Right</td>
        </tr>
    </tbody>
</table>

The vertical alignment of text can also be adjusted with the `vertical-align` property:

```html
<table style="width:100%">
    <tbody>
        <tr>
            <td style="height:100px; vertical-align: bottom">Bottom</td>
            <td style="height:100px; vertical-align: middle">Middle</td>
            <td style="height:100px; vertical-align: top">Top</td>
        </tr>
    </tbody>
</table>
```

<table style="width:100%">
    <tbody>
        <tr>
            <td style="height:100px; vertical-align: bottom">Bottom</td>
            <td style="height:100px; vertical-align: middle">Middle</td>
            <td style="height:100px; vertical-align: top">Top</td>
        </tr>
    </tbody>
</table>


## Table borders
We will cover borders in general in the next chapter, however table cells, rows, and the tables themselves may have borders set.  The `border-collapse` attribute controls whether or not adjacent cells *share* the same border.

```css
table {
    border-collapse: separate;
}
```
<table style="border-collapse:separate; width:100%">
    <tbody>
        <tr>
            <td style="text-align: left">Left</td>
            <td style="text-align: center">Center</td>
            <td style="text-align: right">Right</td>
        </tr>
        <tr>
            <td style="text-align: left">Left</td>
            <td style="text-align: center">Center</td>
            <td style="text-align: right">Right</td>
        </tr>
    </tbody>
</table>

```css
table {
    border-collapse: collapse;
}
```
<table style="border-collapse:collapse; width:100%">
    <tbody>
        <tr>
            <td style="text-align: left">Left</td>
            <td style="text-align: center">Center</td>
            <td style="text-align: right">Right</td>
        </tr>
        <tr>
            <td style="text-align: left">Left</td>
            <td style="text-align: center">Center</td>
            <td style="text-align: right">Right</td>
        </tr>
    </tbody>
</table>

The *spacing* between cells **only exists** with `border-collapse` set to `separate`. When that is set, you can *control* the spacing using the `border-spacing` property:

```css
table {
    border-collapse: separate;
    border-spacing: 20px;
}
```
<table style="border-collapse:separate; border-spacing: 20px; width:100%">
    <tbody>
        <tr>
            <td style="text-align: left">Left</td>
            <td style="text-align: center">Center</td>
            <td style="text-align: right">Right</td>
        </tr>
        <tr>
            <td style="text-align: left">Left</td>
            <td style="text-align: center">Center</td>
            <td style="text-align: right">Right</td>
        </tr>
    </tbody>
</table>

As described earlier, to control spacing *within* the table cells, you will use `margin` and `padding`, which is discussed in the next chapter.

## Table Colors
Table cells, rows, and tables themselves can have background colors.  In conjunction with border spacing, we can see how they all interact with eachother:

```css 
    /* The entire table set to teal */
    table {
        background-color: teal; 
        border-collapse:separate; 
        border-spacing: 20px; 
        width:100%
    }
    /* The first row is set to have green background */
    tr:first-child {
        background-color: green; 
    }

    /* Second column in second row set to yellow */
    tr:nth-child(2) td:nth-child {
        background-color: yellow; 
    }
```


<table style="background-color: teal; border-collapse:separate; border-spacing: 20px; width:100%">
    <tbody>
        <tr style='background-color: green; '>
            <td style="text-align: left">Left</td>
            <td style="text-align: center">Center</td>
            <td style="text-align: right">Right</td>
        </tr>
        <tr>
            <td style="text-align: left">Left</td>
            <td style="background-color: yellow; text-align: center">Center</td>
            <td style="text-align: right">Right</td>
        </tr>
    </tbody>
</table>


## Responsive Tables (prelude)
In the next chapter, we will be talking a lot more about *responsiveness* in CSS design.  The concept refers to the idea that CSS should allow HTML elements to respond to changing device sizes in a way that preservers functionality.  Perhaps no other element highlights the need for *responsiveness* more than the table element.  On small screens, tables often do not have enough space to grow.  This leads to extremely difficult to use pages, with tabular data forcing the user to scroll awkwardly to the left and right, and also creating text wrapping issues within the table - where columns try to become so small that text wraps to the extent that even small words are broken up.

<table border="1">
  <tr>
    <td>
      Antiestablishmentarianism Counterintuitively Supercalifragilisticexpialidocious Incomprehensibilities Phenomenological Misunderstandingly Overcompensation Revolutionarily.
    </td>
    <td>
      Disproportionately Uncharacteristically Overindustrialization Parallelogram Counterproductive Substantiality Understandably Hyperresponsiveness.
    </td>
    <td>
      Institutionalization Thermodynamically Counterrevolutionaries Electroencephalography Contradistinction Unimaginably Misinterpretation.
    </td>
    <td>
      Antiestablishmentarianism Counterintuitively Supercalifragilisticexpialidocious Incomprehensibilities Phenomenological Misunderstandingly Overcompensation Revolutionarily.
    </td>
    <td>
      Disproportionately Uncharacteristically Overindustrialization Parallelogram Counterproductive Substantiality Understandably Hyperresponsiveness.
    </td>
    <td>
      Institutionalization Thermodynamically Counterrevolutionaries Electroencephalography Contradistinction Unimaginably Misinterpretation.
    </td>
  </tr>
  <tr>
    <td>
      Anticonstitutionally Discombobulated Overgeneralization Revolutionary Multidisciplinary Underappreciated Indistinguishability Phenomenal.
    </td>
    <td>
      Misrepresentation Interdisciplinary Misappropriation Unconditionally Overrepresentation Supernaturalistic Discombobulation.
    </td>
    <td>
      Miscommunication Internationalization Hyperintellectualism Overexaggeration Phenomenological Overachievement Substantially.
    </td>
    <td>
      Anticonstitutionally Discombobulated Overgeneralization Revolutionary Multidisciplinary Underappreciated Indistinguishability Phenomenal.
    </td>
    <td>
      Misrepresentation Interdisciplinary Misappropriation Unconditionally Overrepresentation Supernaturalistic Discombobulation.
    </td>
    <td>
      Miscommunication Internationalization Hyperintellectualism Overexaggeration Phenomenological Overachievement Substantially.
    </td>
  </tr>
</table>


A better design is to allow for comfortable horizontal scrolling - allowing the table to occupy *more* horizontal space than given, so the content within the cells reads more reasonably.  This is done by *wrapping* the `table` in another block element, and setting the `overlow-x` to `auto` to allow for horizontal scrolling.  The wrapper will occupy 100% of the horizontal space, while providing scrolling for the wider table.  

```html
<!-- Remember, we're only using the style element to save space
     in the textbook, we should be setting this otherwise.
-->
<div style='overflow-x:auto'>
    <table border="1">
        ...
    </table>
</div>
```

<div style='overflow-x:auto'>

<table border="1">
  <tr>
    <td>
      Antiestablishmentarianism Counterintuitively Supercalifragilisticexpialidocious Incomprehensibilities Phenomenological Misunderstandingly Overcompensation Revolutionarily.
    </td>
    <td>
      Disproportionately Uncharacteristically Overindustrialization Parallelogram Counterproductive Substantiality Understandably Hyperresponsiveness.
    </td>
    <td>
      Institutionalization Thermodynamically Counterrevolutionaries Electroencephalography Contradistinction Unimaginably Misinterpretation.
    </td>
    <td>
      Antiestablishmentarianism Counterintuitively Supercalifragilisticexpialidocious Incomprehensibilities Phenomenological Misunderstandingly Overcompensation Revolutionarily.
    </td>
    <td>
      Disproportionately Uncharacteristically Overindustrialization Parallelogram Counterproductive Substantiality Understandably Hyperresponsiveness.
    </td>
    <td>
      Institutionalization Thermodynamically Counterrevolutionaries Electroencephalography Contradistinction Unimaginably Misinterpretation.
    </td>
  </tr>
  <tr>
    <td>
      Anticonstitutionally Discombobulated Overgeneralization Revolutionary Multidisciplinary Underappreciated Indistinguishability Phenomenal.
    </td>
    <td>
      Misrepresentation Interdisciplinary Misappropriation Unconditionally Overrepresentation Supernaturalistic Discombobulation.
    </td>
    <td>
      Miscommunication Internationalization Hyperintellectualism Overexaggeration Phenomenological Overachievement Substantially.
    </td>
    <td>
      Anticonstitutionally Discombobulated Overgeneralization Revolutionary Multidisciplinary Underappreciated Indistinguishability Phenomenal.
    </td>
    <td>
      Misrepresentation Interdisciplinary Misappropriation Unconditionally Overrepresentation Supernaturalistic Discombobulation.
    </td>
    <td>
      Miscommunication Internationalization Hyperintellectualism Overexaggeration Phenomenological Overachievement Substantially.
    </td>
  </tr>
</table>

</div>