# Arrays
Objects are bags of *unordered* name value pairs.  The names of their properties can be any serializable data - strings, numbers, booleans.  Their property names are completely arbitrary.  If you think about your understanding of *arrays* from other langauges, arrays are *specializations* of that same definition.  Arrays are **ordered** name value pairs, with the **names** being specifically **integers**.  

In most languages, the concept of an array carries with it a specific notion of how it is *implemented* in the language.  In C, C++, Java, C# an array is not only an ordered set of values whose names are integers, but they are a *homogenous* set of values, consecutively / contiguously stored in memory.  **This is not the case** in JavaScript.  In JavaScript, arrays are implemented using objects - they are not laid out in memory any differently.  This means that arrays are extremely flexible (you can store arrays with a mix of data types within them, for example), but they are no more memory efficient or performant than objects are.  That's not to say they are slow, but they aren't using the same short cuts and optimizations that typical arrays use.

**Pro Tip**&#128161; By the way, this is also by things like `Float32Array`, `Float64Array`, `Int16Array`, `Int32Array`, and more exist.  There is a realization that now that JavaScript is widely used as a *general purpose* language, there **are** situations where programmers want to use homogeneous, contiguous memory aligned arrays - and enjoy the efficiency and performance that comes with that.  These array types are much more similar to their counterparts in C, C++, Java, and C# than traditional JavaScript arrays.  That said, for most use cases JavaScript arrays are *still* the way to go.  They offer a very good compromise between flexibility and performance.  If you are absolutely positive that you want homogeneous data, and you know that performance is going to matter (i.e. we aren't talking about an array with a couple of dozen elements!), then take a look at other alternatives - just realize that they are no where near as flexible - they are simple data structures designed for speed, not programmer convenience.

## The basics
Arrays are indexed by integers, with the first index being `0`.  Individual elements are **untyped** just as all variables in JavaScript are, and all object properties are.  This implies that heterogenous arrays are a natural part of JavaScript.  Arrays are created using either literal notation - `[]` or using constructor syntax.

Here's an example of the creation of an array containing 5 floating point values:

```js
const a = [1.4, 3.2, 0.9, 4.5, -0.56];

for (let i = 0; i < 5; i++) {
    console.log(a[i]);
}

```
Note that we've created this array with standard `[]` initialization syntax, and used the implied length in the for loop to index through the array and print it's contents.  Arrays have a built in `length` property that is far better to use than a hardcoded length based on the programmer remembering how many elements are in the array however.


```js
const a = [1.4, 3.2, 0.9, 4.5, -0.56];

// MUCH better way to iterate, since now
// we know length is accurate
for (let i = 0; i < a.length; i++) {
    console.log(a[i]);
}

```

The constructor syntax for arrays is also viable, and comes in a number of flavors:

```js
const a = Array();

console.log(a); // []

const b = Array(3);

```
Be careful using the constructor variants with parameters.  Clearly, using one parameter is vastly different than 2 - as when one paramter is used it is intepreted as the size of the array, rather than a single element, but when more than one parameter is used they are intepreted as elements.  Most programmers completely avoid using the constructor for an array, and prefer to always use literal notation **unless** they wish to allocate an array with a preset size (constructor with a single parameter).  In reality, there is often no need to pre-allocate an array with elements however.

## Adding elements
The fact that arrays are not homogenous and not laid out as consecutive/contiguous cells in memory has many implications.  First and foremost, it means that arrays can grow arbitrarily (there is a maximum size, but that maximum size is related to the largest integer that can be represented in JavaScript, making *indexes* beyond it hard to work with).

```js
const a = [];
a[0] = 10;
a[1] = 20;
a[2] = 30;
console.log(a[1]); // prints 20 

```
Notice now why predefining arrays of arbitrary sizes, without initializing the values within those elements, is not something most programmer do a whole lot.  There's just not a lot of great reasons to do so.  It may be slightly more performant, but most JS execution environments do a darn good job at optimizations that make this consideration nearly moot.

```js
const a = [];
for (let i = 0; i < 100; i++) {
    a[i] = i * i;
}
console.log(a[5]); // prints 25

```
Each element of an array is referred to by an index, but the element itself need not be an integer.

