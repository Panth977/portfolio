---
title: "1 million+ data points in Node.js without the crash"
slug: 1mil-datapoints-in-nodejs
date: 2025-07-22
updated: 2026-09-26
description: "Our backend kept running out of memory on a 2 GB box while handling millions of sensor readings as plain JSON objects. Here is the typed-array table I built instead, why the first version was 8x slower than JSON, and what made the final one faster."
tags: [node-js, performance, typed-arrays, arraybuffer, memory, video]
video: https://www.youtube.com/playlist?list=PLeXF8QGCGNK7MrBOweoDSd6E1L_7upSPV
readingTime: 11
cover: /assets/blog/covers/1mil-datapoints-in-nodejs.png
---

<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/videoseries?list=PLeXF8QGCGNK7MrBOweoDSd6E1L_7upSPV" title="1 million+ data points in Node.js" loading="lazy" allowfullscreen allow="accelerometer; encrypted-media; picture-in-picture"></iframe></div>

This is the written version of a four-part screen recording I made while building it. The videos are above if you would rather watch me get it wrong first. The short version: I replaced a million JavaScript objects with two flat typed arrays and a small class on top, the first version was correct and painfully slow, and the second version was faster than JSON and never ran out of memory again.

## What a data point looks like for us

I work at an air-quality monitoring company. A single reading from a device looks roughly like this:

```typescript
type DataPoint = {
  device: string;
  t: number;                       // epoch seconds
  d: Record<string, number>;       // decimals: co2, o2, pm25, temperature …
  s: Record<string, string>;       // strings: location, firmware, tag …
};
```

`d` holds the gas concentrations and other numbers. `s` holds whatever labels the device or the user attached. Any key can be present or absent on any reading. Multiply that by thousands of devices reporting every minute and a report query can easily touch a million of these.

The backend ran on a DigitalOcean droplet with 2 GB of RAM. It kept dying with out-of-memory errors on exactly those queries.

## Why a million objects is the problem

Three things happen when you hold a million of those objects in V8, and none of them are visible in the code.

**Every property access is pointer chasing.** `points[i].d.co2` is not one memory read. The array holds a reference to the point object, which holds a reference to the `d` object, which is a hash map that has to hash the string `"co2"`, look up the slot, resolve any collision, and then hand you the number. In C you would lay the struct out once and the compiler would know the offset of `co2` before the program ran. In JavaScript nothing is laid out; everything is a reference to somewhere else.

**Every object is a hash map.** JavaScript has one data structure, the array, and builds everything else on top of it. An object with ten keys is an array of buckets plus the hashing on every access. A million objects with ten keys each is ten million hashed lookups for one pass over the data.

**Every object is garbage.** Each `{}` is a separate allocation the garbage collector has to track. Create a million of them per request and the collector spends more time than your code does. And the numbers themselves are boxed doubles scattered across the heap, so the working set is far larger than the data.

So the fix is not "optimize the loop". The fix is to stop creating objects.

## The idea: treat the data as an image

Put the timestamps on the Y axis and the gases on the X axis and the readings are a grid. Some cells are empty because that device did not report that gas at that time. That is exactly what an image is: a rectangle of numbers, stored in one contiguous array, addressed by `row * width + column`.

```
            co2    o2    pm25   temp
t1        [ 412   20.9   35.2   26.1 ]
t2        [ 415    –     36.0   26.3 ]
t3        [  –    20.8   34.1    –   ]
```

So instead of an array of objects, I keep:

- one `Float64Array` for all the decimal values, `times.length * gases.length` long
- one `Int32Array` for the string values, which holds an index into a dictionary of unique strings, because the labels repeat almost every row and there is no reason to store `"Bangalore"` a million times
- three small arrays for the axes: the timestamps, the gas names, the label names

A reserved value marks an empty cell. Time `0` means an unused row; an empty string means an unused column.

No objects per reading. One allocation for the whole table. Reading `co2` at row `i` is `values[i * gases.length + gasIndex.co2]`, which is the C-style offset arithmetic JavaScript normally refuses to give you.

## The interface on top

The buffers are ugly to use directly, so everything goes through one class. This is the surface from the first video, and it barely changed later:

```typescript
class DataPointTable {
  static create(rows: number, gases: number, labels: number): DataPointTable;
  static fromJSON(points: DataPoint[]): DataPointTable;
  static fromBuffer(buf: ArrayBuffer): DataPointTable;

  // axes
  times(order?: 'asc' | 'desc'): Iterable<number>;
  gases(): Iterable<string>;
  labels(): Iterable<string>;
  timeIndex(t: number): number;         // -1 if absent
  gasIndex(name: string): number;
  addTime(t: number): number;           // returns the row index
  addGas(name: string): number;
  removeTime(t: number): void;

  // cells
  get(ti: number, gi: number): number | undefined;
  set(ti: number, gi: number, v: number): void;
  row(ti: number, onlyExisting?: boolean): Iterable<[gas: string, v: number]>;

  // whole table
  toJSON(): DataPoint[];
  toBuffer(): ArrayBuffer;              // for sending to the browser
  compress(): DataPointTable;           // drop unused rows and columns
  stats(): { bytes: number; rows: number; used: number };
}
```

