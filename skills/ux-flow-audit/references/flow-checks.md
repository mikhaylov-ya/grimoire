# Flow checks — read before Step 4

Apply after the interaction-cost pass. Use these as questions, not labels — a finding phrased as an
answer to a concrete question is useful; one phrased as a heuristic name is not.

## Cognitive walkthrough

For each step in a mapped flow, four questions:

1. **Will the user be trying to do the right thing here?** Does this step match what someone
   pursuing the goal expects next, or has the system inserted its own model of the task? The tells
   are in SKILL.md, "Whose goal are you auditing against?".
2. **Will they see the action is available?** Is the control that advances the flow actually
   rendered in this state — not disabled without explanation, not gated on an invisible condition?
3. **Will they connect the action to the outcome?** Does the label describe the outcome or the
   implementation?
4. **After acting, will they know they made progress?** Is there an observable state change that
   maps to what happened?

Questions 2 and 4 often catch the same defect from both ends: a disabled submit with no stated
reason blocks the user *and* tells them nothing.

Question 4 is where mutation-feedback findings live — report them only at the bar set in SKILL.md.

Two useful framings when naming what's wrong:
- **Can't work out how to act** — capability reachable only via API, operation split across screens
  with no signposting, preconditions enforced but never disclosed.
- **Can't work out what happened** — state changes with no rendered consequence, errors caught and
  dropped, async work with no status, the same UI for "running" and "failed".

## Other principles worth checking

Only where they bite, and only with concrete evidence.

- **Consistency** — the same action named and behaving the same everywhere. Two paths to the same
  mutation with *different validation rules* is a real bug class, not a style nit.
- **Error prevention over error messages** — constrain input so the mistake is impossible (pickers
  over free text, invalid options disabled with a reason) rather than validating after the fact.
- **Marked exits** — a cancel from every state that actually cancels.
- **Closure** — a completed task needs an unambiguous end and a sensible next action, not just a
  return to wherever the user came from.
- **Carry state forward** — if step 4 needs a value shown at step 1, don't make them remember it.
- **Disclosure both ways** — rare options shouldn't sit in the primary path, but the thing everyone
  needs shouldn't hide behind "Advanced". Check frequency before recommending either direction.

## Error taxonomy

Classifying the error tells you which fix to recommend.

- **Slip** — right intent, wrong execution (wrong row, wrong unit). Fix by constraining input and
  above all by adding undo.
- **Mistake** — wrong intent from a wrong mental model. Fix what the interface communicates: labels,
  visible state, disclosed preconditions. Confirmation dialogs do nothing here — the user confirms
  confidently, because they believe they're right.
- **Memory lapse** — they knew, then got interrupted. Fix with drafts and resumable flows.

When you find a guard in the code, ask which of the three it catches. A confirm dialog guarding a
*mistake* is itself a finding.

## State coverage

Per screen, check which states the code handles. Report the gaps that matter, not every empty cell.

| State | A gap is a real finding when |
|---|---|
| Loading | The wait is long or common, or one call blanks the whole screen |
| Empty | Any list a new user reaches — no items and no next action is a dead end |
| Partial | Composite screens where one failed call kills the rest |
| Error | The error is swallowed, or there's no retry |
| Terminal | A completed task just dumps the user back to a list |
| Denied | Shown as "empty" or "not found" instead — users will file a bug |
| Stale | Long-lived or collaborative forms with no conflict handling on submit |
| Offline | Indistinguishable from a server error, in an app used on the move |

## Form paths

- Every required constraint traced to a genuine downstream need (B4)
- Prefilled from session, params or previous step where possible (A1)
- Sane defaults on selects, dates, quantities (B3)
- Field-level validation, not submit-only (D3)
- Submitted values survive a failed submit (D1)
- Draft or unsaved-changes guard on navigation away (D2)
- Double-submit prevented — otherwise the user creates duplicates
- Server errors mapped back to the specific field, not one generic banner
- Enter submits; focus lands somewhere useful after submit and after an error

## Flow graph

Build the state/route graph and check for:

- **Dead ends** — no outbound transition except browser back.
- **Unreachable states** — code for a state no transition can produce. Usually a genuine bug.
- **Traps** — enterable but not leavable without losing work.
- **Loops with no progress** — redirect cycles, or an error state returning to the step that caused
  it with the same inputs.
- **Missing back-transitions** — can they go back a step without restarting, with data intact?
- **Auth edges** — a login redirect that loses the deep link and drops the user on a dashboard
  instead of where they were going. Common, annoying, entirely provable from code.
- **Orphans** — a create flow producing a record no screen ever lists.

## Logic-dependent WCAG 2.2

Determinable from code rather than styling, so they belong here. Citing the number raises a finding
from preference to standard.

| Criterion | Check |
|---|---|
| 3.3.7 Redundant Entry (A) | Information re-requested within one process instead of prefilled |
| 3.3.8 Accessible Authentication (AA) | Login needing recall or transcription with no alternative |
| 3.3.1 Error Identification (A) | Failures identify which field and what's wrong, programmatically |
| 3.3.3 Error Suggestion (AA) | Known-format errors suggest a correction |
| 3.3.4 Error Prevention (AA) | Legal, financial and data-deleting submissions reversible or checked |
| 3.3.2 Labels or Instructions (A) | Required formats stated before submission, not after |
| 3.2.3 / 3.2.4 Consistent Navigation & Identification (AA) | Repeated nav in the same order; same function named the same |
| 2.4.3 Focus Order (A) | Focus follows meaning — check dialogs, steps, and post-navigation landing |
| 4.1.3 Status Messages (AA) | Async results announced without moving focus |
| 2.2.1 Timing Adjustable (A) | Time limits can be turned off, adjusted or extended |

This is not a full accessibility audit and shouldn't be presented as one. Real conformance needs
rendered output and assistive-tech testing.
