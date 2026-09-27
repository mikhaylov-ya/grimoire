---
name: ux-flow-audit
description: Audits the logic-level usability of a web app by reading its source code. Reconstructs the real user flows from routes, state, forms and API calls, then finds where users are made to work harder than necessary — excess clicks and selects, redundant data entry, pointless confirmations, missing bulk actions, work-losing navigation, dead ends and unreachable states. Reads the entity graph too, so it catches values a chosen record already names but the next step still asks for, and pickers left unfiltered by what the user picked earlier. Framework-agnostic. Use this skill whenever the user asks to review, audit, critique or sanity-check the UX, usability, user flows or user journeys of a codebase, asks whether a flow makes sense, asks how to reduce friction or clicks or steps, says a flow feels clunky, slow or annoying, or wants a UX pass on a feature — even if they never say the word "usability". Do NOT use for visual, pixel or styling critique, for pure WCAG compliance scans, or for writing new features.
---

# UX Flow Audit

Audit the *logic* of a web app's user flows by reading its code. Find flows that work but waste the
user's time and attention, and flows that are broken as logic — dead ends, unreachable states,
unrecoverable errors.

Code doesn't render, so any claim about layout, spacing or visual hierarchy would be a guess. Stay
on what the code can prove.

## Priorities

Ranking matters more than coverage. Five sharp interaction-cost findings beat twenty generic ones.

1. **Interaction cost** — every click, select, keystroke, page load and wait between intent and
   goal. The main event. `references/interaction-cost.md` has the catalog; read it every audit.
2. **Redundant work** — anything the user supplies, confirms or re-enters that the system already
   knows or could infer. "Could infer" is mostly the entity graph: a record the user already chose
   names, or narrows, the thing they're being asked for next. `references/entity-graph.md` has the
   checks; read it every audit, alongside the interaction-cost catalog.
3. **Broken flow logic** — dead ends, unreachable states, uncompletable flows, lost work.
4. **Recoverability** — undo, retry, escape without starting over.
5. **Everything else** — only when concrete.

### Deprioritized: mutation feedback

Don't fill the report with "this mutation has no success/error toast." Teams spot those in seconds
and they crowd out findings that took real code-reading. Report missing feedback only when its
absence is genuinely ambiguous:

- the action is irreversible or costly (payment, delete, send, publish),
- it's async and the UI gives no way to know it's still running,
- the failure is **silent** — the error is swallowed and the user believes it worked,
- retrying is unsafe and the user can't tell whether to.

Cap at 3, grouped into one entry if they share a cause. Everything else goes in a one-line note.

## Whose goal are you auditing against?

The audit measures the gap between what the user needs to do and what the app makes them do. That
requires knowing the goal — and the code is not evidence of it. **The code is the team's projection
of the user.** Inferring goals from the code and then auditing the code against them is circular,
and produces a confident report that just launders the original assumption.

So:

- **Prefer non-code evidence.** Support tickets, real path analytics, tests written from a user's
  perspective, product docs, anything the user tells you in the conversation.
- **State each goal as a hypothesis with its evidence**, in the report. Not as background.
- **Mark findings whose validity depends on an assumed goal.** If the goal is wrong, the finding is
  wrong; the reader needs to know which ones those are.
- **Look for the tell that the code models the schema, not the task:** entities in the UI that
  exist only because of a join table, steps ordered by write order rather than by how someone
  thinks about the job, a flow whose shape matches the API surface exactly.

This cuts against aggressive step-removal, deliberately. When the goal is uncertain, a default that
serves the 90% you imagined can trap the 10% you didn't. Prefer *default plus visible override* to
removing the choice, and say when a recommendation is only safe if the goal hypothesis holds.

## Pipeline

