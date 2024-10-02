# Language Foundations
We are now going to a take a detour *away* from talking about web development.  We are going to start looking at JavaScript, as a fundamental programming language.  We will examine the syntax, runtime, and design features of the language - just as you likely did when you learned your first programming languages - maybe Python, Java, or C++.  We will cover the foundational aspects of programming in JavaScript without discussing how the language connects to web development specifically just yet - although we will start out with a brief history.  Of course, JavaScript is inescapably linked to web development, but it's important to remember that it is *actually just a general purpose programming language*!

## How we go here
JavaScript, often abbreviated as JS, has a rich and evolving history that began in the mid-1990s. It was created by Brendan Eich while working at Netscape Communications Corporation. In 1995, Eich was tasked with developing a lightweight scripting language to enable interactive web pages. The result was Mocha, which later became known as LiveScript. However, just before its official launch, Netscape rebranded it to JavaScript, partly as a marketing strategy to leverage the growing popularity of the Java programming language, even though the two languages are fundamentally different.

The first official release of JavaScript was in December 1995 with Netscape Navigator 3.0. This version introduced basic scripting capabilities, allowing developers to manipulate HTML elements and respond to user events. The language's initial focus was on client-side scripting, enabling dynamic content without the need for full-page reloads. The language's data *was the website* being rendered, and the code you wrote manipulated the structure (the HTML).  In many ways, you can think of JavaScript originally as a programming language designed to allow you to modify HTML being rendered by the browser.  As the web exploted, JavaScript quickly gained traction, becoming a standard component of web development.

In 1996, Microsoft introduced its own version of JavaScript, called JScript, which led to compatibility issues across different browsers. To address this, the European Computer Manufacturers Association (ECMA) standardized the language under the name ECMAScript in 1997. The first edition, ECMAScript 1 (ES1), laid the groundwork for a more uniform scripting environment across browsers, promoting greater interoperability.

Over the years, JavaScript evolved significantly. ECMAScript 3 (ES3), released in 1999, introduced crucial features such as regular expressions, try/catch error handling, and better string manipulation. However, after ES3, progress slowed down for several years, largely due to the dominance of Internet Explorer and a lack of focus on web standards.  For a long period of time, JavaScript was plagued by the incompatabilities between various web browser's *implementation* of it's features.  This was particularly problematic when working with more advanced aspects of web development, like AJAX.  

In 2009, the release of ECMAScript 5 (ES5) marked a significant milestone, introducing features like strict mode and JSON support, further solidifying JavaScript’s capabilities. Then, in 2015, ECMAScript 6 (ES6), also known as ECMAScript 2015, was released, bringing major enhancements such as arrow functions, classes, and template literals. This version shifted JavaScript into a more modern programming language, enabling developers to write cleaner and more maintainable code.  As we will discuss below, the advancements in the language itself occured in tandem with significant advancements inthe *performance* of JavaScript runtimes.  From 2008-2015, there was a virtual circle of improvements in the language, it's performance, and it's impact.

## Node.js - JavaScript without the web browser
JavaScript evolved as a language strictly within the context of the *web browser*.  The langauge did not have **true** I/O - for most of it's history JavaScript had no concept of writing to the console, writing to files, reading data from your hard drive, etc.  This is for good reason of course, it was assumed that JavaScript code, by definition, was code running on the *end users's* computer, inside a browser, as a result of visiting a web page.  **No one wanted JavaScript** to be able to interact with their machine - because it was inherently untrusted code downloaded from a web server!

All that changed in 2009.  Before you get worried, it's not that the obvious security concerns about having a web page's JavaScript interact directly with your computer are now ignored, it's just that we no longer think of JavaScript code *only* within the context of a web browser.

