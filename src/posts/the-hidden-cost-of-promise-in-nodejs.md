---
title: "The hidden cost of Promise In NodeJS"
slug: the-hidden-cost-of-promise-in-nodejs
date: 2025-05-13
description: "I was just watching some videos, you know, YT and chill. < Then Prime mentioned something that caught me off guard. He said sync Promises go behind event loops. I was like, no way, that can't be true."
tags: [node-js, promises, synchronous, asynchronous, async-await, performance]
migratedFrom: https://blogs.whiteloves.in/the-hidden-cost-of-promise-in-nodejs
readingTime: 4
---

I was just watching some videos, you know, YT and chill.  
<https://www.youtube.com/watch?v=i0YfiQlzv6M>  
Then Prime mentioned something that caught me off guard. He said sync Promises go behind event loops. I was like, no way, that can't be true. Promises have to be wrapped in function wrappers to work, and they have built-in syntax. NodeJS wouldn't take shortcuts like that, right? RIGHT?!

```typescript
async function a() {
    console.log('a');
}
console.log('1');
setTimeout(() => console.log('t1')); // this gose to next event loop
a(); // this is sync code, so should not go to event loop
setTimeout(() => console.log('t2'));
console.log('2');
```

Here is the output

```plaintext
1
a
2
t1
t2
```

Yes, I was right.

But hold on, this might just be due to the async syntax. Maybe the Promise constructor works differently. Perhaps `.then` and `await` actually go to the event loop. Let's find out.

```typescript
async function a() {
    console.log('a1');
    const p = new Promise((r) => {
       console.log('p>>>')
       r();
    }).then(() => console.log('p<<<'));
    console.log('a2');
    await p;
    console.log('a3');
}
console.log('1');
setTimeout(() => console.log('t1'));
a();
setTimeout(() => console.log('t2'));
console.log('2');
```

Here is the output

```plaintext
1
a1
p>>>
a2
2
p<<<
a3
t1
t2
```

OMG, he's right! The log `p<<<` should come before `2`, which proves that async returns are pushed to the next event loop tick!  
If you're not sure what this means 😰, it's a big deal.  
Let me show you with an example.

Let's make some empty sync and async functions, and we'll call them a million times.

1. Use a sync function and run it synchronously.
2. Use a sync function and run it asynchronously.
3. Use an async function and run it synchronously.
4. Use an async function and run it asynchronously.
5. Use an async function, run it synchronously, and await all at once.

```javascript
function sf() {}
async function af() {}
function run(fn, next) {
  const start = Date.now();
  function done() {
    console.log(Date.now() - start + "ms");
    if (next) next();
  }
  fn(done);
}
function case1() {
  run((done) => {
    for (let index = 0; index < 1000_000; index++) {
      sf();
    }
    done();
  }, case2);
}
function case2() {
  run(async (done) => {
    for (let index = 0; index < 1000_000; index++) {
      await sf();
    }
    done();
  }, case3);
}
function case3() {
  run((done) => {
    for (let index = 0; index < 1000_000; index++) {
      af();
    }
    done();
  }, case4);
}
function case4() {
  run(async (done) => {
    for (let index = 0; index < 1000_000; index++) {
      await af();
    }
    done();
  }, case5);
}
function case5() {
  run(async (done) => {
    const promises = [];
    for (let index = 0; index < 1000_000; index++) {
      promises.push(af());
    }
    await Promise.all(promises);
    done();
  });
}
case1();
```

|  | sync func & sync exe | sync func & async exe | async func & sync exe | async func & async exe | async func & await all exe |
| --- | --- | --- | --- | --- | --- |
| Crome Browser | 3ms | 1500ms | 33ms | 1559ms | — |
| NodeJS | 2ms | 51ms | 7ms | 46ms | 171ms |
| Deno | 1ms | 49ms | 7ms | 42ms | 183ms |
| Bun | 2ms | 73ms | 19ms | 74ms | 130ms |
| Crome Browser Fresh Start | 3ms | 1289ms | 33ms | 1477ms | 388ms |

## 😱😱 OH NO 😱😱

None of these runtimes have fixed this, and the browser is the slowest of them all, probably because I have way too many tabs open (Nope).

Let's try doing something inside our empty functions, just in case these runtimes have a little optimization for empty functions.

```javascript
let cnt = 0;
function sf() {
  cnt++;
}
async function af() {
  cnt++;
}
function run(fn, next) {
  const start = Date.now();
  function done() {
    cnt = 0;
    console.log(Date.now() - start + "ms");
    if (next) next();
  }
  fn(done);
}
```

|  | sync func & sync exe | sync func & async exe | async func & sync exe | async func & async exe | async func & await all exe |
| --- | --- | --- | --- | --- | --- |
| Crome Browser Fresh Start | 3ms | 1307ms | 32ms | 1493ms | 396ms |
| NodeJS | 10ms | 50ms | 8ms | 46ms | 170ms |
| Deno | 5ms | 51ms | 7ms | 44ms | 181ms |
| Bun | 4ms | 68ms | 20ms | 76ms | 131ms |

## DAMN

I really did not know cost of this, Now I know.

Now I get why folks using Rust and GoLang say async is tough when I thought it was easy. Sure, it's easy, but at what cost? If you want to build high-performance software, you really have to lean on sync callbacks. Async will just slow your code down by 10 times, and for what? Literally doing nothing. It's wild. Node JS is super popular, and yet this is where we're at!

## Damn!!

I’m not sure what to do next, but I guess I’ll need to dig deeper to figure out the best approach. Running any sync code in async is clearly a big bottleneck. Maybe I’ll revamp my libraries and framework to fully support sync callbacks, and who knows, I might even rewrite the backend from scratch to make the most out of callbacks.
