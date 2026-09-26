---
title: "How to Implement Type Safe Functions in JavaScript"
slug: how-to-implement-type-safe-functions-in-javascript
date: 2024-12-08
description: "Ever run into the issue where you can't make type-safe functions in JavaScript? So you switch to TypeScript, only to find out that types are just for development and don't actually validate function inputs or outputs! Then you end up using a validati..."
tags: [dispose, functional-programming, javascript, typescript, wrapper-functions, context]
migratedFrom: https://blogs.whiteloves.in/how-to-implement-type-safe-functions-in-javascript
readingTime: 7
---

Ever run into the issue where you can't make type-safe functions in JavaScript? So you switch to TypeScript, only to find out that types are just for development and don't actually validate function inputs or outputs! Then you end up using a validation library like Zod to solve it.

Now, if you want to add a caching layer to a `function` without messing with its code, you'll need to use higher-order functions.

What about adding static variables to a `function` and keeping them out of the global scope? Kind of like using the `static` keyword in a `class`.

And what if we could pass a context through the function call tree? We could group all this `context.log` stuff and maybe add `context.dispose` callbacks that get triggered when the original context source decides to dispose of them! This context could also have a shared state, either local to the function or global to the call tree.

Sounds awesome, right? Let's check out how <https://jsr.io/@panth977/functions> can help us!

### Function Design

- We've kept it simple with a single argument, so all arguments are named.
- Use `name` and `namespace` for a great debugging experience! You can also define them later in the code.
- Define your `input` and `output` types using Zod! If you're using generators, also define `yield` and `next` schemas.
- Create your own context-builder and pass it as `buildContext`, or just use our default one!
- `wrappers` are local middleware. You can create higher-order functions and pass them as wrappers, which looks much clearer than the traditional approach!
- Finally, we've got `func` for your implementation! You have access to `context`, `input`, and `build`, which makes your implementation super powerful and clear!
- Add extra properties! It's up to you how you want them, and you can access these properties from `build`, just like using `static` in a `class`.

```typescript
const getUser = FUNCTIONS.AsyncFunction.build({
    namespace: 'PgQuery', // optional
    name: 'getUser', // optional
    input: z.object({ userId: z.number().int().gt(0) }),
    output: z.object({ name: z.string(), ... }).optional(),
    static: { // add static variables
        db: new Pg.Pool(...),
    }
    buildContext: YourCustomContextBuilder, // optional
    wrappers: (_params) => [FUNCTIONS.WRAPPERS.SafeParse({ _params })], // optional
    async func({ context, input, build }) {
        context.log('getting user', input.userId);
        const result = await build.db.query(`SELECT * FROM users WHERE id = ? LIMIT 1`, [input.userId]);
        const user = result.rows[0];        
        if (!user) return undefined;
        context.log('found user', user.name);
        return user;
    }
});
...
getUser.setNamespace('PgQuery');
getUser.setName('getUser');
getUser.getRef(); // 'PgQuery.getUser'
...
const user = await getUser({ context, input: { userId } });
...
```

### Context

What you pass as `context` in `build` then goes to the `buildContext` function, which creates a new `context`. The `context` is identified by its `id`, but you can have multiple `contexts` with the same `id`. I recommend creating one context with a unique ID for each task and passing that context to all other calls!

```typescript
await FUNCTIONS.DefaultContext.Builder.forTask('myId', function (context, done) {
    // use parent context as refrence
    const context1 = FUNCTIONS.DefaultContext.Builder.fromParent(context, 'ref1');
    const context2 = FUNCTIONS.DefaultContext.Builder.fromParent(context, 'ref2');
    console.log(context.id) // 'myId'
    console.log(context.id === context2.id) // true
    console.log(context === context2) // false 
    console.log(context.path) // []
    console.log(context2.path) // ['ref1', 'ref2']
    done();
}); // create a new context
```

### `context.log`

