# JavaScript Syntax Basics
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

## Language Building Blocks
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

Now let's look a little deeper into the data types used by JavaScript.  **There are two kinds of types** in JavaScript - *primitives* and *objects*.  
- **Primitives** are numbers, strings, booleans, `null` and `undefined`.  They are simple types.  
- **Objects** are collections of name/value pairs, they are anything with *properties*.  Objects include arrays, and even *functions* - we'll talk more about these later on.

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

Furthermore, JavaScript also takes an interesting approach towards representing values that *cannot* be represented.  We know that mathematically, `5/0` is Infinity, but `0/0` is not defined.  It's simply "not a thing" in mathematics.  In JavaScript, `0/0` results in `NaN` - literally **N**ot a **N**umber.  `NaN` is different than `Infinity` and `-Infinity` in that it cannot play nice with any mathematical operation.  `5` + `Infinity` is `Infinity` because that's how the infinite works, but unlike `Infinity`/`Infinity`, which is 1 - anything involving `NaN` is `NaN`.

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

JavaScript also includes an object `Number` which has several convenience functions and constants attached to it.  One of these is the helpful `isNaN` that takes care of the logical gap you might have noticed when you learned that `NaN` == `NaN` is `false` above!

```js
console.log(Number.isNaN(0/0)) // True
```
`Number` is the object version of a number.  You can create instances of a number using a constructor (we'll learn more when we cover objects and classes).  This is rarely done in practice, but it can be a nice way to perform type conversions.  The `Number` class has static methods (like `isNaN`), and also some constants that are useful.  `Number.MAX_SAFE_INTEGER` and `Number.MIN_SAFE_INTEGER` are useful for testing limits (although remember that `-Infinity` and `Infinity` exist too).

There is also a `Math` object, which is really closer to a *library*.  It has customary mathematical functions - trigonometry functions, geometric constants (&pi;).

- [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) class reference (Mozilla Developer Network)
- [Math](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math) library references (Mozilla Developer Network)

### Strings
In JavaScript, strings are just strings.  They aren't arrays of characters (as C, C++, JavaScript, and C# think of them).  They are first-class data types.  

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
A more recent addition to JavaScript, string *template literals* allow for easier combination of literal text with variables:

```js
const x = 5;
const y = 7;
const z = x + y;

// Prints "The sum of 5 and 7 is 12"
console.log( `The sum of ${x} and ${y} is ${z}`);
```
String template literals allow for the placement of variables within `${` and `}`.  Template literals **must** be delimited by back tick characters, not single or double quotes.  They are the preferred approach to do most printing.

Just like number primitives have a corresponding `Number` class, which supports member and static methods - there exists a `String` class.  JavaScript is particularly adept at string manipulation, and the `String` class is full of useful methods for working with them.  Whenever you have a primitive string, you can use the `.` operator to access methods, which automatically invokes *autoboxing* to promote the primitive to an object (see below).

- [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) class reference - Mozilla Developer Network

### Booleans
Booleans are first class data types in JavaScript, with literal values written as `true` and `false`.  There is a corresponding `Boolean` class as well, with some useful features.

- [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean) class reference- Mozilla Developer Network

Booleans are quite useful on their own, and are used for branching and conditional looping.  There aren't a lot of surprises here, booleans work the same as they do in most other programming languages.  Since conditionals use boolean expressions however, how *different* data types are converted to boolean conditions *is* an important concept - and is covered below when we discuss "Type Coercion".

### Null and Undefined
In many languages, `null`, or `NULL`, or `nullptr` are used to mark a variable (usually a pointer) as "not currently pointing to anything".  In most langauges, null actually is just a placeholder for the actual number `0`.  In JavaScript, `null` is a bit more of a first-class citizen.  `null` is a **data type** unto itself, with only one value - `null`.  This sounds a little odd, but it actually does make some sense.  `null` is not a string, it's not a number, it's not a boolean - it's a completely different concepts.  It represents the **absense** of a value.  To declare a variable and set it's value to `null` is to specifically say the variable **has no value associated with it**.

```js
const x = null;
```

`null` does not represent an error, or an unexpected situation - it represents specifically not having a value.  

JavaScript has another data type that is *similar* to `null`, but not exactly the same - `undefined`.  The language is somewhat unique in it's differentiation between two concepts:

1. Absense of data  (`null`) 
2. Unknown data / state (`undefined`)

In JavaScript, if you have a variable that has not been given a value, it's value is `undefined`.  If you have a variable that you want to explicitely set to "no data", you set it to `null`.  In JavaScript, `null` means the variable or things you are referring to *exists*, and is in **the known state of having no data**.  If you refer to something that does not have a known state, or *does not exist*, it's value is `undefined`.

We will be talking more about *objects* a little later, but let's look at where this difference might be more visible:

```js
const x = 5;
const y = null;
const z = undefined;
const obj = {
    a: 1, 
    b: 3,
    d: null
}
```
In the code snippet above, we create 4 variables - x, y, and z are regular variables, and `obj` is an object with three properties - `a`, `b`, and `d`.

The values of `x`, `y`, and `z` are clear - they are `5`, `null`, `undefined` respectively.  It might not be obvious why someone would choose `null` or `undefined`, and in practice they are sometime used (incorrectly) interchangeably.  The code is conveying the fact that `y`'s value is known to be "nothing", while `z`'s value is unspecified. It's an *academic* difference, but if used incorrectly can bite you.

The value of `obj.d` is `null`.  The property `d` *exists* in the object, but it's value is absent.  What about `obj.c`?  The value of the `c` property in `obj` is `undefined` - as there *is no property* called `c`.  Note that this is something unusual about objects, and JavaScript.  Referencing `obj.c` is **not a syntax error** and **not a runtime error**, the value of any missing property within an object is `undefined`.  Note, this is very different than trying to use the `.` operator on an undefined value.  Referencing a first-class variable that does not exist **is a runtime error**.  

```js
const x = 5;
const y = null;
const z = undefined;
const obj = {
    a: 1, 
    b: 3,
    d: null
}

console.log(obj.c); // Prints undefined - there is no c property
console.log(obj2.a); // Program crashes, runtime error. obj2 is not defiend
console.log(w);  // Program crashes, runtime error.  w is not defined
```

It's wise to think about the differences between `null` and `undefined` carefully.  The concepts are subtle, but meaningful.  Using them appropriately can improve the quality and readability of your code. 


### Promotion / Auto-boxing
Whenever a student learns the list of *primitives*, they eventually encounter some of the functions often associated with them.  For example:

```js
const x = 5.829543;
const y = x.toFixed(2);
console.log(y); // Prints 5.83
```
If you are familiar with the concept of *primitives* from languages like C++ and Java, you may be wondering - how can we use the `.` operator on a primitive!  JavaScript uses *automatic promotion* to objects whenever it needs to - that's how!  By using the `.` operator and calling a function, you are implicitely asking JavaScript to create a corresponding *object*, with appropriate properties to hold both the value, and the methods associated with the type's corresponding object type.  There are object types (in addition to `Array`, `function`) for each primitive - `Number`, `String`, `Boolean`, etc.  

### Type Coercion
JavaScript data types have well defined, if not always intuitive, ways of working with all operators.  Let's look at a simple example using the `+` sign:

```js
console.log(5 + "hello");
// Prints 5hello
```
The example below employs type coercion.  The `+` operator is *defined* for adding together two numbers, and also for concatenating two strings.  It is **not** defined for adding a number to a string, or a string to a number.  In order to evaluate the result of `5 + "hello"`, JavaScript *must* cast/convert one of the operands into a "like" data type. It seems obvious, the `5` is converted to a string `"5"`, and then the string `"5"` is concatenated with `"hello"` to yeild `"5hello"`.

Where things can potentially become confusing is when examining the following:

```js
console.log(5 + "6");
// Prints 56
```
Why doesn't JavaScript conver the `"6"` into a `6` and perform the arithmetic?  The answer is simple - **not all strings can be converted to numbers**, but all numbers can be converted to strings.  Thus, whenever performing a `+` operation, which is supported by both number and string, we will always get the result of the *string* operation.

But, what about the following?

```js
console.log(5 * "6");
// Prints 30
```
This is where people coming from other language start to look at JavaScript a little suspiciously.  The 6 **is** converted into a number, and the arithmetic is performed!  Why?  It's actually following the same logic as above, **however** the `*` operator is *only* supported by numbers.  The `*` operator is not defined as string.  JavaScript has no choice but to attempt to convert the `"6"` to a `6`, in an attempt to resolve the expression.

```js
console.log(5 * "hello");
// Prints NaN
```
Following the same logic, JavaScript *attempts* to convert both sides of the `*` operator to numbers.  `"hello"` cannot be parsed to a number, so it yeilds `NaN`, and then `5 + NaN` yeilds `NaN`.

The above is only a glimpse of how coercion behaves in JavaScript.  Let's take a look in more detail.  We will cover this in multiple phases.

#### Concept 1:  Coercion only applied to primitive types
Objects (objects, arrays, functions, etc) are never coerced in order to evaluate the results of an operator.  

- For the `==` and `!=` operators, if both sides are objects, then objects are considered equal only if they are pointing to the same location in memory. 
- For any other operators that can only work on primitives - which include arithmetic, comparison, and logical operators, **objects** are first turned into primitives - and then *those* primitives can be coerced, if necessary, to evaluate the operator.  For `==` and `!=`, if one side is a primitive and the other an object, then the object is converted ot a primitive.

#### Concept 2:  Objects are turned into primitives in a pretty simple way
To convert any object (`obj`) into a primitive, JavaScript first checks if there is a valid `valueOf` method on the object.  If so, it calls it.  If that function returns a primitive, then it's done.  Examples of objects that have a `valueOf` function are the object varieties of primitives - `Number`, `String`, `Boolean`.  

If there is no `valueOf`, or if `valueOf` doesn't return a primitive, then JavaScript tries to call `toString` on the object.  Most objects have a `toString` function, but they are often unimpressive. 

Most generic objects will return `"[object ObjectName]"` as the string representation - where `ObjectName` is `Object` or some specialization.
- Function objects can return a shortened function name and some representatation of text, rarely useful for anything beyond some simple debugging.
- The Date object will return a formatted date string (pretty nice!)
- The Array object will actually return a string representation of the content. So, for the array [1, 2, 3], the `toString` function actually returns `"1, 2, 3"`.
- **However** (and this is REALLY important!!!), *empty arrays*, or arrays with a single `null` value in them, will return and **empty** string.  So, the array `[null]` or `[ ]`, if converted to a string with the `toString` function, returns an empty string `""`.  This is a quirk, and is critical to understanding several oddities later on.

If, in the unlikely event that there is no `toString` function, or the `toString` function returns a non-primitive (really bad idea), then an exception is thrown.  This is undefined behavior.

#### Concept 3:  Coercion targets are defined by the operator
Note, in the following discussion, we are assuming if either operand was an *object*, it has already

- For the `==` and `!=` operators, if both operands are the same type, then no coercion occurs - they are compared by examining the location in memory they point to.
- Otherwise, for `==` and `!=`,  if **either** operand is a number or a boolean, the operands are converted to numbers *if possible*; **otherwise** if either operand is a string, the string operand is converted to a number if possible. If **one** of the operands is an object, then both operands will  be converted to a string.
- For the `+` operator, **if either side** is a string, the other side is always coerced to a string.  This is why 5 + "5" is  "55".
- For the `+` operator, if **neither** side is a string, then both sides must be coerced into numbers, and arithmetic is applied.
- For the other arithmetic operators (`-`, `*`, `/`, `%`), both sides must be coerced into numbers, and the arithmetic is applied.
- For expressions that require booleans (`if` and `else if` clauses, or the use of the `!` operator), the expression must result in a boolean value

#### Concept 4:  Once you know what you want, there are specific conversions
Once you know what you need to convert *to*, you can follow straightforward rules for understanding how that will occur:

- Converting *anything* to a **boolean**:
  - `null` and `undefined` are `false`
  - `0` or `-0` are `false`
  - `""` - the empty string, with 0 characters - is `false`.
  - **everything** else is true.  
    - A non-zero length string with only whitespace is `true`
    - The string `"0"` is `true`
    - An empty object `{}` is `true`
    - An empty array `[]` is `true` (this one is quite a gotcha, given how the empty array is converted to an empty string by `.toString`)
- Converting a **number** to a **string**:
    - Uses the `Number.toString` method, will always work trivially
- Converting a **string** to a **number**:
    - Uses `parseFloat` to convert to a number
    - An empty string results in `0`
    - A non-number results in `NaN`
- Converting a **boolean** to a **number**:
    - `true` is `1`
    - `false` is `0`
- `null` to a **number** results in `0`
- `undefined` to a **number** results in `NaN`
- `null` to a **string** results in the string `"null"` (which, if then is converted to a boolean, is `true`!) 
- `undefined` to a **string** results in the string `"undefined"` (which is a non-zero length string as well)

That probably seems a little complicated.  Once again - **rather than reading a bunch of rules**, EXPERIMENT!  Fire up a code editor, and try some things. Here's some examples using the `assert` library.  Calling the assert function with anything that resolved to `false` throws an exception.  The following code throws no such exception - **every `assert` expression is actually `true`**.

```js
const assert = require('assert');


// One of the operands is a number, so 
// the other is converted to a number if 
// possible.  It is possible, so 5 == 5
assert(5 == "5");

// The rules of + are different than =
// While = tries to convert one operand
// to number if the other operand is a number, 
// the + operator does not.  It converts
// one operand to string if the other is a
// string.
assert((5 + "5") == "55");

// One of the operands is a number, 
// but converting to a number fails
// The 5 is turned into a string, 
// and clearly that's not the same as
// "hello"
assert(5 != "hello");

// One of the operands is a number, 
// and "0" can be converted to a number, 
// so we get 0 == 0 which is true
assert(0 == "0");

// This one is tricky.  One is a number, 
// so we try to convert the empty string
// into a number.  parseFloat("") results 
// NaN, however the conversion rules also
// state specifically that the empty string
// converts to 0 when coerced to a number. 
// Therefore, the conversion works, and 
// we are back to comparing 0 == 0!
assert(0 == "");


// This is false because they are both
// objects.  Objects are only equal if 
// they point to the same location in memory
assert({} != [])

// The empty string is turned into 
// a string - which results in an empty string 
assert("" == [])


// The - operator forces both sides
// to be a number.  The boolean true
// converts to 1, and 1-2 is negative 1`
assert( (true - 2) == -1);
```

You are strongly encouraged to try to do some weird stuff with coercion, in your own code editor.  You might encounter things that you cannot believe - you might think they are bugs in the language.  **They are not**, the language is indeed well defined, and the code will follow the rules outlined above.  It just takes some time - but things will sink in if you experiment yourself!

### More on Equality: `==` vs `===`
Testing to see if two values are *equal* is a tricky subject in JavaScript.  This because JavaScript employes the type coercion rules defined above to the `==` and `!=` operators.  The way these coercion rules get applied are the source of an unfortunate number of bugs.  As the section above makes clear - the rules are *a lot* to remember.  

Sometimes, we really just want to know *if two things are exactly the same*.  We want to know if `x` and `y` are the same type, and the same value - *without* all the type coercion.  JavaScript allows for this using the `===` and `!==` operators - strict comparison.


```js
console.log(5 == "5") // True
console.log(5 === "5") // False
```
The **strict** equality operator is the **PREFERRED** approach of most programmers.  If you've coded in JavaScript for long enough, you've learned that no matter how well you know the coercion rules, you will eventually get bitten by it.  The use of the `==` and `!=` backfires, resulting in unwanted confusion and mysterious bugs in your code that are very hard to debug.  It's somewhat unfortunate that the *easiest* thing to write - `==` - is the most dangerous, and the harder things to write - `===` is the preferred.  It's a historical accident.  Originally, when JavaScript was being developed for small little programs running on a web page, the easy going nature of `==`'s type coercion was a nice gift to novice programmers.  JavaScript "programs" were a few dozen lines of code.  Debugging wasn't a big issue.  As JavaScript grew up, it became more useful - and thus larger programs.  Larger programs means professional programmers, who know how to use type coercion *when they want it*, and also know it's better to use `===` all the time by default!

Moral of the story:  Use `===` and `!==` all the time, unless you are specifically looking for type coercion.  When looking for type coercion, **be careful**.


### Preview of the other types
In the next sections we will cover `Object`, `Array`, `Function` along with classes.  There are several other *newer* data types that are worth mentioning here.  They have been added to JavaScript largely to suppor the **general purpose** nature that the language has taken on.  They don't come up in most cases when doing traditional web development, but every once and a while you might encounter them.

- **symbol** - The symbol data type isn't something you would often used.  It allows you to create unique primitive values that occupy different memory locations, where primitives with the same value specifically occupy the same memory location in JavaScript.  For example, "hello" === "hello" is always true.  Symbol("hello") === Symbol("hello") is **false**, each symbol that is constructed is unique, regardless of the actual value stored at the storage cell.  There are situations where this concept can be helpful, and the symbol type can be an elegant solution, but it's exceedingly rare.  Don't use the symbol type unless you are absolutely sure it is the **only** way to accomplish what you are doing.
- **bigint** - This is a new numeric primitive that represents large integers - larger (potentially) than `Number.MAX_SAFE_INTEGER`.  Since numbers are always represented as floating point values - even if they are whole numbers, extra bits are used to facilitate the floating point book keeping.  When you know you only want to store whole numbers, you can store larger ranges of numbers if the encoding is using simple binary (ie 2's compliment) rather than floating point - and that's what this data type provides for you.

There are additonal *objects* that are specializations of `Object` that we will be seeing throughout this book.  These include `Date`, `Map`, and `Set`.  These are essential data structures, and as a web developer you are very likely to use them frequently.  We'll introduce them in the next few sections.   There are other object specialization that are less frequently used in routine web development.  These include things like `ArrayBuffer`, `BigInt64Array`, `Float32Array`, `SharedArrayBuffer`, and a host of other specialized arrays and memory buffers.   All of these are for more efficient storage numeric data (as we will see, JavaScript arrays aren't all that memory-efficient).  They have been added to JavaScript to support use cases that were not originally contemplated in the mid-1990's - things like WebGL!  We won't talk too much about them in this book.

There is more information on JavaScript types, along with type coercsion, on the [Mozilla Developer Network's Data Structures page](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures).



