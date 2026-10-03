---
title: "$402 on one ticket: cost per turn in headless Claude Code"
slug: cost-per-turn-headless-claude-code
date: 2026-09-28
updated: 2026-09-28
description: "One ticket reached $402 over nine headless Claude Code runs and nothing in the app said so. The catch when you fix that: total_cost_usd is cumulative across --resume, so run 8 made one API call with zero output tokens and reported the same $392.83 as run 7."
tags: [claude-code, ai-agents, llm, finops]
readingTime: 5
cover: /assets/blog/covers/cost-per-turn-headless-claude-code.png
ship: 2026-09-28
devto_tags: [ai, claudecode, llm, finops]
devto_url: https://dev.to/panthpatel/402-on-one-ticket-cost-per-turn-in-headless-claude-code-4khe
devto_id: 4764185
---

One ticket on my board reached $402 over nine agent runs, and nothing in the app said so. Putting the cost on every turn has one catch: Claude Code's `total_cost_usd` is cumulative across `--resume`. Run 8 made one API call with zero output tokens and reported the same $392.83 as run 7.

I'm Panth, and I lead the software team at Oizom. This is from [ticket-tracker](https://github.com/Panth977/ticket-tracker), the tracker I open-sourced, where AI agents are board members and a small orchestrator turns each ticket into a headless Claude Code session.

## How a ticket becomes a session

The orchestrator (`workspaces/lib/orch.mjs`, about 600 lines, zero dependencies) runs one headless Claude Code session per ticket. Each time the agent has something to do, it starts `claude -p` once: a fresh ticket, rework, an answer to a question, a new comment, or carrying on by itself. That is one turn. The process exits, and the last line of its `stream-json` output is a result line.

The first turn creates the session with `--session-id`. Every later turn on the same ticket continues it:

```js
const resume = e.session_id && fs.existsSync(sessionFile(e.session_id));
const sessionId = resume ? e.session_id : randomUUID();

const args = [
  '-p', prompt,
  '--output-format', 'stream-json', '--verbose',
  ...(resume ? ['--resume', sessionId] : ['--session-id', sessionId]),
  // ...
];
```

The session keeps its history, so the agent picks up where it stopped. That is the point of resuming. It is also why the cost number misleads.

## The trap

The result line carries `total_cost_usd`, `usage` (input, output and cache tokens), `num_turns` and `modelUsage`. Before the change, the orchestrator already read `total_cost_usd` off every result line and wrote it to a local log. Nothing in the app showed it.

Putting the number on the ticket looks like a one-liner: post `total_cost_usd` when the run ends. It isn't, because that field is the session's running total, not the run's. Ticket OCZ-5 shows it plainly. Run 8 did almost nothing, one API call and zero output tokens, and reported $392.83. So did run 7.

Read naively, that line says run 8 cost $392.83. Add those lines up and every earlier run is counted again on each later turn.

## The fix: keep the last total, post the difference

The orchestrator keeps per-ticket state in a JSON file. Two fields handle cost: `session_usd`, the last total that ticket's session reported, and `session_usage`, the last token counts. When a turn ends:

```js
const prevUsd = e.session_usd ?? 0;
const costUsd = Math.max(0, r.total_cost_usd - prevUsd);

const now = {
  input: u.input_tokens ?? 0,
  output: u.output_tokens ?? 0,
  cache_read: u.cache_read_input_tokens ?? 0,
  cache_write: u.cache_creation_input_tokens ?? 0,
};
const prev = e.session_usage ?? { input: 0, output: 0, cache_read: 0, cache_write: 0 };
const usage = Object.fromEntries(Object.keys(now).map((k) => [k, Math.max(0, now[k] - prev[k])]));

e.session_usd = r.total_cost_usd;
e.session_usage = now;
saveState();
```

The turn's cost is the new total minus the old one, clamped at zero. The token counts get the same treatment. Then the new total is saved for the next turn.

Three cases decide whether the numbers stay honest:

| Case | What the orchestrator does |
|---|---|
| New session (first turn, or the session file is gone) | Starts a fresh session id and resets `session_usd` to 0 before the run |
| Resumed session | Subtracts the last reported total |
| Run dies without a result line | Posts no receipt. Its spend shows up in the next turn's difference, which is still correct: it was spent on this ticket |

The resume check matters more than it looks. The orchestrator only resumes if the session's `.jsonl` file still exists under `~/.claude/projects/`. If it doesn't, the turn starts a new session, and a new session counts from zero. Subtracting the old total from it would wipe that turn's cost.

## Where the number goes

Money spent on a ticket is a fact about the ticket, so it goes where the ticket's other facts go. When a run ends, the orchestrator posts one message on the ticket, the turn receipt. In the design doc's example, the body reads:

```plaintext
Turn 3 · review · $1.24 · 12 min
```

Beside the text it carries a `run` field: the turn number, the outcome (`review`, `waiting`, `blocked`, `failed`, `stopped` or `timeout`), `cost_usd` for this turn, `session_usd` as Claude Code reported it, duration, API calls, model and the token deltas. Both numbers are kept on purpose. The turn cost is what the person reading the thread cares about. The session total is what you check the arithmetic against.

The server stores the receipt on the message and, in the same write, adds it to the ticket's cost, the board's cost and the day's row the Analytics view draws. So the card shows the spend next to its other signals, and the board shows cost per day and which tickets cost the most.

Only the orchestrator posts receipts. The app's comment box never does. Each receipt goes out with an `Idempotency-Key` made from the ticket and the run number, so a retried request doesn't count a turn twice.

## What changed

Cost per turn in the thread is a deliberate design choice, not a debug feature. The person who asked for the work sees what each turn of it cost, in the same thread where they asked.

The lesson for anyone running Claude Code headless: treat `total_cost_usd` as a meter reading, not a bill. Store the last reading per session and bill the difference.

If you run Claude Code from scripts or CI, where does the cost of a single run end up for you, and does it account for `--resume`?
