---
title: "How Caching Boosted Performance for a Top Air Quality Monitoring Company"
slug: how-caching-boosted-performance-for-a-top-air-quality-monitoring-company
date: 2025-01-25
description: "Our usual cache-aside pattern was leaking stale reads and hammering PostgreSQL. Here is the cache layer we ended up with, how invalidation works, and what it did to query volume."
tags: [cache, cache-invalidation, redis, postgresql, node-js]
migratedFrom: https://blogs.whiteloves.in/how-caching-boosted-performance-for-a-top-air-quality-monitoring-company
readingTime: 13
cover: /assets/blog/covers/how-caching-boosted-performance-for-a-top-air-quality-monitoring-company.png
---

What does your usual caching strategy look like? Maybe something like this:

```typescript
async function getUser(userId) {
    const cacheResult = await cache.get(`USERS:${userId}`);
    if (cacheResult !== null) return JSON.parse(cacheResult);
    const result = await (...) // do some db call
    await cache.set(`USERS:${userId}`, JSON.stringify(result), "exp", 3600 * 24);
    return result;
}
```

So, how would you clear the cache? Because when a user updates their profile name, the changes don't seem to show up immediately.

```typescript
async function updateUser(userId, data) {
    await (...) // do some db calls
    await cache.del(`USERS:${userId}`);
}
async function deleteUser(userId) {
    await (...) // do some db calls
    await cache.del(`USERS:${userId}`);
}
```

![](/assets/blog/how-caching-boosted-performance-for-a-top-air-quality-monitoring-company/img1.jpeg)

So, you think you've nailed caching, huh? But have you really? Let's break it down:

1. Why is the cache invalidation code stuck in `updateUser` and `deleteUser`? It's super easy to overlook, especially when you create a new function like `updateUserForSomeNewTask`.
2. What if updating or deleting a user also affects other stuff, like the user's organization or module expiry? If you're caching all that too, you'll need to handle invalidation for everything. Who can keep track of all that?
3. Even with a simple cache get, you have to add two layers of code—one before and one after your implementation—to check if the cache exists and then set it. It's a bug waiting to happen.
4. What if you change the output schema for `getUser`? You either change the key prefix from `USERS:` to `USERS_V2:` or flush the `USERS:` cache. Who's going to remember that?
5. The big one: what if a user is updated from another service? Like someone directly edits the database, or it happens through a different backend, admin backend, or background workers? You'll be stuck with a caching bug for 24 hours, wasting time debugging.
6. And what about when you want to create a function like `getUsers(userIds)`? If you think that's easy, try making caching logic for `getModulesForUser(userId, moduleIds)` where `moduleIds = undefined` to get all modules.

See how managing this can get tricky as you go along? These are real problems that happen more often than you'd think.

All of this can be sorted out with a good design system.

I'm going to talk about my caching and invalidation tricks using `Redis` and `Postgres` with `NodeJs`.

Let's tackle everything step by step.

1. Let's start by turning the caching code into a function.

```typescript
// caching function for single object
// we can similarly create a abstract wrapper to cache multiple objects
function CacheFunc(func, getKey, expInSec) {
    async wrappedFn(...args) {
        const key = getKey(...args);
        const cacheResult = await redis.get(key);
        if (cacheResult !== null) return JSON.parse(cacheResult);
        const result = await func(...args)
        await redis.set(key, JSON.stringify(result), "exp", expInSec);
        return result;
    }
    async invalidate(...args) {
        const key = getKey(...args);
        await redis.del(key);
    }
    return Object.assign(wrappedFn, { invalidate })
}

const getUser = CacheFunc(async function (userId) {
    const result = await (...) // do some db call
    return result;
}, (userId) => `USERS:${userId}`, 3600 * 24)
async function updateUser(userId, data) {
    await (...) // do some db calls
    await getUser.invalidate(userId);
}
async function deleteUser(userId) {
    await (...) // do some db calls
    await getUser.invalidate(userId);
}
```

