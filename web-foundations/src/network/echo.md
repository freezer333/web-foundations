# Echo Client and Server
In this section we will put everything we've learned about TCP/IP together, and implement a simple networking application - the echo server and client.  The echo server/client is a set of (at least) two applications.  The echo server listens for incoming TCP connections, and once a connection is established, will return any message sent do it by the client right back to the very same client - slightly transformed.  For this example, the client will send text to the server, and the server will send back the same text, capitalized.

Here's the sequence of events:

1.  Echo server starts, and begins listening for incoming connections
2.  A client connects to the server
3.  A client sends text via the TCP socket (the text will be entered by the user)
4.  The server will transform the text into all capital letters and send it *back* to the client
5.  The client will receive the capitalized text and print it to the screen.

If the client sends the word "quit", then the server will respond with "Good bye" and terminate the connection.  After terminating the connection, it will continue to listen for more connections from additional clients.

## Implementation - C Echo Server
Most of the code in this book is JavaScript.   It's important to understand that the web, networking, and TCP / IP are all language *agnostic* however.  Applications can communication with TCP/IP no matter what programming language they are written in, and there is no reason to ever believe the server and client will be written in the same programming lanaguage.  

To reinforce this, we'll present the server and client in C++ **first**.  The C++ code presented here might seem really foreign to you - don't worry about it!  It's specific to the POSIX environment (actually, MacOS).  Don't worry about understanding the code in detail - instead, closely look at the steps involved.  We will then substituted the C++ client with a JavaScript implementation, and show how it can still talk to the C++ echo server.  Finally, we'll replace the C++ server with a JavaScript server.  

TODO

## Implementation - C Echo Client

TODO

## Implementation - JavaScript Echo Client

TODO

## Implementation - JavaScript Echo Server

TODO

**Key Point** &#128273;:  If you can build the C++ code yourself, go ahead and mix and match.  The JavaScript client can talk to the JavaScript server just as well as the C server.  The C++ client can talk to the JavaScript or C++ server.  The **protocol** is the same.  This is incredibly important to understand before moving forward!

## Echo is just a protocol
We've discussed the **Internet Protocol** as a Layer 3 *network layer* protocol.  It's a standard way of addressing machines, and passing data through a network.  We've discussed TCP as a Layer 4 *transport layer* protocol.  TCP defines ports to facilitate independent streams of data mapped to applications, along with reliability mechanisms.  In both cases, *protocol* is being used to mean "a set of rules".  IP is the rules of addressing and moving data, TCP is the rules of making reliable data streams.

Echo is a protocol too, but it's a higher level protocol.  It defines *what* is being communicated (text gets sent, capitalized text gets returned) - not how.  It also defines how the communication is terminated (the client sends the word "quit").  Echo has aspects of OSI model's Layers 5-7, but it's probably easier to think of it as an *application layer* protocol.

Notice, any application that speaks the "echo protocol" can play the echo game! Go ahead and check out all of the examples in the [`/echo` directory of the code section](../../../code/echo/) - included are implementations in Python, Java, C# to go along with JavaScript and C++.  They all play together.  Taking a look at examples in languages you already know might help you understand the mechanics of sockets a bit better! 

## The Protocol of the Web
The protocol of the web defines what web clients and web servers communicate.  Normally, TCP / IP is used at the network and transport layer - but as we've seen, that doesn't describe *what* is sent - just how.  In order for *all* web clients and servers to be able to play happily together, we need an *application layer* protocol.  This protocol is the subject of the next chapter - the **HyperText Transfer Protocol** - HTTP.