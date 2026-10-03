# Interaction cost — read before Step 3

The question for every step: **is this action necessary, or is the system making the user do work
it could have done itself?**

Each entry below: what it is, the *tell* to look for in code, the fix. Codes are section letter +
number; there is no F section, because F-numbers are findings in the report.

## Counting cost

Count the **ideal path** first (SKILL.md Step 3), then the actual. One action each for a click,
a select, a toggle, a field they must type into, a navigation they trigger, a modal they must
dismiss, a scroll-to-find, a wait they must sit through.

State the diff:

> **Add a team member** — ideal 4, actual 11 across 3 screens. Six avoidable (F1, F2, F3, F9); one
> is a deliberate legal consent step.

Two calibrations: a *decision* costs more than a click, so weight ambiguous selects above obvious
buttons; and fewer screens isn't automatically better — what helps is removing inputs and
decisions, not merging pages.

**Decision density.** Per screen, count choices demanded at once against choices required to
advance. A screen with nine inputs where two suffice is a finding even when each field is
individually defensible — nothing in the catalog below will catch it, because the defect is the
aggregate. *Fix:* progressive disclosure, or move the rest to a post-creation edit.

## A. Redundant input

**A1 — Asking for what the system already has.** The value exists in session, profile, the current
record, route params, a previous step, or the last thing the user did.
*Tell:* a required field whose value also appears in the session/user object, route params, or a
parent entity. *Fix:* prefill and allow editing, or drop the field. Also a WCAG 2.2 §3.3.7 issue,
so it carries standards weight, not just preference.

**A2 — Double confirmation of a value.** Email twice, password twice, account number twice.
*Tell:* paired fields with an equality validator. *Fix:* one field with a reveal toggle, or verify
downstream.

**A3 — Data the backend already derives.** *Tell:* the handler ignores, recomputes or overwrites a
submitted field. The user is typing into a void.

**A4 — Re-entry after a session boundary.** *Tell:* short token expiry with no draft persistence,
on forms behind an auth guard.

**A5 — Asking for what a chosen record already names.** The user picked a record that carries the
value the next field asks for. Tell and fix: `entity-graph.md` check 1, *Propagation*.

## B. Unnecessary decisions

**B1 — Selects with one real option.** *Tell:* options from a length-1 source, or filtered by a
prior answer until one survives. *Fix:* auto-select and render as text.

**B2 — Picker not narrowed by what's already chosen.** The user searches a whole catalogue for the
few rows compatible with a record picked earlier. Tell and fix: `entity-graph.md` check 2,
*Narrowing*.

**B3 — No default where an obvious one exists.** *Tell:* required selects, dates or quantities
initialized empty. The candidate is usually the most common option, today, 1, the last-used value,
or whatever the API defaults to. *Fix:* default it — a decision becomes a glance.

**B4 — Required fields that needn't be.** *Tell:* trace each required constraint to whether
consuming code actually needs it. Nullable in the schema but required in the form is the classic.
*Fix:* make optional, or defer to a later moment.

**B5 — Confirmations without stakes.** A dialog guarding something cheap and reversible — or worse,
a uniform confirm on every mutation, which trains people to click through the ones that matter.
*Tell:* confirmation on non-destructive actions, or on actions that already have undo. *Fix:* act
immediately, offer undo. The inverse — a destructive action with no guard *and* no undo — is a
separate, higher-severity finding.

## C. Unnecessary steps

**C1 — Steps with no dependency.** *Tell:* a wizard step that reads no state from prior steps and
whose validation could run alongside them. The sequence is imposed, not required. *Fix:* collapse,
or allow free movement between steps.

**C2 — Steps within steps.** A sub-flow opened from inside a flow, where the user loses their
place. *Tell:* dialog state nested inside wizard state; a sub-flow that discards the parent's state.

**C3 — Gates before value.** Login, signup, consent or tours placed before the user has seen
anything worth the cost. *Tell:* a guard on a route with nothing user-specific to protect; a signup
requirement on a flow whose payload doesn't actually need a persisted user. *Fix:* defer the gate
to where it's genuinely required. Forced account creation ahead of checkout is among the most
consistently documented abandonment causes in commerce research.

