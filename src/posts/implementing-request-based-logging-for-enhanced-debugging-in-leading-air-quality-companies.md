---
title: "Implementing Request-Based Logging for Enhanced Debugging in Leading Air Quality Companies"
slug: implementing-request-based-logging-for-enhanced-debugging-in-leading-air-quality-companies
date: 2025-01-04
description: "We often run into issues when trying to debug a request! But debugging in production? 😰 So many logs to sift through, and then you have to track down all the related logs!"
tags: [logs, logging, log, requests, apis, express]
migratedFrom: https://blogs.whiteloves.in/implementing-request-based-logging-for-enhanced-debugging-in-leading-air-quality-companies
readingTime: 9
cover: /assets/blog/implementing-request-based-logging-for-enhanced-debugging-in-leading-air-quality-companies/img1.png
---

We often run into issues when trying to debug a request! But debugging in production? 😰 So many logs to sift through, and then you have to track down all the related logs! Sure, you could use top-notch logging services like AWS, GCP, DataDog, etc. But none of them offer request-based logging! Unless you set up a server for every request, 🤑 which means you must be loaded! Or you'll end up with tons of tiny node projects for each service 😵‍💫.

But let me show you a super cool way to do request-based logging—or technically, task-based logging! This will make your life way easier! Forget about those big services just for debugging; we'll set you up with much better logs. You'll even be able to customize them to fit your needs!

# Problem Statement

So, some XYZ client made a request, but the API crashed with a 500 error on the server. Now you have to debug it and try to recreate the bug. You'll probably log in to the frontend as that user, right? Or, you could just keep a log of all the 500 response `requestId`s and grab logs based on that request! This could save you a ton of time!

# Propose

1. 1. Every time a request comes in, we generate a UUID and include it in the response headers. This way, whenever anything fails from the API, a `requestId` is sent and can be shown to the client in a sandbox view or similar.

      2. Create a `context` object (with `requestId` as `context.id`) that includes a method `context.log`, which works like `console.log`.
      3. When creating the `context`, ensure there is an implementation of `context.log` where you can access `context.id`. This allows you to group the logs by `requestId` effectively.

# Solution

<https://jsr.io/@panth977/functions> with <https://jsr.io/@panth977/routes> has an awesome setup that does just that.

## Create Context

```typescript
// Create Context like following
app.get('/v1/user/:userId', function (req, res) {
    const id = null; // either set id, to string or leave it null for auto generate UUID
    DefaultContext.Builder.forTask(id, async function (context, done) {
        res.on("finish", done);
        context.log('My task started!');
        const user = await getUser({context, input: req.params}); // pass context to all the functions, for access to context.log
        res.send(user);
        context.log('My task completed!');
    });
});
// OR
// use @panth977/routes api to skip the process of creating functions!
export const GET_USER = ROUTES.Http.build([WebsiteAuthValidator], 'get', '/v2/user/{userId}', {
    request: ROUTES.z.HttpRequest({path: getUser.input}),
    response: ROUTES.z.HttpResponse({body: getUser.output}),
    async func({context, path}) {
        context.log('My route started!');
        const user = await getUser({context, input: path}); // pass context to all the functions, for access to context.log
        context.log('My route completed!');
        return {body: user};
    }
})
```

## Make sure all functions depend on `context`!

this way, all the functions can use `context.log`

```typescript
const getUser = FUNCTIONS.AsyncFunction.build({
    input: z.object({userId: z.coerce.number()}),
    output: z.object({name: z.string(), ...}).nullable(),
    async func({context, input}) {
        context.log('Getting user', input);
        const [user] = pg.query(`SELECT * FROM users WHERE id = ? LIMIT 1`, [input.userId]);
        context.log('Found user', user);
        return user ?? null;
    }
});
```

## Capture `context.log`

Every time `context.log` is called, your subscribe callback function will run.

```typescript
const unsub = DefaultContext.onLog(function (context, args) {
    console.log(context.id, ...args);
    // send the log to socket 
    // store to database
    // write to a file!
});
// incase you like to unsubscribe!
unsub();
```

By default, `context.log` doesn't even log to the console! So, make sure to add `console.log` if you need it.

# Case Study

At Oizom, we handle important air quality data that's carefully calibrated by our devices! This data gets sent to the cloud, and every minute, we receive tens of thousands of entries. Then, clients want to check out their live data! With so many API requests flying around, it often becomes super tough, almost impossible, to debug anything in production!

