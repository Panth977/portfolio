---
title: "52 commands, 3 doors: the app, REST and MCP share one write path"
slug: writes-through-commands
date: 2026-10-03
updated: 2026-10-03
description: "My ticket tracker has three ways in: the app, a REST API and an MCP server. All three call the same 52 commands, and Firestore rules deny every other write. An agent with a token can do nothing a person couldn't, and the price is 150 to 400 ms a write."
tags: [firebase, mcp, architecture, open-source]
readingTime: 5
cover: /assets/blog/covers/writes-through-commands.png
ship: 2026-10-03
devto_tags: [webdev, firebase, mcp, architecture]
devto_url: https://dev.to/panthpatel/52-commands-3-doors-the-app-rest-and-mcp-share-one-write-path-9je
devto_id: 4792117
---

My ticket tracker has three ways in: the web app, a REST API and an MCP server. Every write from all three goes through the same 52 commands, and the Firestore rules deny everything else. It costs 150 to 400 ms a write where a direct client write takes about 50 ms.

I'm Panth, and I lead the software team at Oizom. The tracker is [ticket-tracker](https://github.com/Panth977/ticket-tracker), my open-source board where coding agents work tickets next to people. This is the first decision in its plan, and the one that would cost the most to reverse.

## The Firebase default I turned down

The usual Firebase shape is that clients write Firestore directly, security rules decide who may, and triggers do the side effects.

I kept half of it. Clients still read Firestore directly. Every write is a `POST /api/{command}`, and the rules deny writes except for a person's own pointers.

Two things decided it.

Nearly every write has a second document to keep in step: the key counter, the activity log, the other end of a link, notifications, webhooks.

And rules can't carry the permissions. Try writing this one as a rule somebody can maintain: a commenter may change a ticket's stage only between the stages in their grant, and only on tickets assigned to them.

## The reason that mattered more

REST and MCP need the same logic anyway. With client writes, every rule would exist twice, once in `firestore.rules` and once in the API, and the two would drift.

So a command is defined once, as a spec in the shared package:

```ts
export const messagePost = defineCommand({
  name: 'messagePost',
  scopes: ['comments:write'],
  permission: "can(comment); ticket state == 'active'",
  errors: ['forbidden', 'not_found', 'conflict', 'too_large'],
  req: z.object({ /* ticket, body, replyTo, attachments … */ }),
  res: OkResSchema,
});
```

(The `req` is shortened here.) The registry holds 52 of these. The backend parses requests with the spec, and the frontend's `command(name, input)` is typed by the same map.

## Three doors, one runner

| Door | Who comes in | How it reaches a command |
|---|---|---|
| `/api/{command}` | the app, with a sign-in token | the body is the command's request |
| `/v1` REST | an orchestrator or agent, with a board token or OAuth | route, scope gate, names to ids, then the same command |
| `/mcp` | Claude and other MCP clients | each tool parses its input, then calls the same commands |

All three end in one runner, and it does the same things in the same order:

```
registry lookup → scope narrowing → parse the request → idempotency claim
  → handler → parse the response → bump the board's revision → answer
```

The doors are routes in one HTTPS function. The alternative was a function per endpoint, and sixty functions means sixty cold starts, sixty deploy units and sixty minimum-instance bills. One service stays warm on the app's traffic alone, so REST and MCP calls land on warm instances.

## Agents can do nothing people can't

A token only narrows. What it may do is its scopes intersected with `can()` for the principal it acts as, a person or one of their agents. The scope check at the door only answers early. The command decides.

A command that lists no scopes is app-only, and no token reaches it. There is no API-only write path that could drift from the app. And there is deliberately no MCP tool that deletes a ticket.

Every command also runs with who is acting and through which door (`app`, `api` or `mcp`), so a change made with an agent's token is attributed to that agent and to the token.

## What the choke point bought later

Because every write passes through one runner, it became the place to announce that something on a board changed. After a command succeeds, the runner makes one small Realtime Database write to the board's revision. The app and the SDK listen to that node and ask for the delta, not poll for it. A replayed idempotent request bumps nothing, because nothing changed.

That came later, after I measured the bill and found the orchestrator's polling was 88% of all requests. It went into one place because the place existed.

## The cost

A write takes about 150 to 400 ms, not about 50. Optimistic updates hide it in the app. Cold starts are covered by `minInstances: 1` on the function in production.

That is the whole price: a slower write, hidden by optimistic updates, for one copy of every rule.

If your app has a UI, an API and an MCP server, do all three share one write path, or does each one have its own copy of the rules?
