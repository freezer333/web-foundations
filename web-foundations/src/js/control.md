# Control Flow
So far we've covered types and scope, and JavaScript's quirkiness has been on full display.  Hopefully you have come to grips with type coercion. . Hopefully you understand that as long as you **never** use `var`, and instead restrict yourself to `let` and `const`, life is pretty good in terms of scope.  The good news is that most of the rest of JavaScript's syntax is a lot easier and more intuitive. Control flow is straightforward - it works largely the same way as most other programming languages.

## if branches
The `if` condition is exactly like C, C++, Java, C#.  `if` clauses require boolean expressions, and can be followed by any number of `else if` clauses, and may include one `else` at the very end.  Short circuting of boolean expression applies, just like in other languages.  The `{` and `}` scoping operators are *optional* if a clause only has a single statement - **however you are strongly encouraged never to take this option**.

## Ternary operator
Consider the following:

```js

if (x < 5) {
    y = 10;
} 
else {
    y = 20;
}
```
Most JavaScript programmers will take advantage of the ternary operator instead of writing the bulkier code above:

```js
y = x < 5 ? 10 : 20;
```
Both ways are perfectly acceptable, but when you are trying to do a simple assignment based on a single condition, the ternary operator is preferred by most people.  Be careful though, **don't abuse the ternary operator**.  If you find yourself adding a bunch of paranthesis, or chaining mutliple ternary operators together, you are abusing it - and making your code **worse**.  

If you write the following ternary expression:
```js
y = (x < 5 && z > 50) ? (x %5 === 0 ? 70 : (z === 10 ? 6 : 9)) : 6
```
You should write this:

```js
if (x < 5 && z > 50) {
    if ( x % 5 === 0) {
        y = 70;
    } 
    else {
        if (z == 10) {
            y = 6;
        } 
        else {
            y = 9;
        }
    }
} else {
    y = 6;
}
```
It's a lot more space, but it's worth it - because your assignment is complicated.  Taking something complicated and condensing it into a single line of code does no one any favors.  If you want to de-clutter your code, put that complex set of branches into a function instead.

```js
y = complex_assignment(x, z);
```

## switch branches
Like most other language, the `switch` statement can be used to execute one of several blocks of code based on the value of a **single** expression.  It's an alternative to using multiple `if...else if` statements when dealing with multiple possible outcomes for a single expression. Any `switch` can be written as a sequence of `if`/`else if`/`else`, but not vice-versa.

### Syntax:
```javascript
switch (expression) {
  case value1:
    // Code to run when expression === value1
    break;
  case value2:
    // Code to run when expression === value2
    break;
  // Add more cases as needed
  default:
    // Code to run if no cases match
}
```

### Key Points:
1. **Expression Evaluation:** The `switch` expression is evaluated once, and its result is compared to each `case` value.
2. **Case Blocks:** Each `case` contains a value to compare with the `switch` expression. If a match is found, the corresponding block of code is executed.
3. **Break Statement:** The `break` statement is crucial because it prevents the code from "falling through" to the next case. Without `break`, execution continues to the next case, even if it doesn’t match.
4. **Default Case:** The `default` block is optional but useful. It runs if none of the `case` values match the expression. It works like the final `else` in an `if...else` chain.

## while loops
`while` loops are used to repeatedly execute a block of code as long as a specified condition evaluates to `true`. It is especially useful when you don’t know in advance how many times the loop should run, but you want it to continue until a certain condition changes (a conditional loop)

### Syntax:
```javascript
while (condition) {
  // Code to be executed while the condition is true
}
```

### Key Points:
1. **Condition Evaluation:** Before each iteration, the `while` loop evaluates the condition. If the condition is `true`, the loop body is executed. If the condition is `false`, the loop terminates.
2. **Infinite Loops:** If the condition never becomes `false`, the loop will continue indefinitely, creating an infinite loop. Therefore, it's important to ensure that the loop modifies something (such as a counter) to eventually meet the exit condition.
3. **Initial Condition Check:** The condition is checked at the beginning of each iteration. If the condition is `false` on the first check, the loop will never run.

### Example:
```javascript
let count = 0;

while (count < 5) {
  console.log(`Count is: ${count}`);
  count++;
}
```

In this example:
- The loop starts with `count = 0`.
- The condition `count < 5` is checked before each iteration. As long as `count` is less than 5, the loop runs.
- Inside the loop, `count` is incremented by 1 after each iteration.
- When `count` reaches 5, the condition becomes `false`, and the loop stops.

### Output:
```
Count is: 0
Count is: 1
Count is: 2
Count is: 3
Count is: 4
```

JavaScript also supports the `do` / `while` variant, which allows for a **post test** suitable for situations where you want your loop to run at least one time.

```js
let count = 0;

do {
  console.log(`Count is: ${count}`);
  count++;
} while (count < 5)
```

## for loops (Part 1)
It should come as no surprise that JavaScript also allows for *counting* loops using `for`.  These loops are most useful when you can count, or express, the number of times the loop should go around using an expression.  

```js
for (let count = 0; count < 5; count++) {
    console.log(`Count is: ${count}`);
}

```
Notice that `let` is required here rather than `const`. The `count` variable is scoped outside the body of the `for` loop, but is tied to the `for` loop. `count` cannot be used on the lines before or after the loop, however `count` is not recreated on each turn of the loop - it is mutated.

We will revisit `for` loops when we cover arrays and objects, as there are variations of for loops that work specifically with these types of data structures in more sophisticate way.

## Wrap up
Control statements works as expected if you are familiar with C, C++, Java, or C# (among other languages).  As always, using the right tool for the job makes a world of difference.  You should strive to be proficient at using each, and understand which works best in which situation.  You'll be surprised by how much your code will improve, in terms of maintainability, readability, reliability, and correctness by simply learning to use the write control structure for you situation!