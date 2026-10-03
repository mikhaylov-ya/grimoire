# Abstraction forms — read before Step 4

"Extract a function with parameters" is one form among many, and the MDL check in Step 4 only prices that one. When a family varies in ways a parameter list can't carry, the answer is usually a *different form*, not "leave duplicated". Pick the form from the **shape of what varies**, and pick the **weakest** one that fits: value → record → function → object/pattern → data + interpreter. Reaching for Strategy where a conditional suffices is the classic miss (Kerievsky's own confession in *Refactoring to Patterns*).

## Converge before you abstract

1. **Align the copies.** Slide statements, split phases, extract variables and rename until the copies line up line for line and every difference sits in one place. "Make the change easy, then make the easy change" (Beck).
2. **Flock.** Take the two most alike copies, find the smallest difference, make the simplest change that removes it; repeat (Metz, *99 Bottles of OOP*). Each difference you remove is a smaller abstraction inside the larger one — **name it**. A difference you can't name is one you don't understand yet.
3. **Classify what remains** with the table below and choose the form.
4. **Check refactorability.** A difference that can't be parameterized without side effects, or a statement that can't be moved without changing behaviour, blocks extraction (Tsantalis et al.). Leave a hook or leave it duplicated.

In the audit you don't perform these edits — you do them in your head to find the true variation shape, and the report's signature sketch is what's left after step 2.

## Form by variation shape

| What varies | Form | Don't, when |
|---|---|---|
| A literal / constant | Parameterize Function | the parameter is a boolean or mode → next row |
| A flag picks the behaviour | Separate named functions over a private core (Remove Flag Argument) | — |
| A few values always travel together | Parameter Object / pass the whole record | — |
| One step in the middle | Pass a function (callback, lambda, slot) | the callback needs most of the caller's context |
| The same ordered skeleton, different steps | Template: higher-order function / composable with hooks, or Form Template Method | step order differs per site, or step count keeps growing |
| The whole algorithm, chosen at runtime | Strategy — one object/function per variant, chosen once | a single 2–3 branch conditional |
| The same `switch` on type in several places | Polymorphism / a per-type record looked up once | the switch exists in one place only |
| Behaviour depends on state and transitions | Explicit state machine or transition table | two states that never grow |
| Several functions compute over one record | Combine into a class / a transform | they share no data |
| Same core, different pre/post steps | Extract the core, move the edges to callers | — |
| A repeated null/special-value check | Special Case / Null Object | — |
| Nearly-compatible interfaces keep callers apart | Unify the interfaces (adapter, null behaviour) | — |
| Same result, different code (Type-4) | Substitute Algorithm: converge on one implementation, then dedupe | behaviour differs at the edges |
| The variation *is* data — mappings, rules, per-case constants | A table / config record read by one engine | few cases, or cases need arbitrary logic |
| Sites combine elements of an implicit language | Adaptive model / interpreter (Fowler, Kerievsky) | the combinations aren't open-ended; the team can't debug an engine |

## Quality bar — beyond line count

An abstraction passes when it does all of these:

- **Hides a decision likely to change.** Name one or two plausible future changes and count the sites each touches before and after; at least one must become local (Parnas 1972; Beck, coupling = changes that propagate). This is the change-test line in the report; it outranks MDL (SKILL.md Step 4, "When the signals disagree").
- **Is deep.** Much behaviour behind a small interface. A wrapper whose interface is as big as its body is a shallow module (Ousterhout).
- **Every parameter earns its place.** Each takes 2+ distinct values across real call sites; no mode flags; no branch keyed on which caller is calling (Metz).
- **Names a domain concept.** A name that needs "And", "Or", "Helper", "Common" or "Generic" is grouping by shape.
- **Reads better at the call site.** Intention before de-duplication (Beck's design rules, in order).
- **Is cohesive.** A typical change edits all of it, not half.
- **Is cheap to reverse.** It can be inlined back without rewriting the callers.

## Over-abstraction, and when to hold off

- **The flag spiral** — each new case adds a parameter and a branch until nobody can read it. Remedy: inline back into every caller, keep each caller's path, re-flock (Metz, "The Wrong Abstraction").
- **Young clones in churning code** — many clones diverge soon after they appear; wait for the Rule of Three unless the copies already drifted by accident (Kim et al. 2005; Fowler).
- **Accidental drift is the strongest pro-merge evidence** — unintended inconsistent changes between clones are frequent and fault-prone (Juergens et al. 2009).
- **Deliberate clones** — forks kept apart to evolve independently, or templates meant to be copied, are an engineering choice; report and keep (Kapser & Godfrey).
- **Clones the language can't express** — track them, don't force them.
- **An engine only its author can debug** — interpreters and adaptive models move the logic somewhere the rest of the team can't step through (Fowler). Needs a strong case.

Sources: Fowler *Refactoring* 2nd ed. catalog, FlagArgument, BeckDesignRules, Adaptive Model; Kerievsky *Refactoring to Patterns* catalog and preface; Metz "The Wrong Abstraction", *99 Bottles* flocking rules; Beck "Coupling and Cohesion"; Ousterhout *A Philosophy of Software Design*; Parnas 1972; Hunt & Thomas DRY; Kim et al. ESEC/FSE 2005; Juergens et al. ICSE 2009; Kapser & Godfrey EMSE 2008; Tsantalis et al. TSE 2015.
