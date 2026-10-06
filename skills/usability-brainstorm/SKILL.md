---
name: usability-brainstorm
description: >
  Brainstorms usability improvements for a web app from its source code, plus optional user
  complaints or tickets and facts about its users — roles, devices, browsers, environment. Applies
  usability principles to the domain to generate a wide bank of ideas — less interaction cost,
  fewer user-facing errors and bugs, better fit to how people work — each tied to a complaint, code
  location or context fact, then picks top ideas and bold bets. Use when the user asks for UX or
  usability ideas, wants an app smoother or less error-prone, or shares complaints and asks what to
  do. For provable defects only, use ux-flow-audit.
---

# Usability Brainstorm

Generate many good, *different* ideas for making an app easier to use, then pick the ones worth
building. The input is code plus whatever the user knows about the people using it: complaints,
tickets, roles, devices, browsers, the room they work in.

This is the divergent sibling of `ux-flow-audit`. The audit reports only what the code proves and
ranks five sharp findings above twenty. The brainstorm is for range: its ideas are hypotheses, and a
good bank holds small tweaks, new features and a few ideas that rethink the flow. Two disciplines
keep range from turning into noise:

- **Anchored** — every idea is tied to something real: a complaint, a code location, a fact about
  the users' context, or a stated domain fact. An idea with no anchor is a guess.
- **Specific** — every idea names a screen, a role, a domain noun or a complaint. "Add keyboard
  shortcuts", "improve error messages", "add an onboarding tour" are what a brainstorm produces
  when it hasn't read the code. They are the main failure mode of this skill.

The usability baseline is shared with `ux-flow-audit` — its interaction-cost catalog and
entity-graph checks, in the sibling skill's `references/` (`../ux-flow-audit/references/` from this
skill's directory). The creative operators come from TRIZ and Osborn's brainstorming rules; the
view of the work beyond the screen comes from activity theory. `references/lenses.md` turns all of
it into questions to ask of the code. If the sibling skill isn't installed, the summaries in
`lenses.md` are enough.

## Step 0 — Brief

Sort what the user gave you into four parts:

1. **Code scope** — repo, module, the flows in question.
2. **Feedback** — complaints, tickets, reviews, survey verbatims, chat excerpts, analytics.
   Optional.
3. **Context** — who uses it: roles, frequency, expertise, devices, browsers, input methods,
   network, physical environment, locale, accessibility needs. Optional.
4. **Constraints and appetite** — what can't change (backend, design system, regulated steps,
   deadline), and whether they want quick wins, a roadmap, or blue-sky.

Ask at most once, in one message, and only for what would change the result: usually which role
matters most, whether there's feedback they haven't pasted, and what can't change. If the request
already covers it, or the user says to just go, proceed and write your assumptions into the brief,
marked *assumed*. Missing context is not a blocker; unmarked assumptions are.

On a large codebase, go deep on 2–5 flows — the ones the complaints name first, then the core
repeated loop of the most important role — and run the cross-cutting lenses (Fit, Connect)
app-wide. Say which flows you chose and why.

## Step 1 — Understand

Read `references/brief.md` first. Write a brief file to your scratchpad with five parts; the ideas
cite its row ids, and fan-out agents read it.

- **Context sheet** — one row per role: goal, frequency, expertise, device and environment, stakes.
  Facts from the user are *given*; your inferences are *assumed*.
- **Domain primer** — answers to the domain self-interview in `brief.md`: the unit of work, its
  rhythm, what happens before and after the app, what goes wrong in this work regardless of
  software. This is where domain common sense enters, and it is a hypothesis until the user or the
  docs confirm it.
- **Feedback digest** — every complaint as a card: verbatim, the need behind it, role, flow, type,
  suspected cause. Then find the code that produces each one. A complaint the code can't explain
  points at the environment, the data or the user's mental model — say which.
- **Capability inventory** — what the app can already do: bulk endpoints, search and filter
  parameters, undo, drafts, exports, templates, shortcuts, notifications. Mark what the API supports
  and the UI doesn't expose. Hidden capability is the cheapest source of ideas there is, and the
  inventory stops you proposing what already exists.
- **Flow sketches** — per scoped flow: the entity graph (a few entities and edges, from the
  schema), then the ideal and the actual path with interaction counts, as in `ux-flow-audit`
  Step 3. Light: enough to see the gap, not an audit.

## Step 2 — Diverge

Read `references/lenses.md` first, and `references/context.md` for the Fit family.

1. **Generate first, judge later.** Write ideas down without filtering for feasibility; that is
   Step 3. Judging while generating kills the unusual ideas first, and they are the reason to
   brainstorm at all.
2. **Lens × target, never a lens alone.** Apply each lens to something concrete — a complaint
   cluster, a step of a flow, a role, an edge of the entity graph. "Remove × the contract step of
   create-order" yields ideas; "Remove" on its own yields platitudes.
3. **Several answers per target, at different scales.** *Tweak* — hours: a default, a prefill, a
   label. *Feature* — days to weeks: bulk edit, drafts, a narrowed picker. *Rethink* — changes the
   flow or its model: the system proposes and the user confirms; the step moves to another role;
   the form becomes a table.
4. **Build on the best.** After the first pass, take the strongest handful and push each one: the
   zero-interaction version, the version at 10× the data, the version for the other role. Merge
   ideas that serve the same need into one stronger idea.
5. **Record as you go** in a scratchpad idea bank, one line per idea: id, idea, family, scale,
   target, anchor. Raw.

