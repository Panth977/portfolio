---
title: "😰 How is Backend (js)"
slug: how-is-backend-js
date: 2024-12-01
description: "Node.js is probably your backend, and JavaScript gives you far more rope than most people use. A tour of the features that matter on the server, and the ones that quietly hurt."
tags: [javascript, typescript]
migratedFrom: https://blogs.whiteloves.in/how-is-backend-js
readingTime: 5
cover: /assets/blog/covers/how-is-backend-js.png
---

Unless you're a decades-old company or a big firm, you're probably using Node.js as your backend! It's unfortunate that people talk so much about various frontend JavaScript frameworks that they forget to mention the vast array of features available. 😰

Who in their right mind would think that `console.log({} > [])` yields `true`? It's absurd because JavaScript decides to convert the object into a string before comparing. And that's why `console.log({} > ['x'])` results in `false`. This kind of behavior is baffling and highlights the quirks of JavaScript.

The concept of the `prototype` and the `this` keyword can be absolutely mind-blowing 🤯! Imagine being able to change how an existing class method works (super handy when you don't have lifecycle hooks) or eliminating the need to create new extended classes. JavaScript is packed with powerful features for developers to explore, but only if you have the right knowledge 💪. Instead, you often see people relying on 💉 AI. AI isn't bad, but without a solid grasp of your concepts, AI can be like muscles made of oil—yikes!

```javascript
class SomeClassFromLib {
    someMethod(...args) {
        return someVal;
    }
}
// this lib should have given you event for when property1 is called,
// but seems like [prototype] can fix this.
const original_someMethod = SomeClassFromLib.prototype.someMethod;
SomeClassFromLib.prototype.someMethod = function (...args) {
    console.log('someMethod was called.');
    return original_someMethod(...args);
}
// and now any instance of [SomeClassFromLib] class will use 
// this newly provided function.
```

You have `eval`, which is super powerful. You can do all sorts of cool stuff without needing to create a compiler. How about creating a context, passing it to all the function calls, collecting all the console logs in that context, and maybe storing them somewhere?

```javascript
// all the functions exported from all the files.
const myFunc = {
  add: function (context, { a, b }) {
    const calc = a + b;
    console.log(calc);
    return calc;
  },
  diff: function (context, { a, b }) {
    const calc = Math.abs(a - b);
    console.log(calc);
    return calc;
  },
  calcAll: function (context, input) {
    return {
      add: myFunc.add(context, input),
      diff: myFunc.diff(context, input),
    };
  },
};
// wrap all the functions to magical functions that make sure
// every thing is [console.log] invokes [context.log]
for (const key in myFunc) {
  myFunc[key] = eval(`(function (context) {
    const originalConsole = console;
    $: {
      const console = {...originalConsole, log: (...args) => context.log(...args)}
      const func = ${myFunc[key].toString()};
      return func(...arguments);
    }
  })`)
}

const context = {
  logs: [],
  log(...args) {
    this.logs.push({ ts: Date.now(), log: JSON.stringify(args) });
  }
}
myFunc.add(context, {a: 2, b: 3})
myFunc.diff(context, {a: 2, b: 3})
myFunc.calcAll(context, {a: 5, b: 10})
console.log(context.logs);
/* Console */
[
  { ts: ..., log: '[5]' },
  { ts: ..., log: '[1]' },
  { ts: ..., log: '[15]' },
  { ts: ..., log: '[5]' }
]
```

Until I figure out a way to pass down context without code, you might need a compiler 😜. (Of course, you're now stuck with Error.stack or any outside references made.)

Then there's the event loop! You can totally use this to make space for other sync programs to run. How useful is that?! 🎉 This technique can help you share your main thread with other tasks throughout your app.

```javascript
function syncLoop(x) {
    let s = 0;
    for (let i = 1; i <= x; i++) {
        s += i;
    }
    console.log(s);
    return s;
}
syncLoop(1_000_000_000); // 1st
syncLoop(100); // 2ed

async function asyncLoop(x) {
  let s = 0;
  while (x > 0) {
    if (x < 10_000) {
      for (; x > 0; x--) {
        s += x;
      }
    } else {
      const n = x - 10_000;
      for (; x > n; x--) {
        s += x;
      }
      await new Promise((res) => res());
    }
  }
  console.log(s);
  return s;
}
asyncLoop(1_000_000_000); // 5th
asyncLoop(600); // 1st
asyncLoop(9_999); // 2ed
asyncLoop(10_001); // 4th
asyncLoop(200); // 3rd
asyncLoop(1_000_000_000); // 6th
```

But there's an obvious downside to offering so many features. There's no "one way to code," and the human mind is creative, so it will find every possible way to use all these features in their scrap yard projects. When the beginners or interns continue working on the project, you end up discovering world-class misuse of features and classic coding pattern errors. This flexibility sometimes leads to such chaos.

Callback hell, indeed. JavaScript supports `async/await` syntax, yet for some inexplicable reason, and than they use `.then/.catch/callbacks` and keeps writing code in the callback function body. Why? Nothing good can come from this! And what's with all the `.catch` or `try/catch` everywhere? Seriously, unless you're actually handling the response, stop catching everything—it's not mandatory. And naturally, instead of using the `async function` syntax, they opt for `new Promise(...)` syntax, as if that simplifies anything.

```javascript
function badImplementation() {
    return new Promise((resolve, reject) => {
        someOldLibWithCb((data, err) => {
            if (err) {
                reject(err);
                return;
            }
            myDbCall(data).then((result) => {
                const output = processResult(result);
                resolve(output);
            }).catch(reject);
        });
    });
}
// OR
async function goodImplementation() {
    // Convert any old cb syntax to promise using [new Promise]
    const data = await new Promise((resolve, reject) => {
        try { // put a try/catch just to be extra safe.
            someOldLibWithCb((data, err) => {
                if (err) reject(err);
                else resolve(data);
            });
        } catch (err) {
            reject(err);
        }
    });
    // keep awaiting, and don't catching unless you have a reason to.
    const result = await myDbCall(data);
    const output = processResult(result);
    return output;
}
```

We can chat all day about clean code and whether it's better or not, but honestly, I think it's kind of pointless. This isn't about clean code; it's about Clear Code. To achieve that, you need to decide how your code should look and which features are most important. Otherwise, we're no better than the next desk intern! 😰

---

In my future blogs, I will share a JS design system I have created, specifically for the backend! This system can greatly enhance your debugging and coding time, while ensuring your code is type-safe and free from runtime type errors. Let's build a community focused on code design! We'll make JS code design so great that AI will be all over it!
