# Lenses — read before Step 2

A lens is a question you put to a concrete target: a complaint cluster, a flow step, a role, an
edge of the entity graph. Each family below states the principle it comes from, the operators to
apply, and the code tells that show where the operator will pay off. Tag each idea with the one
family it mainly serves.

| Family | Serves | Ask of the target |
|---|---|---|
| 1. Remove | interaction cost | Could this step do itself? |
| 2. Prevent | errors and user-facing bugs | How does this go wrong, and what stops it? |
| 3. Reveal | confusion | Can they see what to do, and what happened? |
| 4. Accelerate | frequent users | What does the hundredth time feel like? |
| 5. Protect | lost work | What does an interruption cost here? |
| 6. Fit | context of use | Does it work for this role, on this device, in this place? |
| 7. Connect | the whole job | Where does the work come from and go to? |
| 8. Reframe | thin or conflicted targets | What if we changed the question? |

Run families 1–7 on every target they fit, then Reframe on the targets where ideas came out thin,
conflicted or all Tweaks.

## 1. Remove — the step does itself

*Principle:* TRIZ's **ideal final result** (Altshuller): the function is performed, and the thing
that performed it doesn't exist. For a UI: the goal is reached and the step isn't there. This is
`ux-flow-audit`'s ideal path, used as a generator rather than a yardstick.

- **Delete the step.** What if this field, screen or confirm didn't exist? What would the system
  need to know instead — and does it already know it: from the session, from the record chosen one
  relation away, from history, from a default? Detail: `entity-graph.md` checks 1–2 (propagation,
  narrowing) and `interaction-cost.md` sections A–C.
- **Use idle resources.** TRIZ's rule is to solve with what the system already has before adding
  anything. *Data* the app holds but ignores: last-used values, per-user frequency, the record's
  own history, relations. *Capability* the backend has and the UI hides: an endpoint that takes an
  array, filter parameters no screen sends, a field nobody shows. *The user's device*: paste, file
  drop, the camera for a barcode, the browser's autofill. *Time*: prefetch while they type,
  compute while they read.
- **The system proposes, the user confirms.** Turn an input into a suggestion: prefilled and
  editable, options ranked by what this user picks, "same as last time".
- **Move the work to when the user has the answer.** Ask at the moment of the related event, or
  defer until something needs it (`interaction-cost.md` B4, C3).

*Tells:* everything in `interaction-cost.md`; API parameters and endpoints no UI code calls; fields
the backend derives anyway (A3); a store that remembers nothing between sessions.

## 2. Prevent — the mistake can't happen, or can't do damage

*Principle:* Reason, *Human Error* (1990), and Lewis & Norman, "Designing for error" (1986): don't
fight errors with warnings — constrain, make the state visible, make actions reversible. Work the
**error ladder** and give each error-prone point ideas on more than one rung:

1. **Prevent** — constrain the input: a picker over free text, only the valid options, a mask, an
   option disabled *with the reason*. Make the wrong action impossible in that state.
2. **Detect early** — validate at the field; warn on plausible but unusual values using the
   domain's ranges (10,000 units from a customer who orders 10); show the consequence before the
   commit ("this will email 340 people").
3. **Recover** — undo instead of confirm, a trash with restore, edit after submit, versions.
4. **Limit damage** — drafts, idempotent submits, soft delete, bulk actions that show exactly what
   they will touch.

A *mistake* — a wrong intent from a wrong mental model — is not caught by a confirm dialog, because
the user confirms confidently. Fix what the screen communicates (`flow-checks.md`, error taxonomy).

**Bug seams.** "Fewer bugs" ideas come from places where an interaction invites a user-visible
bug. Most are greppable:

| Seam | Tell in code | Idea shape |
|---|---|---|
| Double submit | submit handler with no pending guard; non-idempotent POST | disable while pending; idempotency key |
| Stale list after a mutation | mutation that doesn't invalidate or update the list's query | invalidate, or update the cache from the response |
| Lost update | edit form with no version or ETag on a record several people edit | "changed by X since you opened it" on save |
| Optimism without rollback | optimistic update with no restore in the error path | roll back and say what failed |
| Out-of-order responses | fetch per keystroke, no abort or sequence check | abort the previous request; debounce |
| Resubmit on back or refresh | POST that renders instead of redirecting; wizard state in memory | redirect after POST; state in URL or draft |
| Day off by one | `new Date("2024-03-05")` (parsed as UTC) shown in local time | date-only type; show the time zone where it matters |
| Rejected locale input | `parseFloat`/`Number` on typed amounts where the decimal separator is a comma | locale-aware parsing; accept both |
| Limits checked too late | file size or type checked only by the server, after the upload | check before upload, state the limit up front |
| Silent failure | empty `catch`, or `console.error` as the only handling | surface it, offer retry |
| Paste rejected | inputs that reject spaces, dashes or `+` in pasted IBANs, phones, card numbers | normalize on paste |

## 3. Reveal — they can see what to do, and what happened

*Principle:* Norman's **gulfs** of execution and evaluation; Nielsen's visibility of system status
and recognition over recall.

- **Execution.** What must the user know to act, and where will they look for it? Disclose
  preconditions before they hit them ("Submit: 2 lines have no price"). Label actions by outcome,
  not mechanism. When a complaint asks for something that exists, the idea is to surface it where
  they looked.
- **Evaluation.** After acting, what changed, and where will they see it? Status of async work —
  queued, running, failed, done — where they'll look next; the *why* behind system decisions (why
  this price, why rejected, why read-only); who changed it, and when.
- **States that explain.** Empty, denied and partial states that say why and offer the next step
  (`flow-checks.md`, state coverage).
- **Vocabulary.** Compare the words in the complaints with the words in the UI strings. Users
  describe the task in their own words; labels that mirror column names (`item`, `entity`,
  `status 3`) are a rename idea, and the complaints supply the new names.

*Tells:* disabled buttons with no reason; raw error codes rendered; i18n values that echo schema
names; status enums printed as-is; background jobs with no status the UI can read.

## 4. Accelerate — fast for those who do it all day

*Principle:* Cooper's **perpetual intermediates** — most users neither stay beginners nor become
experts; Shneiderman's shortcuts for frequent users; Raskin's **habituation** — what people do
often becomes automatic, so the frequent path must be stable and free of modes. Gal'perin's
stepwise formation of mental actions adds the time axis: support starts external — hints, examples,
a visible checklist — and should fade as the action is internalized. Scaffolding that never fades is
clutter for the expert.

Ideas by stage of use:

- **First run** — example data, defaults that work, a first task that succeeds.
- **Learning** — hints that retire after a few uses; an example next to the hard field.
- **Fluency** — a keyboard path through the frequent flow, Enter to submit, Tab order that follows
  the work, type-ahead in every picker.
- **Mastery** — bulk actions, duplicate-as-template, saved views and filters, a command palette,
  paste-many (a column pasted from a spreadsheet becomes 50 lines).
- **Stability** — frequent controls don't move between states; nothing shifts as data loads; no
  modes that change what a key does.

*Tells:* `interaction-cost.md` E1–E2 and G1–G2; no key handlers anywhere; tables with no selection
model; no duplicate endpoint; filters held in component state (D4).

## 5. Protect — interruptions don't cost work

*Principle:* Reason's **memory lapses** — the user knew, then got interrupted. In clinics, support
desks, shops and the field, interruption is the normal state, not the exception.

- **Drafts** — autosave long forms; on return, "you have an unfinished order from yesterday".
- **Survive boundaries** — session expiry that restores the work after login; the deep link kept
  through the auth redirect.
- **Several tabs** — the same record open twice: sync the tabs, or warn before one overwrites the
  other.
- **Hand the context back** — recently viewed, "continue where you left off", reminders on work
  that's due.
- **Long tasks** — imports and exports that keep running when the page closes, and say when
  they're done.

*Tells:* `interaction-cost.md` A4, D1, D2, I2; form state only in component state; no
`beforeunload` or router guard; an auth redirect with no return URL; uploads tied to a component's
lifetime.

## 6. Fit — built for the people, devices and places in the brief

