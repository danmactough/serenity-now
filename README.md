# serenity-now
Please handle your Promises' errors

SlideShare - http://mact.me/7j

## Overview

I'm going to demonstrate a problem with the way [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) and [Domains](https://nodejs.org/dist/latest-v6.x/docs/api/domain.html) interact in Node.js.

- A Promise is an object representing the eventual completion or failure of an asynchronous operation.
- A Domain is a way to route errors and uncaught exceptions across multiple asynchronous operations to a single context. This allows you handle the error or exception without losing the context.

## Should I even care about Domains?

Domains are deprecated. However, the replacement API has not been finalized. So if we want to take advantage of the features that Domains provide, we have no choice but to keep using them.

One popular web framework, Restify, has [support for Domains built-in](https://github.com/restify/node-restify/blob/v4.3.0/lib/server.js#L960-L971). Until very recently, this built-in support was inescapable. Although the latest versions of Restify v4 (v4.3.x) is allows you to opt-out, and as of v5, Domain support is actually opt-in, having no replacement for Domains means (in my opinion) that you should continue using Domains for the time being.

## What's the problem?

You're probably using Promises. And people have been having [problems](https://github.com/nodejs/node-v0.x-archive/issues/8648) with [Promises](https://github.com/nodejs/help/issues/555) and [Domains](https://github.com/nodejs/node/issues/10724) in Node.js for a long time.

### Part 1 - unhandled Promise rejection

Problem: [unhandled Promise rejection](https://nodejs.org/api/process.html#process_event_unhandledrejection) will hang your web app.

#### Node 4

- `UnhandledPromiseRejectionWarning` **is not logged**
- server will hang

#### Node 6

- `UnhandledPromiseRejectionWarning` **is logged**
- server will hang

#### Node 8

- `UnhandledPromiseRejectionWarning` **is logged**
- additional `DeprecationWarning` **is logged** warning that in the future, Promise rejections that are not handled will terminate the Node.js process with a non-zero exit code
- server will hang

### Part 2 - Ok. Let's handle rejection.

#### Use .catch()

Problem: Your app will still hang.

Confused?

- https://github.com/restify/node-restify/blob/4.x/lib/server.js#L910-L912

#### Ah. My bad. Use the error callback.

Problem: We have succeeded in not swallowing errors, but we're still not handling all the rejections. See Part 1.

### Part 3 - Riiiiight. Let's handle the unhandled rejections. 🌀

Progress, but...

Problem: We have lost the Domain (and therefore the request and response). So, we can crash, but we cannot respond with a 500 error.

### Part 4 - Bluebird to the rescue!

Success!

But, why?!

Native Promises and bluebird Promises are implemented differently.

- Domains work as expected with bluebird Promises, which are userland code. But with native Promises, the active Domain has exited before the Promise rejection occurs.
- https://github.com/nodejs/node-v0.x-archive/issues/8648#issuecomment-61343313

But `throw`?!

Restify's `uncaughtException` handler will catch the exception because it handles Domain errors.

### Part 5 - Be more explicit.

Explicitly use the Domain the rejected Promise is connected to.

### Part 6 - It's fixed in Node 8! 🎉

Native Promises and bluebird Promises interact with Domains the same way.

## Coda

http://thecodebarbarian.com/unhandled-promise-rejections-in-node.js.html
