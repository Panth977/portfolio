---
title: "await on a sync function: 2 ms to 51 ms for 1M calls in Node.js"
slug: the-hidden-cost-of-promise-in-nodejs
date: 2025-05-13
updated: 2026-10-01
description: "A million calls to an empty sync function take 2 ms in Node.js. Put await in front of it and the same loop takes 51 ms; in Chrome, 3 ms becomes 1,500 ms. The benchmark, the numbers for Node, Deno, Bun and Chrome, and why."
tags: [node-js, promises, synchronous, asynchronous, async-await, performance]
migratedFrom: https://blogs.whiteloves.in/the-hidden-cost-of-promise-in-nodejs
readingTime: 4
cover: /assets/blog/covers/the-hidden-cost-of-promise-in-nodejs-2026.png
ship: 2026-10-01
devto_tags: [javascript, node, performance, async]
devto_url: https://dev.to/panthpatel/await-on-a-sync-function-2-ms-to-51-ms-for-1m-calls-in-nodejs-371p
devto_id: 4782682
---

```plaintext
1,000,000 calls to an empty sync function     2 ms
the same calls with await in front           51 ms
```

That is Node.js. In Chrome the same loop went from 3 ms to 1,500 ms. The function does nothing and is not async; the whole difference is the `await`.

I'm Panth, and I lead the software team at Oizom. I measured this in May 2025, after Prime said in [a video](https://www.youtube.com/watch?v=i0YfiQlzv6M) that even sync code behind a Promise waits for the event loop. I didn't believe it, so I tested it.

## An async function starts synchronously

My first guess was that an async function with nothing to wait for would just run inline.

```typescript
async function a() {
    console.log('a');
}
console.log('1');
setTimeout(() => console.log('t1')); // runs later, after the current code
a(); // sync body, so it should run right here
setTimeout(() => console.log('t2'));
console.log('2');
```

```plaintext
1
a
2
t1
t2
```

It does. `a` prints between `1` and `2`.

## `.then` and `await` do not

That could just be the `async` keyword, so the next test used a Promise constructor, `.then` and `await`.

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

The Promise body runs at once (`p>>>`), but the `.then` callback and everything after `await` wait until the current synchronous code has finished: `p<<<` and `a3` print after `2`. They still run before the timers (`t1`, `t2`). The Promise resolved immediately and the work was still deferred.

## Measuring what the deferral costs

Five ways to call an empty function a million times:

1. a sync function, called directly
2. a sync function, called with `await`
3. an async function, called without `await`
4. an async function, called with `await`
5. an async function, called without `await`, then `await Promise.all` on all the results

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

|  | 1. sync fn, direct | 2. sync fn, await | 3. async fn, no await | 4. async fn, await | 5. async fn, Promise.all |
| --- | --- | --- | --- | --- | --- |
| Chrome | 3ms | 1500ms | 33ms | 1559ms | — |
| Chrome, fresh start | 3ms | 1289ms | 33ms | 1477ms | 388ms |
| Node.js | 2ms | 51ms | 7ms | 46ms | 171ms |
| Deno | 1ms | 49ms | 7ms | 42ms | 183ms |
| Bun | 2ms | 73ms | 19ms | 74ms | 130ms |

Every runtime pays for the `await`, and Chrome pays the most. A fresh Chrome start did not change that, so it was not my open tabs.

## With a body in the function

Runtimes might special-case empty functions, so the second run gave both functions one line of work, `cnt++`, and reset the counter after each case:

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

|  | 1. sync fn, direct | 2. sync fn, await | 3. async fn, no await | 4. async fn, await | 5. async fn, Promise.all |
| --- | --- | --- | --- | --- | --- |
| Chrome, fresh start | 3ms | 1307ms | 32ms | 1493ms | 396ms |
| Node.js | 10ms | 50ms | 8ms | 46ms | 170ms |
| Deno | 5ms | 51ms | 7ms | 44ms | 181ms |
| Bun | 4ms | 68ms | 20ms | 76ms | 131ms |

Same picture. The cost is the `await`, not the empty body.

## What I took from it

I didn't know the cost of this before I measured it. It also explained why people who write Rust and Go say async is hard, when it had always looked easy to me in JavaScript. It is easy to write, and it has a price: in these runs, putting `await` in front of code with nothing to wait for made the loop at least 5x slower in every runtime, and several hundred times slower in Chrome.

For high-performance code, that pushed me towards sync callbacks on hot paths. I am thinking about changing my libraries and framework to support sync callbacks fully, and maybe rewriting the backend from scratch to use them.

Where has an `await` on something that was already there cost you time?
