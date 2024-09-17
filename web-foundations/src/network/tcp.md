# Transport Layer
The transport layer (Layer 4 in the OSI model) picks up where the IP protocol leaves off.  There are two concepts typically associated with Layer 4 - reliability and multiplexing

## Reliability with Sequence numbers and Acknowledgements
Recall that each IP message is sliced up into packets and sent through the internet, with **no regard** for when each packet gets delivered.  While IP assembles packets *within* messages in order (and drops messages that have missing or corrupt packets), it makes no attempt to ensure that entire *messages* are delivered in order. In some applications, this may be acceptable - however in *most* applications, this would be chaos.

Consider an application communicating keystrokes over a network.  Each time the user presses a character, or a bunch of characters within a given amount of time, the sending application fires them over to a receiver, responsible for saving the characters to a remote file.  If message are arriving out of order, then characters will end up being saved to disk out of order.  It's pretty clear that won't work!

Here's a toy example, with a hypothetical API for sending and receiving messages.  It further illustrates the concern.

```c++
   // This is the sender code, 

   send(receiver_ip_address, "Hello");
   send(receiver_ip_address, "World");

```
```c++
    // This is the receiver code

    // Imagine recv blocks, waiting until the machine receives a message
    // and then recv decodes the IP message (it's packets) and returns the 
    // message.
    message1 = recv();
    message2 = recv();
    
    print(message1);  // We do NOT know if message 1 will be "Hello" or "World"!
    print(message2);  // They could have arrived out of orcer!
```
Let's pause for a moment and remember where the *IP* protocol is implemented.  The `send` and `recv` functions used in the example above are hypothetical, but they mimic operating system API's that we will use to send and receive data.  Notice that in this example, `send` would need to do the slicing into packets, and attaching IP headers to each packet, including the checksum and sequence number - for each message. Likewise, `recv` would need to manage the process of assembling all the packets and doing error checking before *returning* the message to the program that called `recv`.  Clearly `recv` would also potentially either return an error, or throw an exception of some sort if no message was received after some period of time, or if a message was received by corrupted. 

Back to the ordering problem.  There is an obvious solution to this, and it is actually *already* used within IP for packets within a message.  We can simply attach a *seqeuence number* to each message that we send.  This would allow us to detect, on the receiving end, when something has arrived out of order.  However, this also means that there needs to be some start (and end) of a sequence of messages between two machines - what some might call a *session*.  At the beginning of the session, the first message is assigned a sequence number of 0, and then after sending each message, the current sequence number is incremented.  The session, in this respect, *has state*.  The sequence number is part of the message that is sent using IP, it's inside the IP payload.

The code might look something like this:

```c++
    // Sender code

    session = create_transport_session(receiver_ip_address)

    session.send("Hello");
    session.send("World");

```
```c++
    // Reciver code
    session = accept_connection();

    // Recv still blocks, but now it also determine if something arrives
    // out of order, because there is a sequence number associated with the 
    // session.  If we recieve "World" first, recv won't return - it will wait
    // until "Hello" arrives, and return it instead.  Then the next call to recieve
    // will return "World" immediately - since it already arrived and was cached.
    message1 = session.recv();
    message2 = session.recv();

    print(message1);  // Will definately be "Hello"
    print(message2);  // Will definately be "World"
```

This is powerful.  With the operating system implementing a Transport layer protocol for us, we not only can deal with out of order messages, we can also handle missing messages.  As discussed before, IP *drops* messages that are corrupted.  With our sequence number solution, we can detect when we are missing a message.  For example, we can see (on the receiving end) that we've received a message with sequence number 4 before receiving one with sequence number 3 - and wait for 3 to arrive.  However, a message with sequence number 3 may actually *never* arrive if it was corrupted along the way.  Could we ask the sender to resend it?

It turns out, it is more efficient (somewhat surprisingy) to have the receiver actually acknowledge *every* message received, rather than asking the sender to resend a missing message. This is because in order to avoid asking for *unnecessary* resends the reciver would need to wait a long time - given the message may be *en route*.  It also makes sense to use an acknowledgement scheme rather than a resend request because it is possible that the receiver misses *multiple* messages. Using the previous example, what if we not only miss message 3, but message 4 also.  What if at that point, the sender is done sending!  The reciever will never receive a message 5, and never know it missed messages 3 and 4!

