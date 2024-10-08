# Variables and Scope
In the last section, we reviewed the different data types that JavaScript supports.  There were probably some surprises for you, if you are coming from other programming languages. In this section, we examine variable *scope*, and there are likely to be some more surprises for you.  


![Danger](../images/danger.jpg)

Hold on tight, some of this is why JavaScript got a bad reputation.  The good news is that *modern* JavaScript doesn't force you to use the confusing parts that we'll discuss over the next couple of examples!

## Global Scope, Function Scope, and Block Scope
Before looking at keywords and syntax - some review of what the word *scope* means.  A variable's *scope* is the area of the code (and the lifetime) in which the variable is accessible and valid for.

Let's look at some sample code written in a C-like programming language:

```c

// Global scope, this value is available
// in each function (main, foo, bar).
int x = 5; 

void bar() {
    // Here's a problem with global variables.
    // x defined here is a NEW variable.  It only
    // exists inside the bar function.
    // The x created in the global scope still
    // exists when the program is within the bar function, 
    // but it is entirely inaccessible to the bar function, 
    // because it's own function scoped variable has
    // "hidden" it from being accessible via naming conflict
    int x = 10;
}

void foo() {
    // Note that Y is scoped within
    // the function foo, and is only
    // available within foo.  It does
    // NOT clash with the y in main, and
    // is completely distinct from the
    // y in main!
    int y = 15;

    bar();
}

int main() {
    // y is accessible only within main, 
    // not inside foo or bar
    int y = 0;

    if (y < 1) {
        // z is available only within the
        // if condition.  It is BLOCK
        // scope.
        int z = 10;
        foo();
    }

}
```
The code above is silly - but let's just focus on the variables.  We see that `x` is declared in the **global** scope.  Global scope means that the variable is accessible *anywhere* in the program.  In most C-like languages, the global scope is frowned upon.  Global variables are discouraged for two main reasons - they make code harder to read and maintain, and also because global variables can be *obscured* by local variable declarations - as is happening in the `bar` function above.

