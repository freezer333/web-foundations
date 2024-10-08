# Object Prototypes
JavaScript uses a unique inheritance model called **prototype-based inheritance**, which stands in contrast to the **class-based inheritance** found in many other programming languages like C++ and Java. Instead of defining *classes* as blueprints for generating objects, JavaScript objects are created by making a *reference* to other objects, known as **prototypes**. These prototypes act as blueprints from which objects can inherit properties and behaviors.

At the heart of JavaScript's prototype system is the **prototype chain**. Every object in JavaScript has an internal link to another object, its prototype. This chain of objects continues until it reaches the end, typically the `Object.prototype`, which serves as the top of the prototype chain.


This section described how prototyping works, breifly.  For the most part, we will be able to focus on writing  JavaScript *without* dealing with the details of prototyping often - however if you truly want to master JavaScript, having a deep understand is valuable.

## Creating Objects with Prototypes
When you create an object using object literal notation or the `Object.create` method, you are establishing a prototype relationship. The simplest example is an object created with `{}`:

```js
const obj = {};
```

This object has `Object.prototype` as its prototype, which gives it access to methods like `toString` and `hasOwnProperty`.  Those methods are implmeented on `Object.prototype`.

However, if you want to create an object with a different prototype, you can use `Object.create`:

```js
const proto = { greet: function() { console.log("Hello!"); }};
const obj = Object.create(proto);
obj.greet(); // Prints "Hello!"
```

In this example, the object `obj` inherits the `greet` method from its prototype, `proto`. The prototype acts as a fallback — if `obj` doesn’t have a property, JavaScript will look for it on the prototype.  It's really just a *different* approach towards inheritance, without creating property types (classes).

## Prototype *Chain*
When accessing a property on an object, JavaScript will first check if the property exists directly on the object. If it doesn't find the property, it will follow the object's prototype chain to search for it. This continues until it either finds the property or reaches the end of the chain.

```js
const animal = { hasTail: true };
const dog = Object.create(animal);
dog.bark = function() { console.log("Woof!"); };

console.log(dog.hasTail); // true (inherited from animal)
dog.bark(); // "Woof!"
```

Here, `dog` does not have a `hasTail` property directly, but since `animal` is its prototype, the property is found through the prototype chain.

### Modifying Prototypes
You can modify prototypes at runtime, and any object linked to that prototype will immediately reflect the change.

```js
const proto = { greet: function() { console.log("Hello!"); }};
const obj = Object.create(proto);

// Adding a new method to the prototype
proto.sayGoodbye = function() { console.log("Goodbye!"); };

obj.sayGoodbye(); // Prints "Goodbye!"
```

Be cautious when modifying built-in prototypes (such as `Object.prototype`), as this can lead to unintended consequences throughout your codebase, since all objects will inherit these changes.

### `__proto__` and `Object.getPrototypeOf()`
JavaScript provides two key ways to access an object’s prototype:

1. The `__proto__` property, which is widely supported but is non-standard and discouraged in modern code.
2. The `Object.getPrototypeOf()` method, which is the recommended way to retrieve an object’s prototype.

```js
const obj = {};
console.log(obj.__proto__); // Outputs Object.prototype
console.log(Object.getPrototypeOf(obj)); // Same as above
```

### Setting Prototypes
You can set an object’s prototype using the `Object.setPrototypeOf()` method. However, this method is rarely used in practice because modifying an object’s prototype after creation can hurt performance.

```js
const animal = { hasTail: true };
const bird = { canFly: true };

Object.setPrototypeOf(bird, animal);

console.log(bird.hasTail); // true (inherited from animal)
```

## Constructors!
In JavaScript, functions can serve as constructors when invoked with the `new` keyword. Constructor functions set up the prototype chain for the objects they create. By default, every function has a `prototype` property, which points to an object. When you use a constructor, the newly created object links to the constructor’s prototype.

```js
function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function() {
  console.log(`${this.name} makes a sound.`);
};

const dog = new Animal("Dog");
dog.speak(); // "Dog makes a sound."
```

Here, the `Animal` constructor sets up `dog`'s prototype to link to `Animal.prototype`. As a result, `dog` can access the `speak` method.

### The `this` Keyword in Constructors

When working with object-oriented concepts in JavaScript, the `this` keyword plays a central role in defining properties and behaviors that belong to a specific instance of an object. In the context of a constructor function, `this` refers to the **new object instance** being created.  

