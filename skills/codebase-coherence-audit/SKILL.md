---
name: codebase-coherence-audit
description: >
  Audit a codebase (or a scoped part of one) for families of similar code —
  both code that looks alike and code that performs the same business
  function while looking different — and turn the families worth merging
  into abstractions shaped around real domain concepts, in the right form
  (parameter, template, strategy, state machine, table, ...). Decides WHICH
  similarity is worth abstracting versus which should stay duplicated. Use
  this whenever the user asks to find repeated, copy-pasted, structurally
  or functionally similar code, wants abstraction or refactoring proposals,
  asks for a coherence audit, a DRY audit, or a "smells repetitive" review,
  asks what domain concept is missing from a codebase, or wants help naming
  a shared abstraction across similar call sites. Make sure to trigger this
  even when the user doesn't say "duplicate" explicitly but describes
  symptoms of it — e.g. "these five functions all do basically the same
  thing," "I keep copy-pasting this block," "is there a cleaner way to
  structure these handlers," or "help me find what to extract into a shared
  utility." Also use it when the question is whether a divergence is
  intentional — "are these supposed to be the same?", "did these two copies
  drift?", "why does each page do this differently?" — or whether a piece of
  code earns its place at all. This skill explicitly guards against
  over-abstraction: it will sometimes recommend LEAVING code duplicated, and
  it always negotiates scope before scanning.
---

# Codebase Coherence Audit

Finding duplicate code is easy. The valuable part is deciding **which similarity is worth fixing**,
**what form the fix takes**, and **what to name it** so it reads as a domain concept rather than a
pile of `if flag_a` branches.

Similarity has two dimensions. **Code shape** is found formally, by clone detectors and compression
distance (Step 1). **Business function** — the same job done by different code — is found by
describing each unit in domain terms and grouping the descriptions (Step 1b). The strongest
findings sit where the two meet, or where several clusters are facets of one concept nobody gave a
home.

Every cluster is a candidate to *evaluate*, not a defect to *fix*. Two rules do the evaluating:

- **The function lens** — *should these be one thing at all?* What function does the code perform
  toward the system's real goal, is it essential, and who owns it? One function in different code
  wants one home; different functions in identical code must stay apart (Step 3).
- **Minimum Description Length (MDL)** — *is the merge worth its price?* `len(abstraction) +
  Σ len(delta at each call site)` must be meaningfully shorter than the duplication it replaces
  (Step 4).

"Leave this duplicated" and "nothing needs this; delete it" are legitimate verdicts, and often more
valuable than a refactor diff.

## Step 0 — Negotiate scope

Never scan a whole repo on a vague "audit my codebase". Ask, or infer from the conversation,
whichever of these is unclear:

1. **Boundary** — the whole repo, a module, a layer ("all the API controllers"), or recent changes
   (a diff, a PR, the last N commits). A diff, PR or named pain point *is* the scope; don't widen
   it uninvited.
2. **Depth** — syntactic duplication only (Step 1: fast, precise), or business-function duplication
   too (Step 1b: slower, needs the callers, more false positives).
3. **Appetite** — a report with proposals (the default: these are judgment calls a human should
   review before code moves), or make the extractions for the strongest candidates.

If the request already answers all three, don't ask: state the scope in one line and start.

## Step 1 — Find clusters by shape

Read `references/detection-tools.md` first — commands per language and a no-install NCD fallback.
Cheapest first: a token or structural clone detector where one covers the language; NCD where none
does, or as a shortlist filter over a very large scope. Chunk at function or method level, not
whole files.

Output: clusters of 2+ locations (`file:lines`), each with a similarity score.

## Step 1b — Find clusters by function (business-function depth only)

Read `references/business-function.md` first. Write a function card per business-performing unit,
group the cards by (function, effect class, rule) with context as a veto, and verify every group
pairwise. Then cross-reference with Step 1: a group that overlaps a clone cluster merges into it; a
group that doesn't becomes a new cluster with `similarity: functional`.

## Step 2 — Build the domain index

Before judging any cluster, write down what the domain says must be the same and what must differ;
without it Step 3 is eyeballing. Read `references/domain-index.md` for the format, where to harvest
rows from, and a worked example. One page, 5–15 rows, in three sections:

- **Canon** — one rule everywhere. Divergence between sites is a defect, reportable on its own.
- **Variation by design** — looks alike, must differ. Convergence is the defect; never merge.
- **Unowned** — a function performed in several places that no component owns. It ends as Extract,
  Absorb or Eliminate; the nearest existing owner decides which.

Harvest it from docs, cited specs, test names and — first of all — comments; ask the user only
about what remains. An empty index (pure utilities, generated code) is a one-line finding, not a
failure.

## Execution mode — solo or fan-out

Decide now, with the clusters and the index in hand. Judging a cluster means reading every site and
its callers; past a handful of clusters one context can't hold that and still compare them.

- **Solo** — up to ~8 clusters, or one module at syntactic depth. Run Steps 3–6 yourself.
- **Fan-out** — more clusters, several modules, or functional depth across modules. You keep scope,
  detection and the index, which need one coherent view; parallel agents take the per-cluster work.
  The roles are defined in `references/roles.md`.

For a fan-out, write the index to a file in your scratchpad, tell the user the plan and a rough
agent count (about 2 per cluster + 1 per module + 2), and get a yes before launching — it costs far
more than a solo run. Launch with, in order of preference:

1. **The Workflow tool** — `scriptPath: <this skill's directory>/workflows/coherence-audit.js`,
   `args` = `{ skillDir, indexPath, scope, clusters, modules }` (the script header documents each
   field). Omit `modules` at syntactic depth.
2. **The Agent tool** — the roles in `references/roles.md`, as parallel subagents.
3. **Solo, prioritized** — if neither exists, say so, judge clusters in order of similarity × number
   of sites, and report which ones you didn't reach.

Either way the report is yours to check before handing it over: re-read every verdict a skeptic
refuted.

## Step 3 — Judge each cluster by its function

Answer from the *callers* and the specs, not from the cluster's own lines. If you can only describe
the code mechanically, you haven't found the function yet: follow the call sites up to the
user-facing action they serve, and down to what they persist or emit.

1. **Name the function in the business's words** — verb + domain noun, at the level of the process
   the software serves: "records what a production run produced", not "builds a meta object and
   calls updateOperation".
2. **Is it essential?** Would someone running the real process notice if it stopped happening? A
   shape that outlived the reason it was given is not essential, however tidy it looks.
3. **Who owns it?** Often one site already generalized it and the others never found out.

| Function | Ownership | Index says | Verdict |
|---|---|---|---|
| One function across sites, essential | no single owner | canon or unowned | **Extract** — create the owner |
| One function across sites, essential | one site already generalizes it, or a component already exists | canon or unowned | **Absorb** — move the sites onto the existing owner; don't invent a second one |
| One function, and the differences *are* the function | each site owns its own policy | variation by design | **Leave duplicated** |
| No one's process depends on it | — | any | **Eliminate** — delete, and say what else dies with it (i18n keys, tests, fixtures) |
| Different functions that happen to share a shape | separate by design | — | **Coincidental — no action** |

