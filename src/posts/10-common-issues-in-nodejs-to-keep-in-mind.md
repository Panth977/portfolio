---
title: "10 Common Issues in Node.js to keep in Mind"
slug: 10-common-issues-in-nodejs-to-keep-in-mind
date: 2024-12-01
description: "const userChanges = new PubSub(); userChanges.subscribe((username) = { // Invalidate user cache }) async function getUser(username) { // cache this!"
tags: [node-js, promises, zod, asynchronous, trycatch, typescript]
migratedFrom: https://blogs.whiteloves.in/10-common-issues-in-nodejs-to-keep-in-mind
readingTime: 4
cover: /assets/blog/covers/10-common-issues-in-nodejs-to-keep-in-mind.png
---

#### If you have a callback API function, fix it using the Promise constructor.

```javascript
function badImplementation() {
    return new Promise((resolve, reject) => {
        someOldLibWithCb((data, err) => {
            if (err) {
                reject(err);
                return;
            }
            // Implementation...
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
    // Implementation...
}
```

#### Keep your function implementation in the main body instead of inside a callback.

```javascript
async function badImplementation() {
    return getUser(userId).then((user) => {
        if (!user) throw new Error('User not found');
    });
}
// OR
async function goodImplementation() {
    const user = await getUser(userId);
    if (!user) throw new Error("User not found");
    // ...
}
```

#### Make sure to avoid catching errors unless you have a plan to handle them.

```javascript
async function badImplementation() {
    const user = getUser(userId).catch((err) => {console.error(err)});
    if (!user) throw "User not found";
    // ...
}
// OR
async function goodImplementation() {
    const user = await getUser(userId);
    // ...
}
```

#### Always throw an HTTP response-supported error for better API responses.

```javascript
class HttpError extends Error {
  constructor(status, message) {
    this.status = status;
    super(message);
  }
}
app.get('/profile', async (req, res) => {
    try {
        const profile = await getProfile(req.query.username);
        res.send(profile);
    } catch (err) 
        if (err instanceof HttpError) {
            res.status(err.code).send(err.message);
            return;
        }
        console.error(err);
        res.status(500).send("Something Went Wrong!");
    }
});
async function getProfile(username) {
    const user = await getUser(username);
    if (!user) throw new HttpError(400, "No such user found!");
    // implementation
    return profile;
}
```

#### Consider sending a request ID with all incoming requests and storing all `console.log` entries in a database for debugging purposes.

```javascript
function myLog(requestId, ...args) {
    try {
        await db.logs.insert(requestId, Date.now(), JSON.stringify(args));
    } catch (err) {
        cosnole.error(err);
    }
}
app.get('/profile', async (req, res) => {
    const requestId = randomUuid();
    const profile = await getProfile(requestId, req.query.username);
    res.setHeaders('x-req-id', requestId);
    res.send(profile);
});
async function getProfile(requestId, username) {
    const user = await getUser(username);
    if (!user) throw new HttpError(400, "No such user found!");
    // implementation
    myLog(requestId, "Found Profile", username, profile);
    return profile;
}
```

#### Add schema validation for all incoming requests and outgoing responses, as they cannot be fully trusted and might have a schema version mismatch.

```javascript
app.get('/user', async (req, res) => {
    if (!isUsername(req.query.username)) {
        res.status(400).send('Invalid username!')
        return;
    }
    const user = await getUser(req.query.username);
    if (!isUsername(user.username)) {
        res.status(500).send('Invalid username!')
        return;
    }
    if (!isEmail(user.email)) {
        res.status(500).send('Invalid email!')
        return;
    }
    if (!isName(user.name)) {
        res.status(500).send('Invalid name!')
        return;
    }
    res.send(user);
});
app.post('/user', async (req, res) => {
   if (!isUsername(req.body.username)) {
        res.status(400).send('Invalid username!')
        return;
    }
    if (!isEmail(req.body.email)) {
        res.status(400).send('Invalid email!')
        return;
    }
    if (!isName(req.body.name)) {
        res.status(400).send('Invalid name!')
        return;
    }
    const profile = await getProfile(requestId, req.query.username);
    res.send('User added successfully!');
});
```

#### Cache your frequently accessed data. There's no need to cache everything!

```javascript
async function getDevices(userId) {
    // maybe cache this!
    return await db.user(userId).devices.get();
}
async function getDevicesData(userId, gte, lte) {
    const devices = await getDevices(userId)
    return await db.devices(devices).data(gte, lte);
}
async function getDevicesStatus(userId) {
    const devices = await getDevices(userId)
    return await db.devices(devices).data.lastEntry().wasInLast15Min();
}
async function getDevicesExpiry(userId) {
    const devices = await getDevices(userId)
    // ...
}
// Make sure to invalidate the cache when changes are made!
```

#### Create an internal Pub/Sub system; it can be useful. Also, consider creating a batching function and a max parallel allowance function, similar to Pub/Sub. These can make your work easier.

```javascript
class PubSub {
  cbs = new Set()
  subscribe(cb) {
      this.cbs.add(cb);
      return () => {
          this.cbs.delete(cb);
      }
  }
  publish(...args) {
      for (const cb of this.cbs) {
          setTimeout(() => cb(...args));
      }
  }
}

const userChanges = new PubSub();
userChanges.subscribe((username) => {
  // Invalidate user cache
})
async function getUser(username) {
    // cache this!
}
async function updateUser(username) {
    // Implementation
    userChanges.publish(username)
}
async function deleteUser(username) {
    // Implementation
    userChanges.publish(username)
}
```

#### You might want a way to generate OpenAPI JSON, and there are various UIs available to assist with presentation.

```javascript
const generatedOpenAPIjson = {...};
app.use('/docs/', swagger.ui, swagger.serve(generatedOpenAPIjson));
```

#### Ensure all your `GET` APIs are fast, and make your `POST`, `PATCH`, `DELETE`, and `PUT` operations transactional. This means that either everything succeeds or everything fails.

---

I think I've found a way to handle these problems. Check out <https://jsr.io/@panth977> for how to use it. It's the best approach for building a backend easily.

This package lets you do many things easily.

1. <https://jsr.io/@panth977/tools> offers useful tools, such as creating internal Pub/Subs and higher-order functions that let you batch multiple function calls. It also includes a higher-order function to set a limit on the maximum number of parallel invocations allowed, as well as one-to-one and one-to-many mappings, among others.
2. <https://jsr.io/@panth977/functions> offers a builder to create type-safe functions using Zod, along with static variables and local wrappers. You can build synchronous functions, asynchronous functions, synchronous generators, and asynchronous generators. It also includes helpful wrapper implementations for easier use.
3. <https://jsr.io/@panth977/cache> offers a standard cache class, giving you full control over key prefixes, and the ability to read, write, and remove keys and hash fields. It also includes standard hooks to cache a response, whether it's an Object, MultipleObject, Collection, or MultipleCollection. This should cover all your caching needs.
4. <https://jsr.io/@panth977/routes> provides builders to create your endpoints. It supports Middleware, HTTP, and SSE techniques. If you correctly use the Zod schema with the routes, it will automatically generate OpenAPI JSON for free.
5. <https://jsr.io/@panth977/cache-redis> provides a Redis implementation for [/cache](https://jsr.io/@panth977/cache).
6. <https://jsr.io/@panth977/routes-express> provides an Express implementation for [/routes](https://jsr.io/@panth977/routes).

Stay tuned for more insights.