For example:

```js
function Person(name, age) {
  this.name = name; // 'this' refers to the new instance
  this.age = age;
}

const john = new Person("John", 30);
console.log(john.name); // "John"
console.log(john.age);  // 30
```

In this code:

- `Person` is a constructor function.
- `this.name = name` assigns the `name` parameter to a `name` property on the new object.
- `this.age = age` does the same for the `age` property.
- The `new Person("John", 30)` call creates a new instance of `Person`, where `this` inside the constructor refers to the `john` object.

### How `this` Behaves with `new`

When you use the `new` keyword with a constructor function:

1. A new empty object is created.
2. The constructor function is called with `this` bound to that new object.
3. Any properties or methods assigned to `this` inside the function become part of the new object.
4. Unless the constructor returns an object explicitly, `this` (the new object) is returned by default.

For example:

```js
function Car(make, model) {
  this.make = make;
  this.model = model;
  this.drive = function() {
    console.log(`Driving a ${this.make} ${this.model}`);
  };
}

const car1 = new Car("Toyota", "Corolla");
car1.drive(); // Driving a Toyota Corolla
```

Here, `this.make` and `this.model` refer to the specific car instance being created, and `this.drive` becomes a method attached to that instance.

### The Importance of `new` with `this`

When calling a constructor function without `new`, the behavior of `this` changes dramatically. Instead of referring to a new object, `this` might refer to the global object or be `undefined`. This can cause unexpected bugs.

For instance:

```js
function Animal(type) {
  this.type = type;
}

const dog = Animal("Dog");
console.log(dog);         // undefined
console.log(window.type); // "Dog" (in non-strict mode)
```
Since `new` is not used, the constructor does not create a new object, and `this` refers to the global object (`window` in browsers, `undefined` in Node.js). To avoid this confusion, always use `new` when calling a constructor function to ensure that `this` refers to the new instance.

**We will revisit our discussion of `this` when we cover proper ES6 Classes in the next section**.  Not only does the `this` keyword have different implications with true classes, but it also is affected by the use of `function` and `=>` notations as well.


## Prototypes vs Classes
In JavaScript, objects inherit properties and methods through a **prototype**, an object linked to every instance of a constructor function. This prototype-based inheritance allows shared methods across instances via the prototype chain. This is in stark contrast to a language like C++, which uses **class-based inheritance**, where classes serve as blueprints, and objects (instances) inherit methods and properties directly from a class hierarchy. 

Both the prototype style and class-based inheritance can facilitate *most* of the same object oriented and polymorphic functionality - especially given JavaScript's typing system.  That said, there are advantages to the type of **class-based** inheritance models we see in other languages: 

1. **Clarity and Structure**: Class-based inheritance provides a more formal and structured way to define relationships between objects. We can explicitly define class hierarchies, making the code easier to read and understand - especially given that most programmers are **already** familiar with this style of programming.

2. **Encapsulation**: Classes allow for encapsulation of data and behavior. By using access modifiers (like `private`, `protected`, and `public`), class-based languages provide fine-grained control over which parts of an object are accessible outside its scope.  There is no notion of this with the original JavaScript prototype implementation.  All properties on objects (including objects that are serving as prototypes) are accessible (and mutable).  

3. **Multiple and Interface Inheritance**: Many class-based languages support multiple inheritance or interfaces, allowing for more complex and flexible designs. This lets objects inherit from more than one class or follow multiple interface contracts, making them more versatile in complex systems.  This isn't possible with prototyping, as each object has **one and only one** prototype.

Perhaps the biggest benefit of *class-based* object oriented design is that there is a distinction between the *blueprint* of a type, and instances.  When using prototyping, objects are derived from other *objects*, and those underlying objects can be changed.  As noted above, you can even change (at runtime) the properties of `Object` itself - and those changes would cascade (immediately) to every instance of every object in your program - past, present and future!  This might sound incredibly powerfule (it is), but it's also **really dangerous**.  **class-based** design allows you to set up the rules of a "type" in an unmodifiable way, in a more declarative style.  This is less powerful, but also far easier to manage.

In the 2015 release of EMCAScript (JavaScript) 6, JavaScript received *true* class-based syntax.  Under the hood, it still uses the prototype design, but from a syntactic perspective we can now design object oriented features in a similar manner as other OO langauges.  This is the focus of the next section.