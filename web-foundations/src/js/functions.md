# Functions
We've seen functions a bunch of times in examples, and we'll assume you are familiar with them from other languages.  All the same concepts of *why* we use functions apply in JavaScript, they allow for quality abstraction, reuse, and readability.  In this section we will focus on some of the interesting features of functions in JavaScript - as they are more powerful than in some other languages.  In fact, many of the features JavaScript provides have been adopted in other languages as well, due to how powerful they actually ar.  In many ways, JavaScript is a *functional* or *function oriented* programming language - or at least, if you want it to be!

## Defining functions
First off, you may have noticed that throughout this chapter so far, we used the following syntax to define functions:

```js

function example() {
    console.log("Hello World");
}

example();
```
While that syntax is still supported (it is the original syntax), it is **not** the way modern JavaScript programmers tend to write their code.  

In JavaScript, **functions are objects**.  It's worth repeating.  **functions are data**. That's a jarring concept to many students.  It's likely when you learned to program, you were immediately introduced to the idea that functions were code, and code was different than data.   It's one of the biggest hurdles to understanding how to *really* program with JavaScript.  As soon as you wrap your head around the fact that functions work just like data in JavaScript, you will begin to see how so much of the language really fits together - and your skills will improve in leaps and bounds.

Functions as data has many implications - the first is how we typically declare functions.

```js
const example = function () {
    console.log("Hello World");
}

example();
```

In the code above, we are defining the same exact function, and calling it exactly the same way.  The difference is that we are intentionally writing the declaration as the declaration of a *variable* followed by the assignment of a *value*.  The *value* to the right side of the assignment `=` operator just so happens to be the *function literal notation* - it's a function, without a name.  It's an *anonymous* function.  Think of it like `const x = 5`, where 5 is a numeric literal.  `5` doesn't have a name, it's just a number.  `const x = 5;` means `x` refers to a storage cell that contains the literal number `5`.  The above code is saying `example` is a variable that points to a storage cell that contains the function that accepts no parameters, prints "Hello World", and returns nothing (`undefined`).

It follows that functions can be reassigned, and moved around.

```js
let example = function () {
    console.log("Hello World");
}

const x = example;
example = function(y) {
    console.log(y);
}

x(); // Prints Hello World
example(10) // Prints 10
```
The syntax above also suggests that functions can be attached to variable declared with `var`, `const`, and `let` - and indeed they can.  They carry with them exactly the same rules about scope too.  There is literaly *nothing* about the variables `x` and `example` above that is different than variables that hold numbers, strings, booleans, objects, or arrays.  **Functions are objects**.

```js
let x = function() {
    console.log('Hello');
}

x(); // prints Hello
x = 5;
console.log(5); // prints 5
```
In modern JavaScript, we nearly **never** use the original syntax.  We will not use it again in this book.  You should avoid it. 

There is a second way that modern JavaScript developers declare functions:

```js
const x = () => {
    console.log('Hello');
}

x(); // prints Hello
```

The arrow notation at first may seem like *simply* a syntactic shortcut.  We replaced the verbose `function` keyword.  That's *almost* true, and in most cases *is effectively true*, however there are some subtle differences.  We will talk about the difference later in this section - for now you can understand that because the difference only matters under very specific circumstance, which you don't necessarily want to use by default, you can *default* to the `=>` syntax and opt for the `function` syntax *when you explicitely need to*.

Therefore, in the absense of a good reason, throughout the remainder of this book, we will see the `=>` notation when declaring functions.

## Parameters
Functions define parameters, and just like variables, they do not have specific types attached to them.  Parameters are always *block* scoped to the function, and they *are mutable*, meaning they act list they were declared within the function using `let`.  They are **always** pass by copy - however remember that variables (parameters) are *references*.

This means that when dealing with primitives, parameters behave like pass-by-copy in langauges like C++
```js
const example = (a) => {
    a++;
    console.log(a)
    // Prints 6
}

let x = 5;
example(x);
console.log(x);// Prints 5
```
In the example above, `x` could also be declared with `const`.  The `a++` inside `example` is operating on a *reference* called `a`, which originall pointed to the same storage cell that `x` points to - the storage cell with the number `5` in it.  The `a++` operator has the effect of changing the `a` reference to point to the storage cell that has `6` in it (which might need to be allocated).  The `x` reference is unchanged.