**C4 — Round-trip navigation after an action.** *Tell:* a post-mutation redirect to an index page
when the user wants the thing they just created, or wants to make another. No "save and add
another", no "save and continue editing". *Fix:* land them on the entity; offer the repeat inline.

**C5 — Manual refresh.** The user must reload to see the result of their own action. *Tell:*
mutations that don't invalidate or update their cached query; a "Refresh" button that exists
because invalidation doesn't; no polling where the backend is async.

## D. Work destroyed

**D1 — Lost input on validation failure.** *Tell:* error handling that remounts or resets the
form; a server re-render that doesn't echo submitted values back.

**D2 — Lost input on navigation.** Back, refresh or a stray link wipes in-progress work. *Tell:*
form state held only in component state, no draft persistence, no unsaved-changes guard. On long or
high-value forms this is major, not minor.

**D3 — Validation deferred to submit.** The user finishes everything, then learns field 2 was
wrong. *Tell:* validation only in the submit handler, for constraints knowable up front. *Fix:*
validate at field level and on blur; reserve submit-time errors for what only the server knows.

**D4 — Non-restorable view state.** Filters, search, sort, page and tab live in memory, so back
navigation loses them and URLs can't be shared. *Tell:* view state in local component state rather
than query params. *Fix:* put it in the URL.

## E. Repetition

**E1 — No bulk action where the model has many items.** *Tell:* per-row buttons with no selection
model; a client looping single-item calls; an endpoint that accepts an array while the UI only ever
sends one. That last case is the strongest version — the capability exists and the UI hides it.
*Fix:* multi-select plus batch action.

**E2 — No accelerators for frequent users.** *Tell:* no duplicate-as-template, no saved presets,
no "same as last time", no Enter-to-submit, no shortcuts on the highest-frequency actions.
Efficiency for repeat users is a distinct need from first-run clarity, and the code usually reveals
which one the app was built for.

## G. Reaching the thing

**G1 — No search where the list can grow.** *Tell:* pagination with no query parameter; a select
over an unbounded collection with no type-ahead.

**G2 — Burial.** A frequent action reachable only through list → detail → tab → menu → modal.
*Tell:* count route depth plus dialog and tab layers per common action. Cross-check against
analytics event names — the events the team tracks reveal which actions are frequent, and
frequency × depth is the real cost.

**G3 — Recall instead of recognition.** *Tell:* free-text inputs where a picker over existing
records is possible; errors naming a code the UI never showed; a step needing a value shown only on
a now-unreachable screen.

## I. Interruptions

**I1 — Auth friction on repeat visits.** *Tell:* aggressive token expiry with no refresh, no
"remember me", OTP for routine actions, CAPTCHA on every submit rather than on suspicion. Recall-
or transcription-based auth also touches WCAG 2.2 §3.3.8.

**I2 — Uncontrollable timeouts.** Sessions expiring mid-task with no warning or extension (WCAG
2.2 §2.2.1).

**I3 — Blocking waits.** *Tell:* chained awaits with no data dependency; one slow call gating the
whole route; no optimistic update on a mutation the user repeats quickly.

## Is the cost worth removing?

Not every extra click is a defect. Before writing the finding:

- **Frequency.** A cost paid once at signup differs from one paid forty times a day.
- **Is the friction deliberate?** Confirmation on irreversible actions, legally required consent and
  fraud checks are features. If removing the step creates a safety, legal or data-integrity risk,
  say so and make it *cheaper* instead — undo rather than confirm.
- **Does the goal hypothesis hold?** See SKILL.md. If the fix only helps under an assumed goal, mark
  it, and prefer a visible override to removing the choice.
- **Does the code support the fix?** If you propose bulk edit, check an endpoint or transaction
  boundary exists. Note backend work where needed.
- **Is the fix smaller than the problem?** Prefer prefill, default and undo. Reserve "restructure
  this flow" for when the step sequence itself is the defect.