`console.log` is cool, but you can't really tell which thread or task made the log! So, we came up with `context.log`.

```typescript
FUNCTIONS.DefaultContext.Builder.forTask('myId', function (context, done) {
    // get logs immediately on FUNCTIONS.DefaultContext.onLog
    context.log('Hi', 'World');
    done();
});
```

These logs don't show up in the console by default, so you might need to add a logger.

```typescript
FUNCTIONS.DefaultContext.onLog(function (context, args) {
    console.log(context.id, ...args);
});
// CONSOLE:
(0 sec) myId Hi World
```

### `context.dispose`

If you need to do some cleanup but don't want to slow down the main task, just add a callback to the `dispose` function. Whoever created the `context` in the first place should also handle disposing of it!

```typescript
await FUNCTIONS.DefaultContext.Builder.forTask('myId', function (context, done) {
    // just before this function is call, FUNCTIONS.DefaultContext.onCreate is called
    console.log('my implementation');
    context.dispose(() => TOOLS.delay(2_000).then(() => console.log('MyDispose1')));
    context.dispose(() => TOOLS.delay(2_000).then(() => console.log('MyDispose2')));
    TOOLS.delay(2_000).then(done);
    // after the done call, FUNCTIONS.DefaultContext.onDispose is called
});
console.log('task completed!');
```

We have lifecycle hooks like `FUNCTIONS.DefaultContext` for when things are created and when they're disposed of.

```typescript
FUNCTIONS.DefaultContext.onCreate(async function (context) {
    await TOOLS.delay(2_000);
    console.log('task', context.id, 'started1');
});
FUNCTIONS.DefaultContext.onCreate(async function (context) {
    await TOOLS.delay(2_000);
    console.log('task', context.id, 'started2');
});
FUNCTIONS.DefaultContext.onDispose(async function (context) {
    await TOOLS.delay(2_000);
    console.log('task', context.id, 'ended1');
});
FUNCTIONS.DefaultContext.onDispose(async function (context) {
    await TOOLS.delay(2_000);
    console.log('task', context.id, 'ended2');
});
// CONSOLE:
(2 sec) task myId started1
(2 sec) task myId started2
(2 sec) my implementation
(4 sec) task myDispose1
(4 sec) task myDispose2
(6 sec) task myId ended1
(6 sec) task myId ended2
(6 sec) task completed!
```

Here's how it goes: first, we wait for all the `FUNCTIONS.DefaultContext.onCreate` callbacks to finish up (using Promise.allSettle), then we run the task. Once `done` is called, we wait for all the `context.dispose` callbacks to wrap up, and finally, we wait for all the `FUNCTIONS.DefaultContext.onDispose` callbacks to finish.

### `context.useState`

We've got a state manager in `context` too. You can set up local state and even global state. Local state is specific to the `context` instance, while global state is available to all parent and child `contexts`.

```typescript
const GlobalStateKey = FUNCTIONS.DefaultContextState.CreateKey<string>({
    label: 'MyGlobalState',
    scope: 'global',
});
const LocalStateKey = FUNCTIONS.DefaultContextState.CreateKey<number>({
    label: 'MyLocalState',
    scope: 'local',
});
FUNCTIONS.DefaultContext.Builder.forTask('myId', function (context, done) {
    context.useState(GlobalStateKey).set('s1');
    context.useState(LocalStateKey).set(1);
    const context1 = FUNCTIONS.DefaultContext.Builder.fromParent(context, 'ref1');
    const context2 = FUNCTIONS.DefaultContext.Builder.fromParent(context, 'ref2');
    console.log(context2.useState(GlobalStateKey).get()) // 's1'
    console.log(context2.useState(LocalStateKey).get()) // undefined
    context2.useState(LocalStateKey).set(2);
    context2.useState(GlobalStateKey).set('s2');
    console.log(context.useState(GlobalStateKey).get()) // 's2'
    console.log(context.useState(LocalStateKey).get()) // 1
    console.log(context2.useState(LocalStateKey).get()) // 2
    done();
});
```