Now let's look at something similar, but where the parameter is an object:
```js
const example = (a) => {
    a.x++;
    console.log(a.x)
    // Prints 6
}

let o = {x : 5};
example(o);
console.log(o.x);// Prints 6
```
`o` (which certainly can be declared with `const`) is a reference that points to an object.  That object has a property called `x`, which points to a storage cell that has `5` in it.  When example is called, `a` is a reference that points to the same object that `o` refers to.  Inside example, that object's `x` property is changed to point to a storage cell that has `6` in it.  The object is still the same object, it's just that one of it's properties points to a different value now.  When example returns, `o` is still the same reference.  `o` points to the very same object whose `x` property was changed.  `6` is printed.  

The above examples are critical to your understanding of parameter passing. 

### Optional parameters and default values
Functions can have any number of parameters.  The can also defined **default** values for their parameters.

```js
const example1 = (a, b) => {
    return a + b;
}
const example2 = (a = 0, b = 0) => {
    return a + b;
}

console.log(example1(5, 6));  // 11
console.log(example1(5));     // NaN, since b is undefined
console.log(example1());      // NaN, since a and b are undefined

console.log(example2(5, 6));  // 11
console.log(example2(5));     // 5, since b defaults to 0
console.log(example2());      // 0, since and b default to 0
```

Note that this example demonstrates not only the value of default values, but also the ability for a caller to invoke functions without the proper parameters in the first place.  In fact, there is nothing stopping the caller from calling `example` with 0, 1, 2, or 42 parameters.  Again - JavaScript is permissive - and it's a double-edged sword.

### Arguments
Function calling is so flexible, that when a function is called with *too many* parameters, the function can still accomodate this - and even capture the parameters.

```js
const example = (a, b) => {
    console.log(a);
    console.log(b);
}
example(1, 2, 3, 4, 5);
```
In the code above, no runtime error is generated.  The caller has called `example` with 5 parameters (or arguments).  The `example` function receives 1 and 2 in `a` and `b` is unaware that more parameters had been sent with the call.  In this case, it's clear the caller has made an error.  JavaScript's philosophy of permissiveness is at work here.  It's stance is essentially "no harm no foul".  That may or may not feel right to you, and likely the point of view of a professional programmer would be that this is at least deserving of some sort of warning!

There is a hidden way to actually access extra parameters however, through a built-in `arguments` array available within a function whenever it is invoked.  **There is an important restriction** however.  The `arguments` array is **NOT** supported in functions declared with `=>`, only function using the `function` syntax.

```js
const example = function (a, b) {
    console.log(a);
    console.log(b);
    if (arguments.length > 2) {
        console.log("---- Extra Arguments ---- ");
        for (let i = 2; i < arguments.length; i++) {
            console.log(arguments[i])
        }
    }
}
example(1, 2, 3, 4, 5);
```
```
1
2
---- Extra Arguments ---- 
3
4
5
```
The reason the `argument` array is not available to functions with the `=>` syntax is that actually `=>` syntax functions are different *kinds* of objects.  Functions are objects, and they have objects that define their *scope*.  The *scope* contains local variable, parameters, etc.  It is implicitely references within the function.  Traditional `function` have slightly different scope principles applied than `=>` functions, and the newer `=>` function dropped support for `arguments`.  `=>` functions also lack the `this` binding (we will discuss this a bit when we talk about prototypes and classes), and cannot be used the same way to define classes.

There is a better, newer, and more broadly supported way of allows functions to *truly* work with any number of parameters - a concept called **variadic** functions.  The *rest* parameter syntax allows functions to explicitely define parameters that act as arrays:

```js
const example = (...values) => {
   for (const v of values) {
    console.log(v);
   }
}
example(1, 2, 3, 4, 5);
```
```
1
2
3
4
5
```
This is the **preferred** approach to working with varied number of parameters in JavaScript functions.  It works the same with `function` syntax and `=>`.  A nice example of why this is helpful is when implementing something like a *summation* function:

```js
const summation = (base, ...values) => {
    let sum = base;
    for (const v of values) {
        sum += values;
    }
    return sum;
}

// Prints 15
console.log(summation(0, 4, 5, 6));
// Prints 115
console.log(summation(100, 4, 5, 6));
```
## Return Values
The `return` keyword works exactly like it does in any other programming langauges.  Once the execution of the function hits a line with the `return` statement, the function is terminated - and the value to the right (if any) of the `return` is bubbled up to the caller.

