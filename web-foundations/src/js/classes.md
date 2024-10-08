# JavaScript ES6 Classes
With ECMAScript 2015 (ES6), JavaScript introduced a more structured and readable way to define object-oriented constructs using **classes**. Although JavaScript remains a prototype-based language at its core, classes provide a familiar and straightforward syntax for those accustomed to class-based languages like Java or C++. 

## Class Syntax and Constructors
Classes in JavaScript are declared using the `class` keyword, followed by the class name. Inside the class, the `constructor` method is used to initialize the object's properties when a new instance is created with the `new` keyword.

```javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  greet() {
    console.log(`Hello, my name is ${this.name}`);
  }
}

const person1 = new Person('Alice', 30);
person1.greet(); // Output: Hello, my name is Alice
```

Here, the `Person` class has a constructor that takes two parameters, `name` and `age`, and assigns them to the newly created object using the `this` keyword. The `greet` method then uses these properties to display a personalized message.

## Encapsulation and Property Access with `get` and `set`

JavaScript classes provide **getters** and **setters** for encapsulating properties and controlling access to them. Getters retrieve the value of a property, and setters validate or modify the data before assigning it to the internal property.

```javascript
class Person {
  constructor(name, age) {
    this._name = name;
    this._age = age;
  }
  
  get name() {
    return this._name;
  }
  
  set name(newName) {
    if (newName.length > 0) {
      this._name = newName;
    } else {
      console.log("Name cannot be empty.");
    }
  }
  
  get age() {
    return this._age;
  }
}

const person1 = new Person('Alice', 30);
console.log(person1.name); // Output: Alice
person1.name = 'Bob';
console.log(person1.name); // Output: Bob
```

In this example, `name` and `age` have getter methods. The setter for `name` ensures the name cannot be set to an empty string, providing controlled access to the internal `_name` field.

### Why Use the `_` Prefix?

You may notice the `_` prefix before `name` and `age`. In JavaScript, this is a **convention** to indicate that a property is intended to be private or should not be directly accessed or modified outside of the class. However, this convention does not enforce true privacy, as `_name` and `_age` are still publicly accessible. It merely signals to developers that these properties should be handled with care.

```javascript
const person1 = new Person('Alice', 30);
person1._name = ''; // The underscore indicates this should not be done, but it is still allowed
console.log(person1._name); // Output: (an empty string, which may break logic elsewhere)
```

This convention led to the introduction of **private class fields**, denoted with the `#` symbol, which we'll explore next.

## Private Fields with `#`

To achieve true privacy in JavaScript classes, ES2022 introduced **private fields**, which are prefixed with `#`. Unlike the `_` convention, private fields are not accessible outside of the class definition, providing genuine encapsulation.

```javascript
class Person {
  #name; // private field
  #age;  // private field
  
  constructor(name, age) {
    this.#name = name;
    this.#age = age;
  }

  get name() {
    return this.#name;
  }

  get age() {
    return this.#age;
  }

  greet() {
    console.log(`Hello, my name is ${this.#name}`);
  }
}

const person1 = new Person('Alice', 30);
console.log(person1.name); // Output: Alice
console.log(person1.#name); // SyntaxError: Private field '#name' must be declared in an enclosing class
```

In this example, trying to access `#name` directly from outside the class throws an error. This ensures that private fields cannot be tampered with from the outside and are only modifiable or accessible via methods or getters/setters defined in the class.

## Read-Only Properties with Getters

A getter without a corresponding setter can be used to create **read-only** properties, meaning the property can be accessed but not modified directly.

```javascript
class Person {
  constructor(name, age) {
    this._name = name;
    this._age = age;
  }
  
  get name() {
    return this._name;
  }

  get age() {
    return this._age; // Read-only
  }
}

const person1 = new Person('Alice', 30);
console.log(person1.age); // Output: 30
person1.age = 35; // No effect since there is no setter
console.log(person1.age); // Output: 30
```

In the example above, the `age` property has only a getter, making it read-only. Any attempt to assign a new value will be ignored.

## Static Methods

Static methods are defined on the class itself rather than on instances of the class. These methods are useful when the functionality is not tied to a particular instance but instead relates to the class as a whole.

```javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  static species() {
    return 'Homo sapiens';
  }
}

console.log(Person.species()); // Output: Homo sapiens
```

In this example, the `species()` method is static, meaning it is called on the `Person` class itself rather than on an instance. Static methods are typically used for utility functions or to define constants.

## The `this` Keyword

In JavaScript, `this` refers to the current instance of the class. It is used to access the instance's properties and methods. When working within a class, `this` ensures that the correct object is being referenced.

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }

  greet() {
    console.log(`This person is named ${this.name}`);
  }
}