### Wrapper

We often use higher-order functions, like when we need to throttle by time or cache results. So, we came up with the idea of wrappers, which make implementing these functions super easy. (Wrappers run in the order you write them.)

```typescript
const fib = FUNCTIONS.SyncFunction.build({
    input: z.number(),
    output: z.number(),
    wrapper: (_params) => [
        // your custom wrapper
        function ({ context, input, func, build }) {
            console.log('start w1', input);
            const result = func({ context, input, build });
            console.log('end w1', input);
            return result;
        },
        function ({ context, input, func, build }) {
            console.log('start w2', input);
            const result = func({ context, input, build });
            console.log('end w2', input);
            return result;
        },
    ],
    func({ context, input, build }) {
        console.log('fib', input);
        if (input <= 2) return 1;
        return build({ context, input: input - 1 }) + build({ context, input: input - 2 });
    },
});
fib({ context, input: 3 });
// CONSOLE
start w1 3
start w2 3
fib 3
start w1 2
start w2 2
fib 2
end w2 2
end w1 2
start w1 1
start w2 1
fib 1
end w2 1
end w1 1
end w2 3
end w1 3
```

Here are some of the ready-made wrappers:

- `FUNCTIONS.WRAPPERS.CloneData` helps you copy inputs and outputs (and yields & next arguments in a generator).
- `FUNCTIONS.WRAPPERS.Debug` lets you log your input/output and check if the time taken went over the set throttle time.
- `FUNCTIONS.WRAPPERS.MemoData` helps you remember results in `AsyncFunction` and `SyncFunction`.
- `FUNCTIONS.WRAPPERS.SafeParse` helps you parse your input/output.

### `name` & `namespace`

These are optional parameters when building the function, but you can set them later using `.setName` & `.setNamespace`. I usually like to export all my functions from a directory and then gather them in a single `index.ts`. After that, I loop through all the functions and set `namespace` as the directory name and `name` as function aliases.

```typescript
// --- pg/users.ts ---
export const getUser = FUNCTIONS.AsyncFunction.build({ ... });
export const getSubUsers = FUNCTIONS.AsyncFunction.build({ ... });
// --- pg/devices.ts ---
export const getDevices = FUNCTIONS.AsyncFunction.build({ ... });
export const updateDevice = FUNCTIONS.AsyncFunction.build({ ... });
// --- pg/_index.ts ---
export * from './a.ts';
export * from './b.ts';
// --- pg/index.ts ---
export * as Pg from './_index.ts';
import * as _Pg_ from './_index.ts';
const Pg = (_Pg_) as Record<string, any>;
for (const name in Pg) {
    Pg[name].setNamespace('Pg');
    Pg[name].setName(name);
}
```

### Extra Static Variables on Build

You can even throw in some extra variables during the build, and they'll stay attached to it.

```typescript
const getUser = FUNCTIONS.AsyncFunction.build({
    ...
    static: {
        query: new QueryBuilder(`SELECT * FROM users WHERE ID = {{{SqlNum userId}}}`),
    },
    ...
    async func({ context, input, build }) {
        const rows = await pg.query(build.query.compile(input))
        ...
    }
});
getUser.query; // QueryBuilder
```

### Schema of `input` & `output` (`next` & `yield`)

With `FUNCTIONS`, you can create `SyncFunction`, `AsyncFunction`, `SyncGenerator`, and `AsyncGenerator`. This lets you set up `input`, `output`, `next`, and `yield` schemas for better type safety while coding, using the declared Zod schema. To ensure they're safe at runtime, you need to add a parsing layer! That's where `FUNCTIONS.WRAPPERS.SafeParse` comes in handy!

---

Check out [**https://jsr.io/@panth977**](https://jsr.io/@panth977) to make your project [cl](https://jsr.io/@panth977)early coded instead of that clean coding nonsense...
