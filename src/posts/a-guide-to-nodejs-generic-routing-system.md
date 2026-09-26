---
title: "A Guide to Node.js Generic Routing System"
slug: a-guide-to-nodejs-generic-routing-system
date: 2024-12-11
description: "< gives you a cool design system to set up your routes, with support for Middleware, HTTP (req, single res), and SSE. But keep in mind, this package isn't meant to serve your routes!"
tags: [http, node-js, routes, openapi, swagger, express-js]
migratedFrom: https://blogs.whiteloves.in/a-guide-to-nodejs-generic-routing-system
readingTime: 5
---

<https://jsr.io/@panth977/routes> gives you a cool design system to set up your routes, with support for Middleware, HTTP (req, single res), and SSE. But keep in mind, this package isn't meant to serve your routes! For that, you'll need <https://jsr.io/@panth977/routes-express> as a handler, or you can create your own custom handler!

Here, we're just focusing on the [/routes](https://jsr.io/@panth977/routes) package!

The route setup uses the design approach from <https://jsr.io/@panth977/functions> as its foundation! So, you still get all the goodies like `wrappers`, `context`, `static`, `name & namespace`, `build`, and `input/output schema`! Check out [functions-blog](https://how-is-my-backend.whiteloves.in/how-to-implement-type-safe-functions-in-javascript) for more details.

Since this system design already ensures all your routes are type-declared, we can use this schema to build an open-api JSON, which can be used for serving some doc UI or generating a front-end schema!

### `ROUTES.Middleware.build`

```typescript
const DecodedStateKey = FUNCTIONS.DefaultContextState.CreateKey<ReturnType<typeof decodeToken>>({ label: 'Decoded',scope: 'global' });
const authorize = ROUTES.Middleware.build({
  security: {
    JwtAuth: {
      type: "apiKey", // this rules will be used for documentation of routes
      description: "Authorize ** /users/login **.",
      name: "x-auth-token",
      in: "header",
    },
  },
  request: ROUTES.z.MiddlewareRequest({ // this schema will be used to address route request schema, in documentation
    headers: z.object({ "x-auth-token": z.string() }).passthrough(),
  }),
  response: ROUTES.z.MiddlewareResponse({}),
  async func({context, headers}) {
    const token =
      headers["x-auth-token"] ??
      headers["authorized"] ??
      headers["x-token"];
    const decoded = await decodeToken(token);
    if (!decoded) throw createHttpError.Unauthorized("Token not found / Token got Expired / Invalid Token!");
    // set state to context for others to make use of it!
    context.useState(DecodedStateKey).set(decoded);
    return {};
  },
});
```

### `ROUTES.Http.build`

```typescript
const getProfile = ROUTES.Http.build([authorize], "get", "/profile", {
  description: `Get user profile.`,
  request: ROUTES.z.HttpRequest({
      query: z.object({
        getFriends: z.enum(['true', 'false']).default('false'),
      })
  }),
  response: ROUTES.z.HttpResponse({
    body: z.object({
      id: z.number(),
      username: z.string(),
      address: z.string().nullable(),
      noOfProjects: z.number().int().gt(0),
    }),
  }),
  static: {
    query: pg.query(`Select * from users where id = ? LIMIT 1`),
  },
  async func({context, query, build}) {
    const { userId } = context.useState(DecodedStateKey).get();
    const result = await build.query.execute([userId]);
    if (!result.rows.length) throw createHttpError.NotFound("Given user was not found in db, could be because someone has deleted the user.");
    if (query.getFriends === 'true') {...}
    return result.rows[0];
  },
});
```

### `ROUTES.Sse.build`

```typescript
export const getLogs = ROUTES.Sse.build([systemAuthorized], "get", "/logs/{requestId}", {
  request: ROUTES.z.SseRequest({
    path: z.object({
      requestId: z.string(),
    }),
  }),
  response: ROUTES.z.SseResponse(
    z
      .object({ id: z.number(), msg: z.string(), ts: z.date() })
      .array()
      .transform((x) => JSON.stringify(x))
  ),
  async *func({context, path: { requestId }}) {
    let logs = [];
    let offset = 0;
    do {
      const result = await pg.query(`SELECT * FROM logs where id = ? ORDER BY ts OFFSET ? LIMIT 30`, [requestId, offset]);
      logs = result.rows
      offset += logs.length;
      yield logs;
    } while (logs.length);
  },
});
```

### Design Description

It's pretty much the same setup as [/functions](https://jsr.io/@panth977/functions), but with a few tweaks. Now, `input` is called `request`, and you can directly access the request `path`, `query`, `headers`, and `body` in the `func` implementation as named arguments! We've also switched from `output` to `response`, which includes `headers` and `body`.