this looks way more promising.

2. But there's still a question: What do we do when a new lightweight user function needs caching and invalidation? so let's move all the invalidation stuff to an `onUserChange` function.

```typescript
async function onUserChange(userId) {
    await Promise.all([
        getUser.invalidate(userId),
        getUserWithFewColumns.invalidate(userId),
        // add all the other, user caching functions
    ])    
}

const getUser = CacheFunc(async function (userId) {
    const result = await (...) // do some db call
    return result;
}, (userId) => `USERS:${userId}`, 3600 * 24)
const getUserWithFewColumns = CacheFunc(async function (userId) {
    const result = await (...) // do some db call
    return result;
}, (userId) => `LIGHT_USERS:${userId}`, 3600 * 24)

async function updateUser(userId, data) {
    await (...) // do some db calls
    await onUserChange(userId);
}
async function deleteUser(userId) {
    await (...) // do some db calls
    await onUserChange(userId);
}
```

It's like having a pub/sub system, where all the subscribers are inside the `onUserChange` function, and any functions that change user content, like `updateUser` and `deleteUser`, are doing the publishing.

3. There's still the problem of having to manually invalidate in `updateUser` and `deleteUser`. Someone might forget to invalidate the user cache when creating a new `userUpdateWithModule` function. So, we'll send an event from pg whenever changes happen and trigger the `onUserChange` function based on that event.

```sql
-- run this once
CREATE FUNCTION notify_change()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'internal_change', 
        jsonb_build_object(
            'old', row_to_json(OLD),
            'new', row_to_json(NEW),
            'table', TG_TABLE_NAME,
            'event', TG_OP
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- for all the tables you do caching for.
CREATE TRIGGER on_change
AFTER INSERT OR UPDATE OR DELETE ON public."USERS"
FOR EACH ROW EXECUTE FUNCTION notify_change();
```

```typescript
const pool = new pg.Pool({...});
const client = await pool.connect();
async function listenToPgChanges() {
    const callbacks = {
        USERS: onUserChange,
        // add other tables
    }
    client.on('notification', function (e) {
        if (e.channel !== 'internal_change') return;
        try {
            const data = JSON.parse(e.payload);
            await callbacks[data.table](data);
        } catch (err) {
            console.error('Err in internal_change notification:', err)
        }
    })
    await client.query(`LISTEN internal_change`)
}
async function onUserChange(msg) {
    if (msg.event === 'INSERT') {
        // new possibilities.
        await sendWelcomeEmail(msg.new)
        return;
    }
    const userId = msg.old.ID;
    await Promise.all([
        getUser.invalidate(userId),
        getUserWithFewColumns.invalidate(userId),
        // add all the other, user caching functions
    ])    
}

const getUser = CacheFunc(async function (userId) {
    const result = await (...) // do some db call
    return result;
}, (userId) => `USERS:${userId}`, 3600 * 24)
const getUserWithFewColumns = CacheFunc(async function (userId) {
    const result = await (...) // do some db call
    return result;
}, (userId) => `LIGHT_USERS:${userId}`, 3600 * 24)

function updateUser(userId, data) {
    await (...) // do some db calls
    // No need to do any thing for invalidation.
}
function deleteUser(userId) {
    await (...) // do some db calls
    // No need to do any thing for invalidation.
}
```

This is awesome. We've tackled a bunch of issues all at once. If anyone updates the table from the database or some other backend, we can count on `pg` to send a notification about the changes, and our server will handle them accordingly. Plus, we've totally removed the need for invalidation in `updateUser` and `deleteUser`.

![](/assets/blog/how-caching-boosted-performance-for-a-top-air-quality-monitoring-company/img2.jpeg)

With just 3 simple steps, we've solved 90% of our problems. But there are still a few things we haven't figured out yet:

1. The code design isn't perfect yet. The invalidation call `getUser.invalidate` happens in the `onUserChange` function, but we want a proper callback using `Pub/Sub`.This all can be further solved using my library, i have abstract the code for anyone to use. so that you can spent time writing important business logic and not wonder the caching bugs.
2. We only have one caching wrapper to cache the function output. We need a solution for functions like `getUsers` that handle multiple users.
3. Changes in the output schema for caching functions. We need to check the schema before deciding if the cached output is valid, without changing the cache key prefix or manually flushing keys from Redis.

**NOTE BUG:** In the current setup, when we use `pg_notify`, it sends notifications to all the backend instances you have running. This means you'll end up invalidating the same cache multiple times because each backend instance listens to the event separately. It might be okay to invalidate the cache several times, but if you're using this for something like `sendWelcomeEmail`, it could be a problem. Don't worry, my solution will fix all these issues for you.

Here's the solution I came up with in the end:

1. <https://jsr.io/@panth977/tools> - This lets us set up Pub/Sub for calling internal functions.
2. <https://jsr.io/@panth977/functions> - This helps us define functions with zod input/output schemas and wrappers. It makes our code more consistent and easier to read.
3. <https://jsr.io/@panth977/cache> - An abstract wrapper with a bunch of hooks for single object caching, multiple object caching, collection caching, and more. (You'll need a cache that supports `key → value` and `key → hash (field → value)`)
4. <https://jsr.io/@panth977/cache-redis> - A Redis adapter for the [/cache](https://jsr.io/@panth977/cache) package.

Let's tackle the rest step by step.

