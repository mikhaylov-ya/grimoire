# Fan-out roles — read when you are one of them

The fan-out splits SKILL.md Steps 1b and 3–6 across agents. `workflows/coherence-audit.js` launches
these roles and enforces their output schemas; without the Workflow tool, launch them as parallel
subagents with the same instructions. Every role:

- reads the domain index first — it is the authority for canon / variation by design / unowned;
- is read-only: no file is edited, created or deleted;
- cites `file:line` for every claim about the code.

## Inventory — one per module

SKILL.md Step 1b and `business-function.md`. Write one function card per unit in the module that
performs a business function; skip plumbing (formatting helpers, type glue, generic utilities).
Describe each unit from its callers and effects, not from its own lines.

## Group — one

`business-function.md`. Group all the cards by (function, effect class, rule), however different
their means. Context is a veto: cards with the same key in different contexts join a group only if
they pass the "stay apart" check. Keep groups with 2+ locations. Mark which clone clusters cover the
same code, so nothing is judged twice.

## Judge — one per cluster

SKILL.md Steps 3–5 and `abstraction-forms.md`. Read every location and its callers.

- A cluster grouped by function card rather than code shape is verified pairwise first (inputs,
  outputs, side effects, edge cases, what the tests assert). If the members don't really do the
  same job, the verdict is Coincidental; otherwise put the commonality/variability matrix from
  `business-function.md` into `variationShape`.
- For Extract and Absorb, pick the weakest form that fits the variation and fill in form, name,
  signature, MDL and change test.
- Record any drift between copies of a canon rule, quoting the lines that disagree, and which copy
  is right.
- Tag confidence as SKILL.md Step 6 defines it: Observed, or Inferred with the assumption named.

## Skeptic — one per verdict

Argue the opposite of the judge, reading the code yourself:

| Judge said | Argue |
|---|---|
| Extract / Absorb | Against the abstraction: coincidental duplication, variation by design, a flag per call site, a shallow wrapper, or a form stronger than the variation needs. |
| Eliminate | That something still depends on the code: callers, routes, jobs, tests, external consumers. |
| Leave duplicated / Coincidental | For a shared concept: one rule the sites must keep identical, drift between them, or a weaker form (parameter, table) that removes the duplication without coupling policy. |

Set `refuted` only if evidence in the code or the index beats the judge's reasoning.

## Synthesizer — one

Write the report in the SKILL.md Step 6 format from the judged clusters.

- Where a skeptic refuted the judge, weigh both arguments: change the verdict, or mark it
  "contested" with each side in one line.
- Fill the Drift section from every verdict's drift list.
- Fill Missing concepts by reading the clusters' functions together (SKILL.md Step 3).
- List any cluster that failed to judge, so the reader knows the report is incomplete.