#### What do I want?

1. Only keep logs for failed requests. We don't want to clutter the logs database with successful ones!
2. A way to get list of request IDs made by `user` from the website, `user` from third-party APIs, `device` from the device itself, and `system-{type}` for any internal system calls like cron jobs, reports, alerts, etc.
3. I want the full logs for `{xxx}` request ID.

#### Here is what I did:

1. Define a log payload

   ```typescript
    type log = {
        ids: string[];
        msg: string;
        ts: number;
        line: number;
    }
   ```

   This seems odd! A lot of logs can belong to the same ID, but how can the same log belong to many IDs? Actually, it's just a simple engineering trick. Many logs can still have the same ID, and most logs will have a single ID (which will be `context.id`). But sometimes, we need more control over filtering logs, and having multiple IDs helps with that! We'll get into this more later on.
2. First, set up a secure socket app with these protocols:

   1. `/send_log` - All my servers will send their logs through this channel.
   2. `/stream_all_logs` - Stream all the logs in real-time as my server sends them.
   3. `/stream_logs` - Only share logs that match its room (create rooms based on `id`).
3. Create a service that listens to `/stream_all_logs` and stores all the logs somewhere. For us, it was Cassandra. We self-hosted a container and set a `ttl` of a few weeks to keep things tidy.

   ```sql
    CREATE TABLE logs.logs_v2 (
      id text,
      ids set<text>,
      ts bigint,
      msg text,
      line bigint,
      PRIMARY KEY ((id), ts)
    ) WITH CLUSTERING ORDER BY (ts ASC) AND ...
   ```
4. Set up a service with an HTTP GET endpoint `/fetch_logs` to grab logs by `id` from Cassandra. Just add some ordering and use limit/offset (Cassandra has built-in token-based pagination), and you're all set!
5. Now, make a simple frontend with two modes: [ `real-time` , `database` ]

   1. Add a simple text box where you can type the `id` and a submit button.
   2. Depending on the mode you choose, either connect to the socket `/stream_logs` or fetch from `/fetch_logs`, and add a "fetch next" button for more logs.
   3. For each log shown, include an expand button that reveals all the `ids` (this can be used to link to different ids with the same log).
6. Great, you've got your logging system all set up 🎉. Take a break!
7. Now, let's dive into the core backend code. Here's how you do it! Every time a `context` is created:

   1. We set up a logs state.
   2. Add all the `context.log` entries to the state.
   3. If there's an error or if something needs to be stored because it's important, we set `.importance = true`.
   4. When disposing, if `.importance === true`, we stream all the logs to `/send_log`.

```typescript
    type Logs = {
        logs: { ids: string[]; msg: string; ts: number; line: number }[];
        important: boolean;
    };
    const LogsStateKey = FUNCTIONS.DefaultContextState.CreateKey<Logs>({
        label: 'Logs',
        scope: 'global',
    });
    const stringifyLogs = LOGS.createStringifyLogger({ forEachLine: false });
    // exposing this function for set the importance level.
    // this determines wether logs should be sent to socket or not!
    export function needToSendLogsToSocket(context: Pick<FUNCTIONS.Context, 'useState'>) {
        const state = context.useState(LogsStateKey).get();
        if (!state) return;
        state.important = true;
    }
    // exposing this function for more versatile use. (link different ids to same log)
    export function logToSocket(
        context: Pick<FUNCTIONS.Context, 'useState'>,
        { ids, line, ts }: { ids: string[]; ts?: number; line?: number },
        ...args: any[]
    ) {
        const state = context.useState(LogsStateKey).get();
        if (!state) return;
        state.logs.push({
            ids: ids,
            msg: stringifyLogs(null, args),
            ts: ts ?? Date.now(),
            line: line ?? state.logs.length,
        });
    }
    // set a state on context
    FUNCTIONS.DefaultContext.onCreate(function (context) {
        context.useState(LogsStateKey).set({ logs: [], important: false });
    });
    // store all the logs in the state
    FUNCTIONS.DefaultContext.onLog(function (context, args) {
        // every context.log will be mapped to 
        // ids=[context.id] 
        // so single id for all the context.log 
        logToSocket(context, { ids: [context.id] }, ...args);
    });
    // at end, check if it is important, and stream them to socket.
    FUNCTIONS.DefaultContext.onDispose(async function (context) {
        try {
            const state = context.useState(LogsStateKey).get();
            if (!state.important) return;
            for (const log of state.logs) socket.send(JSON.stringify(log));
        } catch (err) {
            console.error('Socket Log Error:', err);
        }
    });
```