1. Let's use Pub/Sub from [/tools](https://jsr.io/@panth977/tools) (we'll be using [zod](https://zod.dev/) as the schema validation library).

```typescript
const zUSER = z.object({
    ID: z.number(),
    NAME: z.string(),
    // ...
})
const zEvent z.enum(['INSERT', 'UPDATE', 'DELETE'])
function zChanges(schema) {
    return z.object({ event: zEvent, old: schema.nullable(), new: schema.nullable() });
}
const TablesChanges = {
    // from @panth977/tools
    USERS: TOOLS.CreatePubsub(zChanges(zUSER))
}

async function onPgChanges() {
    client.on('notification', function (msg) {
        if (msg.channel !== 'internal_change') return;
        try {
            const data = JSON.parse(msg.payload);
            await TablesChanges[data.table].publish(data);
        } catch (err) {
            console.error('Err in internal_change notification:', err)
        }
    })
    await client.query(`LISTEN internal_change`)
}

TablesChanges.USERS.subscribe((msg) => msg.old && getUser.invalidate(msg.old.ID));
const getUser = CacheFunc(function (userId) {
    const result = await (...) // do some db call
    return result;
}, (userId) => `USERS:${userId}`, 3600 * 24);
TablesChanges.USERS.subscribe((msg) => msg.old && getUserWithFewColumns.invalidate(msg.old.ID));
const getUserWithFewColumns = CacheFunc(async function (userId) {
    const result = await (...) // do some db call
    return result;
}, (userId) => `LIGHT_USERS:${userId}`, 3600 * 24);
```

Perfect, this lets us directly subscribe to our changes without needing a middle function like `onUserChange`.

2. Let's use [/cache](https://jsr.io/@panth977/cache). It already has the code abstracted with `CacheFunc` for Single Object and Multiple Object outputs, as well as Single Collection (and even Multiple Collection for those tricky situations).

```typescript
// from @panth977/cache
const cache = new CACHE.CacheController({
    // from @panth977/cache-redis
    client: new RedisCacheClient(redis.createClient({...}), { delayInMs: 10, label: 'Redis' }),
    separator: ':',
    defaultExpiry: 3600 * 24,
    prefix: 'Dev',
    allowed: { '*': true },
    log: true,
});
TablesChanges.USERS.subscribe((msg) => msg.old && getUser.getHooks(msg.old.ID).del());
const getUser = CACHE.Wrap((userId) => new CACHE.HOOKS.SingleObject({
    cache: cache
        .addPrefix('USERS')
        .addPrefix(JSON.stringify({ userId }))
        .setDefaultExp(3600 * 24),
}), function ($, userId) {
    const result = await (...) // do some db call
    return result;
})
getUser(1001)
getUser(1002)
```

this might seem a bit much, but keep in mind `CACHE.HOOKS` has other hooks like:

```typescript
const getUsers = CACHE.Wrap((userIds) => new CACHE.HOOKS.MultipleObject({
    cache: cache
        .addPrefix('USERS')
        .setDefaultExp(3600 * 24),
    ids: userIds,
}), function ($, userIds) {
    userIds = $.notFound; // only run for ids not found in cache
    // make sure you fetch all user data in single db request.
    const result = await (...) // do some db call
    // NOTE: use TOOLS.oneToOneMapping from @panth977/tools
    const dictResult = (...) // Make sure result is { [userId: number]: UserObject }
    return dictResult;
})
// lets say user:1001 & user:1003 exists;
getUsers([1001, 1002]) // { 1001: USER_DATA }
// --> will set cache for 1001
getUsers([1001, 1003]) // { 1001: USER_DATA, 1003: USER_DATA }
// --> will get 1001 from cache & set cache for 1003

// ------------ // ------------ //
const getUserDevices = CACHE.Wrap((userId, deviceIds) => new CACHE.HOOKS.SingleCollection({
    cache: cache
        .addPrefix('USER_DEVICES')
        .addPrefix(JSON.stringify({ userId }))
        .setDefaultExp(3600 * 24),
    subIds: deviceIds ? deviceIds : '*',
}), function ($, userId, deviceIds) {
    deviceIds = $.notFound === '*' ? undefined : $.notFound;
    const ignoreDeviceIds = $.found;
    // make sure you fetch all user devices data in single db request. 
    // if deviceIds = undefined, then fetch all the device
    // and ignore ones already found from cache.
    const result = await (...) // do some db call
    // NOTE: use TOOLS.oneToOneMapping from @panth977/tools
    const dictResult = (...) // Make sure result is { [deviceId: string]: DeviceObject }
    return dictResult;
})
// lets say user:1001 has device:OZ001, device:OZ002 & device:OZ003
getUserDevices(1001, ['OZ001', 'OZ005']) // { 'OZ001': DEVICE_DATA }
// will set cache for (1001 -> OZ001)
getUserDevices(1001) // { 'OZ001': DEVICE_DATA, 'OZ002': DEVICE_DATA, 'OZ003': DEVICE_DATA }
// will set cache for (1001 -> OZ002) & set cache for (1001 -> OZ003) 
getUserDevices(1001, ['OZ003']) // { 'OZ003': DEVICE_DATA }
// will get (1001 -> OZ003) from cache
getUserDevices(1001) // { 'OZ001': DEVICE_DATA, 'OZ002': DEVICE_DATA, 'OZ003': DEVICE_DATA }
// will get fully from cache.
getUserDevices(1001, ['OZ004']) // {}
// will figure form cache.
```

🎉 Awesome! These APIs will help us cache almost all our cases.

3. Let's use [/functions](https://jsr.io/@panth977/functions) to make our code design more consistent. This will also make sure your cache has the right schema.

```typescript
const getUsers = FUNCTIONS.AsyncFunction.build({
    input: z.number().array(),
    output: z.record(z.number(), zUSER),
    wrappers: (_params) => [
        CACHE.Wrapper({
            _params,
            getHook: ({ input }) => new CACHE.HOOKS.MultipleObject({
                cache: cache.addPrefix('USERS'),
                ids: input,
            }),
            updateInput: ({ info }) => info.notFound,
            useHook(hook) {
                // NOTE: [useHook] function gets executed once 
                // for this case it is when [getUsers] is being build.
                TablesChanges.USERS.subscribe(
                    (msg) => msg.old 
                        && hook({ input: [msg.old.ID] }).del()
                );
            },
        }),
    ],
    func({ input }) {
        const result = await (...) // do some db call
        const dictResult = (...) // Make sure result is { [userId: number]: UserObject }
        return dictResult;
    }
})
```

This takes care of all our code issues. Take a break, and we'll deal with the `pg_notify` later. 😘

Now, let's tackle the last problem: listening to database changes.

```sql
-- drop the earlier function & trigger
DROP TRIGGER IF EXISTS on_change ON public."USERS";
DROP FUNCTION IF EXISTS notify_change();

-- we will store all the changes to a table
CREATE TABLE public."INTERNAL_CHANGES_V2" (
    "ID" SERIAL PRIMARY KEY,
    "TXID" TEXT NOT NULL DEFAULT txid_current(),
    "TABLE" VARCHAR(255) NOT NULL,
    "EVENT" VARCHAR(255) NOT NULL,
    "OLD" JSONB NOT NULL,
    "NEW" JSONB NOT NULL,
    "CREATED_AT" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_internal_changes_txid_table_created_at
ON public."INTERNAL_CHANGES_V2" ("TXID", "TABLE", "EVENT", "IDENTITY", "CREATED_AT");

-- we will maintain a table about which all changes have already been observed by a subscriber.
CREATE TABLE public."INTERNAL_CHANGES_LISTENED_V2" (
    "INTERNAL_CHANGES_ID" INTEGER NOT NULL REFERENCES public."INTERNAL_CHANGES_V2"("ID") ON DELETE CASCADE,
    "LISTENER_ID" VARCHAR(255),
    PRIMARY KEY ("INTERNAL_CHANGES_ID", "LISTENER_ID") 
);
CREATE INDEX idx_internal_changes_listened
ON public."INTERNAL_CHANGES_LISTENED_V2" ("INTERNAL_CHANGES_ID", "LISTENER_ID");

-- we will delete all the changes that past 20 mins
CREATE OR REPLACE FUNCTION delete_rows_in_internal_changes()
RETURNS trigger
AS $$
BEGIN
    DELETE FROM public."INTERNAL_CHANGES_V2"
    WHERE "CREATED_AT" < NOW() - INTERVAL '20 min';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_delete_rows_internal_changes
AFTER INSERT ON public."INTERNAL_CHANGES_V2"
FOR EACH ROW EXECUTE FUNCTION delete_rows_in_internal_changes();

-- we will delete cleanups, can be avoided by CASCADE DELETE
CREATE FUNCTION delete_rows_in_internal_listened()
RETURNS trigger
AS $$
BEGIN
    DELETE FROM public."INTERNAL_CHANGES_LISTENED_V2"
    WHERE "INTERNAL_CHANGES_ID" = OLD."ID";
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_delete_rows_internal_listened
AFTER DELETE ON public."INTERNAL_CHANGES_V2"
FOR EACH ROW EXECUTE FUNCTION delete_rows_in_internal_listened();

-- on any changes added to the table notify all the clients
CREATE FUNCTION on_internal_change_added()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('internal_change', '1');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_change_added
AFTER INSERT ON public."INTERNAL_CHANGES_V2"
FOR EACH ROW EXECUTE FUNCTION on_internal_change_added();

-- create on change generic function.
CREATE FUNCTION insert_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public."INTERNAL_CHANGES_V2"("TABLE", "EVENT", "OLD", "NEW")
    SELECT TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- add the trigger to all your desired table.
CREATE TRIGGER on_change
AFTER INSERT OR UPDATE OR DELETE ON public."USERS"
FOR EACH ROW EXECUTE FUNCTION insert_changes();
```

```typescript
function tableChangeSchema<S extends z.ZodRawShape>(
  schema: z.ZodObject<S>
) {
  return z.object({
    context: z.instanceof(FUNCTIONS.DefaultContext),
    event: z.enum(['INSERT', 'UPDATE', 'DELETE']),
    old: schema.nullable(),
    new: schema.nullable(),
  });
}
export const TablesChanges = {
  USERS: tableChangeSchema(zUSER)
  // add other tables...
}
const fetchLimit = 50;
const restartSec = 300;
const listenTimeout = 1000 * 30;
// this query will fetch all the new records form "INTERNAL_CHANGES_V2" 
// and add its observation entry in "INTERNAL_CHANGES_LISTENED_V2"
// it will also ignore all the rows added in transaction, but not yet commited. 
const query = `
WITH
SELECTED_CHANGES AS (
  SELECT "ID", "TABLE", "EVENT", "OLD", "NEW"
  FROM public."INTERNAL_CHANGES_V2" C
  WHERE 
    "TXID" NOT IN (
      SELECT backend_xmin::text
      FROM pg_stat_activity
      WHERE state IN ('active', 'idle in transaction') AND backend_xmin::text IS NOT NULL
    ) 
    AND NOT EXISTS (
      SELECT 1 
      FROM public."INTERNAL_CHANGES_LISTENED_V2" 
      WHERE "INTERNAL_CHANGES_ID" = "ID" AND "LISTENER_ID" = {{{SqlStr listenId}}}
    )
    AND "TABLE" IN (${Object.keys(InternalChanges).map(x => `'{x}'`).join(', ')})
  ORDER BY "ID" ASC
  LIMIT ${fetchLimit}
),
ADD_LISTENER AS (
  INSERT INTO public."INTERNAL_CHANGES_LISTENED_V2" ("INTERNAL_CHANGES_ID", "LISTENER_ID")
  SELECT "ID", ?
  FROM SELECTED_CHANGES
)
SELECT "TABLE", "EVENT", "OLD", "NEW" FROM SELECTED_CHANGES;
`;
// this function will constantly observe to pg changes.
export async function pgListenInternalChanges(): Promise<void> {
  console.log('LISTEN PG INTERNAL CHANGES');
  let lastResult: undefined | null | number | void = 1;
  while (typeof lastResult === 'number') {
    // if last observation was 0 rows
    // we will wait for any changes to happen
    if (!lastResult) await listenNewEntry();
    // we will create a [context]
    await FUNCTIONS.DefaultContext.Builder.forTask('Pg-Internal-Changes', async function (context, done) {
      // check & publish the changes.
      lastResult = await publish(context).catch(console.error);
      done();
    });
  }
  console.log('exited publishInternalChanges dew to some error, will start after a while');
  await new Promise((resolve) => setTimeout(resolve, 1000 * restartSec));
  return pgListenInternalChanges();
}
const pool = new pg.Pool({...});
const client = await pool.connect();
async function listenNewEntry() {
  // a promise that resolves on 1 msg received successfully!
  const newEntry = new Promise<any>(async (resolve, reject) => {
    try {
      client.on('notification', resolve);
      client.on('error', reject);
      // start listning!
      await client.query('LISTEN internal_change');
    } catch (err) {
      reject(err);
    }
  });
  newEntry.then(() => console.log('Listen a new Change!'));
  // fallback of some timeout, if no msg was reveived.
  const timeout = TOOLS.delay(listenTimeout);
  // check which one resolves first.
  await Promise.race([newEntry, timeout]);
  // stop listning!
  client.query('UNLISTEN internal_change').catch(console.error);
}
async function publish(context: FUNCTIONS.DefaultContext) {
  // run the query.
  const result = await pool.query(query, CONFIG.env.LISTEN_PG_INTERNAL_CHANGES);
  const jobs: Promise<void>[] = [];
  for (const row of result) {
    // publish the change.
    const promise = TablesChanges[row.TABLE as keyof typeof TablesChanges].publish({
      event: row.EVENT,
      old: row.OLD, 
      new: row.NEW,
      context: context,
    });
    jobs.push(promise);
  }
  // wait for all jobs to complete.
  await Promise.all(jobs);
  // return changes observed.
  return result.length;
}
```

That's it!

Now you know how we clear the cache.