Before leaving the step, check coverage. These are checks, not quotas to pad: if a family has
nothing to offer after an honest pass, write one line saying why.

- Every complaint cluster has at least two ideas at different scales, one of them aimed at the
  cause rather than the symptom.
- Every role in the context sheet has ideas aimed at it — including roles nobody complained for.
- At least six of the eight families contributed.
- At least three ideas are Rethinks.

A bank for three flows and two roles typically holds 40–80 raw ideas. Far fewer usually means the
lenses were run on their own instead of on targets.

## Execution mode — solo or fan-out

One context anchors on its first ideas, and later ones drift towards them. People show the same
effect: individuals who brainstorm alone and then pool their ideas out-produce groups who hear each
other (Diehl & Stroebe, 1987). Parallel agents that never see each other's output are the same
remedy.

- **Solo** — up to ~4 flows and 2–3 roles. Run Steps 2–5 yourself.
- **Fan-out** — a larger brief, or when the user asks for maximum range. You keep Steps 0–1, since
  the brief needs one coherent view. Agents diverge by lens group, then merge, ground and converge.
  The roles are defined in `references/roles.md`.

For a fan-out, tell the user the plan and a rough agent count (one per lens group, one merge, one
per opportunity area, one synthesis — usually 12–16), and get a yes first. Launch with, in order of
preference:

1. **The Workflow tool** — `scriptPath: <this skill's directory>/workflows/usability-brainstorm.js`,
   `args` = `{ skillDir, briefPath, scope, lensGroups }` (the script header documents each field).
2. **The Agent tool** — the roles in `references/roles.md`, as parallel subagents.
3. **Solo** — if neither exists, say so, and run the families one at a time, writing each family's
   ideas to the bank before reading the next family's section.

Either way the report is yours to check before handing it over: re-run the Step 3 tests on every
top pick, and open every `path:line` it cites.

## Step 3 — Ground

Read `references/converge.md` first. For every raw idea:

1. **Does it exist?** Search the code. Exists — drop it, or, if a complaint shows nobody finds it,
   turn it into a discoverability idea. Partly exists — say what's missing. The API has it and the
   UI doesn't — say so; that idea just got cheap.
2. **Anchor** — attach the citation: complaint id, `path:line`, role row, domain fact. None — drop
   the idea, or move it to "Worth asking".
3. **Swap test** — put another app's name in the idea. If it still reads true, make it name this
   app's screen, role or domain noun, or drop it.
4. **Feasibility** — what in the code supports or blocks it: the endpoint exists, it needs backend
   work, it needs a schema change.
5. **Who it might hurt** — another role, a less common goal, a safety, legal or data-integrity
   guard. An idea that buys one role's speed with another role's errors is a contradiction: take it
   back to the Reframe lens once before keeping or dropping it.

Merge duplicates, keeping the strongest wording and every anchor.

## Step 4 — Converge

Cluster the surviving ideas into opportunity areas named by the user need, not the feature. Score
each idea on value, confidence and effort, as `converge.md` defines them. Then pick:

- **Top picks** — 5–10, high value and at least medium confidence, any effort, spread across areas.
- **Quick wins** — cheap, solid value, not already a top pick.
- **Bold bets** — 2–3 Rethinks worth a prototype, each with what would have to be true.
- **Tempting but wrong** — obvious ideas you rejected, and why: they hurt a role, remove a
  deliberate safeguard, or already exist. This stops the team re-proposing them.

Give each top pick and bold bet the cheapest way to check it: an analytics event that already
exists, a log or database query, a five-user task test, a week behind a feature flag.

## Step 5 — Report

Follow the template in `references/converge.md`. The top of the report is readable in two minutes;
the full idea bank goes at the end.

## Rules

- **Every idea in the report passes Step 3**: it doesn't already exist, it has an anchor, and it
  survives the swap test.
- **Complaints are symptoms.** The user's own proposed fix is one idea among several, not the
  brief. Keep it in the bank, labeled as theirs, and look for the need behind it.
- **One loud complaint is not a trend.** Weigh by the number of reporters and frequency where the
  feedback says; write "unknown" where it doesn't.
- **Assumed is never presented as given.** Domain and context inferences carry the label all the way
  into the report, and "Assumptions that matter" names those the top picks rest on.
- **Ideas, not findings.** Write "could", give the anchor, and state confidence. A defect the code
  proves is still stated as a defect and fixed first; for a proof-only pass, point to
  `ux-flow-audit`.
- **Deliberate friction stays.** Legal consent, guards on irreversible actions and fraud checks are
  made cheaper — undo, preview, a smarter condition — never removed.
- **Visual ideas are allowed** when a complaint or a context fact anchors them, flagged "check the
  rendered screen": the code can't show how it looks.
- **Read-only.** Brainstorm and report; don't implement unless asked separately.

## References

- `references/brief.md` — context sheet, domain self-interview, feedback digest, capability
  inventory. Read before Step 1.
- `references/lenses.md` — the eight lens families and their operators, with the code tells for
  each. Read before Step 2.
- `references/context.md` — context facts (devices, browsers, network, environment, people,
  locale) mapped to design consequences and what to check in the code. Read with the Fit family.
- `references/converge.md` — grounding, scoring, picking, report template. Read before Step 3.
- `references/roles.md` — fan-out roles. Read when you are one of them.
- `../ux-flow-audit/references/interaction-cost.md` and `entity-graph.md` — the Remove family's
  detail.
