---
title: "The ticket is the interface: how our developers ship without a laptop"
slug: ticket-is-the-interface
date: 2026-09-26
updated: 2026-09-26
description: "How a small team turned its ticket tracker into the only developer interface: per-ticket stacks with their own DB copy and preview URL, an AI agent driven from the ticket thread, and a scripted orchestrator that merges, deploys and rolls back."
tags: [devops, ai-agents, developer-experience, platform-engineering]
canonical: https://dev.to/panthpatel/the-ticket-is-the-interface-how-our-developers-ship-without-a-laptop-4of1
cover: /assets/blog/pipeline_og_1200x628.png
video: https://youtu.be/5IuE38UzhW4
readingTime: 7
---
<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/5IuE38UzhW4" title="The ticket is the interface: 2-minute walkthrough" loading="lazy" allowfullscreen allow="accelerometer; encrypted-media; picture-in-picture"></iframe></div>

Neither I nor my developers need a laptop to ship code anymore. That sounds like a stunt, so here is the boring version: on our team a developer's working day happens inside a ticket thread, and the parts that make that possible are mostly scripts, not AI.

This post is the long version of the short video above. It covers what the pipeline does, how the pieces fit, what we deliberately kept dumb, and where we drew the line on automation.

## The problem we were actually solving

I lead the software team at Oizom, an environmental monitoring company. Our platform is called Envizom, and it is several repos: hardware drivers, a simulator, a backend, a frontend. Getting a working local setup took a new developer days, and even for the rest of us "does it work on your machine" was a real question.

When we started using AI coding agents, the first thing we noticed was not the speed of the agent. It was the waiting. One developer, one agent, one task at a time, sitting there watching a terminal. The agent was fast. The developer was the bottleneck.

We wanted five things:

1. A developer should be able to hand off a task and go do something else.
2. Every task should run in isolation, so an agent cannot break anyone else's work, and so features can live on different timelines. One ticket can sit in QA for a week while three others ship.
3. Nothing about "we use agents" should weaken the normal engineering process: branches, commits, pull requests, review, CI.
4. Every prompt should be stored with the work it produced, so we can review and coach how people ask for things.
5. The ticket should be the audit trail: what was asked, what was built, what was tested, what feedback was given, in one place.

## The ticket is the interface

We already had our own ticket tracker. So we made the ticket the only thing a developer touches.

A developer writes what they want in a ticket, in plain English, and drags it to **Approved**. That is the whole spec. There is no IDE open, no terminal, no prompt window.

On our dev VM each developer has their own devbox: VS Code running in the browser, with our orchestrator inside it. We call it **orch**. Every developer is paired with their own agent, and their orch only picks up tickets assigned to that agent. So the board is shared, but the machines and the agents are not.

## Each ticket gets its own full stack

When orch sees an approved ticket it provisions a workspace for it:

- a fresh branch in every repo, named after the ticket
- its own backend, drivers, simulator and frontend, running in that workspace
- a copy of the dev database, so the ticket can change data freely
- a private preview URL for the ticket, with an HTTPS certificate issued on demand

This is the part that made everything else possible. Because every ticket is fully isolated, a developer can have several tickets in flight at once, and agents cannot step on each other. If an agent does something silly to the database, it did it to a copy.

## An agent does the work, but only from the thread

Inside that workspace an AI coding agent picks up the ticket. Orch gives it the ticket text and the workspace, and the agent does the actual engineering work.

The developer only ever talks to the agent through the ticket thread. When the agent is done it posts the preview link and moves the ticket to **QAQC**. The developer opens the preview, tests it, replies with feedback in the same thread, and moves the ticket back. The same agent, with the same context, picks up where it left off.

In the video I asked for a camera layout change on a device page. The agent shipped it, posted the preview, I replied "also handle more than 4 cameras with a horizontal scroll, and set up 8 test cameras on this device", and it did both, including creating the test data in the ticket's own database copy.

Two of the design goals pay off here, and they are the ones people underestimate:

- **Every prompt is saved.** The thread is the prompt history. I can read how each person on the team asks for things and coach them on it. That has been more useful than any prompting guide.
- **The thread is the audit trail.** What was asked, what was built, which preview was tested, what feedback was given. All in one place, attached to the ticket. Because each ticket has its own stack, that trail is also self-contained: a ticket can pause in QA for days without blocking anything else.

## Shipping is a drag-and-drop

When the developer is happy they drag the ticket to **Git Push**. From here on, no agent is involved. Orch:

1. commits the work on the ticket branches
2. merges the current dev branch into them
3. opens a pull request in each affected repo
4. merges the pull requests
5. posts the PR and commit links back into the ticket thread
6. waits for CI
7. rolls the new images onto the dev VM
8. runs health checks against the VM

If the VM is not healthy afterwards, orch rolls the VM back to the previous images and reverts the merges. On its own. Then it tells the thread what happened.

When it is healthy, the ticket moves to **Completed** and the developer gets a notification. In the video that is the whole ending: two notifications, and the change is live on dev.

## What is AI and what is not

This is the part I am proudest of, and the part I think most teams get backwards.

Roughly 90% of this pipeline is plain scripted code. Watching the board, provisioning the stack, copying the database, issuing certificates, driving git, opening PRs, waiting on CI, deploying, health checks, rollback. None of that is done by an agent. It is deterministic, it is tested, and when it breaks I can read a log and fix it.

The agent does exactly one thing: the engineering work inside an isolated workspace, in response to a human's words in a ticket.

We tried the other way first, with the agent doing more of the operational steps. It was slower, more expensive, and worse at exactly the tasks that need to be boring. An agent deciding how to merge is not a feature. A script that always merges the same way is.

## What it gave us

- One developer runs several tickets in parallel instead of babysitting one agent.
- No local setup. New people are productive on day one. The laptop can be closed.
- Every feature still gets its own branch, commits, PR and review. Nothing about our process got looser.
- Every prompt the team writes is stored with the ticket.

## Three deliberate choices

People sometimes read these as gaps. They are decisions.

- **Cost is visible on every turn.** Each agent turn posts its cost into the ticket thread. That is intentional. The person asking sees what the ask cost, right where they asked it, and it changes how they write the next one.
- **QA is human.** The developer tests the preview and decides whether the ticket moves forward. That step is where we check the thing that was built is the thing that was asked for. An agent grading its own work would remove the one review that matters most.
- **This pipeline is for dev only.** Rollback, auto-merge, VM updates: all of it stops at the dev environment. Production goes through a separate path where real people make the call, on a slower cadence. We do not want automation deciding what reaches production, and we do not want a fast feature list to become the goal.

## What is next

The one thing I keep looking at is the dev VM itself. The per-developer devboxes and the per-ticket stacks all run on one rented box. It costs about ₹4–6k a month and comfortably handles six tickets in parallel, which is fine at our size, but it is still one machine and it is still rented.

The plan is almost embarrassingly simple. We have a pile of laptops. Turn them into VMs. The whole point of this pipeline is that your main laptop can be closed while the work happens, so the machine doing the work might as well be an old laptop on a shelf in the office. A one-time purchase of in-house hardware will never cost what a cloud VM costs over a year, and it keeps the same isolation model: each developer's devbox on its own box.

We have not done this yet. When we do, I will write it up.

## If you want to build something similar

Start with isolation, not with the agent. If every task cannot run in its own branch, its own services and its own data, none of the rest is safe. Then make the handoff surface something your team already uses. For us that was the ticket. Then, and only then, put an agent inside the box.

And keep the box scripted. The agent should be the smallest part of the system.

If you have questions, ask in the comments. I am collecting them for a follow-up post.

---

*I lead the software team at [Oizom](https://oizom.com), where Envizom is the platform that turns data from air-quality and environmental monitors in 80+ countries into something cities and industries can act on. The walkthrough video is on [YouTube](https://youtu.be/5IuE38UzhW4); find me on [LinkedIn](https://www.linkedin.com/in/panth-patel-447a88240/).*