A few implications of JavaScript's typing system (or lack of) are of note however.

- A function can return different types of data, depending on conditions.

For example, you might have something like this:

```js
// This is terrible code, it's an example.
const example = () => {
    const  v = Math.random();
    if (v < 0.5) {
        return 1;
    } else {
        return {a: 1, b:2};
    }
}
```
Imagine calling this function.  You have no idea what kind of data it will return, as it returns an integer 50% of the time, and an object 50% of the time.  You could check - but you can imagine how dealing with functions that return unpredictable data would lead towards very brittle code.

```js

const r = example();
if (r.a) {
    console.log('Object returned');
} 
else {
    console.log('Integer returned');
}
```
Generally speaking, you shouldn't be creating functions that return **different** data depending on it's input (and certainly not a coin flip!).  There are exceptions, and when used smartly this "feature" can be used effectively - but you must understand the danger.  By returning different kinds of data, you are making the **caller** responsible for carefully working with the return value.  Sometimes **callers** don't read documentation.  As a rule of thumb, if you have a function that returns numbers, strings, or objects based on input, you haven't created a good abstraction around your function, and your code design could be improved.  Functions that return different kinds of data are a *code smell*.  A smell isn't an error, but it's usually unwanted.

One caveat is returning `undefined` or `null`.  It's fairly common to have a function return a value under some conditions, and under others, return nothing.  This might indicate the presense or absence of an error potentially.  This is easier to use for callers, and usually is easier to understand.  

```js
const v = send_email(recipient, body);
if (v) {
    console.log('There was an error');
    console.log(v);
}
else {
    console.log('Success!');
}

```



## Functions as properties, parameters, and return values
Now things start to get weird &#128521;

Functions are data, and we have variables that refer to those functions.  Variables are passed into function as parameters.  Variables can be assigned to object properties and to elements of an array.  Variables are returned from functions.  So, it follows that *functions* can be passed to other functions, put in objects and arrays, and even returned from other functions.  Guess what - that's exactly what we do, a lot, in JavaScript!

```js
const add = (a, b) => {
	return a+b;
}
const subtract = (a,b) => {
	return a -b;
}
const mult = (a, b) => {
	return a * b;
}
const div = (a, b) => {
	return a / b;
}

const op_obj = {
	plus: add,
	minus: subtract,
	product: mult,
	quotient: div
}

const op_arr = [add, subtract, mult, div];

const op_func = (op) => {
	switch (op) {
	case '+':
		return add;
	case '-':
		return subtract;
	case '*':
		return mult;
	case '/':
		return div;
	}

}


const a = 10;
const b = 5;

let op = op_func('-');
console.log(op(a, b)) 

for (const o of op_arr) {
	console.log(o(a, b))
}

console.log(op_obj.product(a, b));
```
```
5
15
5
50
2
50
```

Pretty cool huh?  There are some probably abuses of cleverness, but study that code.  It contains an example of adding functions to objects, and then calling those functions.  It shows you that you can have an array of functions, iterate over them, and call each.  It also shows you a function that given an input, can decide *which* function to return, and how you can *call* that function later.

Now take a look at this:

```js
const math = (operand1, operand2, operation) => {
	const result = operation(operand1, operand2);
	return result;
}

const answer = math(1, 2, add);
console.log(answer); // prints 3
```
Here we see the `add` function sent as a *parameter* to `math`, and `math` calls it just like it would any other function - under the alias *operation*.

### Anonymous Functions
Now take a look at this:

```js
const answer = math(5, 2, (x, y) => {
    return (x * x) + (y * y);
});

console.log(answer); // prints 29

```
That might look really confusing to you at first glance, but it's commonplace.  We have the `math` function, which expects two operands and a function to call - the third parameter.  In the previous example, we called the `math` function with a *named* function, `add`.  In this example, we call the `math` function with a *literal* function, or an anonymous function.  

It's the same concept as this:

```js
const example = (x, y) => {
    console.log(x, y);
}

const a = 5;
const b = 10;
example(a, b); // prints 5, 10
example(a, 12) // prints 5, 12

```
In the code above, you likely aren't confused at all.  The first call to `example` passes two parameters, they both happend to be named variables.  No surprise, 5 and 10 are passed in, become `x` and `y` within `example`, and are printed.  In the second call, we pass two parameters again - but this time the second parameter is a *literal* number - `12`.  No matter, `x` is 5 and `y` is 12 inside `example, and are printed.

