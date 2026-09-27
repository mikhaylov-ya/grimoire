# The Entity Graph

The ideal path is bounded by what the system could know. Most of what it could know is not on the
screen you're reading — it's one relation away, in a record the user already picked.

A per-screen pass cannot find this. Walking a form field by field, every field looks defensible:
someone has to choose the protocol, someone has to name the product. The defect is that choosing
the goal already named the product, and choosing the product already narrowed the protocols to
three. Nothing on the screen says so, because the missing link lives in another slice.

So build the graph before you count interactions.

## Build it from the schema, not the UI

Sources, in order of trustworthiness: foreign keys and join tables, the API's own types and filter
arguments, generated schema types, ORM models. The UI is the thing under audit — deriving the graph
from it just re-encodes the assumption you're testing.

Write down, for the entities the flow touches: the relations, their cardinality, and which side is
required. Three entities and four edges is usually enough; this is not a data-modelling exercise.

## Then read the domain docs for the *real* path

The graph tells you what is connectable. The domain docs tell you what users actually connect, and
in what order. Product specs, a glossary or context map, onboarding material, role guides — these
often state the intended journey outright:

> Users go to the substance page and create a synthesis from its protocols tab — they want to
> synthesize *that* substance, and the substance is usually the item named by an open goal.

That sentence is worth more than any heuristic: it names the anchor entity (the substance), the
hop the user has already made (they navigated to it), and a second relation the system can follow
(substance ← goal). A form that starts empty in that context is throwing away two known values.

Quote the doc in the finding. A divergence between a written intended path and the code is a
spec defect, not a preference — say so, and it stops being arguable.

## The five checks

For each edge in the graph that the flow crosses:

**1. Propagation — the chosen record names another; is that other one filled in?**
*Tell:* a handler that stores only the id it was given. `on_goal_select` setting `goal_id` and
nothing else, when the goal row carries `item_id`. Also: two steps that read the same relation
from opposite ends, neither writing to the other.
*Fix:* prefill the related field, visibly, editable, and only while the user hasn't set it
themselves.

**2. Narrowing — the chosen record constrains a later picker; is that picker constrained?**
*Tell:* the strongest one in this whole catalog — a query's filter arguments compared against what
the form already holds. A `where` built from `name ILIKE '%search%'` when the draft has a product
id, and the relation product→protocol exists, is proof by omission. Same for a select fed by a
`list_all` query in a form that has already picked the parent.
*Fix:* filter by the anchor by default, and provide a visible escape ("search all") — a narrowed
picker with no way out is a trap when the anchor is wrong or the data is incomplete.

**3. Direction symmetry — is the inference implemented both ways?**
Relations are symmetric; implementations rarely are. Teams usually build the direction that matches
their write order and leave the other empty. If picking the product narrows the goals but picking
the goal does not fill the product, that asymmetry is the finding — and it's cheap to fix, because
the join is already written.
*Tell:* one query filtered by a draft field, and no code path writing the reverse.

**4. Invalidation — when the anchor changes, what happens to what was derived from it?**
Inference creates a dependency the user can't see. Change the product, and a goal chosen for the
old product is now wrong — silently attached, and submitted.
*Tell:* a prefill or filter that reads the anchor, with no watcher clearing or re-checking
dependents when it changes. Ask what the backend does on submit: if it rejects the stale
combination, the user hits a submit-time error for a value they never touched; if it accepts, the
data is now wrong.
*Fix:* clear the dependent, or re-validate and say what changed. Never silently keep it.

**5. Entry-point coverage — the same form reached from N places; what does each one carry?**
A prefill contract is a promise; entry points fulfil it unevenly. Build the matrix:

| Entry point | Knows | Passes | Gap |
|---|---|---|---|
| Substance page → protocols tab | item, its open goals | item | goal |
| Goal page | goal, its item | goal, item | — |
| Global create menu | nothing | nothing | — deliberate |

*Tell:* grep the prefill type's usages and compare each call site against the route params and
the record on that page. A context-free global entry is fine and often deliberate; a context-rich
entry that passes a subset of what its page holds is the defect.

## What not to turn into a finding

- **A relation is not an intention.** Two entities being joinable does not mean the user wants the
  hop. Check the domain docs or ask; if you can't, mark it goal-dependent (⚠︎G*) and prefer
  "default plus visible override" to a hard narrowing.
- **Inference must be visible.** A prefilled field the user doesn't notice becomes wrong data
  submitted confidently — a *mistake* in the error taxonomy, the class confirmation dialogs never
  catch. Recommend prefill that shows itself (filled and editable, a stated filter chip on a
  narrowed picker), never a hidden default.
- **Don't propagate over user edits.** The rule is: fill what is empty, never overwrite what was
  typed. If the code has a `*_dirty` flag or similar, it already knows this — check it's respected.
- **Step order follows the inference, not the write order.** If step 4's answer could fill step 2,
  either the step order is wrong or the propagation is. Asking "зачем" before "из чего" is a
  product decision; note the conflict, name both options, let the owner pick.

## Reporting these

Name the relation and the hop, not the category:

> **F2 — Protocol picker ignores the product the plan already names**
> `protocol → protocol_revision_items.item_id` exists and the draft holds `items[role=product]`,
> but the picker's `where` filters on name and operation type only.

Quantify against the graph: "the user searches a catalogue of ~400 methodics for the 3 that make
this compound." That is the interaction cost the edge would have removed.
