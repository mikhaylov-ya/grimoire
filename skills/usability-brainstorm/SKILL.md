---
name: usability-brainstorm
description: >
  Brainstorms usability improvements for a web app from its source code, plus optional user
  complaints or tickets and facts about its users — roles, devices, browsers, environment. Applies
  usability principles to the domain to generate a wide bank of ideas — less interaction cost,
  fewer user-facing errors and bugs, better fit to how people work — each tied to a complaint, code
  location or context fact, then picks top ideas and bold bets. Use when the user asks for UX or
  usability ideas, wants an app smoother or less error-prone, or shares complaints and asks what to
  do. For evidence-only, ranked findings from the code alone, use ux-flow-audit.
---

# Usability Brainstorm

Generate many good, *different* ideas for making an app easier to use, then pick the ones worth
building. The input is code plus whatever the user knows about the people using it: complaints,
tickets, roles, devices, browsers, the room they work in.

This is the divergent sibling of `ux-flow-audit`, which reports only what the code proves. Here the
ideas are hypotheses, and a good bank holds small tweaks, new features and a few ideas that rethink
the flow. Two disciplines keep range from turning into noise:

- **Anchored** — every idea is tied to something real: a complaint, a code location, a fact about
  the users' context, or a stated domain fact. An idea with no anchor is a guess.
- **Specific** — every idea names a screen, a role, a domain noun or a complaint. "Add keyboard
  shortcuts", "improve error messages", "add an onboarding tour" are what a brainstorm produces
  when it hasn't read the code. They are the main failure mode of this skill.

**Sibling references.** `lenses.md` and `context.md` cite three files from `ux-flow-audit` by bare
name — `interaction-cost.md` (catalog codes such as A3 or D4), `entity-graph.md` and
`flow-checks.md` — all at `../ux-flow-audit/references/` from this skill's directory. Every citation
carries a short gloss, so the operators work without the sibling installed; the files add detail.

## Step 0 — Intake

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

## Step 1 — Write the brief

Read `references/brief.md`, then write `<scratchpad>/brief.md` with its six parts. Ideas cite the
brief's row ids, and fan-out agents read it as their only shared input.

- **Context sheet** (R) — who uses it, given or assumed.
- **Domain self-interview** (D) — domain common sense, assumed until confirmed.
- **Feedback digest** (C) — each complaint traced to the code that produces it. Skip if no feedback.
- **Capability inventory** (K) — what the app can already do; stops you proposing what exists.
- **Constraints and appetite** (X) — what can't change, and what kind of ideas the user wants.
- **Flow sketches** — per scoped flow, the gap between ideal and actual paths: the lens targets.

### Execution mode — solo or fan-out

Decide now, before generating. Ideas generated in one context anchor on the first few; isolating
lens groups from each other's output is what keeps the bank wide.

- **Solo** — the default. Run Steps 2–5 yourself, one lens group at a time, writing each group's
  ideas to the bank before reading the next group's section of `lenses.md`.
- **Fan-out** — 5+ flows, 4+ roles, or the user asks for maximum range. You keep Steps 0–1; the
  roles in `references/roles.md` run the rest.

A fan-out costs far more than a solo run: tell the user the plan and the agent count (4 lens groups,
1 merge, 1 reframe, 4–8 area grounders, 1 synthesis — usually 11–15) and get a yes first. Launch
with, in order of preference:

1. **The Workflow tool** — `scriptPath: <this skill's directory>/workflows/usability-brainstorm.js`,
   `args` = `{ skillDir, briefPath, scope, lensGroups }` (the script header documents each field).
2. **The Agent tool** — the roles in `references/roles.md`, as subagents in the same order.
3. **Solo**, if neither exists — say so.

Either way the report is yours to check before handing it over: re-run the grounding checks on the
top picks, quick wins and bold bets, and open every `path:line` they cite.

## Step 2 — Diverge

Read `references/lenses.md`, and for the Fit family only the sections of `references/context.md`
that match facts in the context sheet.

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
4. **Build on the best.** After the first pass, push the strongest handful: the zero-interaction
   version, the version at 10× the data, the version for the other role.
5. **Record as you go** in a scratchpad idea bank, one line per idea: title, idea, family, scale,
   target, anchors. Raw; **I** ids come at clustering.

Then run Reframe (`lenses.md` §8) on the targets that came out thin, conflicted or all Tweaks, and
check the bank against the coverage gate in `references/converge.md`. A bank for three flows and two
roles typically holds 40–80 raw ideas; far fewer usually means the lenses ran on their own instead
of on targets.

## Step 3 — Ground

Read `references/converge.md`. Run its five grounding checks on every raw idea and record each
outcome in the bank. Merge ideas that make the same change, keeping the strongest wording and every
anchor; ideas that only serve the same need stay separate and meet again in one area.

## Step 4 — Converge

Cluster, score and pick as `converge.md` defines: opportunity areas, value / confidence / effort,
then top picks, quick wins, bold bets and "tempting but wrong", with a check-it line for each top
pick and bold bet.

## Step 5 — Report

Follow the template in `converge.md`. The top of the report is readable in two minutes; the full
idea bank goes at the end.

## Rules

- **Every idea in the report passed Step 3.**
- **Read feedback as `brief.md` says** — the need behind the ask, the signal, say versus do. The
  user's own proposed fix is one idea among several, labeled as theirs.
- **Assumed is never presented as given.** Domain and context inferences carry the label all the way
  into the report, and "Assumptions that matter" names those the top picks rest on.
- **Ideas, not findings.** Write "could", give the anchor, and let the confidence letter carry the
  uncertainty. A defect the code proves goes in the report's "Defects found" block, one line each,
  and is not scored as an idea; for a proof-only pass, point to `ux-flow-audit`.
- **Deliberate friction stays.** Legal consent, guards on irreversible actions and fraud checks are
  made cheaper — undo, preview, a smarter condition — never removed.
- **Visual ideas are allowed** when a complaint or a context fact anchors them, flagged "check the
  rendered screen": the code can't show how it looks.
- **Read-only.** Brainstorm and report; don't implement unless asked separately.