```js
const a = [];
a[0] = 10;
a[1] = {a: 1, b: 2};
a[2] = "hello";
console.log(JSON.stringify(a[1]); 
// Prints {a: 1, b: 2}
```
**Pro Tip**&#128161; While it is perfectly natural to have mixes of types within a single array, a word of caution.  Most situations that call for arrays will require you to iterate over the array to do some sort of processing.  That is usually done with a loop.  If your elements all have different data types, then inside the loop you need to figure out what type you are dealing with - unless you know somehow what they are (i.e. odd indexes are numbers, even indexes are string - or some other highly personal pattern).  There are fine ways of doing this, but just understand that just because you **can** doesn't mean you **should**.  JavaScript likes to let you do whatever you want, it's up to you to avoid writing code full of flaws!

## Sparse arrays, deletion & writable length
Adding to arrays implicitely simply by assigning an element is a departure from our understanding of preallocated arrays from other languages, but is not especially shocking.  But let's look at a slightly different code snippet:

```js
const a = [];
a[0] = 10;
a[1] = {a: 1, b: 2};
a[4] = "hello";
```
There's a very tiny change in the above code, relative to our last example.  The first two elements (indexes 0 and 1) are assigned exactly the same, however the next line of code **assigns index 4** to be "hello", instead of the *next* logical index - 2.

Let's see what the array looks like, by using `length`:

```js
for (let i = 0; i < a.length; i++) {
    console.log(`Value at index ${i} = ${a[i]}`);
}
```
```
Value at index 0 = 10
Value at index 1 = [object Object]
Value at index 2 = undefined
Value at index 3 = undefined
Value at index 4 = hello
```
There's a bit to unpack here!  Not only did we add a 5th element to the array, but we also seemingly added slots at index 2 and 3!  Behind the scenes, those allocation aren't actually made though.  Instead, `length` is actually defined by the langauge to be **the value of the largest index, plus 1**.  If we had set `a[10000] = "hello";` we would have seen 9997 `undefined` elements sitting between the `[object Object]` and `hello`.  It's important to note that there is nothing *inefficient* about this.  This concept is a very big departure from statically and contiguously allocated arrays - where a sparse array would mean lots of potentially unused memory allocations.  In JavaScript, a sparse array really just a matter of the indices not being consecutive, from a memory allocation perspective.  **Sparse arrays** have lots of uses, especially when creating caches and mappings of integers to other values - but their use is the exception rather than the rule.

While we're at it, since sparse arrays are easily supported in JavaScript, it follows that we can *delete* elements out of the array - leaving holes in the index sequence too!

```js
const a = [];
for (let i = 0; i < 5; i++) {
    a[i] = i * i;
}

delete a[1];
delete a[4];

for (let i = 0; i < a.length; i++) {
    console.log(`Value at index ${i} = ${a[i]}`);
}

```
```
Value at index 0 = 0
Value at index 1 = undefined
Value at index 2 = 4
Value at index 3 = 9
Value at index 4 = undefined
```
Note that the elements 1 and 4 are now undefined.  Also note that **length** is still 5.  This is a bit of a surprise - deleting the index **does not** remove the index from use within the array, it's deleting the value.

What if we wanted to remove the last element, **and actually change the length** to reflect this?  That's easy - just change the length!

```js
const a = [];
for (let i = 0; i < 5; i++) {
    a[i] = i * i;
}

// Delete index 4
delete a[4];
a.length = 4; // Now 3 is the last index.

for (let i = 0; i < a.length; i++) {
    console.log(`Value at index ${i} = ${a[i]}`);
}
```
In fact, we don't even need to `delete` at all - we can just change the length, and the value will be removed (and garbage collected as applicable).   We can truncate an array to any size.

```js
const a = [];
for (let i = 0; i < 5; i++) {
    a[i] = i * i;
}

a.length = 3; // Now 2 is the last index, the array has 3 elements

for (let i = 0; i < a.length; i++) {
    console.log(`Value at index ${i} = ${a[i]}`);
}
```
```
Value at index 0 = 0
Value at index 1 = 1
Value at index 2 = 4
```
I know what you are thinking...


```js
const a = [];
for (let i = 0; i < 5; i++) {
    a[i] = i * i;
}

a.length = 10; 

for (let i = 0; i < a.length; i++) {
    console.log(`Value at index ${i} = ${a[i]}`);
}

```
```
Value at index 0 = 0
Value at index 1 = 1
Value at index 2 = 4
Value at index 3 = 9
Value at index 4 = 16
Value at index 5 = undefined
Value at index 6 = undefined
Value at index 7 = undefined
Value at index 8 = undefined
Value at index 9 = undefined
```
Yep, you can enlarge an array simply by changing it's length too.  Really, you aren't even enlarging the array - you are just setting the `length` property.  All you are doing is changing *how many* indices you are accessing with your `for` loop - which is controled with `a.length`.