*Principle:* usability is relative to **specified users, goals and context of use** (ISO 9241-11).
Soviet engineering psychology made the same point about operators (Lomov, *Человек и техника*,
1966; Zinchenko & Munipov, *Основы эргономики*, 1979): working conditions are part of the system
being designed, not its surroundings.

- **Walk it as them.** For each role × flow, walk the flow with that role's knowledge, device and
  surroundings, asking the cognitive-walkthrough questions in `flow-checks.md`.
- **Apply every context fact.** Each fact in the context sheet has a row in `context.md` with its
  design consequences and what to check in the code.
- **Real data.** What do real records look like — long names, 5,000 rows, zero rows, Cyrillic, 30
  line items — and does each screen survive them?
- **Role conflicts.** Where one flow serves two roles who need different things, hand it to
  Reframe.

## 7. Connect — the whole job, not the screen

*Principle:* **activity theory** (Leontiev; brought into HCI by Bødker, *Through the Interface*,
1991, and Kaptelinin & Nardi, *Acting with Technology*, 2006). Software serves an activity whose
motive runs beyond the app — across colleagues, other tools, paper and phone calls. Activity breaks
into actions with goals, and actions into operations that run without thought. A **breakdown** is
when an operation falls back into a conscious action: the user has to think about the tool instead
of the work. Many complaints are reports of breakdowns. From contextual inquiry (Beyer &
Holtzblatt): **workarounds** point straight at unmet needs.

- **Before and after.** What does the user do just before this flow, and just after? Where does the
  input come from — an email, a PDF, a call, a spreadsheet — and where does the output go — a report
  to a manager, a customer email, a printed label? Ideas: import or paste from the source; export,
  share or print in the shape the next step needs.
- **Handoffs.** Where does the work wait for someone else? How do they find out, what do they need
  to know, and how does the first person learn it's done? Ideas: assignment, status the requester
  can see, notifying the next role, comments in context.
- **Workarounds.** Spreadsheet exports edited and re-imported, copy-paste between screens, a
  free-text "notes" field holding structured data, the same report pulled every Monday — each is a
  missing feature. If the feedback doesn't show them, ask.
- **The motive.** Why is the user doing this at all, and what are they measured on? An idea that
  serves the motive can skip the flow: the manager wants "which orders are late", not a list of
  orders to scan.

*Tells:* export endpoints; `notes` or `comment` fields; email templates; status fields that change
with no notification; scheduled reports.

## 8. Reframe — when the obvious answers run out

Use on targets where ideas came out thin, conflicted or all Tweaks. Reframe ideas are usually
Rethinks, and still need anchors.

- **Resolve the contradiction (TRIZ).** State it as "we want X so that A, but X makes B worse":
  experts want density and novices want guidance; delete should be fast and safe; one role needs a
  field required, another needs it optional. Don't split the difference — separate the demands:
  - *in time* — guidance for the first few uses, then gone; a confirm only the first time;
  - *in space* — the dense view in the list, the guided view in the editor;
  - *on condition* — a confirm only when the stakes are high: an amount over a threshold, other
    people affected, nothing to undo;
  - *by role* — different defaults or views per role over the same data;
  - *whole and parts* — a bulk action safe as a whole, with a per-item preview.
- **SCAMPER the flow** (Osborn's checklist, as arranged by Eberle, 1971). *Substitute* the input:
  scan, paste, pick, import. *Combine* two steps or two screens. *Adapt* a pattern from a domain
  that solved this — spreadsheets, point-of-sale, IDEs, email clients. *Modify*: make the frequent
  thing big and the rare thing small. *Put to another use*: the confirmation screen becomes the
  receipt. *Eliminate*: the Remove family. *Reverse*: pick the product first and let it find the
  contract; the system pushes instead of the user pulling; the reviewer edits instead of rejecting.
- **Reverse brainstorm.** How would you make this flow as painful as possible for this role? List
  five to ten ways, check which ones the app already does, and invert those.
- **Change the actor.** What if another role did this step, the system did, the customer did it
  themselves, or nobody did because it can be derived?
- **Change the unit.** One at a time → many at once; per item → per batch; per user → per team; a
  form → a table; a page → a side panel next to the thing it's about.
