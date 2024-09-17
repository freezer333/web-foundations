# The Nouns of HTTP - URLs and Domain Names
We can't build a hypertext system without a way of *addressing* resources - whether they are text or some other form of media.  We need a *universal* way of identifying said resources on a network.  In the previous chapter, we learned that the Internet Protocol has an addressing scheme for identifying *machines* on the internet. We also learned that TCP adds a concept of a port number, which further identifies a specific connection on a machine.  We learned that when creating a socket, we needed to use both - and we used the format `ip_address:port` - for example, `192.45.62.156:2000`.  

The descripters of IP and TCP get us partially towards identifying a resource on the internet - the IP address can be the way we identify which machine the resource is on, and the port number helps identify how to contact the server application running on that machine that can deliver the resource to us. There are two components that are not described however:

1.  Which protocol should be used to access said resource?
2.  Which resource *on the machine* are we trying to access?

By now, you should know that the protocol we will be dealing with is HTTP.  The protocol is also referred to as the **scheme**, and can be prepended to the address/port as follows:

```
http://192.45.62.156:2000
```
The above it telling us that we are looking to get a resource from the machine at IP address 192.45.62.156, which has a server listening on port 2000, capable of speaking the HTTP protocol.  `http://` isn't the only scheme you may have seen - you've probably noticed `https://` too.  This is a secure form of HTTP which is simply HTTP sent over an *encrypted* socket.  Secure HTTP is still just HTTP, so we won't talk much about it here - we can make HTTP secure simply by creating an encrypted socket - and we will do so in future chapters.