The actual solution to the reliability problem is as follows:
- Each message gets a sequence number
- Upon reciept, the receiver sends an acknowledgement to the sender. 
- The sender expects an acknowledgement within a specific time window (we'll discuss details soon), and if it doesn't receive it, it resend the message.  After a specified number of resends without an acknowledgement, the connection is deemed lost.
- Receivers will cache any out of order messages received until all messages with sequence numbers less than the out of order message are received, or the connection times out.

It's interesting to note, it's possible that the *acknowledgement* never makes it to the sender, for the same reason it's possible the original message didn't make it to the receiver.  That's ok, the sender just resends.  The receiver will ignore reciept of a message it already has, since it's trivial to detect a duplicate based on the sequence number.

It's important to understand the above lays out a conceptual strategy for allowing for reliable data transmission over IP, but there are lots of optimizations that can be made.  Stay tuned for more on this below.


## Multiplexing with Port Numbers
Port numbers are a simple concept, but are foundational to application programming over networks.  Think about how postal mail is delivered via the postal system.  Imagine a letter, being sent across the country.  It arrives at your house based on the *address* - the street number, town, postal code, etc.  The address relates to the *physical location* where the mail should be delivered.  Layer 3 (the IP Protocol) does a lot of the work here - it identifies physical machines, and routes data traffic through the network so it reaches the right machine.

However, when mail gets delivered to your house, there's another step.  Unless you live alone - you probably need to take a look at the *name* listed on the envelope before you open it.  If you have a roomate, you probably shouldn't open their mail - and vice versa.  Well, network traffic is sort of like this too!  On your computer, right now, you probably have a few applications running that are receiving network data - your web browser, maybe an email client, a game, etc.  As network traffic comes into your computer over the network device, the underlying operating system software needs to know **which application** should see the data.  

Port numbers are just integers, and they are abstract (they don't physically exist).  They serve a similar purpose as the *name* of the person on a mail envelope - they associate network data being transmitted over IP *with a specific stream of data* associated with an application.  Your web browser communicates with web servers over a set of port numbers, while your email client uses a different port number, and your video games use others.  Applications associate themselves with port numbers so the operating system can deliver received data to the right application.

Port numbers facilitate **multiplexing**, in that they allow a single computer to have many applications running, simulataneously, each having network conversations with other machines - as all network messages are routed to the correct application using the port number.

Just like with sequence numbers, port numbers are associated with a "session" - a connection managed in software between two computers.  The session will have sequence numbers, acknowledgement expectations, and the port number of the receiver (and sender).  

## Sockets
We've been using the term "session" to represent a *stateful* software construct representing a connection between two machines.  While the term make sense, it's not actually what is used. Instead, we call this **a socket**.  A **socket**, across any operating system, is a software construct (a data structure) that **implements** the IP + Transport Layer protocol.  There are two basic types of sockets, which correspond to the most commonly used transport layer protocols: **TCP** and **UDP**.

TCP - the Transmission Control Protocol is **by far** the most commonly used of the two.  TCP layers **reliability** and **multiplexing** on top of IP using sequence numbers, acknowledgements, and port numbers. UDP - the **U**ser **D**atagram **P**rotocol, doesn't go quite a far.  UDP *only* adds multiplexing (port numbers), and **does not** address reliability.  We will talk a bit more about UDP in the next session, but we don't use it much in web development.

## Transmission Control Protocol
TCP implements what we described above, and it implements it *extremely well*.  TCP isn't really an addon to the IP protocol, it was [developed originally by the same people](https://web.archive.org/web/20160304150203/http://ece.ut.ac.ir/Classpages/F84/PrincipleofNetworkDesign/Papers/CK74.pdf), at the same time.  It was always obvious we needed reliability and multiplexing, it's just that it makes sense to divide the implementation into two protocols to allow for some choice (for example, to use UDP instead for some applications).

TCP is far more complex than what was described above, in that it uses a more sophisticated acknowledgement scheme that can group acknowledgements to reduce congestion.  It also uses algorithms to more efficiently time resends, using a back off algorithm to avoid flooding already congested networks (congested networks are the primary reason packets are dropped, so further flooding is counterproductive).  The technical details of the algorithms used in TCP are very interesting, and you can start [here](https://en.wikipedia.org/wiki/Transmission_Control_Protocol#) to do a deep dive - however they aren't necessary for web development.  Simply understanding the basic conepts of how TCP ensures reliability and multiplexing is sufficient.

The **Internet Protocol** and **Transmission Control Protocol** are core to the internet - it simply wouldn't exist without them.  The two protocols are generally simply referred to as the "TCP/IP" stack.Operating systems expose API's for communicating via TCP/IP via *sockets*.  We now turn our attention to learning how to truly program with them.