Token-identical blocks can serve unrelated functions ("is this email well-formed" versus "is this
SKU well-formed"); coupling them stops the two features evolving independently. Report coincidental
clusters as "duplicate but not related" — never drop them silently, since the user may read the
domain differently. Lookalikes from different contexts (`references/business-function.md`, "stay
apart") are variation by design even when identical.

**Drift.** When the index says canon and the copies disagree, that is a bug finding whatever the
refactor verdict: name what each copy does differently and which one is right. This is often the
most valuable output of the audit, and invisible to every duplicate-finder that skips this step.

**Missing concepts.** With every cluster's function named, read the list as a whole: several
clusters are often facets of one concept with no home (signals in `references/business-function.md`).
Report the concept — its name, what it would own, which clusters it absorbs. It usually beats the
per-cluster extractions it replaces.

## Step 4 — Choose the form, then price it

Extract and Absorb only. Read `references/abstraction-forms.md` first.

1. **Name what varies between the sites** and pick the weakest form that carries it: a parameter,
   separate functions, a callback, a template with hooks, a strategy, a state machine, a table.
2. **Sketch it and estimate MDL.** Abstraction cost = the shared body + at every site the call and
   whatever glue remains. Status-quo cost = the duplicated code as it is. A reasoned estimate, with
   the reasoning shown, not byte counts.
3. **Run the change test.** Name one or two plausible future changes and count the sites each
   touches before → after.
4. **Check the quality bar** in the reference. A parameter list that grows toward one parameter or
   branch per site means *this form* failed — try a form that carries the variation (data → table,
   steps in a fixed skeleton → template) before falling back to "leave duplicated".

**When the signals disagree**, each one outranks those below it:

1. **Function and index** (Step 3) decide whether a merge is allowed at all. Coincidental and
   variation by design never merge, however good the MDL.
2. **Volatility.** Sites known to be about to diverge for product reasons stay duplicated even when
   everything below favors merging — abstracting them relocates the coming pain. The index's
   variation section usually shows this; ask the user if it doesn't.
3. **The change test.** An abstraction that makes no likely change local is shape-matching, whatever
   MDL says.
4. **MDL** decides the rest, and picks between candidate forms. Near break-even, an essential
   function with one owner is worth centralizing at par: the recurring cost is the multi-file edit
   every future change forces. Say so in the report when you lean on this.

## Step 5 — Name it by its function

The name is the function written down in Step 3 — by construction the thing invariant across every
site — not the mechanism, and not the fact that it was extracted. `handleCommon`, `processHelper`,
`doValidation2` and `genericUpdate` all fail.

Test: would someone who has never seen the original sites understand what it is for from its name
and parameter names alone? If you can't state the function in one short phrase, Step 3 was too
optimistic — re-check whether the cluster is coincidental, or downgrade to "duplication flagged, no
abstraction proposed yet".

## Step 6 — Report

Don't silently drop clusters that didn't survive Step 3 or 4: a documented "leave this duplicated"
tells a reviewer what NOT to spend time on.

```markdown
# Coherence Audit — <scope>

## Scope
<boundary, depth, and any exclusions used for this run>

## Domain index
<the three sections, one line per row, each with its authority —
 spec section, ADR, ticket, test name, or "asked the user">

## Summary
<N clusters found (F of them functional); M to extract, A to absorb into
 an existing owner, J to leave duplicated, E to eliminate, K coincidental;
 D drift defects; C missing concepts>

## Drift — canon concepts whose copies disagree
<one line per divergence: the rule, the copies, which one is right.
 Omit this section if there is none.>

## Missing concepts
<per concept: name, what it would own, the clusters it absorbs.
 Omit this section if there is none.>

## Cluster <n>: <short description>
**Locations:** <file:lines, file:lines, ...>
**Similarity:** <how it was found — e.g. "97% token match", "NCD 0.08",
 or "functional: same function card, verified pairwise">
**Function:** <verb + domain noun, in the business's words>
**Index:** <canon / variation by design / unowned — and the authority for that>
**Essential?** <yes, and who owns it / no, and what depends on it>
**Varies by:** <what differs between sites, and its shape — value, flag,
 step, algorithm, state, data; the commonality/variability matrix
 for functional clusters>
**MDL estimate:** <abstraction cost vs. duplicated cost, one line each —
 only for Extract and Absorb>
**Change test:** <the likely change, sites touched before → after —
 only for Extract and Absorb>
**Verdict:** Extract / Absorb / Leave duplicated / Eliminate / Coincidental — no action
**Proposed abstraction** (only for Extract and Absorb):
  - Form: <parameter / template / strategy / state machine / table / ...>
  - Name: `<name>`
  - Signature sketch
  - What stays as call-site-specific glue
**Reasoning:** <2-4 sentences — why this verdict, referencing Steps 3-4>

<repeat per cluster, strongest/most-confident recommendations first>
```

## Tone

These are judgment calls, not linter violations. Present verdicts as reasoned recommendations with
visible reasoning; the team knows the domain and the product's trajectory better than any static
analysis. Show the domain index with an authority per row and invite correction — a row inferred
from a comment is a hypothesis, so mark it inferred.
