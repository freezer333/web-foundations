# Objects
As has been described a few times in this chapter, JavaScript has two *kinds* of types - **primitives** and **objects**.  We've talked a lot about primitives, and we've mentioned objects a few times.  In this section, we'll look a lot more closely at objects, and then over the next few sections we will look at *specific* specializations of objects.

If you are coming from an object oriented language, the word *object* has a specific meaning.  Normally we think of it as an *instance* of a class - a class being a data type.  In object oriented languages, we usually have built in classes and user defined classes - and in both cases we think of *classes* as blueprints for new data types.  We create instances when we declare variables of that type.

JavaScript has a fundamentally different take on *objects* and object orientation.  We are going to look at the most commmon and practical uses of *objects*, and then we will breifly discuss their implementation details.

## Objects are just bags of properties
JavaScript code can create objects, without defining classes.  While we will discuss actual classes (which are a newer feature of JavaScript), *objects* are mostly just instances of the `Object` type.  As a programmer, you can put *whatever* properties you want in *each* object instance you create.  There is no blueprint, no new type.

```js
// Create a new, empty object
const obj1 = {};

// Create a new object with two properties
const obj2 = {a: 1, b: 2};

// We can add x as a new property just
// by setting it.
obj1.x = 7;
// Same with c, which can be added to obj2
obj2.c = "Hello";
// And a can be changed to have a string 
// rather than a number.
obj2.a = "World";
```

In the code above, we highlight two concepts - property *addition* and chaning property values.  We are also demonstrating how `const` objects can be mutated, which might at first seem surprising.

Let's deal with those issue in reverse order.  `const obj1` is indeed declaring a new *constant* object, but the *const* is not referring to the object that `obj1` points to, it's referring to the `obj1` reference itself.  Variables, whether they refer to primitives or objects, are just references.  `const obj1` means that `obj1` will always refer to the object we've created, but the *contents* of that object are always free to change.

For example, the following code would *violate* the constant constraint:

```js
const o = {};
// We would throw an error here.  Even though it's still an 
// empty object, when you create a new object with the literal {} 
// notation, a new object is being created in memory.  If o was
// declared with let, this would be fine - but const means o cannot
// point to or refer to a different location in memory.
o = {};
```
The following is fine:
```js
const o = {};
o.a = 1;
```
We can also always *change* properties within an object.  When we changed `obj2.a` in the original code above, we were changing the value that `a` refers to.  That neither changes the object that `obj2` refers too, nor does it cause any problem by changing the data type.  This is for the same reason that `let a = 1` can be followed by `a = "hello"` - we've already established that JavaScript variables can refer to data of *any* type over their lifetime.

BTW, there is also nothing wrong with this:

```js
let a = 5;
a = {b: 9};
a = "hello";
```
In each of those statements, the variable `a` is being reassigned (`let` permits this).  The fact that its being changed from a number, to an object, to a string is not an issue.

Finally, in the original code we demonstrated that properties could be added via simple assignment.

```js
// Create a new object with two properties
const obj2 = {a: 1, b: 2};
// c can be added to obj2
obj2.c = "Hello";
```

This is perfectly normal, and expected in JavaScript. We create objects, and we add properties to them.  We can also reference properties, and is alway safe to do so:

```js
const obj2 = {a: 1, b: 2};
obj2.c = "Hello";

// There is no d property, so
// the value printed is `undefined`
console.log(obj2.d);
```
Here we see that `undefined` concept again.  Accessing a property within an object that has not been assigned results in `undefined` being returned.  In fact, you can almost think of every object as always having the *entire infinite* set of all possible properties already available - but that they have all been initialized to `undefined`.  This of course is **not** how it works under the hood - but it **is** the behavior.

Remember, referencing a property of an object that was never set is ok - you get `undefined`.  Referencing a property of an undefined object is something quite different - and it will crash your program!

```js
const o = {};
let x;
console.log(o.missing); // undefined
console.log(x.missing); // Program crashes, x isn't an object at all!
```

## Object creation
Now that we've gotten started, let's look at all the ways that we can create objects in the first place.

The most common way is to use the *literal* notation:

```js
const o = {}
```
Alternatively, some prefer to use `const o = new Object()`.  This is using a constructor syntax that you might already feel confortable with.  It's OK to use, but it's verbose, and it isn't really any different than using the `{}` notation.

A third way is to use `const o = Object.create(null)`.  This is a more unusual case, and is very rarely used in practice.  This syntax provides the ability to take advantage of some of the internals of how objects work in JavaScript - through a *prototype* system.  We'll discuss this later on in this section, but in practice it's not used directly all that often in regular web development.

When creating objects, we are free to create them with any number of properties;

```js
const x = 5;
const o = {
    a: 10,
    b: "Hello World",
    c: null, 
    d: x
};
```
It is perfectly natural to do this, and it is quite useful to do so.  Objects are used **extensively** in JavaScript code because they are so easy to create, they are flexible, and once you get the hang of them, very easy to use.
## Object Properties
Object property names can be referenced using the `.` operator.  Assignment and referencing works as you'd expect, with the reminder that you can assign properties that don't already exist, and you can also reference properties that don't already exist, without issue.

Object names, when they follow the rules of standard identifiers (start with alphabetical or underscore, no spaces, and limit characters to alphanumeric plus _ and a few others) can use the `.` operator, but actually property names can be even more flexible.

For situations where a property name must use a naming convention that does not adhere to the indentifier syntax, you can use `[]` notation instead.

```js
const o = {};
o["Hello World"] = 5;

console.log(o["Hello World"]);

```
The property name "Hello World" is not a valid identifier, and thus cannot be used with the `.` operator, but you can still use it as a property name.  There are some use cases where this comes in handy, but genrally you will want to stick to proper identifier names.  The `.` operator is much more ergnonmic.

The `[]` syntax for referencing object properties does have a nice use case though.  Consider the code below, where a *random* property name is accessed:

```js
const o = {a: 1, b: 2};
const name = Math.random() < 0.5 ? 'a' : 'b';
console.log(o[name]);
```
This code might appear odd (and yes, it's a bit contrived).  We set a variable `name` to be be **either** `"a"` or `"b"`, and then use the value of `name` to access the corresponding proeprty.

Note that this is different than `o.name`, which would attempt to access the property called `name` - which is undefined.  This literally is accessing either property `a` or `b` based on the *value* of `name`.  