```js
const a = [];
for (let i = 0; i < 3; i++) {
    console.log(`Value at index ${i} = ${a[i]}`);
}
```
We are coming full circle.  In the code above, we don't use length at all - and we see the truth behind all of this.  **Accessing an index that doesn't exist** is a perfectly natural thing in JavaScript, just like accessing a property name in an object.  If the property name doesn't exist, we get `undefined`.  If the **index** doesn't exist, we get `undefined` too!

## Better Iteration with `in` and `of`
What if we really actually want to visit each index in an array, but we suspect it's sparse.  How can we tell whether a given element has anything in it intentionally or not?

Recall how objects work (after all, arrays *are* objects).  We can use the `in` operator!

```js
const a = [];
for (let i = 0; i < 5; i++) {
    a[i] = i * i;
}

delete a[1];
delete a[4];

// Use the in operator, to iterate over properties/indcies
for (const i in a) {
    console.log(`Value at index ${i} = ${a[i]}`);
}
console.log(a.length);

```
```
Value at index 0 = 0
Value at index 2 = 4
Value at index 3 = 9
5
```
In the above code, we've deleted indexes 1 and 4, and unlike our standard for loop from before, we used the `for in` loop that skips over unused / deleted indices.  Notice, length is still unchanged - the `for in` loop isn't using it.

The `for in` loop is a great way to iterate over an array and be more sure that you will only iterate the elements used.  It allows you to navigate through a very sparse array without incurring the costs of processing (or manually coding skip logic) all the empty elements.

If you want to iterate over the *values* of an array rather than the *indices* of an array, then you can use the `for of` loop instead.

```js
const a = [];
for (let i = 0; i < 5; i++) {
    a[i] = i * i;
}

delete a[1];
delete a[4];

// Use the of operator, to iterate over values
for (const v of a) {
    console.log(v);
}
```
```
0
undefined
4
9
undefined
```
This brings us to **another** surprise.  When using `of`, JavaScript actually does use `length` to determine which elements to visit, and visits every element within the array up to `length-1`.  This means `for of` visits **every** element in a sparse loop, while `for in` visits only the used indices.

If you are frustrated by this inconsistency, that's understandable.  However, the idea behind this is that programmers have the power to do **either**.  If they wish to intentionally skip unused elements in a sparse array, they can do so with `for in`.  Since sparse arrays are the exception, rather than the rule, the `for of` uses the more natural method of simply honoring the `length` property of the array.

You may have noticed that we switched to `const` rather than `let` when using `for in` and `for of`.  This isn't required, but the syntax of `for in` and `for of` actually creates a new value of the interation variable each turn around the loop.  By marking as `const` we gaurd against accidentally changing it within the loop body.  For the standard loop, the iteration variable **must change**, it is a counter that is controlling the for loop.  We may accidentally change it within the body of the loop, and it's up to us not to.  This is one of the reasons we *prefer* to use `for in` and `for of` whenever we can.

### Advice on iteration
We've seen standard for loops, standard for loops controlled by `length`, `for in`, and `for of`.  Which should you use?

- Never use `for (let i = 0; i < 10; i++)`.  Meaning, never hard code a length of your array.  If 10 truly is meant to be **always 10, no matter how long the array is**, then fine - but otherwise, it's a bad idea.
- If you have a compact (not sparse) array, then the most natural way of iterating the loop depends on what you are going to do inside the *body* of the loop.  
    - If you will need to use the **index** and the value, then use `for in`.  It gives you the index, and you can get the value using array notation `a[i]`.  
    - If you don't need the index, then just use `for of` to iterate values.  It's more compact.
    - Both of those options will ensure you never loop beyond the end of the array.
- If you have a **sparse** array, then you need to determine whether you want to visit the empty elements:
  - If you want to skip empty elements, use `for in`
  - If you don't want to skip empty elements, use `for of`
    - If you don't want to skip empty elements, **and you need the index in the body of the loop**, use `a.length`
    - `for (let i = 0; i < a.length; i++)` iterates the same elements that `for of` iterates, but `i` is the index, and you can get the value using `a[i]`.

