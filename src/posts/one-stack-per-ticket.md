---
title: "One stack per ticket: why our coding agent works on a DB copy"
slug: one-stack-per-ticket
date: 2026-09-30
updated: 2026-09-30
description: "Every ticket on our board gets a branch in every repo, its own services, a copy of the dev database and a preview URL. It started as a fix for branch mistakes. It is also what keeps a coding agent's worst case small."
tags: [ai-agents, devops, architecture, sqlite]
readingTime: 4
cover: /assets/blog/covers/one-stack-per-ticket.png
ship: 2026-09-30
devto_tags: [ai, devops, architecture, sqlite]
devto_url: https://dev.to/panthpatel/one-stack-per-ticket-why-our-coding-agent-works-on-a-db-copy-1d6m
devto_id: 4778116
---

Every ticket on our board gets its own stack: a branch in every repo, its own services, its own copy of the dev database and its own preview URL. We built it because coding agents made my developers faster, and the mistakes moved out of the code and into the branches around it.

I'm Panth, and I lead the software team at Oizom, where Envizom is the platform. This is why our agent pipeline isolates per ticket, and what the isolation buys beyond running tasks in parallel.

## Where the mistakes were

With an agent, one developer can keep three tasks in flight. That holds while all three go into the same branch and the same release. Once they are due in three different releases, the developer juggles repos and branches and has to remember which change belongs to which PR.

The development was usually fine. The mistakes were a change on the wrong branch, or a fix that only worked on one machine. As agents got faster I saw more "works on my machine" on my team, and client expectations kept going up at the same time.

What was missing was a sandbox you could fork for one task and turn into a PR when it was done.

## What a ticket gets

When a developer drags a ticket to Approved, orch, our orchestrator, provisions a workspace for it:

| Part | What the ticket gets |
|---|---|
| Code | a fresh branch in every repo, named after the ticket |
| Services | its own backend, drivers, simulator and frontend |
| Data | a copy of the dev database |
| Access | a private preview URL, with an HTTPS certificate issued on demand |

An agent does the work inside that workspace. The developer talks to it only through the ticket thread, tests the preview, and drags the ticket to Git Push when it is right. Until then, nothing the ticket does reaches the shared dev branch.

## Isolation is the safety decision

A stack per ticket looks like a way to run things in parallel. That is half of it. The other half is safety.

An agent that runs a bad migration or deletes the wrong rows does it to the ticket's copy of the database. An agent that breaks the backend breaks the ticket's backend. Nobody else's work is touched, because nobody else's work is in that box.

The shared environment is reached only at Git Push, and that step is a script, not the agent. Orch commits the ticket branches, merges dev into them, opens and merges the PRs, waits for CI, rolls the new images onto the dev VM and runs health checks. If the VM is unhealthy afterwards, orch rolls it back to the previous images, reverts the merges and tells the thread what happened.

All of it stops at dev. Production goes through a separate path where people make the call.

## Independent timelines

The second thing isolation gives us is time. A ticket can sit in QA for a week while three others ship. Its branch, its data and its thread wait for it, and nothing else waits on it. Three tickets due in three releases are three separate stacks, and each one ends in its own PR.

It is also why the audit trail holds together. What was asked, what was built, which preview was tested and what feedback went back all sit on one ticket, not mixed with another ticket's work.

## What made the copies cheap

A database copy per ticket only works if copying is cheap. In Envizom V3, which we are rebuilding from scratch, the backend runs in dev without a single extra database credential. Every store has a dev driver:

| Store | Prod | Dev |
|---|---|---|
| Main DB | Postgres | SQLite |
| Assets | S3 | SQLite |
| Device data | a time-series database | SQLite |
| Pub/sub | MQTT | a service built into the Go backend |
| Cache | Redis | SQLite |

SQLite runs inside the Go process, so the dev kit needs no extra containers, and copying a database means copying a few files. That change made our sandboxes about 10x cheaper and faster than sandboxes with full databases.

The dev VM that holds the devboxes and the ticket stacks costs about ₹4–6k a month and handles six tickets in parallel.

## If you are building one

Start with isolation, not with the agent. If a task can't run in its own branch, with its own services and its own data, nothing else in the pipeline is safe. Then put the agent inside the box, and keep every step that leaves the box scripted.

If your team runs a sandbox per branch or per ticket, which part was hardest to copy: the code, the services or the data?