8. Now, whenever a user logs in from the website, a third-party, a device, or a system-{type}, I create a unique UUID for that login session and add it to the auth token.
9. On every request, we obviously throw in some kind of auth check. Here, I figure out what kind of login it is and then decide on all the possible categories I want to sort this request into.

   ```typescript
    const WebsiteAuthValidator = ROUTES.Middleware.build({
        request: ROUTES.z.MiddlewareRequest({
            headers: z.object({}).passthrough(),
        }),
        response: ROUTES.z.MiddlewareResponse({
            headers: z.object({}).passthrough(),
        }),
        async func({ context, headers }) {
            // frontend wants to store logs!
            if (headers['x-store-logs'] === 'true') needToSendLogsToSocket(context);
            const decoded = ...; // decode the token from headers.
            if (decoded.mode === 'client') throw createHttpError.Unauthorized('This is not a client Api, You only have access to client APIs');
            const ids = [context.id];
            if (decoded.mode === 'system') {
                if (decoded.id) ids.push(`Core:User:System:${decoded.id}`);
            } else {
                ids.push(`Core:User:${decoded.userId}`);
                ids.push(`Core:User:Org:${decoded.orgId}`);
                if (decoded.id) ids.push(`Core:User:${decoded.userId}:${decoded.id}`);
            }
            const { req } = context.useState(ExpressStateKey).get();
            logToSocket(context, { ids }, req.method, req.path);
            context.useState(DecodedStateKey).set(decoded);
            if (headers['x-store-logs'] === 'true') return { headers: { 'x-request-id': context.id } };
            return {};
        },
    })
   ```

   This way, when you get logs for `id = Core:User:2141`, you see a list of all the API calls made by this user. Each log includes a list of other relevant `ids`, and one of them will be `context.id`. That way, you can get the `requestId`, and by fetching the logs of that `requestId`, you get the complete logs for that specific API call.
10. Whenever there's an error with a request, we like to save the logs.

    ```typescript
    const onError: ExpressHandler.onError = function ({ context, error: err }) {
      if (createHttpError.isHttpError(err)) {
        return { 
          body: err.message,
          headers: { 'x-request-id': context.id, ...(error.headers ?? {}) },
          status: err.statusCode
        };
      }
      if (context) {
        const { req } = context.useState(ExpressHandler.ExpressStateKey).get();
        // log the request, could be helpfull for recreating error, in debugging.
        context.log(
          'Req::',
          JSON.stringify({ method: req.method, path: req.params, query: req.query, body: req.body, headers: req.headers }, null, '\t'),
        );
        context.log('Err While Req:', err);
        console.error('500 Error at:', context.id);
        // set the importance.
        needToSendLogsToSocket(context);
      } else {
        // nothing we can do further!
        console.error('Err:', err);
      }
      return { 
        body: 'Something went wrong!', 
        headers: { 'x-request-id': context.id }, 
        statusCode: 500 
      };
    };
    const v2 = ExpressHandler.serve({ bundle: ExposedRoutes, onError });
    app.use(v2);
    ```

# Tips

use AI to build this simple system. That's exactly what I did. As an engineer, your job is to set up the system and let AI take care of the boring stuff 😘.

Here are my Log-GUI images:

![](/assets/blog/implementing-request-based-logging-for-enhanced-debugging-in-leading-air-quality-companies/img1.png)

Later, there was a need for a new feature! I needed a list of all the emails sent to a certain XYZ address or SMS to an XYZ phone number. All I had to do was create a new template for `id`, and I was all set. I logged the `requestId`, which lets us track which request sent the email!

![](/assets/blog/implementing-request-based-logging-for-enhanced-debugging-in-leading-air-quality-companies/img2.png)

For each log, I show 4 things:

1. A toggle button to see other linked `ids`
2. The `line` number of the log
3. The `ts` in local time
4. The `msg`, which is the log message.

![](/assets/blog/implementing-request-based-logging-for-enhanced-debugging-in-leading-air-quality-companies/img3.png)

When you spot the extra `ids`, turn them into hyperlinks. This makes it super easy to hop around while you're checking out the logs.

---

This logging service can be set up for your company, but I'd suggest doing it yourself. That way, you can easily add your own customisations.
