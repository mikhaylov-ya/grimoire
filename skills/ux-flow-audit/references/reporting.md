# Severity, confidence and report format — read before Step 5

## Severity

| # | Meaning |
|---|---|
| 0 | Not a problem — don't report it |
| 1 | Cosmetic. Fix if convenient |
| 2 | Minor. Users work around it |
| 3 | Major. Users are meaningfully slowed or make errors |
| 4 | Catastrophic. Task can't be completed, or work/money is lost |

Score in two moves:

1. **Impact** — what happens to the user when it bites, on the 1–4 scale above.
2. **Frequency and persistence** — raise it one if the flow runs many times a day or every user hits
   it every time; lower it one if it's rare and easy to work around. Never above 3 this way: 4 is
   for the cases listed below only.

So one extra click on a flow run fifty times a day can outrank a confusing screen seen once.

Severity is the least reliable judgment in this kind of audit, so: sanity-check your 3s and 4s
against each other before publishing, don't inflate to make the report feel valuable, take the
lower score when torn and explain why, and flag 4s as warranting human confirmation.

Reserve 4 for: task impossible, work or data lost, money moves incorrectly, irreversible
destruction with no guard and no undo, or the user gets permanently stuck.

## Confidence

- **Observed** — explicit in the code; you can quote the lines that prove it.
- **Inferred** — implied by code you read but dependent on runtime behavior or an assumption. State
  the assumption.
- **Speculative** — plausible, unverified. **Not in the findings table.** Move to "worth testing."

If most findings are Inferred, you haven't read enough code.

## Template

```markdown
# UX Flow Audit — [app/feature]

## Scope & method
Analyzed: [flows, with routes]. Not analyzed: [what and why].
Reconstructed from: [router config, e2e tests, project docs].
Not determinable from source: rendered layout, real content, actual latency, real user intent.

## Goal hypotheses
| # | The user is trying to… | Evidence | Confidence |
|---|---|---|---|
| G1 | [goal] | [tickets / analytics / docs / user said so / **inferred from code**] | |

Findings marked ⚠︎G1 are only valid if that hypothesis holds.

## Flow map

### [Flow name] — `route/path` · assumes G1
**Ideal: X interactions. Actual: N across M screens. N−X avoidable (F1, F4, F7); [k] deliberate.**
Ideal path: 1. [step] 2. [step]
Actual path: 1. [step] — [what the user must do]
Decision density: [screen] demands [n] choices; [m] required to advance.
Branches: [validation failure → …, error → …, empty → …, denied → …]
Ends at: [terminal state]

## Findings
Ranked by severity, then frequency.

### F1 — [Imperative title: "Role select has one valid option"]
**Severity 3 · Interaction cost · Observed · ⚠︎G1 · 1 select per invite**
`src/features/team/InviteForm.vue:48-61`
```[lang]
[the snippet that proves it]
```
**What happens:** [the user's experience, concretely]
**Why it costs:** [frequency, what it blocks]
**Fix:** [smallest change that removes it]

## State coverage
Only screens with a gap that meets the bar in flow-checks.md; omit the section if none.
| Screen | Loading | Empty | Error | Terminal | Denied |
|---|---|---|---|---|---|

## Fix order
By severity, then cheapest first. Effort: ⚡ under an hour · S a day · M a few days · L needs
backend or design work.
| Finding | Fix, in one line | Severity | Effort |
|---|---|---|---|
| F4 | [fix] | 4 | S |

## Worth testing with users
Hypotheses the code suggests but can't prove. Not findings.

## Notes
[Low-value observations, including any minor missing mutation feedback below the reporting bar.]
```

## Writing findings

- **Title the defect, not the category.** "Department re-entered on every invite" beats "redundant
  entry issue."
- **User experience first**, then the code, then the fix.
- **One finding per root cause.** Five symptoms of one cause is one finding with five citations —
  otherwise the count inflates and priority stops meaning anything.
- **Quantify.** Clicks, fields, screens removed.
- **Smallest fix.** "Default to the inviter's department" beats "reconsider the invitation flow."
- **Don't pad.** If the flow is well-built, say so and report three findings. A short correct audit
  builds trust; a long padded one destroys it.
- **Don't hedge into uselessness.** "Consider possibly reviewing whether this might be suboptimal"
  is not a finding. Take a position and mark confidence honestly.
