# Encryption - HTTPS and TLS
Sending secrets if a problem, in the physical world and the cyber world.  It's a big topic, and can get fairly complex.  In this section, we are going to cover what you need to know to understand *what* secure web traffic is, and how it *generally* works - but we won't get too bogged down in the algorithmic detail.

First, a few definitions that will help us going forward:

- **Encryption** is a *reversible* transformation of (plain)text, into some obfuscated byproduct - typically called the *cyphertext*.  The goal of encryption is to create a *cyphertext* that you can feel comfortable sharing - to anyone - and that they will not be able to determine what the *plaintext* is.  The *reversible* part is important though, it must be *possible* for *someone* to reverse the process and obtain the plaintext back from the cyphertext.  This is generally done by knowing some other bit of information.

Let's take the example from HTTP Basic authentication.  The browser *encrypts* the `username:password` (i.e. the `guess:who` string) into a *cyphertext* of `Z3Vlc3M6d2hv`.  That cyphertext seems incomprehensible, unless you are *in the know*.  We are *in the know*, though.  We know that HTTP Basic Authentication uses *Base64* encoding.  Since we know that, we can decode the message.  If we didn't know that - we'd have a hard time!

Encryption is only as secure as the information you need to *decrypt* the cyphertext.  Since *everyone* knows HTTP Basic Authentication uses Base 64 encoding, the encryption is *useless*.

There are, however, several encryption schemes that *are secure*.  They rely on exchanging *keys* between parties, that allow for receivers to decrypt information.  The exchange occurs in a way that is resistent to the obvious challenge of exchanging the keys in a secure way in the first place!  We'll get back to this in a moment.

