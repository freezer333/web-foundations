# Echo Client and Server
In this section we will put everything we've learned about TCP/IP together, and implement a simple networking application - the echo server and client.  The echo server/client is a set of (at least) two applications.  The echo server listens for incoming TCP connections, and once a connection is established, will return any message sent do it by the client right back to the very same client - slightly transformed.  For this example, the client will send text to the server, and the server will send back the same text, capitalized.

Here's the sequence of events:

1.  Echo server starts, and begins listening for incoming connections
2.  A client connects to the server
3.  A client sends text via the TCP socket (the text will be entered by the user)
4.  The server will transform the text into all capital letters and send it *back* to the client
5.  The client will receive the capitalized text and print it to the screen.

If the client sends the word "quit", then the server will respond with "Good bye" and terminate the connection.  After terminating the connection, it will continue to listen for more connections from additional clients.

## Implementation - C++ Echo Server
Most of the code in this book is JavaScript.   It's important to understand that the web, networking, and TCP / IP are all language *agnostic* however.  Applications can communication with TCP/IP no matter what programming language they are written in, and there is no reason to ever believe the server and client will be written in the same programming lanaguage.  

To reinforce this, we'll present the server and client in C++ **first**.  The C++ code presented here might seem really foreign to you - don't worry about it!  It's specific to the POSIX environment (actually, MacOS).  Don't worry about understanding the code in detail - instead, closely look at the steps involved.  We will then substituted the C++ client with a JavaScript implementation, and show how it can still talk to the C++ echo server.  Finally, we'll replace the C++ server with a JavaScript server.  


```cpp
{{#include ../../../code/echo/server.cpp}}
```

## Implementation - C++ Echo Client

```cpp
{{#include ../../../code/echo/client.cpp}}
```

## Implementation - JavaScript Echo Client
We can implement a compatable client in any language, there is no need for client and server to be written in the same language!  If you aren't familiar with JavaScript, or callback functions, then the following code may seem a bit mysterious to you.  Rather than focusing on those mechanics, try to focus on what's happening with sockets - you should notice the similarities between the C++ example and this.  The main difference is that callback take the place of synchronous loops, and the Node.js interface for sockets is quite a bit simpler than the C++ version.

The easiest way of thinking about the difference between the C++ and JavaScript versions is that JavaScript is *event driven*.  In the C++ version, everything is sequential - we make function calls like `getline`, `connect`, `write` and `read`.  Everything executes in order, and we use loops to do things over and over again.

In the JavaScript version, we identify *events* - when the socket gets connected, when the user types something in, when a response is received from the server.  We write functions (usually anonymous) that contain code that executes *whenever* these events occur.  Notice in the code below there are no loops - we simply specify, *send the entered text whenever the user types something* and *print the response and prompt for more input whenever the server response is received*.  Those *callbacks* happen many times - and the sequence is kicked off by connecting to the server.

We will talk a lot about callback in JavaScript in later chapters - don't get too bogged down on this now!

```js
{{#include ../../../code/echo/client.js}}
```

## Implementation - JavaScript Echo Server
We can write a server in JavaScript too, and the C++ and JavaScript clients can connect to it - even at the same time.  In this example, Node.js's `net` library along with it's asynchronous callback design really shines.  We don't need to deal directly with threads, while still retaining the ability to serve many clients simultaneously.

```js
{{#include ../../../code/echo/server.js}}
```
It's actually a pretty amazing little program - in just a few lines of code we have implemented the same TCP echo server as we did using over 100 in C++!.  It's the same functionality though, and completely interoperable!

## Echo is just a protocol
We've discussed the **Internet Protocol** as a Layer 3 *network layer* protocol.  It's a standard way of addressing machines, and passing data through a network.  We've discussed TCP as a Layer 4 *transport layer* protocol.  TCP defines ports to facilitate independent streams of data mapped to applications, along with reliability mechanisms.  In both cases, *protocol* is being used to mean "a set of rules".  IP is the rules of addressing and moving data, TCP is the rules of making reliable data streams.

Echo is a protocol too, but it's a higher level protocol.  It defines *what* is being communicated (text gets sent, capitalized text gets returned) - not how.  It also defines how the communication is terminated (the client sends the word "quit").  Echo has aspects of OSI model's Layers 5-7, but it's probably easier to think of it as an *application layer* protocol.

Notice, any application that speaks the "echo protocol" can play the echo game! Go ahead and check out all of the examples in the [`/echo` directory of the code section](https://github.com/freezer333/web-foundations/tree/main/code/echo) - included are implementations in Python, Java, C# to go along with JavaScript and C++.  They all play together.  Taking a look at examples in languages you already know might help you understand the mechanics of sockets a bit better! 

## The Protocol of the Web
The protocol of the web defines what web clients and web servers communicate.  Normally, TCP / IP is used at the network and transport layer - but as we've seen, that doesn't describe *what* is sent - just how.  In order for *all* web clients and servers to be able to play happily together, we need an *application layer* protocol.  This protocol is the subject of the next chapter - the **HyperText Transfer Protocol** - HTTP.

Just like for the echo server and client, **HTTP** isn't about a specific programming language.  Any program, regardless of the language it is written in, can speak HTTP.  Most web browsers (clients) are written in C, C++ (and some partially in Rust).  Web servers are written in all sorts of languages - from C, Java, Ruby, and of course Node.js / JavaScript!