We've added some extra properties to make generating OpenAPI docs JSON easier! These include `description`, `tags`, `summary`, `security`, `resMediaTypes`, and `reqMediaTypes`. Behind the scenes, we use `zod-openapi` to generate the OpenAPI schema with Zod (<https://www.npmjs.com/package/zod-openapi>).

Instead of using `z.object` to define `request`, we use `ROUTES.z.HttpRequest`. For responses, we use `ROUTES.z.HttpResponse`. This helps keep the types accurate! (But you can still use your own if you want.)

### `ROUTES.Endpoint`

If you prefer a code design where you chain your middleware and use `app.get('/profile', {...})` instead of the one mentioned above, then this class is for you!

```typescript
const initMiddleware = ROUTE.Middleware.build(...);
const userAuthMiddleware = ROUTE.Middleware.build(...);
const thirdPartyAuthMiddleware = ROUTE.Middleware.build(...);

const EndpointFactory = ROUTE.Endpoint.build().addMiddleware(initMiddleware);
const endpoints = {
  userAuthorized: EndpointFactory.addMiddleware(userAuthMiddleware),
  thirdPartyAuthorized: EndpointFactory.addMiddleware(thirdPartyAuthMiddleware),
}

const getProfile = endpoints.userAuthorized.HTTP('get', '/profile', ...);
const getProfile3rdParty = endpoints.thirdPartyAuthorized.get('/api/{userId}/profile', ...);
```

### `ROUTES.getEndpointsFromBundle`

This will simplify your super-detailed endpoint types, which is super handy when you just need to handle your general routes. Like, if you want to serve your routes or filter them based on certain conditions, this method lets you do that! Plus, you can filter out endpoint types (http/sse) from the rest of the extra APIs!

```typescript
// --- routes/m.ts ---
export const myMiddleware = ROUTES.Middleware.build(...);
// --- routes/a.ts ---
export const myVariable1 = ...;
export const route1 = ROUTES.Http.build(...);
export const route2 = ROUTES.Http.build(...);
// --- routes/b.ts ---
export function myFunction(...) {...}
export const route3 = ROUTES.Http.build(...);
export const route4 = ROUTES.Sse.build(...);
// --- routes/index.ts ---
export * from './m.ts';
export * from './a.ts';
export * from './b.ts';
// --- server.ts ---
import * as routes_ from './routes/index.ts';
const routes = ROUTES.getEndpointsFromBundle({bundle: routes_}); // strong type will be lost
console.log(routes) // {route1: ..., route2: ..., route3: ..., route4: ...}
```

### `ROUTES.getRouteDocJson`

After you've set up all your endpoints, you can use this method to generate your OpenAPI JSON!

```typescript
const routes = ROUTES.getEndpointsFromBundle({
    bundle: await import('./routes/index.ts'),
    excludeTags: ['internal-apis'],
});
const OpenApiJson = ROUTES.getRouteDocJson(routes, {
    info: {
        title: 'My Apis',
        version: '0.0.1',
    }
});
```

### `ROUTES.execute`

Here's how you run your endpoint! First, set up your lifecycle hooks, and then it's pretty straightforward!

```typescript
type MyFrameworkOpt = { req: Express.Request, res: Express.Response };
const MyEndpointExecutionLifeCycle: ROUTES.LifeCycle<MyFrameworkOpt> = {
    init(...) {...},
    onStatusChange({...}) {...},
    onExecution({...}) {...},
    onResponse({...}) {...},
    onComplete({...}) {...},
}
app.get('/getUser', (req, res) => {
    FUNCTION.DefaultContext.Builder.forTask(null, async (context, done) => {
        ROUTES
            .execute({
                context,
                build: getUserEndpoint,
                lc: MyEndpointExecutionLifeCycle,
                opt: { req, res },
            })
            .finally(done);
    })
})
```

Even though we're using express.js in our example to handle requests, you can totally create your own custom handler for whatever framework you prefer!

Make sure to build your handler carefully! To see how to do it, check out this reference: <https://github.com/panth977-packages/routes-express>.

### `ROUTES.CodeGen.{lang}`

These are pre-exported code generators that turn your OpenApiJson into frontend SDK-like code! Super easy to use!

```typescript
app.get('/code-gen', (_, res) => {
  FUNCTIONS.DefaultContext.Builder.forTask('CodeGen', function (context, done) {
    res.on('finish', done);
    try {
      const { code } = ROUTES.CodeGen.genTsCode({ context, input: { json, options: {} } });
      res.setHeader('content-type', 'text/x.typescript').send(code);
    } catch (err) {
      console.log(err);
      res.status(500).send('Something went wrong!');
    }
  });
});
```

And you get type-safe code for all the APIs to call the backend!

---

Check out [**jsr.io/@panth977**](http://jsr.io/@panth977) [**to make your pr**](https://jsr.io/@panth977)**oject** [**cl**](https://jsr.io/@panth977)[**ea**](https://jsr.io/@panth977)**rly coded instead of that clean coding nonsense...**
