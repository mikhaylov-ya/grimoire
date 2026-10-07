# Fan-out roles — read when you are one of them

The fan-out runs SKILL.md Steps 2–5 across agents; the main agent keeps Steps 0–1 and checks the
report. `workflows/usability-brainstorm.js` launches these roles in order — Lens agents in
parallel, Merge, Reframe, Grounders in parallel, Synthesizer — and enforces their output schemas.
Without the Workflow tool, launch them as subagents in the same order. Every role:

- reads the brief first — the authority on roles, complaints, capabilities, constraints and domain
  facts, and the source of the ids anchors cite;
- reads only the files its section names;
- is read-only: no file is edited, created or deleted;
- cites anchors as `converge.md`, Anchors, defines them.

## Lens — one per lens group

SKILL.md Step 2, items 1–5; your families' sections of `lenses.md`; if Fit is yours, the sections
of `context.md` that match the context sheet.

- Apply your families to every target in the brief: each complaint cluster, each step of each flow
  sketch, each role, each entity edge. Skip a target only when none of your operators fits it.
- You run isolated from the other lens agents so the bank stays wide. Generate; grounding judges.
- Open the code the flow sketches cite, and whatever else an idea needs to name this app. An idea
  that still reads true with another app's name in it fails the swap test and is wasted output.

## Merge — one

No code reading. The raw ideas arrive with ids `r1, r2, …`; return ids, not copies.

- Merge ideas that make the **same change**: name the one to keep and the ones it absorbs, and give
  better wording only if the merge improved it. Fold a cheaper and a bigger version of one idea into
  one entry with *variants*.
- Ideas that only serve the **same need** are not merged — they go in the same area.
- Cluster into 4–8 opportunity areas (`converge.md`, Clustering). Don't drop weak ideas.

## Reframe — one

`lenses.md` §8. From the merged areas, pick the targets the other lenses left thin: areas with few
ideas, areas that are all Tweaks, and ideas that pit two roles against each other. Add Reframe ideas
for them — usually Rethinks, still anchored — each naming the area it belongs to by its need,
verbatim, or a new need if none fits.

## Grounder — one per opportunity area

`converge.md`: Anchors, Grounding checks and Scoring only. Run the five checks on every idea in your
area, against the code and the brief's X rows, and score the ideas you keep. Drop an idea only for a
reason the checks name, and record it. If the swap test made you reword an idea, return the new
wording.

## Synthesizer — one

`converge.md` from Coverage gate on. Run the coverage gate on the bank, then pick and write the
report. Ideas marked *ungrounded* — their area failed — go only to the Idea bank. Fill Coverage from
the brief's complaint ids, and list any lens group, the Reframe pass or any area that failed, so the
reader knows the bank is incomplete.