We also have two other scopes - variables scoped to the *function* and to a *block*.  Most C-style langauges (C, C++, C#, Java) actually just have **block** scope, and consider a function a block. Variables are available within the *block* they are defined.  Inside `main` above, `y` is available anywhere in the function, and `z` is only available inside the `if` block it is declared in.  Both variables are *block scoped*, it's just that one block is a function, and the other is a control structure. Scope blocks in C-style languages are delimited by `{` and `}` - in fact, technically they are actuall called **scoping operators**.

**In JavaScript**, we actually distinguish between **function scoping** and **block scoping**.  It is possible to defined variables at the *global scope*, at a *function scope*, **or** at a block scope.  Let see how.

## Declaring Variables (the older way)
In the original versions of JavaScript, there was only one keyword used to create variables - `var`.  In these early versions of JavaScript, there **were only two kinds of scope**, global and function scope. There was no notion of block scope.

```js

var x = 5;

function example () {
    var y = Math.random();
    if (y < 0.5) {
        var z = 10;

    }
    console.log(x, y, z);
}

example();
```

In the snipped above, `x` is in the global scope.  It is accessible with the `example` function.  `y` is function scoped, it is only available within `example`. The curveball is that `z` is **also function scoped**.  It is not only available **inside** the `if` block it was written in, it is **also** available outside - for the `console.log` statement.

The `var` keyword creates a variable at the **function scope**.  The runtime actually scans the function *before* executing it, locates each `var` declaration, and creates variables for them.  Only then is the function executed.

So, what  happens when the above code is run?  `Math.random()` returns a random floating point number between 0 and 1, so there is a 50/50 chance y will be less than 0.5.

- If `y` is less than `0.5`
  - **before** executing `example`, the `z` variable is created. It's value is `undefined`
  - The `if` condition is `true`, so the line of code `var  z = 10` is executed.  The `var` keyword is meaningless at this point, as `z` is already created.  So, it is effectively just `z = 10`. 
  - When the program reaches the `console.log` statement, it will print `x` (5), `y` (some value less than 0.5), and `z` - which is `10`.
- If y is greater than or equal to  `0.5`
    - **before** executing `example`, the `z` variable is created. It's value is `undefined`
    - The `if` condition is `false`, so the branch is skipped.
    - The `console.log` line executes, and prints `x` (5), `y` (some value greater than or equal to 0.5), and `z` - which is `undefined`.

Notice why `undefined` is helpful in this code.  `undefined` means the value wasn't set.  This is very different than `null`, meaning the value was **intentionally** set to nothing.  Imagine if the `var z = 10;` line was actually `var z = null;`.  Checking to see if z is `null` or `undefined` would in fact tell you if the `if` condition branch was taken.  

Be careful with function scoped variables - as the code is easily confusing.  While the variable `z` is defined regardless of whether or not the `if` condition was taken, the initialization `= 10` is only executed if the the `if` condition was taken!

If this sounds confusing to you, you are certainly not alone.  Function  scoping is not common in programming languages. There are some valid reasons why you might want it, but it's obscure.  It's sort of novice-friendly, which could be one reason it was favored - but generally it's not something most programmers enjoy dealing with.

Things get a bit worse though.  Consider the following code:

```js
var x = 5;

function example () {
    var y = Math.random();
    if (y < 0.5) {
        z = 10; // Note the absense of the var keyword

    }
    console.log(x, y, z);
}

example();
```
**This code is a disaster**.  In JavaScript, **assignment** automatically **creates** a global variable, in the absense of a declaration keyword like `var` (or others, see below).  However, the variable **is only** created if that line of code is executed.  This is fundamentally different than when using the `var` keyword - where the runtime scans the entire function **first** before executing, and creates the variables.

- If `y` is less than `0.5`
  - The `if` condition is `true`, so the line of code `z = 10` is executed.  `z` is created **in the global scope**, not the function scope.  This is incredibly problematic, since now **all functions** have access to this variable we've created inside `example`!  The value is 10
  - When the program reaches the `console.log` statement, it will print `x` (5), `y` (some value less than 0.5), and `z` - which is `10`.
- If `y` is greater than or equal to  `0.5`
    - The `if` condition is `false`, so the branch is skipped.  Importantly, `z` is **never created**.
    - The `console.log` line executes, **and crashes**.  `z` is not `undefined`, `z` is not a variable at all.  `undefined` means the *value* is not defined - but trying to reference a first class variable that never got created is a runtime error.  

Notice the inconsistency:  If you **assign** a variable without ever declaring it, the variable is created in the **global** scope.  If you **read** a variable without ever declaring it, it's a runtime error.  If you are worried, take that as a good sign!

```js

x = 5; // creates a variable in global scope
var y = 10; // creates a variable in global scope
var w = z;  // Crashes, reading from z, which was never declared

function example() {
    var a;
    if (false) {
        var b = 10;
    } else {
        c = 20;
    }
    // Prints undefined for a, since we didn't give it a value
    // Prints undefined for b, since it was function scoped, but the 
    // line of code that set its value to 10 was never executed
    // Prints 20 for c, which is created in the global scope
    console.log(a, b, c);
}

// console.log(c) --- would crash, because c hasn't been created
// yet, it will get created when we execute example
example();
console.log(c); // Works, prints 20!
```

So, why does JavaScript work this way?  There are lots of explanations, but perhaps the best is this:  *JavaScript was developed for non-programmers to write small snippets of code to do relatively unimportant things on web pages*.  If you think about things from that perspective, some of the insanity of what was just described above may start to makes sense.  Novice programmers don't write a lot of functions in the first place, and certainly not when writing just a small amount of code.  It makes sense to assume they might forget to use the `var` keyword, so automatically creating the variable seems reasonable if they are assigning a value to it.  If the novice programmer tries to read a variable that they never defined, thats obviously an error, and it's a good idea to crash. This design is essentially an overly forgiving way of handling declaration errors.

The problem is that the web grew up.  We write large amounts of JavaScript to run in web browsers, and frankly most of it is written by professionals.  We also write other programs in JavaScript, that aren't associated with web browsers.  Finally, JavaScript both within and outside of web browsers is actually used to perform really important things.  JavaScript isn't just for a fancy animation - it drives the core functionality of somem websites entirely.

When a programming language grows up, professional software developers want more.  Professional software developers understand that syntax errors are just that - errors.  They don't want the language to accomodate them, they want the program to crash when the syntax isn't correct! This way, they can detect the mistake and correct it.  Professional software developers want less ambiguity, and easier to maintain code. 

## Declaring Variables (the modern way)
In 2015, a long awaited revision to the JavaScript language was released.  ES6 (Recall, the official name for JavaScript is [actually EMCAScript](https://en.wikipedia.org/wiki/ECMAScript)) introduced many critical and impactful updates the JavaScript language that brought it in line with modern professional langauges.  One of the most important additions was the introduction of two new keywords that permitted developers to create **block scoped** variables - `let` and `const`.  

The `const` keyword creates a **blocked** scoped variable whose value **cannot** change after it's creation.

```js

// Global scope, cannot change.
// Can be used inside any other function.
const x = 5;

function example() {
    // Y is scoped to function, can be used
    // anywhere in example, but not outside
    const y = 10;
    if (Math.random() < 0.5) {
        // Z is scoped to the if branch, cannot
        // be used outside
        const z = 20;

        // Note, this would throw an error, because
        // y is const
        y+= 5;
    }
}
```

If you understand how variable scope works in C, C++, Java, or C#, then you understand how `const` works.  It's exactly the same scoping rules.

While `const` also means the value of the variable cannot change, `let` accomplishes the same in terms of **block scoping**, however the value is *mutable*.

```js

// Global scope, cannot change.
// Can be used inside any other function.
const x = 5;

function example() {
    // Y is scoped to function, can be used
    // anywhere in example, but not outside
    let y = 10;
    if (Math.random() < 0.5) {
        // Z is scoped to the if branch, cannot
        // be used outside
        const z = 20;

        // OK, since Y is declared with let
        y += 5; 
    }
}
```

## What you should do
1. Make limited use of global variables, and do so with care
2. Never use `var`
3. Always use `const`, unless you absolutely **must** use `let`

First off, let's discuss the use of global variables.  In most situations, global variables are discouraged - across any programming language.  They do create naming conflicts, and they do create more difficult to maintain code.  That said, since JavaScript files consider code outside of functions to be *executable*, it's likely you will have code (and variables) outside of functions - which are inherently global. It's likely code files in your programs will have *some* global variables.  In addition, Node.js's version of *includes*, which is the `require` statement, creates objects - and they are usually better off in global scope.  

While you should always take care when creating global variables, it's not unreasonable to do so in a JavaScript program. Just don't go overboard.  If the variable really belongs to a function, create it in the function!

**You will likely NEVER use `var`**.  

`var` is still part of JavaScript, because there is an enormous amount of JavaScript code in use and floating around the web that was written before 2015.  However, there is almost **no** reasonable reason to ever use it yourself.  **Block** scoping with `let` and `const` still allow you to create variables that are available within an entire function.  `let` and `const` can be used in the global scope to create variables in global scope.  There is almost nothing you can do with `var` that can't be done with `let` and `const` - and there is a strong argument to be made that if you **need** `var`, you are probably writing code in a suboptimal or very convoluted way.  

Most JavaScript developers will use *linters*, which are plugins for code editors that highlight code problems.  One of the settings usually allows you to flag *any* use of `var` - and you are encouraged to do so.  By never using `var`, you eliminate a large set of common programming errors without losing any expressive power in the language.

When choosing between `let` and `const`, always start with `const`.  You will be surprised just how many variable that you create in practice **never** change. The use of `const` is almost always correct - and allows the runtime to operate more efficiently. The use of `let` is the exception, not the rule.  There's nothing wrong with using it, but only use it when the value of something will need to change.  Again, you might find it hard to believe, but it's less often than you think.

If you commit to **never** using `var`, and always using `const` unless you **must** use `let`, you will be well on your way to writing **much better** JavaScript code.  Proper use of `const` and `let`, combined with the author's personal opinion that *naming things well is the most important aspect of programming* will cut down on your programming errors more than anything else you cnan commit to.

While we're at it... use `===` not `==` :)