The point of the class is that nobody else in the codebase has to know there are buffers underneath. A report generator asks for a row and gets an iterable of `[gas, value]` pairs. It never sees `Float64Array`.

## Version one: correct, and eight times slower than JSON

The first implementation kept the rows sorted by timestamp, descending. That felt right; queries always want time order. It meant `addTime` had to find where the new row belongs, find the nearest free slot on either side, and shift every row in between by one. Adding a gas column was worse: every row has to move to make room for the new cell, so the copy runs from the back of the buffer to the front, zeroing the new cells as it goes so nothing overlaps.

I over-allocated to soften this: five spare rows and five spare columns at a time, so a burst of inserts does not trigger a reallocation each. And when the table is full, allocate a bigger one, copy, and continue. All standard.

It worked. Every function test passed, `toJSON(fromJSON(x))` round-tripped, `compress()` reclaimed the spare cells. Then I measured loading a million points with thirty columns each. It never ran out of memory, which JSON always did at that size. It was also eight times slower than parsing the JSON. Unusable.

## What was actually slow

Not the typed arrays. The shifting.

Look at what the backend does with this table. It loads rows from the database, maybe runs one or two operations, then either sends the data to the browser or feeds it into a report. It almost never inserts a row into the middle of an existing table. So I was paying for ordered insertion on every load, and getting nothing for it.

Two smaller things compounded it. Finding a column by name was a linear scan of the gas array on every cell write, so a hash map for `name → column index` had to come back, but only for the axes, which have thirty entries, not a million. And a binary search on the sorted timestamps, which I added hoping it would help, did not, because the search was never the cost.

## Version two: stop maintaining order

The rewrite dropped the one assumption that hurt. Rows are no longer kept sorted. Instead the table keeps two free lists:

```typescript
private freeRows: number[];      // indexes of rows with t === 0
private freeCols: number[];      // indexes of columns with name === ''
private rowOf = new Map<number, number>();   // timestamp → row index
private colOf = new Map<string, number>();   // gas name → column index
```

`addTime` becomes: if the timestamp is already known, return its row; otherwise pop a free row, record it in the map, done. No search, no shift. If the free list is empty, allocate a bigger table, copy once, push the new rows onto the free list, and carry on. `removeTime` is the reverse: zero the row and push its index back onto the free list. Not a single loop in the hot path.

And because a query knows how many rows it will return before it reads them, the table is created at the right size up front. In practice the "allocate bigger and copy" branch almost never runs.

Order comes back only where it is read. `times('desc')` collects the live timestamps, sorts them once, and yields. That is one sort per query instead of one shift per insert.

With that, loading a million points was faster than `JSON.parse` on the equivalent array, and the memory graph stayed flat where the JSON version used to fall over. The number in the video description, roughly a 400% gain, is the load-and-serve path measured against the JSON version on the same box.

## Skipping JSON entirely

The last piece is the reason the class has `toBuffer` and `fromBuffer`. If the whole exercise is to stop building a million objects, then serializing them to JSON to send to the browser defeats it. So the table serializes itself as its own buffers: a small header with the dimensions and the axis arrays, then the two value buffers as they already are in memory.

On the server the database rows go straight into the table without a `DataPoint[]` ever existing. On the way to the browser the buffer goes out as is (base64 where it has to cross a text boundary), and the frontend rebuilds the same class from it. `fromJSON` and `toJSON` are still there for tests and for the odd tool, but the production path never touches them.

## What I would tell past me

- The win came from removing allocations, not from typed arrays as such. Typed arrays are just the only way JavaScript lets you allocate a million numbers in one go.
- Do not maintain an invariant the read path does not need. Sorted rows cost me a full version.
- Keep the buffers behind one class. Every place in the code that touched `Float64Array` directly would have been a place the second rewrite had to visit.
- Measure against the thing you are replacing, on the same box. "Never runs out of memory" is not a win if it is eight times slower.

I had Claude write the function and performance tests for the second version; that is the part of the fourth video where the round-trip comparison catches a bug in `compress()` that I would not have found by hand.

## Related reading

- [How I generated heatmaps 100x faster](/blog/how-i-generated-heatmaps-100x-faster): the same instinct applied to a 1 km grid, which is where the "look at it as an image" idea came from.
- [How caching boosted performance for a top air-quality company](/blog/how-caching-boosted-performance-for-a-top-air-quality-monitoring-company): the other half of the same backend.
- [The hidden cost of Promise in Node.js](/blog/the-hidden-cost-of-promise-in-nodejs): another thing that is not free even when it looks free.