Let's take a step back, and think about another general purpose language with a runtime system:  Python.  Python code is cross-platform.  It's cross-platform because the code itself is not compiled before being distributed, it is distributed as regular Python code.  In order to run a Python program, the *end user* must have the [Python Intepreter](https://www.python.org/) installed on their computer.  The intepreter comes in various versions, for most common operating systems.  The intepreter is written in C++ and C, it reads Python code and performs the corresponding operations.

When the Python intepreter encounters a `print` statement in Python, the intepreter interacts *with the operating system*, using *operating system APIs*, in C, to perform the printing operation.  In fact, the Python intepreter can expose C APIs for many operating system resources - the file system, the network interaces (sockets), etc.  This allows Python code to be general purpose - there are Python functions to interface with devices - and those functions are mapped to C APIs the underlying operating system provides.

What does this have to do with JavaScript?  Well, Javascript is similarly cross-platform.  The code is distributed to end users, and the code is run by an intepreter whcih is written in C/C++ (for the most part).  The interpreter, prior to 2009, was generally assumed to be *a web browser*.  The choice *not* to support interfaces to the operating system's APIs was just that - *a choice*.  

### Google Chrome and the V8 Engine
Web browsers aren't normally written as monoliths.  Web browsers contain HTML parsing code, HTML/CSS rendering (drawing) code, user input and network code, and JavaScript execution code.  All of these components can be fairly distinct.  The part of Google Chrome (circa 2008) that was responsible for intpereting and executing JavaScript code was a C++ library called the *[V8 Engine](https://v8.dev/)*.  The V8 engine was different than the JavaScript execution libraries found (at the time) in Safari, Firefox, Internet Explorer, and others.   **It was blazingly fast**.  The reasons for this speed are a topic unto themselves, but the V8 library made several important advancements in JavaScript execution inspired from work done for other runtime systems (Java Virtual Machine, .NET CLR, etc), including Just-in-Time compilation.

The dramatic improvement in execution speed, coupled with the ubiquity of JavaScript *developer skills* due to the web, suddenly made JavaScript a more attractive language for people to write *general* programs - distinct from the web.

### Node.js 
In 2009, Ryan Dahl released the first version of Node.js.  Node.js is the V8 Engine, but instead of embedding it within a web browser, it is embedded in a command line program called `node`, written in C++, that supports **JavaScript interfaces to operating system APIs**.  That last part of the sentance is what is really important - when you run a Node.js intepreter, you are running a C++ environment that can translation JavaScript code into operating system APIs allowing your JavaScript code to access things like the file system and network devices directly.  These interfaces are exposed via Node.js specific *includes* (`require`) of specific libraries:  `fs`, `net`, etc.  These libraries are not part of standard JavaScript.  They are not available within V8 engines hosted within web browses.  They are hosted by Node.js.  They are just as safe as code written in any other languages - and just as dangerous.  Node.js programs are programs just like C++ programs, Java programs, .NET programs, and Python programs.  They have the same capabilities, and the same abilities to access the host computer.   **They are not distributed via web browsers**.

## Running Node.js Programs
You will need to install the Node.js runtime on your computer.  You can do so for any platform by visiting the main website for the system - [https://nodejs.org](https://nodejs.org).  There are a few other ways to install Node.js, including using the [NVM](https://github.com/nvm-sh/nvm), which allows you to more easily manage *multiple versions* of Node.js on the same machine.  While this is my *recommended* approach, it's not strictly necessary - you can use the standard install if you wish.

Once installed, you should be able to type the following on your commamnd prompt (Windows) or terminal (MacOS, Linux):
```
node -v
```
The output should look something like this, although the version you've installed might be different.
```
v20.12.2
```

You will also need a code editor suitable for Node.js.  You will want to stay within the same editor when working in HTML, CSS, later on too.  Modern editors like [Visual Studio Code](https://code.visualstudio.com/), [Sublime Text](https://www.sublimetext.com/), [Zed](https://zed.dev/) all have fantastic support for Node.js.  If you are familiar with `vim`, `emacs`, Notepad++, they also support Node.js and JavaScript.  More heavyweight IDEs can also work well (JetBrains WebStorm, Visual Studio), but are not necessary.

**Pro Tip**&#128161; As of this writing (2025), Node.js is pretty stable.  Differences between versions do not tend to be major.  In the past however, there were *significant* changes.  If you have Node.js installed on your machine and the version is lower than v20, you are **strongly** encouraged to upgrade the installation.  If your installation is v14 or below, you **must** upgrade, as important modern parts of the language itself (JavaScript) are either not supported.  

## Simple Programs
In a source code editor, create a new file called `example.js`.  Make sure you note which directory you are creating the file in, you will need to use your command prompt/terminal to navigate to the directory and execute the program.

```js
// Contents of example.js
const x = 5;
const y = 4;
console.log(x + y);
```
Within your terminal, navigate to the directory.  If you type `ls .` or `dir` (Windows), you should see the file listed in the current working directory.

Execute the program:
```
node example.js
```

You'll see the result - `9`.

Let's compare this to the same C++ program, just to note the obvious differences.

```c++
#include <iostream>
using namespace std;

int main() {
    int x = 5;
    int y = 4;
    cout << x + y << endl;
}
```
Without looking at the code, certainly the biggest difference is that in order to run the C++ version you need to *compile* it - transforming it into executable code.  Unlike scripting languages (Python, JavaSrcipt, Ruby), C++ must be converted into a *binary* format as a separate step. C++ binary is *native* binary - native to your operating system and actual computer architecture (the type of processor - x86, ARM, Silicon, etc).  This binary *cannot* be run on different platforms.  Java and .NET occupy a space in between scripting languages and compiled languages - their source code *is compiled* into generic *byte code* that can be distributed.  The byte code can be run by the end user's runtime (Java Virtual Machine, .NET CLR), and that byte code can be *very quickly* translated to machine-specific binary code.

Modern scripting languages actually have begun to blur the lines between *intepreters* and runtimes like the JVM and .NET CLR however.  These days, while a scripting language like JavaScript *is* loaded as straight source code into the intepreter - the intepreter (or more commonly referred to now as the *runtime engine*) does actually pre-compile portions of the code on the fly.  This was part of V8's innovation - the JavaScript engine for Node.js.  This concept has been adopted by nearly every major web browser.

Taking a look at the code, we see a few more key differences:

1. In JavaScript, variable declarations use a generic keyword (in the case, `const`).  We don't specify the *type*.  More on this later.
2. In JavaScript, there is no need for a *main* entry point function.  Code written *outside* of functions is executed automatically - top down.
3. While there will be include-like statements (`require`), we don't need to include anything special to print to the screen (`console.log`).

## Language Basics
Let' touch on some of the core basics of the JavaScript language.  First, note that the language is inspired by the C, C++, Java family of languages.  It uses `{` and `}` to delimit things like loops, conditionals, functions, and general scopes.  It uses white space the same way (whitespace doesn't matter much), has similar comments (`//` and `/*` - `*/`).  The same rules apply to *identifiers* - things like variable and function names are **case sensitive**, they **cannot contain spaces** or start with numbers.  JavaScript is a bit more liberal with identifier names - for example, you can have a variable named `_` or `$`, where in C++ this is generally frowned upon (and not part of the actual standard).  The bottom line is that many of the natural conventions that you may already be familiar with from C, C++, Java, or C# are going to apply to JavaScript.  This is in contrast to Python and Ruby, which have quite different syntax.

JavaScript contains many *keywords*, or *reserved words*, just like other languages you know.  This includes keywords that are used in control flow - `if`, `else`, `switch`, `case`, `while`, `for`. Also included are keywords that declare data and structures like `var`, `let`, `const`, `function`, `class`.  In contrast *data types* are not generally reserved words.  For example, while JavaScript absolutely differentiates between numbers, strings, and objects - `number`, `string`, `object` are not keywords.  

There are other *words* that have special meaning within the execution environment, but are not reserved words themselves.  Things like `console`, `window`, `document`, `alert`, `require` are all *built in* functions and objects within execution environments.  In Node.js, `console` is a built in object that lets you interact with the terminal.  In browsers, `console` serves a similar purpose, but it lets you print to the web development tools.  In Node.js, `require` allows you to import modules (built in, like `fs`, `net` or your own) - while in a web browser `require` is not supported at all.  Web browsers support `window` and `document` to allow access to the rendered content (HTML), and `alert` to interact with the user.  All of this is to say, there are words with *special meaning* in JavaScript programs, but they aren't *keywords*.  They are a bit ambiquous, because their presence depend onthe execution environment itself.  They are objects in the *global* scope, added to you program when it starts.  We'll cover the concept of the *global* scope in more depth a bit later.

## Data types
When we create a variable in C, C++, or Java, we specify it's data type directly:

```c++
int x = 5;
double y = 4.5;
string s = "Hello";
```
Why is it that we need to do this?  While there are many ways to answer that question, at the core it's because in these languages variables **are allocations of memory**.  When we declare `x`, we are not just saying "x is an integer", we are actually invoking code that allocates the right amount of space in memory, at a particular location, to store integers.  This might not be the same amount of bytes as we would need for a `float` or `double`.  The layout of the binary data is also *very* different - the same binary string of 8 bytes (32 bits) is decoded completely differently depending on whether or not it is an integer or floating point value!  The point here is that a variable, in compiled languages, usually represents **a container within memory**, with a specific size and format.  Variables are **named locations in memory** that we can put things into.

In JavaScript, we have a more decoupled model.  In JavaScript, variables are **names**, but they don't map *directly* to memory, they *point* to memory.  They are a lot like pointers in other langauges.

Let's be more precise. In C++, if we have an integer (`int x`), we **cannot** set `x` to "hello":

```cpp
// C++
int x = 5;
x = "hello";  // No!
```
This is because `x` is a 4 byte slot in memory layed out to encode/decode binary numbers as 2's compliment integers.  It doesn't store arbitrary length ASCII codes!

In JavaScript, this is fine:
```js
// JavaScript
let x = 5;
x = "hello";  // Cool
```
The key difference is that in JavaScript, `x` is **not** a storage cell.  It's not memory.  It's just a label.  The value of `5` **is** placed in a storage cell, and that storage cell is *exclusively for numbers*, but `x` is not forever tied to the storage cell `5` is in, *it can be changed*.  By setting `x` equal to `"hello"`, we are *creating a new* storage cell to store ASCII codes - `"hello"`, and we are remapping `x` to point to that new storage cell.

A picture is helpful:

![int and string](../images/int-string.png)

Note that the storage cell that contained `5` is now eligible for garbage collection, and all JavaScript execution runtimes support garbage collection.  

There are some interesting implications to the memory model.  Imagine the following code:

```js
// JavaScript
let x = 5;
let y = 5;
let z = x;

// Diagram 1:  One storage Cell

y = 10;
// Diagram 2:  Two storage cells

z += 7;
// Diagram 3:  Three storage cells

z += 3;
// Diagram 4:  Back to two storage cells!
```

This is fundamentally different than C++, were we begin with 3 integer allocations, and the memory footprint never changes.  The JavaScript design is inherently more complex - and it's *not* as efficient from a pure execution perpsective.  It *may* be more efficient in memory usage, depending on the circumstance.

More importantly however, these examples are about clarifying how memory works in JavaScript and how it relates to data types.  In JavaScript, the **type** is connected to the storage cell (where the values are actually stored).  Storage cells are **immutable**, their contents will not change once they are created.  Variable **names** are mapped to storage cells - but that mapping is fluid.  Thus, the data type that a variable is mapped to is fluid.  This is why we do not declare data types at all - data types are *inferred* by the literal value written - `5` is an integer, `5.5` is a floating point number, `"hello"` is a string, etc.  

There are many benefits of this approach, but it is not without it's problems.  It's harder to work with variables when you don't know what data type the hold, for example.  In JavaScript code, developers must take extra care to be aware that variables in their code can have unexpected data types if they are poorly written.  This is the cost of *loosely typed* languages - there are more ways for you to write *incorrect* code!

Now let's look a little deeper into the data types used by JavaScript.

### Numbers
With some caveats (see below), JavaScript takes a very simplistic approach towards numbers.  Numbers are just numbers - there is no distinction between integers and floating point numbers.  There is no distinction between signed and unsigned numbers.  There are no categorizations of magnitudes.  Every number in JavaScript is a 64-bit floating point number - whether you intend to store any number in it, or you are sure you are only going to store the numbers 0, 1, or 2 in it!  There are no `int`, `short`, `long`, `float`, `double` - only "number".  The maxium **absolute** value of all JavaScript numbers is around +/- 1.8 x 10<sup>308</sup> and the minimum **absolute** value is about +/- 5 x 10<sup>-324</sup>.

**Pro Tip**&#128161; There are costs to this approach, **however** when we outline these rules keep in mind that this is the specification of the language itself - not necessarily how the JavaScript engine *actually* implements things.  If that sentence scares you, keep in mind that this is very similar to how compilers work - compilers make optimizations all the time!  They rewrite your code!  JavaScript engines are permitted to make optimizations (including storing your numbers in smaller storage cells than would would be required for a 64-bit number) as long as your code *behaves* as if it is a 64-bit number!  Dive into the source code of V8 to start appreciating just how much optimization is possible.  Don't dismiss JavaScript's performance ;)

The syntax of using numbers, along with the operators (`+`, `-`, `*`, `/`, `%`) all basically work as you'd normally expect.  

There are *special* numbers that can be written anywhere a normal number can be written.  These include `Infinity` and `-Infinity`. These values **are** numbers, allowing JavaScript to represent a closed set of all mathematical concepts - unlike compiled langauges which do not generally have the ability to respresent negative or positive infinity.

```js
const x = Infinity;
const y = 5;
const z = -Infinity;

console.log(y < 5); // Prints true
console.log(x == Infinity); // Prints true
console.log(x / z); // Prints -1
console.log(Infinity == 5/0) // Prints true!
```

Furthermore, JavaScript also takes an interesting approach towards representing values that *cannot* be represented.  We know that mathematically, `5/0` is Infinity, but `0/0` is not defined.  It's simply "not a thing" in mathematics.  In JavaScript, `0/0` results in `NaN` - literally **N**ot a **N**umber.  `NaN` is different than `Infinity` and `-Infinity` in that it cannot play nice with any mathematical operation.  `5` + `Infitity` is `Infinity` because that's how the infinite works, but unlike `Infinity`/`Infinity`, which is 1 - anything involving `NaN` is `NaN`.

```js
console.log(NaN/NaN); // Prints NaN
```
In fact, you can't even compare something with `NaN` to see if it's `NaN`, because *anything* compared with `NaN` (including `NaN`) is `false`.

```js
console.log(NaN == NaN);// FALSE
```
Why would you get a value of `NaN` in the first place, other than taking `0/0` which seems contrived?  Well, what happens if you want to *parse* user input - let's say a string.

```js
const input = "4.6"; // pretend this came from a user
const x = parseFloat(input);
console.log(x+1) ; // Prints 5.6
```

THe `parseFloat` function parses a string and returns a number based on the input.  What happens if the string given to `parseFloat` is

JavaScript also includes a global object `Number` which has several convenience functions and constants attached to it.
### Strings
in JavaScript, strings are just strings.  They aren't arrays of characters (as C, C++, JavaScript, and C# think of them).  They are first-class data types.  

Strings are immutable, meaning appending strings creates new strings.  You cannot change individual characters of strings - manipulating them on a character-by-character basis *is* possible using function calls, but each time you modify a string you create a *new* string.  This can have significant performance implications when taken to the extreme.

Strings can be delimited by either `"` or `'` but you can't mix and match:

```js
const s1 = "This is ok";
const s2 = 'This is ok';
const s3 = "This is not';  // No good
```
Strings can be compared and concatenated:

```js
console.log(s1 == s2); // Prints true
console.log(s3 > s2); // Prints true because s3 is alphabetically before s2

console.log(s1 + " - and so is this!") 
// Prints "This is ok - and so is this! 
```


### Booleans
### Null and Undefined
### Equality, Comparison, Coersion
### Preview of the other types
Discuss IntArray and more too.  Outside scope, but promised to discussthem.
## Declaring Variables (the older way)
## Declaring Variables (the modern way)
## Global Variables, Function Scope, and Block Scope
## Control Flow Statements (if, switch, while, for)

