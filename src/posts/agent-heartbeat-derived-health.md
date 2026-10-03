---
title: "Agent health from a 60-second heartbeat: derived, never stored"
slug: agent-heartbeat-derived-health
date: 2026-10-02
updated: 2026-10-02
description: "In my ticket tracker an agent's status is never stored as alive or dead. The orchestrator beats once a minute, and every screen works out the dot from the age of the last beat, so a crashed agent turns red with no write from anyone."
tags: [ai-agents, firebase, architecture, open-source]
readingTime: 5
cover: /assets/blog/covers/agent-heartbeat-derived-health.png
ship: 2026-10-02
devto_tags: [ai, webdev, firebase, agents]
devto_url: https://dev.to/panthpatel/agent-health-from-a-60-second-heartbeat-derived-never-stored-4n1f
devto_id: 4787986
---

A coding agent that crashes can't report that it crashed. In my ticket tracker, the orchestrator sends a heartbeat every 60 seconds while an agent works, and a "working" status whose last beat is more than 75 seconds old shows as red on every screen, with no write from anyone.

I'm Panth, and I lead the software team at Oizom. The tracker is [ticket-tracker](https://github.com/Panth977/ticket-tracker), my open-source board where each ticket runs its own headless Claude Code session. This post is about one small piece of it: how the board knows an agent is alive.

## The status that lies

The obvious design stores a status on the ticket: `working`, then `done`. The agent writes `working` when it starts and `done` when it finishes.

If the process dies in between, nothing writes anything. The ticket says `working` for as long as nobody looks into it. A stored status is only as true as the last thing that managed to write it, and a dead process writes nothing.

## What the beat carries

The orchestrator sends the beat, not the agent. It is one call:

```
POST /v1/heartbeat
{ ticket?: KEY,            // omit = an agent-level beat, with no ticket
  state: 'working' | 'idle' | 'done' | 'error',
  message?: string,        // "Running tests (3/12)", up to 200 characters
  progress?: number }      // 0 to 1
```

It goes out every minute while the agent works and once more when the work ends. The message comes from the agent's task list: the orchestrator reads the list on every fifth beat and repeats the last message on the four in between.

A beat never touches the ticket document. It has its own small record per agent and ticket, so a beat a minute doesn't retrigger the ticket's search indexing or re-render everything that listens to the ticket.

## Health is computed where it is read

The stored state has four values. The health on screen has six, and the extra ones come from the clock:

```ts
export const HEARTBEAT_INTERVAL_MS = 60_000;
export const HEARTBEAT_STALE_MS = 75_000;

export function deriveAgentHealth(status, now, staleAfterMs = HEARTBEAT_STALE_MS) {
  if (!status) return 'none';
  if (status.state !== 'working') return status.state;
  return now - status.lastBeatAt > staleAfterMs ? 'stale' : 'working';
}
```

75 seconds is one missed beat plus a little slack.

| Stored state | Last beat | Shown as |
|---|---|---|
| working | 75 s ago or less | green pulsing dot, "Working · Running tests (3/12)" |
| working | more than 75 s ago | red, "No signal for 3 min" |
| idle | any | yellow, "Idle · waiting for an answer" |
| done | any | grey, "Finished · 10:42" |
| error | any | red, "Stopped with an error" and the message |
| none yet | | nothing |

Only `working` can go stale. Idle, done and error are statements that stay true until the next beat. `working` is a claim that has to be renewed.

This one function is in the shared package. The card, the ticket header, the People & roles page and the Agents page all call it, so they can't disagree about an agent. When several agents are on one ticket, the card shows the loudest: error first, then no signal, then working, idle and finished.

## The 15-second clock

A derived value only changes when something recomputes it. If no new beat arrives, no data arrives either, so the screen needs its own clock:

```ts
export const HEALTH_TICK_MS = 15_000;

export const healthClock = readable(Date.now(), (set) => {
  const id = setInterval(() => set(Date.now()), HEALTH_TICK_MS);
  return () => clearInterval(id);
});
```

15 seconds is a quarter of the beat interval, so the longest a dot can be wrong is 15 seconds. It is one interval shared by every dot on screen, and it stops when the last subscriber goes.

## What it cost, and what I changed

The first version kept each beat stream as a Firestore document. I measured the project's bill from 23 to 26 September 2026 and the heartbeat was on it twice:

- 1,440 writes per agent per day, each a Firestore transaction through a function, followed by one read in every open tab.
- A scheduled sweep that ran every minute to notice silence: 4,261 runs in three days.

Two changes came out of that.

Beats moved to the Realtime Database, which bills bandwidth and not operations. A beat is now about 100 bytes. The shape everything above the database reads stayed the same, so no screen changed.

The sweep stopped looking for silence. Noticing silence never needed a server, because staleness is `now - lastBeatAt` wherever the beat is read. The sweep now runs every three minutes and does the one thing that does need a server: if a working agent has been silent for five minutes, it tells the agent's owner, once per silence, because nobody may have the board open. The next beat re-arms it.

## If you are building one

Store the facts: the last state the agent claimed and when it claimed it. Derive the judgement, alive or not, at read time, in one function every screen shares. Then give the screen a clock, or the judgement never updates.

How does your agent setup tell you a run died: a timeout on the server, or something you work out from the last thing it said?