```js
const answer = math(5, 2, (x, y) => {
    return (x * x) + (y * y);
});

console.log(answer); // prints 29

```
In the code above, the `math` function is receiving 3 parameters.  The first to are numbers, and become math's `operand1` and `operand2` values.  The third parameter is a *literal* function that computes the sum of squares, given two inputs `x` and `y`.  

Creating functions that accept other functions is a very common design pattern in JavaScript.  It's encouraged, because it allows you create reusable and flexible code.  Many times, we wish to pass simple functions into them, functions that aren't going to be used elsewhere.  There is no need to create named functions unless you think you are going to reuse them - especially when they are short.  Inlining an anonymous function is a choice, it's not (always) changing behavior (there are some situation where it can, when we need to consider scopes and closures).

**Do not resist** this new way of coding (if it is new to you).  It is effective, and it is commonplace.  You will use it judiciously, and you of course will avoid inlining *the same* function over and over again - for the same reasons you don't write the same literal number in lots of places, or write the same 3 lines of code in a bunch of places.  You will, however, find that proper use of this style leads to very readable code.

## Scope & Closure
In passing, we noted earlier that functions have a *scope* object, that contains the variables accessible to it.  In JavaScript, functions can be **closures** that enclose within their scope all variables within in, and the parent function.  Before moving forward, let's examine a fairly common design pattern in JavaScript - *locally defined functions*.

```js
const parent = () => {
    let c = 5;
    const local = (a, b) => {
        console.log(a, b, c++);
    }
    local(1, 2);
    local(3, 4);
}

parent();
```
In the code above, the function `local` is created **inside** the function called `parent`.  It is not available outside the `parent` function, but it is callable within `parent`.  The resulting code prints `1, 2, 5` and then `3, 4, 6`.  This may seem unusual, but if you understand the concept of local "things" belonging to functions, there's nothing all that unusual going on.  Notably, the variable `c` defined in `parent` **is available** inside `local` because it is defined at the scope that encloses it.  This is just like `x` being available inside the `if` condition below, which shouldn't too surprising at all.

