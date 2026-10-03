# Business function — read before Step 1b

Clone detectors find code that *looks* alike. Code that *does the same job* usually doesn't: it
differs in algorithm, data structure, library and I/O (Wagner et al. 2016), and it's the kind of
duplication developers report actually hurting them (Käfer et al. 2018). This pass finds it by
describing what each unit does for the business, then grouping the descriptions.

## The function card

One card per unit that performs a business function — a handler, endpoint, composable, service
method, job. Skip plumbing: formatters, type glue, generic utilities. Describe the unit from its
**callers and effects**, not from its own lines.

| Field | Question |
|---|---|
| **context** | Whose vocabulary is this — which module, team, schema, UI area? |
| **trigger** | A user command, an event it reacts to ("whenever…"), a schedule, a query |
| **function** | Domain verb + work object: "reserve stock", not "update row" |
| **effect class** | calculation · predicate (select / validate / build-to-order) · state change · emitted event · external side effect |
| **rule** | The invariant or policy it enforces, in domain words — or "none" |
| **means** | Libraries, queries, loops — recorded, **never used for grouping** |

**Group by** (function, effect class, rule). **Context is a veto, not part of the key**: two cards
with the same key in different contexts are a candidate only after the keep-apart check below.

Grouping by label alone produces false clusters — a manual review of weak Type-3/4 benchmark pairs
found 93% had no similar functionality (Krinke & Ragkhitwetsagul 2025). So every group is verified
pairwise before it becomes a cluster: compare inputs, outputs, side effects and edge cases. If there
are tests, read what each one asserts; that is the contract.

## Commonality and variability, for a function cluster

For a verified group, before Step 3 (Coplien, *Multi-Paradigm Design*; Shalloway & Trott, *Design
Patterns Explained*):

1. **State the commonality in domain words**, one sentence — what every member does. If you can't,
   it isn't one family.
2. **Build the matrix**: columns are the sites, rows are the steps or decisions that cut across
   them, cells are how each site does it. Rows that differ are the **variation points**; a column is
   one site's configuration.
3. **Classify each difference.** *Positive* variability refines the commonality. *Negative*
   variability contradicts it — a site that has to pretend, special-case or opt out. Much negative
   variability means the commonality is wrong: split the family rather than add flags.
4. **Record binding time** for each variation point — fixed in source, chosen by config, or decided
   at runtime. It picks the form in `abstraction-forms.md`: source → parameter or separate
   functions, config → table, runtime → strategy or state machine.

The matrix goes into the report for the cluster; it *is* the reasoning.

## Signals that a domain concept is missing

A missing concept rarely shows up as one clone cluster — it shows up as several clusters that are
facets of one idea (Evans, *DDD* ch. 9 "Making Implicit Concepts Explicit"):

- **A word with no home** — tickets, UI copy or comments use a short term for something complicated
  that no module is named after.
- **The same predicate in a filter, a validator and a creation path** — one Specification in three
  shapes (Evans & Fowler, "Specifications").
- **A rule buried in a guard clause** in several places — a named Policy nobody extracted.
- **A repeated switch on the same status or type** (Fowler, Repeated Switches).
- **Values that always travel together** — a missing value object.
- **Contradictions** — two paths disagree about the same fact. This is drift, and a clue to the
  model.
- **Awkwardness** — the code where every new requirement piles on another special case.

When several clusters point to one concept, report the concept, not the clusters: its name, what it
would own, and which clusters it absorbs.

## Signals that lookalikes must stay apart

Same shape, same words, different context — merging couples models that must evolve separately
(Evans, Bounded Context; Vernon):

- **Same term, different attributes, invariants or life cycle** — "Policy" in underwriting versus
  claims.
- **Different actors or business phases.**
- **Different change history** — check `git log` for co-change; code that changes at different times
  for different reasons is accidental duplication (R. C. Martin).
- **Different owning team, schema or deployable.**
- **One side translates the other** through an adapter or anti-corruption layer — merging leaks the
  upstream model.

These go to **Variation by design** or **Coincidental**, never Extract. The narrow exception is a
small, explicitly shared kernel, or a generic subdomain that carries no business specifics.

## What makes a good abstraction here

- It hides **one business decision**, not a sequence of steps (Parnas 1972: modules "will not
  correspond to steps in the processing").
- Its name states **effect and purpose** in domain words, with no reference to means (Evans,
  Intention-Revealing Interfaces).
- Only units whose **rules match** are merged; a mismatched rule is negative variability.