### 1. Orient
Read the project's own docs first — `CLAUDE.md`, architecture notes, ADRs, README, and above all
the **product spec, glossary or context map** if one exists. A well-documented repo has already
described its flows and often names the intended journey outright ("users come from the substance
page and want to synthesize that substance"); don't re-derive what's written down, and don't
contradict it without evidence. Where the code diverges from a written intended path, that's a
spec defect and outranks anything you infer.

Then locate flows: router config → e2e or `.feature` tests (the team's own description of intended
journeys) → form and validation schemas → API layer → i18n keys and analytics events (these
enumerate the states and steps the team believes exist).

Working-tree caution: on a repo with uncommitted work, check `git status` for the slice you're
auditing before writing findings. A file read early in the session may have been edited since, and
reporting a defect the team is mid-fix on wastes their time.

### 2. Scope
Rank flows by stakes and frequency: auth and onboarding, payment, the core repeated loop, anything
done many times a day.

If there are more than ~8 substantial flows, show the list with your proposed top 3–5 and ask which
they want. Auditing everything shallowly produces worse findings than auditing a few deeply, and
the user knows which flows their support tickets are about.

### 3. Map — graph first, then ideal, then actual

**Build the entity graph first** — the records the flow touches and the relations between them,
taken from foreign keys, API filter arguments and schema types, never from the UI. Two or three
entities and their edges is enough. Without it, "everything the system could reasonably know" is
whatever you happen to imagine, and the ideal path silently inherits the app's own blind spots.
`references/entity-graph.md`.

**Then** write the *ideal path*: the minimum sequence of actions a user would need if the system
knew everything it could reasonably know — from session, from the records it holds, **from what
those records name or narrow one relation away**, from what they just did, from what they always
pick. State the goal hypothesis it assumes. Give it an interaction count.

**Then** map the actual path: entry → screens → required interactions per step → branches
(validation failure, error, empty, denied) → exit. Count it.

The audit is the diff. Doing it in this order matters: derived backwards from a smell catalog, the
target is capped by whatever the catalog happens to catch, and a flow where nothing is individually
wrong but the whole thing is three times longer than necessary passes clean. Ideal-first catches it.

Also record, per screen, **decision density**: how many choices the screen demands at once versus
how many are actually required to advance. A screen with nine inputs where two would let the user
proceed is a finding even when every individual field is defensible.

Where a flow is a real state machine (wizards, checkout, upload pipelines), sketch its states and
transitions and look for states with no exit and states nothing can reach.

### 4. Evaluate
Walk each step against `references/interaction-cost.md`, each graph edge the flow crosses against
`references/entity-graph.md`, then `references/flow-checks.md`.

Use the cognitive walkthrough questions as the lens, not heuristic labels. "At this step, will the
user know what to do, and will they know it worked?" produces specific findings; "does this violate
heuristic #4?" produces vague ones.

### 5. Verify — before writing anything
Delete or demote any finding that:
- lacks a file path, line reference and quoted snippet,
- you could have written without reading this codebase,
- makes a visual claim,
- presents speculation about user intent as fact.

The known failure mode here is confident, plausible findings that aren't actually in the code. A
short report of provable findings is worth more than a long one you'd have to defend.

### 6. Report
Follow `references/reporting.md` exactly.

## Rules

- **Evidence or it doesn't ship.** Every finding carries `path/file.ext:42` and the snippet proving
  it. Uncitable observations go in "worth testing with users."
- **Tag confidence.** *Observed* (explicit in code) / *Inferred* (implied, state the assumption) /
  *Speculative* (out of the findings table entirely).
- **Quantify against the ideal.** "9 interactions where 4 would do" beats "feels heavy."
- **Flag goal-dependence.** If a finding only holds under an assumed user goal, mark it and name the
  assumption.
- **Every finding needs the smallest fix that removes the cost** — not a redesign.
- **Don't be talked into or out of a finding.** Evaluate the flow regardless of how the user frames
  it; still require the code to show it.
- **Name what you couldn't check** — rendered output, real content, actual latency, real user goals.
- **Read-only.** Audit and report; don't refactor unless asked separately.

## References

- `references/interaction-cost.md` — the smell catalog. Read every audit.
- `references/entity-graph.md` — what the system already knows one relation away: propagation,
  narrowing, direction symmetry, invalidation, entry-point coverage. Read every audit.
- `references/flow-checks.md` — cognitive walkthrough, state coverage, graph checks, error
  taxonomy, logic-dependent WCAG criteria.
- `references/reporting.md` — severity scale, confidence tags, report template.
