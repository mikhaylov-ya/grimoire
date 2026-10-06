# The brief — read before Step 1

The brief is the situation model every idea is generated against and cited from. Write it to
`<scratchpad>/brief.md` with stable row ids: **R** roles, **D** domain facts, **C** complaints,
**K** capabilities. Ideas get **I** ids later. Keep each part short — the brief is a tool, not a
deliverable; the report quotes only what the top picks need.

## Context sheet

| Id | Role | Goal, in their words | Frequency | Expertise | Device · browser · input | Environment | Stakes | Source |
|---|---|---|---|---|---|---|---|---|
| R1 | Account manager | "Put in the order while the customer is on the phone" | 30×/day | expert | Windows laptop, Chrome, keyboard | open office, on calls | wrong quantity ships | given |
| R2 | Warehouse lead | approve and pick | 100×/day | intermediate | shared tablet, Safari, gloves | loud, standing | late shipments | assumed |

- **Expertise** in Cooper's sense: novice, intermediate or expert *for this flow*, and how fast
  people move through the stages. Someone who uses a screen once a month stays a novice on it
  forever.
- **Source** is *given* (the user or the docs said so) or *assumed* (your domain inference). Keep
  both visible. A top pick that rests on an assumed row says so in the report.
- Include roles the request doesn't mention but the code does: permission checks, role enums and
  route guards list who else is in the app.

## Domain self-interview

Answer each in a line or two before generating ideas; each answer is a **D** row. This is where
domain common sense enters the brainstorm, so mark every answer *assumed* unless a source says it.

1. **Unit of work** — what would the user count at the end of the day? An order, a visit, a
   ticket, a shift, a batch.
2. **Rhythm** — the daily loop, weekly reviews, month-end peaks, seasons. Which flow runs under
   time pressure?
3. **Before and after** — where does the input come from, and where does the output go?
4. **What goes wrong in this work regardless of software** — wrong patient, wrong quantity, double
   booking, a missed deadline. Software can prevent or amplify each one.
5. **What is costly to get wrong, and what is cheap** — this decides where friction is deliberate
   and where it is waste.
6. **Who else is involved** — colleagues, managers, customers, auditors — and what they need from
   this user.
7. **What sits beside this app** — spreadsheets, email, phone, paper, a legacy system. They show
   the user's mental model and the patterns users already know.
8. **What mature tools in this domain do** — keyboard grids in accounting, scan-first in
   warehouses, calendar views in scheduling. Users bring these expectations with them.
9. **What users are measured on** — speed, accuracy, cases closed, customer satisfaction. Ideas that
   move their number get adopted; ideas that cost it get worked around.

## Feedback digest

One card per complaint, ticket or verbatim:

| Id | Verbatim (short) | Literal ask | Need behind it | Role | Flow · screen | Type | Signal | Cause |
|---|---|---|---|---|---|---|---|---|
| C3 | "I pick the customer again every single time" | remember the customer | don't re-enter what the contract names | R1 | create order | Friction | 4 reporters | `OrderForm.tsx:88` stores only `contract_id` |

**Types**, and the families they usually call for:

| Type | Means | Families |
|---|---|---|
| Defect | the code does the wrong thing | Prevent — and it's a bug to fix, not an idea to weigh |
| Friction | it works, but costs | Remove, Accelerate |
| Confusion | they can't tell what to do or what happened | Reveal |
| Mismatch | the app's model of the task differs from theirs: order, naming, granularity | Reveal, Reframe |
| Missing | the app doesn't do something the job needs | Connect, Remove |
| Lost work | input, state or progress disappears | Protect |
| Environment | depends on the browser, device, network or data volume | Fit |
| Outside UX | pricing, policy, staffing | note it and leave it |

**Reading feedback:**

- **The need behind the ask.** "Add an export button" may mean "I need this in my Monday report" —
  then the report in the app, or a scheduled email, may serve better. Ask *why* until the answer is
  about the work, and stop there. The user's own suggestion stays in the bank as one idea, labeled
  as theirs.
- **Signal.** How many people, how often, how much it costs them. One vivid complaint is a lead, not
  a trend. Write "unknown" when the feedback doesn't say.
- **Say versus do.** Reports of what went wrong are strong evidence; predictions of what people
  would use are weak (Nielsen, "First rule of usability? Don't listen to users", 2001).
- **Vocabulary is data.** The words people use for things are candidate labels.
- **Workarounds are the best evidence there is.** "I keep a spreadsheet", "I open two tabs", "I copy
  it from the other screen" each name a missing feature.
- **Silence is not satisfaction.** A role that never complains may have given up, or was never
  asked. Run the Fit lens for it anyway.

**Triangulate with the code.** For each card, find the code that would produce the experience:

- **Found** — cite it. The cause is now Observed, and the card's ideas start from that line.
- **Not found, but explained by context** — name the context fact (Safari on iPad, 5,000 rows,
  decimal comma). The idea goes to the Fit family.
- **Contradicted** — the code seems to do what they ask. The problem is discoverability or a
  mental-model mismatch, and that is often the strongest idea in the bank.

## Capability inventory

| Id | Capability | Where | In the UI? |
|---|---|---|---|
| K4 | batch status update — `PATCH /orders` takes `ids[]` | `api/orders.ts:120` | hidden: the list updates one row at a time |

Search for: endpoints and mutations that take arrays; search, filter and sort parameters in the API
compared with those the UI sends; undo, restore, soft delete; drafts and autosave; import and
export; duplicate and templates; key handlers; notifications, emails and webhooks; saved views;
the permission model; audit logs. Hidden and partial rows are ideas already half-built.

## Flow sketches

Per scoped flow, three lines and a count, in `ux-flow-audit` Step 3's order — graph, then ideal,
then actual:

> **Create order** — entities: customer → contract → product. Ideal 5 interactions; actual 12
> across 2 screens. Gap: customer re-picked (C3), product picker unfiltered by contract, no
> "add another".

Count with `../ux-flow-audit/references/interaction-cost.md`, "Counting cost". The gap is not the
report here: each gap is a target for the lenses.