```js
const example = () => {
    const x = 5;
    if (true) {
        console.log(x); // x is available, defined at enclosing scope
    }
}
```
The variable `c` is incremented when `local` is called - we see 5 print first, and the `++` has the effect of post-incrementing it.  When `local` is called again, the `c` value is once again printed (now it's `6`), and post-incremented again.  Now let's extend this example, having `parent` *return* the `local` function it had created - so the caller **can** use it.

```js
const parent = () => {
    let c = 5;
    const local = (a, b) => {
        console.log(a, b, c++);
    }
    return local;
}

const f = parent();
f(1, 2);
f(3, 4);
```
It's a bit contrived, but this example is now demonstrating that the locally defined function `local` **can** be returned and used later.  The output of the program is exactly the same as before.  There is something **very** interesting happening with `c` though.  `c` is a local variable of `parent`.  Everything you know about local variables inside functions is probably telling you that *after parent returns, it's local variables are destroyed*.  That's the point of local variables.  Yet, after parent returns, we call the `local` function (`f`) not once, but twice.  And each time, `c` is valid.  In fact, the changes made to it are still tracked - it's `6` when `f` is called again!

This is happening because **at the time `local` is created**, `c` is in it's scope.  Functions are closures, and **capture** the enclosing scope.  They hold on to them, through their lifetime.  `local` lives on past the lifetime of `parent`, and with it, it's reference to `c`.

Let's bend this example even further:

```js
const parent = (a, b) => {
    let c = 5;
    const local = () => {
        console.log(a, b, c++);
    }
    return local;
}

const f = parent(1, 2);
const g = parent(3, 4);
f(); // 1, 2, 5
f(); // 1, 2, 6
g(); // 3, 4, 5
```
Now `a` and `b` are moved to the `parent` function's parameter list.  They are local variables of `parent` as before, but now they are being passed into `parent`.  

The first time we call `parent`, we do so with `1` and `2` as parameters.  The `local` function is **created** and captures the `1` and `2`, along with the mutable `c` variable.  `local` is returned to the caller.  The first time it is called, we get the expected `1, 2, 5` printout.  Note, the `1` and `2` are captured just like in the example prior.  

We are calling the returned `local` function (`f`) twice.  Notice that the second time, we still get `1` and `2`.  The `local` function was created once, and it is still alive and well.   `c` is printed as `6`, since it's **the same** `c` variable as we incremented the first time we called the function.  We incremented it the first time we called `f`, and now we see that effect.

We also called `parent` a second time, with `3` and `4` as parameters.  **Critically**, this second call created a **second** `local` function instance.  This second `local` function instance was created while `a` and `b` were bound to `3` and `4`.  They are distinct variables, because they belong to the second invocation of `parent`, and are enclosed within the closure of the second instance of `local`.  **Also critically**, the second invocation of `parent` created a **second** instance of `c` - it's own local variable.  `local` has captured **that instance of c**.  As we can see, when the caller invokes the second instance of `local` - by calling `g()`, the second instance prints `3, 4` and uses the **second** instance of `c` - which is 5.  This is a separate and distinct variable from the `c` in the first `local` created, which has been incremented (now to 7).

**Re-read this section**.  If you grasp the concepts in the last example, you will be well ahead of the game in terms of being able to read professional level JavaScript code, and being able to write your own.  These concepts are powerful.  When used correctly, you can create elegant code that actually *reduces* complexity.  When used accidentally, or used incorrectly, this style of programming can lead to lots of confusing errors unfortunately!

## Arrays revisited
When we discussed arrays in the last section, we noted that there were a few things that were a lot more powerful if we were able to understand functions first.  Let's revisit now that we do.

### Sorting
The sort function can only do so much for us, particularly when we are using arrays containing objects, or wish to sort in non-standard ways (i.e. even numbers first, odd numbers after).  It's limited only until now however - now that we know how to use functions a bit better.  The JavaScript `sort` function accepts an optional parameter - a **function** that it will call whenever it needs to compare two elements in the array it is trying to sort.

```js
// Assumes a and be are numbers
const regular = (a, b) => {
    if (a === b) return 0;
    else if (a < b ) return -1;
    else if (a > b) return 1;
}

// Assumes a and be are objects with 
// an x & y property, and sorts by their
// sum
const object_compare = (a, b) => {
    const v1 = a.x + a.y;
    const v2 = b.x + b.y;
    if (v1 === v2) return 0;
    else if (v1 < v2 ) return -1;
    else if (v1 > v2) return 1;
}

// Assumes a and b are numbers, rounds to integers
// sorts them by even number first, then odd, 
// and by value for ties (both even, or both odd)
const even_odd = (a, b) => {
    const a_even = Math.round(a) % 2 === 0;
    const b_even = Math.round(b) % 2 === 0;
    if (a_even && !b_even) return -1
    else if (!a_even && b_even) return 1;
    else {
        if (a === b) return 0;
        else if (a < b ) return -1;
        else if (a > b) return 1;
    }
}

const t1 = [3.6, 9.5, 12.4, 3.1, 6.3];
const t2 = [{x: 4, y:11}, {x: 9, y: -2}, {x: -5, y: 7}, {x: 1}]
t1.sort(regular);
// 3.1, 3.6, 6.3, 9.5, 12.4
console.log(t1.join(", "));

t1.sort(even_odd);
// 3.6, 6.3, 9.5, 12.4, 3.1
console.log(t1.join(", "));

t2.sort(object_compare);
// [ { x: -5, y: 7 }, { x: 9, y: -2 }, { x: 4, y: 11 }, { x: 1 } ]
console.log(t2)

```
**Pro Tip**&#128161; This example is bigger than just sorting.  It's critical example for you to really think deeply about.  Once this makes intuitive sense to you, you will be able to leverage the concepts of *functional programming* to your advantage more effectively.  Think about *any* sorting algorithm - bubble sort, quick sort, merge sort.  They employ different strategies, but **the all** need *compare* elements against eachother.  The `sort` function in JavaScript is simply *deferring* how that comparison is to be made to the comparison function you give it.  It's **outsourcing a behavior**, and by doing so, it becomes far more flexible.  It can work with *any data type*, and can apply it's sorting algorithm to any method of comparison.  It's more than polymorphism from an object-oriented language, this is flexibility taken to the next level!

### Searching, and `map` and `filter`
Searching involves comparison too, so it makes sense that the *search* functions also work with arbitrary functions.  Before diving into `indexOf` and `find` though, we need to take a detour into two *foundational* methods defined on the array - `map` and `filter`.

`map` and `filter` *transform* arrays.  The `map` function allows you to easily *map* **each** element to another value - creating an array with the same number of elements, but transformed values.  The `filter` method allows you to defined a function that decides whether a specific element is in the new array - allowing you to *remove* elements from a source array.

Let's look at a simple example:

```js
// Receives an object with x and y properties, 
// returns the sum
const sum_xy = (e) => {
    return e.x + e.y;
}

// If the element is even, result is true
const even = (e) => {
    return Math.round(e) % 2 === 0;
}


const t = [{x: 4, y:11}, {x: 9, y: -2}, {x: -5, y: 7}, {x: 1, y: 7}]

const sums = t.map(sum_xy);
// [ 15, 7, 2, 8 ]
console.log(sums);

const even_sums = sums.filter(even);
// [ 2, 8 ]
console.log(even_sums)
```

`map` and `filter` are shockingly useful in a variety of circumstances.  Once you start writing enough JavaScript, you'll start to notice that you hardly have a program that doesn't use them.  They take some practice to get used to, and that practice time will pay huge dividends.

Let's get back to searching now - and revisit `indexOf`.  The `indexOf` function will return the *first* index where a particular value is found within an array.  The `indexOf` function *does not* accept a function to do the comparison however.  At first, this looks like a drag - for example, we can't find a matching element within a list of objects very easily, since objects are always compared by *memory* location.

```js
const t = [{x: 4, y:11}, {x: 9, y: -2}, {x: -5, y: 7}, {x: 1, y: 7}]

// Find the object with x,y = 9, -2
const i = t.indexOf({x: 9, y: -2});
console.log(i); // -1, not found
```
Have no fear though, because `map` can *transform* the array, and we can use `indexOf` to search the *transformed* array.

```js
const t = [{x: 4, y:11}, {x: 9, y: -2}, {x: -5, y: 7}, {x: 1, y: 7}]

// Find the object with x,y = 9, -2
const i = t.map((o) => {
	return `${o.x}:${o.y}`
}).indexOf(`9:-2`);

console.log(i); // 1, second element
```
Note, even though `map` returned a transformed list, the *index* returned by `indexOf` is the index of the matching object in the original array `t`.  This is because `map` always produces an array of elements that is the same length, and derived from the same inputs, in the same order.

BTW, we can use a simpler function syntax  when our *inline* functions contain just a return statement:

```js
const t = [{x: 4, y:11}, {x: 9, y: -2}, {x: -5, y: 7}, {x: 1, y: 7}]

// Find the object with x,y = 9, -2
const i = t.map(o => `${o.x}:${o.y}`).indexOf(`9:-2`);
console.log(i); // 1, second element
```
The example above works since `indexOf` can accurately compare strings.  This mechanism is lacking though if we were to be searching for floating point numbers, or something that can't be unambiguously turned into a string.  We could alternatively use `map` to convert the array into *literally* a set of `true`/`false` values depending on search status though:

```js
const t = [{x: 4, y:11}, {x: 9, y: -2}, {x: -5, y: 7}, {x: 1, y: 7}]

// Find the object with x,y = 9, -2
const i = t.map(o => o.x === 9 && o.y === -2).indexOf(true);
console.log(i); // 1, second element
```
Note, the `map` function ended up returning an array of booleans:  `[false, true, false, false]`, and we just used `indexOf` to get the first.  This strategy, where map is effectively producing a *signal* for each element is a common and flexible strategy.

The `find` method can also help us here, and **does** accept a comparison function that it will use

```js
const t = [{x: 4, y:11}, {x: 9, y: -2}, {x: -5, y: 7}, {x: 1, y: 7}]

// Find the object with x,y = 9, -2
const e = t.find(o => o.x === 9 && o.y === -2)
console.log(e); // {x: 9, y: -2}
```
Remember, `find` returns the element, while `indexOf` returns the index of the element found.

We could go further.  Let's say we wanted to find only the objects whose sum (of x and y) were even.  We could do the following, with `indexOf`

```js
const t = [{x: 4, y:11}, {x: 9, y: -2}, {x: -5, y: 7}, {x: 1, y: 7}]

// Map to sums of x, y, and then map again for evens
// The result of first mapping in [15, 7, 2, 8], 
// and after the second mapping we have [false, false, true, true]
const signals = t.map(o => o.x + o.y).map(v => v%2 === 0);

const even_sums = [];
let i = -1;
do {
	i = signals.indexOf(true, i+1);
	if (i >= 0) {
		even_sums.push(t[i]);
	}
} while (i >= 0);

// [ { x: -5, y: 7 }, { x: 1, y: 7 } ]
console.log(even_sums);
```
This is a little awkward though.  Instead,  We could be a little more clever, and use `filter`.  Note that in the example earlier, we used `map` and `filter` to print out even sums, **but we lost the object**, since map converted each element into it's sum.  Let's do a little tweek to that, so we don't actually lose the original source object - and *just* have an array with objects whose x,y sum is even.

```js
// Just use filter, with a function that computes sum, and returns if it's sum is even.
const t = [{x: 4, y:11}, {x: 9, y: -2}, {x: -5, y: 7}, {x: 1, y: 7}]

// Filter returns true or false, based on if sum is even
// It does not alter the element
const even_sums = t.filter(o => (o.x + o.y) %2 === 0);

// [{x: -5, y: 7}, {x: 1, y: 7}]
console.log(even_sums);
```

### forEach
What if we wanted to sort the array of objects we had above, using the even/odd sorting strategy we employed in the first example of sorting.  One way, is to split the list into even and odds, and then sort them.

```js
const t = [{x: 4, y:11}, {x: 9, y: -2}, {x: -5, y: 7}, {x: 1, y: 7}]

const sum_xy = (e) => {
    return e.x + e.y;
}

const compare_sum = (a, b) => {
	const sa = sum_xy(a);
	const sb = sum_xy(b);
	if (sa === sb) return 0;
	else if (sa < sb) return -1;
	else return 1;
};

const evens = t.filter(o => (o.x + o.y) % 2 === 0);
const odds = t.filter(o => (o.x + o.y) % 2 !== 0);

evens.sort(compare_sum)
odds.sort(compare_sum);

const result = evens.concat(odds);

//[ { x: -5, y: 7 }, { x: 1, y: 7 }, { x: 9, y: -2 }, { x: 4, y: 11 } ]
console.log(result);
```
Another way (not necessarily better) is to manipulate each element *first*, before applying sort.  `map` and `filter` *transform* arrays, it would be nice if we could just *manipulate* each element.  The simple way of doing that is with a `for` loop.

```js
const t = [{x: 4, y:11}, {x: 9, y: -2}, {x: -5, y: 7}, {x: 1, y: 7}]

for (const o of t) {
	o.sum = o.x + o.y;
	o.even_sum = (o.sum %2 === 0);
}

const results = t.sort((a, b) => {
	if (a.even_sum && !b.even_sum) return -1
    else if (!a.even_sum && b.even_sum) return 1;
    else {
        if (a.sum === b.sum) return 0;
        else if (a.sum < b.sum ) return -1;
        else return 1;
    }
    // Use the map again to trim out the 
    // extra properties we added with the for loop
}).map((o) => {return {x: o.x, y: o.y}});

//[ { x: -5, y: 7 }, { x: 1, y: 7 }, { x: 9, y: -2 }, { x: 4, y: 11 } ]
console.log(results);
```

Another way of doing that is the `forEach` method.  The `forEach` method is essentially turning a for loop inside out - or, more accurately, allowing you to specify what happens **inside** the for loop, but allowing the library call to actually implement the loop itself.

```js
const t = [{x: 4, y:11}, {x: 9, y: -2}, {x: -5, y: 7}, {x: 1, y: 7}]

t.forEach((o) => {
	o.sum = o.x + o.y;
	o.even_sum = (o.sum %2 === 0);
});

const results = t.sort((a, b) => {
	if (a.even_sum && !b.even_sum) return -1
    else if (!a.even_sum && b.even_sum) return 1;
    else {
        if (a.sum === b.sum) return 0;
        else if (a.sum < b.sum ) return -1;
        else return 1;
    }
    // Use the map again to trim out the 
    // extra properties we added with the forEach
}).map((o) => {return {x: o.x, y: o.y}});

//[ { x: -5, y: 7 }, { x: 1, y: 7 }, { x: 9, y: -2 }, { x: 4, y: 11 } ]
console.log(results);
```

<hr/>
The purpose of these examples has been to demonstrated the use of `indexOf`, `map`, `filter`, and `forEach` - there are many ways of doing each of the (seemingly useless) examples.  Invest some time in trying to make sense out of all the ways arrays can be manipulated though - the investment will pay off!