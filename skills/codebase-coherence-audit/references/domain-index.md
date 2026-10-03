# The domain index — read before Step 2

A duplicate-finder tells you two blocks look alike. It cannot tell you whether they are *allowed* to. The domain index is the small, explicit thing you check against so that Step 3 is a lookup instead of a guess.

Keep it to about one page — 5 to 15 rows total. An index that tries to describe the whole domain is a glossary, and writing one is a different job. This one covers only the concepts the clusters actually touch.

## The three sections

### Canon — one rule, one behaviour, everywhere

Concepts where every site must behave identically. Divergence is a **defect**, reportable on its own even when the refactor verdict is "leave it."

| Concept | The rule, in one sentence | Where it must hold | Authority |
|---|---|---|---|
| Work submission outcome | One mutation per click, never retried; an unanswered request is reported as unknown, not as failure | every creation form | `docs/product/creation.md` § "Resubmission" |

### Variation by design — looks alike, must differ

Concepts whose whole purpose is to differ per site. Convergence is the defect. Record **what decides** the difference and **who owns** that decision — that is what stops a future reader from "cleaning up" the divergence.

| Concept | Why sites differ | What decides it | Owner |
|---|---|---|---|
| Per-page action policy | each operation type offers a different set of acts to the operator | the type's own spec page | product, per type |

### Unowned — a function with no home

Functions performed in several places where no component's job it is. Each ends as **Absorb** (a site or component already holds the general form — move the rest onto it), **Extract** (nothing does — create the owner) or **Eliminate** (nothing needs the function). Record the nearest existing owner: it decides between the first two.

| Function | Performed at | Nearest existing owner |
|---|---|---|
| Patch a record's `meta` and keep the client cache in step | 4 sites | one site already has the general form |

## Harvest it; don't invent it

In priority order. Stop as soon as the rows are covered — this is a means to Step 3, not a deliverable of its own.

1. **An existing ubiquitous-language artifact.** A context map, `CONTEXT.md` / `GLOSSARY.md`, an ADR directory, a normative spec folder. If the repo has one, its terms *are* the index's vocabulary; use its words verbatim rather than paraphrasing. Check the repo's own doc index first if it has one — many repos say explicitly where the normative spec lives.
2. **Specs and tickets cited in comments near the clusters.** A comment that names a spec section or a ticket ID is the domain telling you a rule exists at that spot. Follow the link before deciding anything about that cluster.
3. **Test names.** A test called `does_not_retry_on_timeout` is a canon row already written down by someone.
4. **Docstrings that give a *why*.** Not the ones that paraphrase the code — the ones that explain a decision.
5. **The user.** Three to six targeted questions, not an interview. Good ones: "Are these four supposed to behave the same, or is each one's policy deliberate?" · "Is any of these about to diverge for product reasons?" · "Which of these is the correct one?" (when you have already found drift) · "Does anything still depend on X?" (when you suspect a function is dead).

## The comment-as-evidence heuristic

The highest-yield signal in the whole audit, and the reason to read comments before reading code:

- **The same explanatory sentence or ticket reference, verbatim, at every site of a cluster** → one rule with several copies. Canon row. Usually an extraction, and the comment itself is the name of the function you are extracting.
- **A different reason cited at each site, each naming its own spec section** → the divergence is the point. Variation row. Leave duplicated, and quote one of those comments in the report so the reviewer sees why.
- **A comment telling the reader to copy this from elsewhere** ("follow `x.vue`", "same as the listing", "mirrors the importer") → canon row whose owner was never created. This is duplication *by instruction*, and it is the clearest extraction signal a codebase can give you.
- **No comment at any site** → no evidence either way. Fall back on reading the callers, and mark the row inferred.

Grep for the shared comment text, not just the shared code: the comment often travels further than the clone detector's token window reaches, and finds sites the tool missed.

## What makes a row worth writing

- It names a **concept**, not a file or a function. "Submission outcome", not "`submit()` in `use_quick_create.ts`".
- It states a **rule or a reason**, not a description. "Never retried, because an unanswered request may have committed" beats "handles the response".
- It carries an **authority** — a spec section, ADR, ticket, test name, or the literal words "inferred from comment" / "asked the user". A row with no authority is a hypothesis; say so.
- It covers a cluster you actually found. Do not pre-write rows for concepts no cluster touches.

An empty index is a legitimate result: a pure utility layer or generated code may have no domain rules at all. Say that in one line and go to Step 3 with the coincidence check alone.

## Worked example — four sibling detail pages

Four pages render one record type each, all built from the same shared context builder. A clone detector flagged roughly 90 duplicated lines between two of them and a family of ~13 near-identical action-button components.

The index, harvested in about ten minutes from comments and the spec folder they cited:

**Canon**
- *Is this act offered right now* — the answer is the status machine, the per-type gate and the edit permission, in that order. Holds at every action control. Authority: the ten button docstrings, which state it identically.
- *Submission outcome* — one mutation per click, never retried; unanswered is unknown. Authority: spec § "Resubmission", quoted verbatim in both copies.
- *After cloning, the user lands on the new revision.* Authority: a ticket ID, plus two comments instructing the reader to copy the handler from a third page.

**Variation by design**
- *Which acts a page offers* — each page's gate table. Decided by the type's spec page; every key carries its own comment naming its own section. Owner: product, per type.

**Unowned**
- *Patch the record's `meta` and keep the cache in step* — four sites, one of which is already the general form.

What that index bought, which shape-matching alone would not have produced:

- The 13-file button family split into two verdicts instead of one: the gate predicate is canon → extract; the markup is per-act presentation → leave duplicated. A single verdict either way would have been wrong.
- The ~90 duplicated lines across the two pages became **leave duplicated**, because the largest block among them is the gate table — a variation row. Merging it would have replaced four readable policy tables with one table plus four override tables.
- The `meta` patch became **Absorb** rather than **Extract**: the owner already existed, and three sites simply never learned about it.
- The clone-success handler became an extraction on the strength of its comments alone; the block is five lines and MDL would have shrugged at it.
