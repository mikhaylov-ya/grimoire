# Ground, converge, report — read before Step 3

## Anchors

Every idea cites at least one anchor, using the brief's ids or a code location:

| Anchor | Example | Strength |
|---|---|---|
| Complaint and the code that causes it | C3 + `OrderForm.tsx:88` | strongest |
| Code location | `api/orders.ts:120` — the batch endpoint the UI never calls | strong |
| Complaint alone | C7, cause not found | medium |
| Given context or capability | R2 (gloves, given), K4 | medium |
| Assumed domain or context fact | D5 (month-end peak, assumed) | weak — say so |

An idea whose only anchors are assumed is kept only if it is specific and the assumption is named.

## Grounding checks

Run all five on every raw idea (SKILL.md Step 3), and record the outcome in the bank:

1. **Exists** — no / partly / yes / hidden capability. "Yes" is dropped unless a complaint shows
   nobody finds it; then the idea becomes making it discoverable.
2. **Anchors** — as above.
3. **Swap test** — with another app's name in it, does the idea still read true? Then it names
   nothing from this app yet.
4. **Feasibility** — what supports or blocks it: an existing endpoint, backend work, a schema
   change, a design-system gap.
5. **Who it hurts** — a role, a less common goal, a deliberate guard.

## Clustering

Group the ideas into 4–8 **opportunity areas**, each named by the user need it serves, in the
users' words: "Account managers re-type what the contract already says", not "Prefill". An idea
belongs to one area. An area with one idea is usually part of another.

## Scoring

Three letters, not a formula. Numeric scores such as RICE need reach and impact data a brainstorm
doesn't have, and invented numbers look more certain than they are.

- **Value — H / M / L.** Who (how many users, how much the brief weights their role) × how often
  (per day versus once) × how much (interactions saved, errors prevented, the worst outcome
  avoided). Quote interaction counts from the flow sketches where you have them.
- **Confidence — H / M / L.** High: a complaint and the code agree. Medium: one strong anchor.
  Low: assumed context or domain only.
- **Effort — ⚡ / S / M / L.** Under an hour · a day · a few days · needs backend or design work.
  The same scale as `ux-flow-audit`.

## Picking

- **Top picks** — 5–10. Value H and confidence at least M, any effort. No more than three from one
  area, so the list shows the range of the bank, not one theme five ways.
- **Quick wins** — effort ⚡ or S, value at least M, not already a top pick.
- **Bold bets** — 2–3 Rethinks, chosen for upside rather than certainty. Each states what would
  have to be true for it to work, and the cheapest test of that.
- **Tempting but wrong** — the obvious ideas you considered and rejected: they hurt another role,
  remove a deliberate guard, already exist, or fix a symptom of a cause another idea removes.
- Everything else that survived grounding stays in the bank.

**Variants.** When one idea has a cheaper and a bigger version, keep it as one entry with
*Smaller* and *Bigger* lines rather than two competing entries.

**Checking it.** Each top pick and bold bet gets one line: the cheapest evidence that would confirm
or kill it. Name the analytics event if the code already tracks one; a log or database query (how
often a field is edited within minutes of creation shows a default that's wrong); a task test with
five users from the role (Nielsen & Landauer, 1993, on why five find most problems); a week behind
a feature flag.

## Report template

```markdown
# Usability Brainstorm — [app or area]

## Brief
Scope: [flows, and why these]. Inputs: [code paths; N complaints; which context was given].
Roles: R1 [one line] · R2 [one line] — given / assumed.
Assumptions that matter: [the assumed facts the top picks rest on]

## What the feedback says
One line per complaint cluster: the need behind it, the signal, and the cause — `path:line` if
found in code, otherwise the context fact or mental model that explains it.

## Top picks

### I12 — Fill the customer from the chosen contract
**Area:** Re-typing what the contract already says · **Family:** Remove · **Scale:** Tweak
**Value** H · **Confidence** H · **Effort** ⚡
**Anchors:** C3 ("I pick the customer again every single time", 4 reporters) ·
`src/orders/OrderForm.tsx:88` · R1
**Idea:** [2–4 sentences: what changes for the user]
**Why it helps:** [the cost removed or the error prevented, with counts where you have them]
**Smaller / Bigger:** [optional variants]
**Watch out:** [who it might hurt, what it depends on]
**Check it:** [the cheapest evidence]

## Quick wins
| Idea | Anchors | Effort |
|---|---|---|

## Bold bets

### I31 — [title]
**What changes:** [the rethought flow, in a few sentences]
**Would have to be true:** [the assumptions]
**Cheapest test:** [prototype, flag, interviews]

## Tempting but wrong
| Idea | Why not |
|---|---|

## Idea bank
Grouped by area; every idea that survived grounding.
| # | Idea | Family | Scale | Anchors | V | C | E |
|---|---|---|---|---|---|---|---|

## Coverage
Complaints → ideas: C1 → I3, I12 · C2 → I7 · C5 → none, outside UX (pricing).
Families with no ideas: [family — why].
Not determinable from source: rendered layout, real data, actual latency, what users really do.

## Worth asking
Questions whose answers would change the top picks — "Do account managers ever order outside the
customer's active contract?" — and ideas you couldn't anchor.
```

## Writing ideas

- **Title what the user gets, with the domain noun.** "Fill the customer from the chosen contract"
  beats "Smart prefill".
- **The user's experience first**, then the anchors, then the mechanism.
- **Quantify** where the flow sketches allow: interactions removed, screens skipped, errors made
  impossible.
- **Take a position.** "Could consider exploring whether…" is not an idea. State it plainly and let
  the confidence letter carry the uncertainty.
- **Don't pad.** If a flow is already good, say so and spend the bank elsewhere. Forty specific
  ideas beat a hundred that could describe any app.