By the way, there are lots of schemes - most of which map to protocols. It's not unheard of to see `ftp://`, `mailto://`, and others.  [Here's a fairly complete list](https://en.wikipedia.org/wiki/List_of_URI_schemes).

As for #2, *which resource*, we borrow the same sort of heirchacly mental model as a file system on our computer. In fact, the first web servers really simply served up documents, stored on the machine's file system.  To refer to a specific file on in a file system, we are fairly used to the concept of a **path**, or file path.  The path `/a/b/c/foo.bar` refers to a file called `foo.bar` found in the `c` directory, which is in the `b` directory, inside the `a` directory, which is found at the root of the file system.  When used to identify an http resource, the "root" is simply the conceptual root of wherever the web server is serving things from.

Therefore, to access a resource under the `intro` directory called `example.html` on the machine with address `192.45.62.156`, by making a request to a server listening on port `2000` speaking `http`, we can use the following **universal resource locator**:

```
http://192.45.62.156:2000/intro/example.html
```
A **U**niversal **R**esource **L**ocator, or **URL** is the standard way to identify a resource on the web.  We'll add additional components to it later, but for now it's just `scheme://address:port/path`.  

The URL `http://192.45.62.156:2000/intro/example.html` might look sort of familiar, but URLs that we normally deal with don't have opaque IP addresses in them, at least typically.  They also don't normally have port numbers.

First off, let's discuss port numbers quickly.  As we discussed in the previous chapter, clients must always know the port number they need to connect to when initiating a connection.  While it's always OK to specify them in a URL, we can also take advantage of **well known** or conventional port numbers.  On the web, http is conventionally always done over port 80, and https (secure http) is done over port 443. I know, this feels random.  [It sort of is](https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers).  Thus, whenever we use *scheme* `http://` and *omit* the port number, it is understood that the resource is available on port 80.  When `https://` is used, 443 is assumed.  

**Pro Tip**&#128161;  Do not, under **any circumstance** get confused... HTTP does not have to use port 80.  It can use any port you want. HTTP is *what* you send over a socket, it doesn't care which port that socket is associated with. In fact, on your own machine, it is unlikely you will easily be able to write a program that creates sockets on ports 80 or 443, because typically the operating system safegaurds them.  As developers, we often run our web software on other ports instead - like 8080, 8000, 3000, or whatever you want.  Typically these port numbers can be used by user programs on a machine, and are firewalled to avoid external (malicous) connections.  **A program that works on port 8080 will work on port 80**, you just need to jump through some security hoops!

So, let's revise our example URL to use port 80
```
http://192.45.62.156:80/intro/example.html
```
This URL is perfectly valid, but since port 80 *is the default* port for HTTP, we could also write the following:

```
http://192.45.62.156/intro/example.html
```

## Domain Name Service 
If URLs required people to remember the IP address of the machines they wanted to connect to, it's fair to assert the WorldWideWeb project wouldn't have become quite so mainstream. Absolutely no one wants to use IP addresses in their day-to-day life.  Rather, we would much prefer to use more human-friendly names for machines.  This brings us to the concept of *domain name*.

Domain names are *sort of* structured names to refer to machines on the internet.  We say *sort of* because a given domain name might not actually correspond to just on machine, and sometimes one machine might be reachable from several domain names.  Conceptually however, it's OK for you to think of a domain name as being a specific machine.  

The phrase "domain name" however is not the same thing as "name".  Otherwise we'd just say "name".  On the web, there exists the concept of a "domain" - which means a *collection* of machines.  A domain is something like `google`.   Domains are registered within a central and globally accessible database, organized by *top level domains*.  Top level domains simply serve to loosely organize the web into different districts - you'll recognize the big ones - `com` for commercial, `edu` for education, `gov` for government domains.

Thus, the `google` domain is registered under the `com` top level domain (TLD) since it is a commercial enterprise.  Combining the two, we get `google.com`.  TLDs are not strictly enforced.  Just because a domain is registered under the `.com` TLD doesn't mean it's "commercial".  Some TLD's are regulated a bit more closely (for example, `.edu` and `.gov`) since those TLDs do indicate some degree of trust that those domains are being run by the appropriate institutions.  There are many, many TLDs - some have been around for a long time (`.org`, `.net`, `.biz`), but within the past decade the number has [exploded](https://en.wikipedia.org/wiki/List_of_Internet_top-level_domains).

**Pro Tip**&#128161;  One thing that you should understand as we discuss domains and top level domains is that the actual concept is pretty low-tech.  Top Level Domains are administered by vendors.  The `.com` TLD was originally administered by the United States Department of Defense.  Responsibilty for administering the `.com` TLD changed over to private companies, including Network Solutions and then to it's present administrator - Verisign.  There are many online vendors that allow you to register your own domain under `.com`, but they ultimately are just middlemen, your domain is registered with Verisign. This is the same for all TLDs - different TLDs are administered by different companies.  These companies maintain enourmous database registries, and these registries are, by definition, publically accessible.

The domain `google.com` doesn't necessarily specify a specific machine - it's a group of machines.  A full domain name can build on the domain/TLD heirarchy and add any number of levels of *sub domains* until a specific machine referenced.  A registrant of a domain is typically responsible for defining it's own listing of subdomains and machines within it's domain - typically through a *name server*.  A name server is really just a machine that can be contacted to *resolve* names within a domain to specific *ip addresses*.

Let's say we are starting a new organization called *acme*.  Acme will be a commercial enterprise, so we register `acme.com` with Verisign.  As a retail customer, we would probably do this domain service provider - there are many, such as Namecheap, DreamHost, GoDaddy, etc.  As a larger company, we may do this directly through Verisign or another larger player closer to the TLD.  At the time the domain is registered, a specific name server will be provided.  For example, if we were to register our `acme.com` site through *Namecheap*, the registration would automatically be assed to Namecheap's name servers (a primary and a backup)

```
dns1.registrar-servers.com
dns2.registrar-servers.com 
```
Note, those machines have already been registered and configured, so they are accessible through the same domain name resolution process as we will discuss in a moment (this will feel a little recursive the first time you read it:)

We would also have the possibility of registering *our own nameservers*, if we had our own IP addresses to use (and were willing to configure and maintain our own nameservers).  Maybe something like this:

```
primary-ns.acme.com
backup-ns.acme.com
```
Unless our new company called "acme" had a really large number of computers, and a lot of network administrators, we probably wouldn't manage our own nameservers - but we could.

A **name server** is the primary point of contact when a machine needs to resolve a more specific subdomain or actual machine name within a domain.  Let's continue with our `acme.com` example, and suppose we had a few machines we wanted to be accessible on the internet:

- `www.acme.com` - the machine that our web server runs on
- `mail.acme.com` - the machine our email system runs on
- `stuff.acme.com` - the machine we put our internal files on

The machine names are *arbitrary*, but you probably noticed that one's named `www`.  It's not a coincidence this is named `www`, because that is what people traditionally have named the machine running their web site - however it doesn't need to be this way.  There is nothing special about `www`.  Incidentally, we can also just have a "default" record on our nameserver that points to a specific machine.  So, we can configure our nameserver such that if someone requests the IP address of `acme.com` they receive the IP address of `www.acme.com`.  This is very typical of course, we rarely ever actually type `www` anymore.

**Pro Tip**&#128161;  In case you are wondering how a nameserver is resolved itself, it's done by contacting nameserver for the *top level domain*.  In this case, Verisign operates a nameserver for `.com`, and it can be queried to obtain the IP address of `registrar-servers`, for example.

We've covered a lot of ground.  To recap, registering a *domain* (ie acme) with a top level domain (ie .com) requires a name server to be listed.  That nameserver has an IP address attached to it, and is publically available.  The nameserver has a list of other machines (ie www, mail, stuff), and their IP addresses.  

Let's recall why we are talking about DNS in the first place.  Ultimately, we want to be able write a URL with a human friendly name - `http://acme.com/intro/example.html` instead of `http://192.45.62.156/intro/example.html`.  Clearly, that URL is probably going to be typed by a user, in the address bar of a web browser.  So, the real question is - if the browser wants to know the IP address of `www.acme.com` how does it go about obtaining this information?

### DNS Resolution
DNS resolution is really just a multi-step query of a giant, global, distributed look up table.  A lookup table that, when flattened, contains a mapping of *every single named machine* to it's associated IP address.  

Let's identify what is happening when we resolve `www.acme.com`.  A web browser *is just a program*, and it's probably written in C or C++.  One of the first things that needs to happen is that the browser code invokes an operating system API call to *query* the DNS system for `www.acme.com`.  The DNS system starts with the operating system, which comes pre-configured (and via updates) with a list of IP addresses it can use to reach TLD nameservers.  In this case, it will query the appropriate TLD nameserver to obtain the IP address of the `acme.com` nameserver (let's assume this was registered at Namecheap, so it's `dns1.registrar-servers.com`).  This "query" is performed (usually) over UDP on port 53, although it is also commonly done over TCP. The *protocol* of the query is literally just the **DNS protocol**.  The protocol is out of scope here, but it's just a set of rules to form structure questions and responses about DNS entries.

Once the operating system receives the IP address of the name server for `acme.com`, it does another query using the same DNS protocl to that machine (dns1.registrar-servers.com), asking it for the IP address for the `www` machine.  Assuming all goes well, the IP address is returned, and passed back to the web browser as the return value of the API call.  The web browser now has the IP address - `192.45.62.156`.  Note, that IP address is imagined, it's not really the IP address of www.acme.com.

Note, the web browser isn't the only program that can do this - any program can.  In fact, there are command line tools available on most systems that can do it.  These programs simply make API calls.  If you are on a machine that has the `ping` command, you can type `ping <server name>` and see the IP address getting resolved.

```
> ping example.com
PING example.com (93.184.215.14): 56 data bytes
64 bytes from 93.184.215.14: icmp_seq=0 ttl=59 time=8.918 ms
```
You may also have a command line program named `whois` on your machine.  You can get name server information using this.  Go ahead and type `whois acme.com`, if you have it installed, you will see the name servers for the *actual* acme.com

To round things out, and to really make sure you understand how DNS resolution is acheived, here's a simple C++ program (written for MacOS) that can resolve a domain name to the associated IP address.  As in the previous chapter, the goal of this code is not that you understand all the details - just that you see that it isn't *magic*, you just make API calls!

```c++
#include <iostream>
#include <cstring>
#include <sys/types.h>
#include <sys/socket.h>
#include <netdb.h>
#include <arpa/inet.h>

void resolve_hostname(const std::string &hostname)
{
    struct addrinfo hints, *res, *p;
    int status;

    memset(&hints, 0, sizeof hints);
    hints.ai_family = AF_UNSPEC;     // AF_UNSPEC means IPv4 or IPv6
    hints.ai_socktype = SOCK_STREAM; // TCP, although isn't really necessary

    // Perform the DNS lookup
    if ((status = getaddrinfo(hostname.c_str(), NULL, &hints, &res)) != 0)
    {
        std::cerr << "getaddrinfo error: " << gai_strerror(status) << std::endl;
        return;
    }

    // The result (res) is a linked list.  There may be several resolutions listed,
    // most commmonly becuase you might have both IPv4 and IPv6 addresses.

    std::cout << "IP addresses for " << hostname << ":" << std::endl;
    for (p = res; p != NULL; p = p->ai_next)
    {
        void *addr;
        std::string ipstr;

        if (p->ai_family == AF_INET)
        { // IPv4
            struct sockaddr_in *ipv4 = (struct sockaddr_in *)p->ai_addr;
            addr = &(ipv4->sin_addr);
            char ip[INET_ADDRSTRLEN];
            inet_ntop(p->ai_family, addr, ip, sizeof ip);
            ipstr = ip;
        }
        else if (p->ai_family == AF_INET6)
        { // IPv6
            struct sockaddr_in6 *ipv6 = (struct sockaddr_in6 *)p->ai_addr;
            addr = &(ipv6->sin6_addr);
            char ip[INET6_ADDRSTRLEN];
            inet_ntop(p->ai_family, addr, ip, sizeof ip);
            ipstr = ip;
        }
        else
        {
            continue;
        }

        // Here's the IP address, in this case we 
        // are just printing it.
        std::cout << "  " << ipstr << std::endl;
    }

    // Free the linked list
    freeaddrinfo(res);
}

int main()
{
    std::string hostname = "www.example.com";
    resolve_hostname(hostname);
    return 0;
}
```
If you compile this on a POSIX compliant machine (Linux, MacOS), you should get the same IP address for example.com that you got when using the `ping` command.

To close out the DNS discussion, what we've really done is made it possible to write URLs using people-friendly names, rather than IP addresses.  Using IP addresses within a URL is perfectly valid, however we normally prefer a domain name when available.

**Pro Tip**&#128161;  There's a lot more to learn about DNS, nameservers, and related technologies like CNAMEs and A records.  We will discuss, much later, some of the basics of getting our web applications live on the web, by registering a domain name, and configuring it such that it is available to the public.  When we do, we'll revisit DNS in more detail.  There's a very detailed tutorial [here](https://www.digitalocean.com/community/tutorials/an-introduction-to-dns-terminology-components-and-concepts) if you are looking to dive deeper right away.


## Noun Summary
URLs are the **nouns** in the HTTP protocol.  They refer to resources - they may be HTML files, but they could be images, audio files, video files, PDF documents, or virtually [anything else](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types).

A URL contains a **scheme**, which indicates the protocol being used.  In our case, the scheme will usually be `http` or `https`.  The URL contains a **domain name**, or IP address, followed by a **port** number, if the port number used is *not* the default port number for the given scheme.  After the port number, a URL can contain a **path** which specifically identifies the resource.

Nouns represent *things*, now we need to look at what we do with URLs - the *verbs* of HTTP.