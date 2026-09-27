---
name: codebase-coherence-audit
description: >
  Audit a codebase (or a scoped part of one) for duplicate and near-duplicate
  code, and decide WHICH duplication is actually worth abstracting versus
  which should stay duplicated. Use this whenever the user asks to find
  repeated, copy-pasted, or structurally similar code, wants abstraction or
  refactoring proposals for duplication, asks for a coherence audit, a DRY
  audit, or a "smells repetitive" review, or wants help naming a shared
  abstraction across near-duplicate call sites. Make sure to trigger this
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

## What this skill is actually for

Finding duplicate code is easy — every IDE has a "find similar code" button. The hard, valuable part is deciding **which duplication is worth fixing**, and **what to name the fix** so it reads as a real domain concept rather than a parameterized pile of `if flag_a` branches.

Two decision rules do that work, and they answer different questions:

- **The function lens** answers *should these be one thing at all* — not "what does this code do" but **"what useful function does this perform toward the system's actual goal, and is that function essential, or could it be absorbed elsewhere or dropped?"** Shape-of-the-code is the wrong question; function-toward-a-real-process is the right one. Two blocks performing one business function want one home even when they look different; two blocks performing different functions must stay apart even when they're token-identical.
- **Minimum Description Length (MDL)** answers *is the merge worth its price* — an abstraction earns its place only if `len(abstraction) + sum(len(delta at each call site))` is meaningfully shorter than the duplicated code it replaces. If covering the variation needs nearly one parameter per call site, the right answer is "leave it duplicated."

The function lens runs first and can veto MDL in both directions. Saying "leave this duplicated," with a reason, is a legitimate and often more valuable output than a refactor diff — and so is "this whole cluster performs no function anyone needs; delete it."

Treat every cluster of similar code as a candidate to be *evaluated*, not a defect to be *fixed*. The default outcome for a cluster should not always be "extract a function."

## Step 0 — Negotiate scope before scanning anything

Never run a whole-repo scan on a vague "audit my codebase" request. Ask (or infer from context already in the conversation) whichever of these aren't already clear:

1. **Boundary** — the whole repo, one module/package, one architectural layer ("all the API controllers", "everything under `src/importers/`"), or files touched recently (e.g. `git diff` against a branch, or the last N commits). If the user gives you a diff, PR, or a specific pain point ("this file is 2000 lines and half of it looks the same"), that IS the scope — don't widen it uninvited.
2. **Depth** — surface syntactic duplication only (fast, safe, high precision), or also semantic/behavioral duplication (code that reads differently but does the same thing — slower, needs actual understanding of the logic, more false-positive risk).
3. **Appetite for change** — does the user want a report with proposals they'll review, or should you go ahead and make the extraction for the strongest candidates? Default to "report with proposals" unless told otherwise — this audit produces judgment calls, and judgment calls should be reviewed by a human before code moves.

If the user's request already answers all three (e.g. "look at `src/handlers/` for copy-pasted validation logic and just tell me what you find"), don't ask — proceed and state the scope you're using in one line before you start.

## Step 1 — Find candidate clusters

Pick a detection strategy appropriate to the scope size and the language(s) involved. See `references/detection-tools.md` for concrete commands per language/tool (jscpd, PMD CPD, Simian, tree-sitter-based structural matching, and a plain NCD/gzip fallback with a ready-to-run script) — read that file before this step if you haven't already, rather than guessing at flags from memory.

General approach, cheapest-first:
- **Structural/token clone detection first** if a suitable tool is available for the language — this is precise and fast, and directly gives you clusters of near-identical code with line ranges.
- **NCD (compression-distance) pass** when no good clone-detector exists for the language, or as a cheap first filter over a very large scope to shortlist which subdirectories/files deserve a closer look before running something heavier. The intuition, worth stating in the report if the user seems unfamiliar with it: two code blocks that compress much smaller together than apart share real structure, the same way two similar text passages do.
- Chunk at a meaningful unit — function/method bodies, not whole files — or clone detectors will drown you in file-level noise.

The output of this step is a list of clusters: each cluster is a set of 2+ code locations (file + line range) that a detector flagged as similar, with a similarity score.

## Step 2 — Build the domain index

