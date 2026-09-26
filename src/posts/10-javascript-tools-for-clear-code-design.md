---
title: "10 Javascript tools for clear code design"
slug: 10-javascript-tools-for-clear-code-design
date: 2024-12-07
description: "Hey there, developer! You might need some tools to boost your skills, and here are a few to check out: (<…"
tags: [javascript, typescript, tools, event-loop, batch-processing, pubsub]
migratedFrom: https://blogs.whiteloves.in/10-javascript-tools-for-clear-code-design
readingTime: 5
---

Hey there, developer! You might need some tools to boost your skills, and here are a few to check out: (<https://jsr.io/@panth977/tools>)

### Rate limit function invocation

Sometimes you just want to make sure you don't go over the max number of calls to a service. To keep things in check and avoid hitting the rate limit, try using `TOOLS.CreateParallelTaskManager`.

```typescript
const serviceToSq = TOOLS.CreateParallelTaskManager({
    maxParallelExecution: 2,
    async implementation(x) {
        console.log('start', x);
        await TOOLS.delay(x * 1000);
        console.log('end', x);
        return x ** 2;
    },
});
serviceToSq(5);
serviceToSq(2);
serviceToSq(4);
serviceToSq(10);
serviceToSq(9);
/** CONSOLE **/
(00 sec) start 5
(00 sec) start 2
(02 sec) end 2
(02 sec) start 4
(05 sec) end 5
(05 sec) start 10
(06 sec) end 4
(06 sec) start 9
(15 sec) end 10
(15 sec) end 9
```

### Batch multiple Invocations

Maybe you've got a speedy API call for the backend that handles multiple operations in one go, but you don't want to complicate your development process. In that case, try using `TOOLS.CreateBatchProcessor`.

```typescript
const RedisMethods = {
    get: TOOLS.CreateBatchProcessor<string, string | null>({
        delayInMs: 0,
        async implementation(args) {
            console.log('<0>', args);
            return await redis.mget(args);
        },
    }),
    getAfter10ms: TOOLS.CreateBatchProcessor<string, string | null>({
        delayInMs: 10,
        async implementation(args) {
            console.log('<10>', args);
            return await redis.mget(args);
        },
    }),

}
RedisMethods.get('key1');
RedisMethods.get('key2');
delay(12).then(() => RedisMethods.get('key3'));
delay(12).then(() => RedisMethods.get('key4'));
RedisMethods.getAfter10ms('key5');
RedisMethods.getAfter10ms('key6');
delay(5).then(() => RedisMethods.getAfter10ms('key7'));
delay(12).then(() => RedisMethods.getAfter10ms('key8'));

/** CONSOLE **/
(00 ms) <0> ['key1', 'key2']
(10 ms) <0> ['key3', 'key4']
(10 ms) <10> ['key5', 'key6', 'key7']
(22 ms) <10> ['key8']
```

### Internal PubSub

We've all seen code where we pile on tons of features after creating a user. Sure, you could set up a PubSub, but that takes time. Unless you're handling something big, you can just do it on the API server. No need to set up a separate background worker service and build a whole PubSub messaging system. Try using `TOOLS.CreatePubsub` to keep your code nice and clear.

```typescript
const userChanges = TOOLS.CreatePubsub(z.object({
    event: z.enum(['CREATE', 'UPDATE', 'DELETE']),
    data: z.object({
        id: z.number().int(),
        email: z.string().email(),
        name: z.string().max(225),
        ...
    }),
}));
function createUser(userData) {
    const rows = pg.query(`INSERT INTO users VALUES (...) RETURNING *`);
    await userChanges.publish({ event: 'CREATE', data: rows[0] });
}
userChanges.subscribe(function ({ event, data }) {
    if (event === 'CREATE') {
        // send welcome email
    } else if (event === 'DELETE') {
        // send good bye email
    }
});
userChanges.subscribe(function () {
    if (event === 'CREATE') {
        // setup records
    } else if (event === 'DELETE') {
        // archive records
    }
});
```

### Data Structures One To One Mapping

You often deal with databases that return rows, and you probably want a Dictionary structure to make life easier. We all know how annoying it is to use `.find` on rows every single time. Give `TOOLS.oneToOneMapping` a shot. We also have `TOOLS.oneToManyMapping` and `TOOLS.oneToOneToOneMapping`.

```typescript
function getUsers(userIds) {
    const rows = pg.query(`SELECT * FROM users WHERE id IN (...)`)
    const users = TOOLS.oneToOneMapping({ rows, keyPath: "id" });
    return users;
}
const users = getUsers([userId1, userId2]);
const user1 = users[userId1];
const user2 = users[userId2];
```

### Data Structures One To Many Mapping

```typescript
function getUsersFriends(userIds) {
    const rows = pg.query(`
SELECT f.* 
FROM users u 
JOIN friends f ON f.userId = u.id
WHERE u.id IN (...)
    `)
    const friends = TOOLS.oneToManyMapping({ rows, keyPath: "id" });
    return friends;
}
const friends = getUsersFriends([userId1, userId2]);
const friendsOfUser1 = friends[userId1];
const friendsOfUser2 = friends[userId2];
```

### Data Structures One To One To Many Mapping

I honestly doubt you'll ever need this monster! But hey, I've got it here just in case. (NOTE: If you find yourself needing this in more than one place, you really should rethink your code architecture.)

### Encode Connection String

Have you checked out `env.PG_HOST`, `env.PG_PORT`, `env.PG_DB`, `env.PG_USER`, `env.PG_PASS`? What if we could simplify all these different environment variables into a single `env.PG_CONNECTION_STRING`? That would be awesome! Here are the `TOOLS.encodeConnectionString` encoder and `TOOLS.decodeConnectionString` decoder for that.

```typescript
MY_CONNECTION_STRING: TOOLS.encodeConnectionString({
    protocol: 'myprotocol',
    user: 'myuser',
    pass: 'mypass',
    host: 'myhost',
    port: 1234, // optional
    db: 'mydb', // optional
    params: { //optional
      log: 'someval',
      ssl: 'true',
      max: '20',
    },
})
// myprotocol://myuser:mypass@myhost:1234/mydb?log=someval&ssl=true&max=20
MY_CONNECTION_OPTIONS: TOOLS.decodeConnectionString(MY_CONNECTION_STRING)
```

No worries, `user`, `pass`, and `host` are all encoded with `encodeURIComponent` and decoded with `decodeURIComponent`. Plus, `params` are handled with `URLSearchParams`, making life easier for everyone!

### Sort

A quick sort function for an array to sort based on some deeply nested field, just the way you need it.

```typescript
const myArray: {
    id: number;
    age: number; // int values only
    stats: {
        score: number;
        goals: number;
        ...
    };
    ...
}[] = [...];
const sortedOnScore = TOOLS.sortList({
    rows: myArray,
    mode: 'ASC',
    keyPath: 'stats.score',
});
const sortedOnAge = TOOLS.sortList({
    rows: myArray,
    mode: 'ASC',
    keyPath: 'age',
    algorithm: 'bucket',
});
```

### Dynamic destructuring

You might need to grab a bunch of data from a SQL select query and turn it into a JSON for the frontend. Here's how you can do it easily using `TOOLS.destructure`

```typescript
const rows = await pg.query(`
    SELECT 
        v.id            "videoId",
        c.email         "creator.email",
        c.name          "creator.name",
        c.handle        "creator.handle",
        v.url           "video.url",
        v.share_id      "video.share_id",
        v.description   "meta.description"
        ...
    FROM ...
    JOIN ...
    WHERE ...
`);
const videosJson = TOOLS.destructure({ rows });
type Video = {
    videoId: number;
    creator: {
        email: string;
        name: string;
        handle: string;
    };
    video: {
        url: string; 
        share_id: string;
        description: string;
    };
    ...
}
return videosJson as Video[];
```

### All Promise Stats

Let's say you're running a bunch of promises at the same time, and this is for a worker API. You probably want to track some stats to see which jobs were successful and which ones weren't. Here's how you can do it using `TOOLS.SettleAllPromise`

```typescript
const jobs: Record<string, Promise<any>> = {};
for (const cluster of clusters) {
    jobs[cluster.id] = runCluster(cluster);
}
const stats = TOOLS.SettleAllPromise(jobs);
stats.errors; // = Record<string, errors>
stats.results; // = Record<string, errors>
stats.stats; // {total, status, error?, errorRate?}
```

### Delay

You've got a super long sync process happening, and if you didn't know, JavaScript runs on a single thread. Unless you're using workers, you're stuck with just one core, and none of your incoming requests will get processed because that one thread is busy with a sync task.

If you're familiar with the JavaScript event loop, you know there's a way out. Just figure out your checkpoints where you can let the main thread handle other tasks and then come back to finish the rest of the process. `TOOLS.delay` comes to rescue.

```typescript
function heavyTask1() {
    //
}
function heavyTask2() {
    //
}
function heavyTask3() {
    //
}
function typicalImplementation() {
    heavyTask1();
    heavyTask2();
    heavyTask3();
}
async function betterImplementation() {
    heavyTask1();
    // complete all the other task from task que & event que
    await TOOLS.delay();
    heavyTask2();
    // complete all the other task from task que & event que
    // if not already 250ms completed, wait of it to complete!
    await TOOLS.delay(250);
    heavyTask3();
}
```

---

Check out <https://jsr.io/@panth977> to make your project clearly coded instead of that clean coding nonsense...
