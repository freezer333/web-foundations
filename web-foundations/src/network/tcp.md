# Transport Control Protocol (TCP)



## Port Numbers
Port numbers are a simple concept, but are foundational to application programming over networks.  Think about how snail mail is delivered via the postal system.  Imagine a letter, being sent across the country.  It arrives at your house based on the *address* - the street number, town, postal code, etc.  The address relates to the *physical location* where the mail should be delivered.  Layer 3 (the IP Protocol) does a lot of the work here - it identifies physical machines, and routes data traffic through the network so it reaches the right machine.

However, when mail gets delivered to your house, there's another step.  Unless you live alone - you probably need to take a look at the *name* listed on the envelope before you open it.  If you have a roomate, you probably shouldn't open their mail - and vice versa.  Well, network traffic is sort of like this too!  On your computer, right now, you probably have a few applications running that are receiving network data - your web browser, maybe an email client, a game, etc.  As network traffic comes into your computer over the network device, the underlying operating system software needs to know **which application** should see the data.  

Port numbers are just integers, and they are abstract (they don't physically exist).  They serve a similar purpose as the *name* of the person on a mail envelope - they associate network data being transmitted over IP *with a specific stream of data* associated with an application.  Your web browser communicates with web servers over a set of port numbers, while your email client uses a different port number, and your video games use others.  Applications associate themselves with port numbers so the operating system can deliver received data to the right application.

TODO:  Create a more elaborate example