const person1 = new Person('Alice');
person1.greet(); // Output: This person is named Alice
```

Here, `this.name` refers to the `name` property of the `person1` instance. The keyword `this` is crucial when creating methods inside classes, as it provides a reference to the object the method is being called on.

## Inheritance with ES6 Classes

ES6 classes support **inheritance**, allowing one class to extend another and inherit its properties and methods. Inheritance is achieved using the `extends` keyword, and the subclass must call `super()` to invoke the constructor of the parent class.

Consider the `Person` class and its two subclasses, `Student` and `Professor`:

```javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  greet() {
    console.log(`Hello, my name is ${this.name}.`);
  }
}

class Student extends Person {
  constructor(name, age, major) {
    super(name, age); // Calls the constructor of the Person class
    this.major = major;
  }
  
  study() {
    console.log(`${this.name} is studying ${this.major}.`);
  }
}

class Professor extends Person {
  constructor(name, age, department) {
    super(name, age); // Calls the constructor of the Person class
    this.department = department;
  }
  
  teach() {
    console.log(`Professor ${this.name} is teaching in the ${this.department} department.`);
  }
}

const student1 = new Student('Alice', 20, 'Computer Science');
const professor1 = new Professor('Dr. Bob', 50, 'Mathematics');

student1.greet(); // Output: Hello, my name is Alice.
student1.study(); // Output: Alice is studying Computer Science.

professor1.greet(); // Output: Hello, my name is Dr. Bob.
professor1.teach(); // Output: Professor Dr. Bob is teaching in the Mathematics department.
```

In this example, both `Student` and `Professor` inherit from the `Person` class. The `Student` class adds a `major` property and a `study` method, while the `Professor` class adds a `department` property and a `teach` method. They both share the `greet` method from the `Person` class. The `super()` function is required in the constructor of the subclasses to call the parent class's constructor.

## Arrow Functions and Lexical `this`
Arrow functions, introduced in ES6, maintain the `this` value from their surrounding lexical scope. This makes them useful in scenarios where you want to preserve the correct reference to `this` without worrying about the context.

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }

  delayedGreet() {
    setTimeout(() => {
      console.log(`Hello, my name is ${this.name}`);
    }, 1000);
  }
}

const person1 = new Person('Alice');
person1.delayedGreet(); // Output: Hello, my name is Alice (after 1

 second)
```

In the example, an arrow function inside `setTimeout` ensures that the `this` keyword refers to the instance of `Person`, not the global object, which would happen with a traditional function.

## When we use classes
JavaScript ES6 classes provide a modern, more intuitive syntax for object-oriented programming. The ability to define constructors, encapsulate properties using getters and setters (including readonly and private fields), leverage inheritance, use static methods, and ensure proper `this` binding with arrow functions, has made ES6 classes a powerful tool for developers. This cleaner and more structured syntax brings JavaScript closer to traditional class-based languages while still maintaining its underlying prototype-based nature.

All that said - you will notice that we don't use classes all that much in a lot of the code througout this book.  That's not a *conscious* decision, it's not done because classes are a bad thing.  The truth is that *a lot* of JavaScript code can be written with just the basic object (`Object`) and functions.  JavaScript *doesn't have to be* object oriented - and because of the flexibility inherent in the language, you can often achieve much of the same expressiveness that you get from polymorphism in typed langauges simple with regular old objects in JavaScript.  

In conclusion - using classes are great, especially if that's what you are most comfortable with - however there is also nothing inherently wrong with using them sparingly.  JavaScript code doesn't need to look like C++, Java, or C# code just because classes are supported.  Classes are great options for certain situations, but they aren't the only options for all situations!


<hr/>
At this point, we have covered more than enough of the JavaScript language.  It's time to start *applying* it towards web development.  For the next few chapters, JavaScript will be used **serverside**, all of our focus will be on implementing **web servers**.  We will do so in conjunction with learning HTML and CSS for front-end development, but whenever we are using JavaScript, it will be towards server side functionality.

Before moving forward, **you are strongly encouraged** to work on the first first project, presented in the next section. It's a bare-bones implementation of a web server, with static data.  It's a chance for you to really practice JavaScript, and also solidify your understanding of exactly how HTML is served to browsers.  We will revisit this project over time throughout this book, as we gradually introduce more powerful techniques.  Take the time to do the practice problems - they will improve your understanding in meaningul ways!