Before judging a single cluster, write down what the domain says must be the same and what it says must differ. Without this, Step 3 is eyeballing, and eyeballing is what produces both bad abstractions and missed drift.

The index is **small and explicit** — aim for one page, roughly 5–15 rows total across three sections. Read `references/domain-index.md` for the format, the harvest sources in priority order, and a worked example.

- **Canon** — concepts where one rule must hold identically everywhere. Divergence between sites is a **defect**, reportable on its own even when you recommend no refactor.
- **Variation by design** — concepts that look alike but are supposed to differ, with a note on *what decides* the difference and who owns that decision. Convergence here is the defect; never merge these, however identical they look today.
- **Unowned** — a function performed in several places with no component whose job it is. These are the absorb-or-eliminate candidates.

**Harvest the index, don't invent it.** In priority order: an existing glossary, context map or ubiquitous-language doc; the specs and tickets already cited in comments near the clusters; test names that state a rule; docstrings that give a *why*. Only then ask the user — and ask three to six targeted questions, not an interview.

The single highest-yield signal, and the reason to read comments before code: **a repeated comment is evidence.** The same explanatory sentence or ticket reference appearing verbatim at every site of a cluster is the domain telling you there is one rule with several copies — a canon row, and usually an extraction. Different reasons cited at each site, each naming its own spec section, is the domain telling you the divergence is the point — a variation row, and a "leave duplicated." A comment instructing the reader to copy this from somewhere else ("follow `x.vue`") is a canon row whose owner was never created.

If the scope is small and the domain genuinely has nothing to say about it (a pure utility layer, generated code), say so in one line and move on — an empty index is a finding, not a failure.

## Step 3 — Ask what function each cluster performs

For each cluster, answer three questions against the index. Answer them from the *callers* and the specs, not from the cluster's own lines — if you can only describe the code mechanically, you have not found the function yet, and that is the signal to widen the read: follow the call sites up to the user-facing action they serve, and down to what they persist or emit.

1. **Name the function in the business's words.** Verb plus domain noun, at the level of the process the software serves: "records what a production run produced", not "builds a meta object and calls updateOperation". Name it before you decide anything.
2. **Is that function essential to the process?** Would someone running the real process notice if it stopped happening? A function that exists only because of how the code got written — a shape that outlived the reason it was given — is not essential, however tidy it looks.
3. **Who owns it?** Is there already a component whose job this function is? Very often one of the sites has already generalized it and the others never found out.

The answers give the verdict directly:

| Function | Ownership | Index says | Verdict |
|---|---|---|---|
| One function across sites, essential | no single owner | canon | **Extract** — create the owner |
| One function across sites, essential | one site already generalizes it, or a component already exists | canon | **Absorb** — move the sites onto the existing owner; don't invent a second one |
| One function, and the differences *are* the function | each site owns its own policy | variation by design | **Leave duplicated** |
| No one's process depends on it | — | unowned / dead | **Eliminate** — delete, and say what else dies with it (i18n keys, tests, fixtures) |
| Different functions that happen to share a shape | separate by design | — | **Coincidental — no action** |

Two blocks that both validate a string, log an event, and return early can be token-identical while serving unrelated functions ("is this email well-formed" versus "is this SKU well-formed"). Coupling those means the two features can no longer evolve independently — a real cost even when the shared function is short. Never drop a coincidental cluster silently; report it as "duplicate but not related", since the user may read the domain differently than you do.

**Report drift separately.** When the index calls a concept canon and the sites have diverged, that is a bug finding regardless of what you recommend about the code: name what each copy does differently and which one is right. This is frequently the most valuable output of the whole audit, and it is invisible to every duplicate-finder that skips this step.

## Step 4 — Score each surviving cluster with MDL

For each cluster the function lens sent to **Extract** or **Absorb**, sketch the abstraction and estimate both sides of the MDL comparison. You don't need exact byte counts — a reasoned estimate is the point, and the report should show your reasoning, not just a verdict.

