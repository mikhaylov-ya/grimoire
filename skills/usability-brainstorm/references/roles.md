# Fan-out roles — read when you are one of them

The fan-out splits SKILL.md Steps 2–5 across agents; the main agent keeps Steps 0–1 and checks the
report. `workflows/usability-brainstorm.js` launches these roles and enforces their output
schemas; without the Workflow tool, launch them as subagents with the same instructions. Every
role:

- reads the brief first — it is the authority on roles, complaints, capabilities and domain facts,
  and the source of the ids that anchors cite;
- is read-only: no file is edited, created or deleted;
- cites anchors as `converge.md` defines them.

## Lens — one per lens group

SKILL.md Step 2 and your families' sections of `lenses.md`; `context.md` too if Fit is yours.

- Apply your families to every target in the brief: each complaint cluster, each step of each flow
  sketch, each role, each entity edge. Skip a target only when none of your operators fits it.
- Generate, don't judge. Feasibility is someone else's job; range is yours. Unusual ideas are the
  reason you run in isolation from the other lens agents.
- Give several ideas per target at different scales, and push your strongest few further — the
  zero-interaction version, the 10× version, the version for the other role.
- Read the code enough to make each idea specific to this app; an idea that passes the swap test
  in `converge.md` is wasted output.
- If Reframe is yours, start from the targets most likely to have thin or conflicted answers:
  complaints that pit two roles against each other, and flows whose gap is large.

## Merge — one

No code reading. Deduplicate across the lens agents: merge ideas that make the same change, keeping
the strongest wording and every anchor, and record which lens groups proposed each. Cluster into
4–8 opportunity areas named by the user need (`converge.md`, Clustering), and give each idea an
**I** id. Don't drop weak ideas — that's grounding's job — but do fold a cheaper and a bigger
version of one idea into a single entry.

## Grounder — one per opportunity area

The five grounding checks in `converge.md`, against the code, for every idea in your area. Then
score value, confidence and effort. Drop an idea only for a reason you can state — it exists,
nothing anchors it, it fails the swap test — and record the reason: tempting ideas dropped for
hurting a role or removing a guard feed "Tempting but wrong".

## Synthesizer — one

Write the report from the grounded areas, using the template and the picking rules in
`converge.md`. Fill Coverage from the brief's complaint ids — a complaint with no surviving idea is
listed with the reason. List any lens group or area that failed, so the reader knows the bank is
incomplete.