- **Hashing** is fundamentally different than encryption, although occasionally the two phrases are used interchangeably.  *Hashing* is specifically **not** reversable (or, shouldn't be easily reversable).  Hashing is going to come up soon, when we talk about how passwords are stored server-side, but for now keep clearly in mind that hashing is **not** encryption.  

## Secure HTTP - Encryption
HTTP request and response messages are inherently *plaintext*.  They really need to be, web browsers and web servers, running on different operating systems, CPUs, and networks all have to interoperate - and plain ASCII text is a standard way of doing so.  It's also convenient that HTTP is human readable too.

**Pro Tip**&#128161; Modern versions of HTTP actually use binary protocols instead of ASCII text to increase efficiency, and deal with all the issues of interoperatbility, but suffice to say, those binary messages are not secure either (they just require an extra step to turn back into human-readable HTTP messages).

Lot's of things get passed within HTTP traffic that we should be wary of allowing others to see.  Imagine that you had the ability to capture network traffic between someone's laptop and a web server - `http://insecure.com`.  What would you be able to see?

1.  You'd be able to see the IP address the laptop is connecting to (the IP address of insecure.com).  This would be obtainable straight from the underlying network packet itself (TCP/IP), not from the HTTP message content.
2.  You'd be able to see the HTTP headers being sent back and forth - *which includes cookies (session id), authentication/authorization*.  This is a big deal, since if you have someone's session id, for example, you could use it to generate HTTP requests from your own machine and you'd be able to do everything the user could do, without ever having to log in at all!
3.  You'd be able to see all the HTML content being exchanged.  This includes **all form data submitted** - which could be the user's username and password, or any other sensitive information they enter.  This also includes all (potentially) sensitive data included in the pages being rendered by the browser.  

Issues #2 and #3 are what we are going to solve with TLS and HTTPs.  Once enabled, Issues #2 and #3 *do not exist*, all HTTP headers and content will be rendered secure.

**Pro Tip**&#128161; "Secure" is a relative term.  To date, we know of no method of breaking TLS/HTTPs when implemented correctly.  That's not to say it always is.  There have been [bugs](https://heartbleed.com/) discovered in industry standard HTTP implmentations.  There will also possibly come a time where *quantum computing* renders TLS useless - and it's questionable whether we will know (immediately) when that happens.  For the rest of this chapter, we will talk about HTTP/TLS being *secure*, and we mean *as secure as possible*.  It's the gold standard.  The web wouldn't work without it.  If it fails, we're in for a bad time.

Issue #1 is fundamentally different than #2 and #3.  Issue #1 is a concern of *privacy* - while you are not able to see what a person is doing on a particular web site, you are able to know that they are interacting with the site based on the IP address.  This could be a security issue unto itself - consider a user locoated in a part of the world where interacting with external (international) web sites was illegal.  

To solve the issues of #2 and #3 we need to *encrypt* HTTP requests and response.  Note, we need *encryption* not hashing.  The process must be reversable, since both the client and the server must be able to obtain the plaintext.  We want the following situation:

1.  Browser encrypts request
2.  Server decrypts the request, processes the request, generates plaintext response
3.  Server encrypts the response
4.  Browser decrypts the response (renders html)

If this is done effectively, only *encrypted* messages travel across the internet.  Someone can still capture that traffic, but they cannot know what the data is unless the break the encryption.

### The Encryption
We know that the encrypted cyphertext is only as secure as the encryption *key* - the information one needs to know to *decrypt* the cyphertext.  Clearly this can't be Base64 encryption.  The encryption mechanism needs to exhibit the following qualities:

1. The encryption and decryption key must be *unique* for each pair of sender/receivers.  
2. The keys needed to *decrypt* messages must not travel across the open internet (see below on symmetric vs asymetric encryption)
3. Stangers need to be able to use the encryption scheme on the internet.  It's not feasible to send decryption keys in the mail, or physically deliver them - we want to be able to visit new websites whenever we want!
4. The cyphertext must be obfuscated to the extent that it is infeasible to obtain the plaintext without having the decryption key in your possession.  This means, the decrption key should be unguessable and the plain text should be unrecoverable by guesswork.  Keep in mind that when we say *guesswork*, we mean millions of dollars worth of computational resources aimed at randomly guessing keys.  We need decryption keys that are *computationally expensive to guess and try**, to the extent in which it's not possible for well funded criminals or hostile state actors to *brute force* guess their way into decrypting traffic.

Requirement 1, 2, and 3 bring us to the discussion of *symmetric* vs *asymetric* encryption.

- *Symmetric* encryption uses the *same* key to encrypt a message as it does to decrypt it.  For example, we could *encrypt* an ASCII message by taking each ascii character (and integer) and adding 13 to it.  The encryption key is 13.  To decrypt it, we subtract 13.  Clearly this doesn't meet requirement #4, but technically, if you didn't know the key (it could literally be any number), it would be tough for a casual observer to crack the message.  
- *Asymetric* encryption uses *different* keys to encrypt a message and decrypt it.  This might be difficult to conceptualize, because examples are not as mathematically obvious.  A good way of thinking about this is delivering physical mail (to a post office box).  Post office boxes have addresses and numbers - P.O. Box 3154145.  If P.O. Box #3154145 is my post office box, you'd need to know that in order to send me mail.  That's the *encryption* key in this scenario - it's a bit of information that you need to know, in order to send something to me.  It's not hard to find out, and it's not really a secret - but it's critical, each PO Box number refers to a different physical PO box.  PO boxes (if you go to a Post office, take a look!) have slots for mail to enter, but you can't get the mail out.  You need a key (physical key) to open another door, to get the mail out.  I have the key to my PO box, and can retrieve your message.  No one else has this key.  I can tell the entire world my *public key* - the fact that my PO box is number 3154145, and still, no one can read my mail.  Only I can read my mail, because I don't give anyone my *private key*.  This is how asymetric encryptions works, and it's often referred to as *public/private key encryption*.

Requirement #1 requires key exchange, since every communiation pair requires different keys.  Requirements #2 and #3 points us to *public/private* key encryption, and *not* symmetric encryption.  In this scheme, when I want to communicate with `https://secure.com`, I can ask secure.com to send me it's *public* key.  I can use the public key to encrypt messages before sending it to secure.com.  If someone captures that network traffic, they can't read it (assuming we've satisfied requirement #4 above). When the message is received by the secure.com server, it can use it's *private* key to decrypt my message.  Likewise, I can send secure.com *my* public key, and secure.com can use it to encrypt responses that are coming back to me.  I can decrypt those responses with *my* private key.  Note, secure.com's private key isn't the same as my private key, and secure.com's public key isn't the same as my public key.  secure.com has the same public and private key for communication between you, me, and our friends - but all of use have our own public and private key.  Thus, the *pair* is unique for each pair of communicators.

This is the foundation of HTTPs.  When you interact with a web site that is operating under HTTPs, the general workflow is as follows:

1.  Your web browser generates a public and private key.  It initiates a network connection with the web server, and requests to exchange keys.
2.  The web server will send the your web browser it's public key, and your web browser will send the web server your public key.  **This is called the HTTPS/TLS *handshake* -it happens before any HTTP traffic occurs**.
3.  From that moment forward, all HTTP requests coming from your browser are encoded with the *server's* public key before leaving your machine.  When the cyphertext arrives at the server, it is decoded with the server's private key.
4.  All responses from the server are encoded with *your* public key before leaving the server.  When the cypher text arrives at your machine, the browser decodes it with your private key, and the HTTP response is handled as if nothing was ever encrypted.

This architecture provides *secure HTTP* - known as HTTPS, by delivering *T*ransport *L*ayer *S*ecurity - **TLS**.

Hopefully the *concept* is starting to become clear.  You may be wondering, what are these public and private keys, and how are they satisfying requirement #4?  What makes them so hard to computationally guess and defeat?  What are the actual algorithms!  

There are several algorithms used for the generation and exchange of public and private keys along with cyphertext production.  These include [Diffie-Hellman](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange), [Ellipic Cuve Diffie-Hellman](https://en.wikipedia.org/wiki/Elliptic-curve_Diffie%E2%80%93Hellman), and [RSA](https://en.wikipedia.org/wiki/RSA_(cryptosystem)).  Each has varying parameters, and deciding which to use is in fact part of the HTTP/TLS *handshake* between two machines beginning their communciation.  You can learn more about the mathematics and other details through other resources (see below). 

- [Wikipedia](https://en.wikipedia.org/wiki/HTTPS)
- [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/Security/Transport_Layer_Security)
- [Khan Academy](https://www.google.com/url?q=https://www.khanacademy.org/computing/computer-science/cryptography/modern-crypt/v/the-fundamental-theorem-of-arithmetic-1&sa=D&source=editors&ust=1731686238857828&usg=AOvVaw01I3TXPHhhy8jupBawaPOe)

**A key to all this is that these algorithms ARE NOT SECRET**.  The algorithms used to implement HTTPs / TLS are public domain.  Encryption schems that rely on keeping the *algorithm* a secret are always doomed to failure - it's been proven time and time again.  The algorithms we used to secure computer systems are always publically known - what makes them secure are the *keys* that are used.  The idea is that if we handed someone the *cyphertext*, the *algorithm use to create the cyphertext*, the *algorithm used to decrypt the cyphertext*, and hundreds of years worth of CPU power, that entity would *still* be unable to decrypt the cyphertext with out the decryption key.  The algorithms above provide that level of protection.

### But who are we talking to?
There is one problem that is subtle, but ever present in the description above.  If you trust that the algorithms used in TLS are secure, that doesn't necessarily mean you are safe.  Let's re-examine the scenario.  I want to communicate with `https://secure.com`.  My machine makes a DNS request, and learns that secure.com has an IP address of 158.23.133.11.  My machine then initiates the HTTPs/TLS handshake, sending it's public key, and receiving the public key from 158.23.133.11.  What could possibly go wrong?

What if someone intercepted our original DNS request?  What if `https://secure.com` really is IP address 165.113.92.77 - but the criminal sitting next to me at the coffee shop crafted a response telling my computer to contact 158.23.133.11 instead.  What if 158.23.133.11 is the attacker?  The attacker machine joyfully sends it's public encryption key, and receives mine.  I blissfully begin to send my secrets to 158.23.133.11 since I think it's secure.com.  My messages are decrypted by the attacker, **because I encrypted them with the attackers public key!**.

This example highlights an important limitation of encryption.  If you aren't talking to who you think you are talking to, it doesn't matter if you are talking securely or not!

This is a problem of *authenticity*.  In addition to making our communication secure, we need a way to make sure we trust that we are talking to the machine we want to talk to.  For this, we must rely on a *third party*.

In order to support HTTPS/TLS web servers must obtain a *certificate* from another organization - called a Certificate Authority (CA).  While in many cases these organizations may charge a fee, there are also free services that can provide these - [certbot](https://certbot.eff.org/) and [Cloudflare](https://www.cloudflare.com/application-services/products/ssl/) are popular choices.  Certificates contains the public encryption key, along with additional *cryptographic* information establishing the server domain name, owner, and other identifying information. Crucially, the data within the certificate can be *verified* by making a request to the CA over the network.  The CA will respond affirmatively if the public encryption key in the certificate matches the server domain name on record, and if the certificate has not expired or been revoked.

Let's summarize the value of this:
1. To communicate with a server, the browser will encrypt messages with the server's public key.  **Only** the server's private key can decrypt this data.
1. The browser obtains the server's public key **from the certificate** it receives from the server (it's part of the certificate).  
2. The certificate is verifiable, through a CA.  Therefore, if the public key in the certificate does not match the CA's public key on record, then certificate is not acceptable.  If the certificate is not on record at all, expired, or revoked - then the certificate is not acceptable either.

The server's certificate is always publically available.  If I was an attacker, I could obtain the server's certificate.  It would have the server's public encryption key.  If I managed to fool your computer into thinking my computer was `secure.com`, and you got a certificate from me, you'd verify it with a CA.  If I didn't tamper with it, it would be valid.  You'd encrypt messages with it, and send them to me.  **I couldn't decrypt them**, because I don't have *server's* private key.  If I do tamper with the certificate, overwiting the public key with my own (which will work with my private key), then the CA will tell you the certificate is invalid, and you won't communicate with me at all.

Read that paragaph again if you are still wondering how this all works.  It takes a few reads.  The bottom line - there's only one way an attacker can truly fool a client into communicating securely - and it's if the attacker **obtains the server's private key**.  

**Pro Tip**&#128161; As with most things in life, the level of success is secured by the weakest link.  If a server leaks it's *private* key, then all bets are off.  Private keys are held in files on web servers.  If an attacker can access the machine, it's likely they can obtain them.  If the attacker is an employee, it's even more likely they have access to the machine.  Typically, there will be multiple layers of security to avoid leakage - but ultimately this is were HTTPs can be exploited.  

### HTTPS - Encryption and Authority
Ultimately, when your browser displays the little lock 🔒, it means two things:

1. The web browser has received the HTTP certificate from the server and has *verified* it with a trusted Certificate Authority.
2. The browser and server have exchanged public/private encryption keys, and the traffic between your machine and the server is now secure.

We will save how to work with and deploy HTTPs for a later chapter on deployment.  For now, understand a that HTTPs happens *at the network level*, and usually isn't happening within your web server's application code.  Therefore, nothing we are doing server side (or client side) changes *in any way* once we enable HTTPs.  

**For the purposes of the rest of this chapter, we will assume HTTPs is enabled.**


