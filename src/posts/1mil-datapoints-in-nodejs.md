---
title: "1 million+ data points in Node.js: a video series"
slug: 1mil-datapoints-in-nodejs
date: 2025-07-22
description: "Four short videos on making Node.js handle millions of data points without falling over: typed arrays and ArrayBuffers for the heavy lifting, and a small interface that hides the complexity."
tags: [node-js, performance, typed-arrays, arraybuffer, video]
video: https://www.youtube.com/playlist?list=PLeXF8QGCGNK7MrBOweoDSd6E1L_7upSPV
readingTime: 4
cover: /assets/blog/covers/1mil-datapoints-in-nodejs.png
---

<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/videoseries?list=PLeXF8QGCGNK7MrBOweoDSd6E1L_7upSPV" title="1 million+ data points in Node.js" loading="lazy" allowfullscreen allow="accelerometer; encrypted-media; picture-in-picture"></iframe></div>

At Oizom our backend was crashing while handling millions of data points, all because of how JavaScript stores numbers by default. This series is the fix, recorded as I built it.

The goal: make Node.js functional and fast for millions of data points, using ArrayBuffers and typed arrays to do the heavy lifting, and hide all of that behind a simple interface so the rest of the codebase never has to think about it.

## The four parts

1. [Part 1](https://www.youtube.com/watch?v=_J4JegTj_gk): the problem, and a first look at typed arrays. Where the memory goes when you keep a million numbers in plain arrays, and what changes when you don't.
2. [Part 2](https://www.youtube.com/watch?v=285Ephqcn2w): building on ArrayBuffers. Views, offsets, and keeping the data contiguous.
3. [Part 3](https://www.youtube.com/watch?v=KCE2WB_0_LI): the interface. Wrapping the buffers so callers get ordinary-looking objects back.
4. [Part 4](https://www.youtube.com/watch?v=TCb4UlAuWRQ): putting it together and measuring. The 400% number, and what it cost in code.

## Related reading

- [How I generated heatmaps 100x faster](/blog/how-i-generated-heatmaps-100x-faster): same instinct, applied to a grid of points.
- [How caching boosted performance for a top air-quality company](/blog/how-caching-boosted-performance-for-a-top-air-quality-monitoring-company): the other half of the same backend story.