**Cost of the abstraction** = the shared function/class body, PLUS at every call site: the call itself plus whatever glue is still needed there (parameters passed, any pre/post lines that couldn't be folded in).

**Cost of the status quo** = the current duplicated code, counted as-is, at every site.

The tell-tale sign of a *bad* abstraction candidate: the parameter list needed to cover every site's variation grows to the point where it's nearly one parameter (or one conditional branch) per call site. At that point the "shared function" is really just the duplicated logic relocated behind a function call, with a dispatch table bolted on — same total complexity, worse locality (a reader now has to jump to the shared function AND understand every flag to know what one call site actually does). Concretely: if you're proposing more than roughly 2-3 parameters *beyond* what a reader would expect from the name, or any parameter whose job is "which branch of the original duplicated logic to run," that's the signal to recommend leaving the cluster duplicated.

When MDL comes out near break-even, the function lens breaks the tie, not line count: an essential function with one owner is worth centralizing at par, because the recurring cost is the multi-file edit every future change forces, not the lines on disk today. Say exactly that in the report when you lean on it.

Also weigh **volatility**, since MDL alone doesn't capture it: if the call sites are known to be about to diverge for real product reasons (e.g. "these will need different validation rules next quarter"), that's a reason to favor leaving the duplication even when the current-moment MDL math favors merging — abstracting something that's about to legitimately fork just relocates the coming pain. The index's variation section is where this usually shows up first; ask the user if it isn't clear from context.

## Step 5 — Name the abstraction by its function

For clusters you recommend merging, the name is not optional polish — a bad name is often what makes an abstraction feel wrong even when the MDL math was right. Name it after **the function you wrote down in Step 3**, which is by construction the thing invariant across every call site — not the mechanism, and not the fact that it was extracted from duplication.

- Bad: `handleCommon`, `processHelper`, `doValidation2`, `genericUpdate`
- Better: name it so it reads correctly on its own, at a call site, without needing to visit the original duplicated locations to understand what it means. If you can't state the function in one short phrase, that's itself a sign Step 3 was too optimistic — go back and re-check whether this cluster is coincidental after all.

Sanity check before finalizing a name: would someone who has never seen the duplicated call sites understand what this function is for, just from its name and parameter names? If not, keep refining, or downgrade the recommendation to "duplication flagged, no abstraction proposed yet."

## Step 6 — Report

Use this structure. Do not silently drop clusters that didn't survive Step 3 or Step 4 — a documented "leave this duplicated" verdict is a legitimate finding and often the most useful line in the report for a reviewer deciding what NOT to spend time on.

```markdown
# Coherence Audit — <scope>

## Scope
<boundary, depth, and any exclusions used for this run>

## Domain index
<the three sections, one line per row, each with its authority —
 spec section, ADR, ticket, test name, or "asked the user">

## Summary
<N clusters found; M to extract, A to absorb into an existing owner,
 J to leave duplicated, E to eliminate, K coincidental; D drift defects>

## Drift — canon concepts whose copies disagree
<one line per divergence: the rule, the copies, which one is right.
 Omit this section if there is none.>

## Cluster <n>: <short description>
**Locations:** <file:lines, file:lines, ...>
**Similarity:** <how it was found — e.g. "97% token match" or "NCD 0.08">
**Function:** <verb + domain noun, in the business's words>
**Index:** <canon / variation by design / unowned — and the authority for that>
**Essential?** <yes, and who owns it / no, and what depends on it>
**MDL estimate:** <abstraction cost vs. duplicated cost, one line each —
 only for Extract and Absorb>
**Verdict:** Extract / Absorb / Leave duplicated / Eliminate / Coincidental — no action
**Proposed abstraction** (only for Extract and Absorb):
  - Name: `<name>`
  - Signature sketch
  - What stays as call-site-specific glue
**Reasoning:** <2-4 sentences — why this verdict, referencing Steps 3-4>

<repeat per cluster, strongest/most-confident recommendations first>
```

Keep each cluster's reasoning short and concrete — this report is meant to be reviewed and argued with by someone who knows the code, not accepted on authority.

## A note on tone

This audit produces judgment calls, not violations of a linter rule. Present verdicts as reasoned recommendations with visible reasoning, not pronouncements — the user (or their team) knows the domain and product trajectory better than any static analysis can, and Step 4's volatility caveat exists precisely because the "right" answer can depend on things no tool can see in the code alone.

The domain index deserves the same treatment: show it, cite where each row came from, and invite correction. A row you inferred from a comment rather than read in a spec is a hypothesis, and the user is the one who can confirm it. Mark those rows as inferred rather than presenting the index as established fact.