## Properties vs Indexes
`length` is a property of an array.  We've seen that it unless you override it by setting it, it holds an integer representing the largest used index, plus 1.  There's not much special about `length` though.  Arrays **are** objects.  Objects can have named properties.  Therefore, **arrays can have named properties**. 

```js
const a = [];
for (let i = 0; i < 5; i++) {
    a[i] = i * i;
}

a.x = 10;
a.y = "Hello World";
a["6"] = "Surprise!"
```

At first this seems odd - why would you be adding properties to an array?  There are situations where this could certainly be useful.  Use the feature cautiously, but it can be very effective.  When using arrays, **numeric** properties are indices, and non-numeric properties are just properties.

One thing to be aware of when introducing more properties to arrays is iteration however.  

```js
const a = [];
for (let i = 0; i < 5; i++) {
    a[i] = i * i;
}

a.x = 10;
a.y = "Hello World";

console.log('---- .length iteration ---- ');
for (let i = 0; i < a.length; i++) {
	console.log(i, a[i]);
}

console.log('----  for in iteration ----');

for(const i in a) {
	console.log(i, a[i]);
}

console.log('----  for of iteration ----');

for (const v of a) {
	console.log(v);
}
```
Here's the output.  Notice that the property "6" was interpreted as an integer index, and has indeed changed the length of the array.  When using the `for` loop controlled with length, we iterate through the indices, including index 6, printing out all the values - including the `undefined` at index 5.  The properties `x` and `y` are never visited, because we are simply visiting elements in the array based on the counter variable `i`.  The `for of` iteration works **exactly** the same way, because the `for of` iteration loop **uses** the `length` attribute.  This is consistent with the rules described above.

The odd ball is the `for in`, but it too should be expected.  The `for in` loop visits each **set property**.  It skips unused indices, because it truly is just iterating over the properties **that exist**.  The `for in` also loops through the non-numeric  property names - so we see the `x` and `y` print out.

```
1 1
2 4
3 9
4 16
5 undefined
6 Suprise!
----  for in iteration ----
0 0
1 1
2 4
3 9
4 16
6 Suprise!
x 10
y Hello World
----  for of iteration ----
0
1
4
9
16
undefined
Suprise!
```
## Useful Methods
We've spent a lot of time in this section covering the flexibity of arrays.  Some of what we've discussed can feel confusing initially, take your time to read this section several times.  Arrays are **amazingly** productive and powerfull in JavaScript.  When used correctly, and with confidence, you can write extremely succinct and powerful code, which would be quite difficult to replicate is some other languages.

Arrays also have many useful *methods* implemented.  They are fairly easy to use, and we will simply define them here with links to documentation.  We will start to use them **a lot** throughout the book.  

### Adding, Removing from the front or back of an array
- [push]() - adds the end of an array
- [pop]() - removes an element from the end of an array
- [shift]() - removes an element from the beginning of an array
- [unshift]() - adds an element to the beginning of an array
### Turning an array into a string
- [join]() - creates a concatenation of each element in the array by calling each element's `toString` method, and (by default) separates each element with a comma.  The programmer can also specify different delimiters.

### Reordering an array
- [reverse]() - Reverses the array (in place).
- [sort]() - Sorts the elements of the array using the element's natural comparators.  We will see more of this later, because it becomes more useful once we learn how to defined different comparison methods to be used within the `sort` function itself.  Sort is an *algorithm*, but we will be able to define how we compare elements themselves.

### Searching an array
- [indexOf]() - allows us to search for a *value* within the array, and return the **index** where it is found.  Optionally, you can also provide a starting index to search from, allowing you to successively call to search for **each** instance of a value.  
- [find]() - returns the **first** value found in the array matching the search value.  Requires us to provide a function that does the comparison, so we will cover this in more depth after covering functions.

### Slice and Dice
- [concat]() - combines two arrays to create a third array representing the concatenation (not necessarily the union) of the two.
- [slice]() - allows us to obtain *shallow* copies of sub-arrays within the array.
- [splice]() - can remove and/or replace elements of the array, in place.

You are encouraged to review **all** the functions associated with arrays - as there are many more.  

- [Arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) - Mozilla Developer Network

There are more to come, but we need to first look deeper at the last big missing peice of the JavaScript puzzle - **functions**.  We've seen them used already in example, but we have to learn more about how they work, how they are created, and how they are used.  Once we do, we can looks a few more array features that leverage functions to do even more.