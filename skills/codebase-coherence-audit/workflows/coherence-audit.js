export const meta = {
  name: 'coherence-audit',
  description: 'Fan out a coherence audit: inventory business functions, judge each cluster, challenge each verdict, synthesize concepts',
  whenToUse: 'Launched by the codebase-coherence-audit skill when the scope is too large for one agent',
  phases: [
    { title: 'Inventory', detail: 'one reader per module writes function cards' },
    { title: 'Group', detail: 'cluster the cards by business function' },
    { title: 'Judge', detail: 'one judge per cluster: function, form, MDL, name' },
    { title: 'Challenge', detail: 'one skeptic per verdict, arguing the other way' },
    { title: 'Synthesize', detail: 'missing concepts across clusters, drift, report' },
  ],
}

// args: {
//   skillDir:  absolute path of the codebase-coherence-audit skill
//   indexPath: absolute path of the domain index the main agent wrote (Step 2)
//   scope:     one line — boundary and depth agreed in Step 0
//   clusters:  [{ id, locations: ["file:12-40", ...], similarity }]   from Step 1
//   modules:   ["src/pages/orders", ...]   optional; enables the Inventory phase
// }
const A = args || {}
if (!A.skillDir || !A.indexPath) throw new Error('args.skillDir and args.indexPath are required')

const CTX = [
  `Skill: ${A.skillDir}/SKILL.md. Domain index: ${A.indexPath} — read it first; it is the authority for canon / variation by design / unowned.`,
  `Scope: ${A.scope || 'as stated in the domain index'}.`,
  'Read-only: do not edit, create or delete any file.',
].join('\n')

const CARDS = {
  type: 'object',
  properties: {
    cards: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          location: { type: 'string', description: 'file:startLine-endLine' },
          context: { type: 'string', description: 'whose vocabulary: module, team, schema, UI area' },
          trigger: { type: 'string' },
          function: { type: 'string', description: 'domain verb + work object, in the business words' },
          effectClass: { enum: ['calculation', 'predicate', 'state change', 'emitted event', 'external side effect'] },
          rule: { type: 'string', description: 'the invariant or policy it enforces, or "none"' },
          means: { type: 'string', description: 'libraries, queries, loops — never used for grouping' },
        },
        required: ['location', 'context', 'trigger', 'function', 'effectClass', 'rule', 'means'],
      },
    },
  },
  required: ['cards'],
}

const GROUPS = {
  type: 'object',
  properties: {
    clusters: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          function: { type: 'string' },
          locations: { type: 'array', items: { type: 'string' } },
          overlapsClusters: { type: 'array', items: { type: 'string' }, description: 'ids of clone clusters covering the same code' },
        },
        required: ['id', 'function', 'locations', 'overlapsClusters'],
      },
    },
  },
  required: ['clusters'],
}

const VERDICT = {
  type: 'object',
  properties: {
    function: { type: 'string' },
    index: { enum: ['canon', 'variation by design', 'unowned', 'not in index'] },
    authority: { type: 'string' },
    verdict: { enum: ['Extract', 'Absorb', 'Leave duplicated', 'Eliminate', 'Coincidental'] },
    variationShape: { type: 'string', description: 'what varies between sites, e.g. value, flag, step, algorithm, state, data' },
    form: { type: 'string', description: 'abstraction form, for Extract/Absorb only' },
    name: { type: 'string' },
    signature: { type: 'string' },
    mdl: { type: 'string', description: 'abstraction cost vs duplicated cost, one line each' },
    changeTest: { type: 'string', description: 'likely future change and sites it touches before vs after' },
    drift: { type: 'array', items: { type: 'string' }, description: 'canon rules the copies disagree on, and which copy is right' },
    reasoning: { type: 'string' },
  },
  required: ['function', 'index', 'authority', 'verdict', 'variationShape', 'drift', 'reasoning'],
}

const CHALLENGE = {
  type: 'object',
  properties: {
    refuted: { type: 'boolean' },
    counterVerdict: { type: 'string' },
    argument: { type: 'string' },
  },
  required: ['refuted', 'counterVerdict', 'argument'],
}

let clusters = (A.clusters || []).map(c => ({ ...c, source: 'clone' }))

if (A.modules && A.modules.length) {
  phase('Inventory')
  const decks = await parallel(A.modules.map(m => () => agent(
    `${CTX}\n\nFollow SKILL.md "Step 1b" and references/business-function.md. Write one function card per unit in ${m} that performs a business function — skip pure plumbing (formatting helpers, type glue). Describe each from its callers and effects, not its own lines.`,
    { label: `inventory:${m}`, phase: 'Inventory', schema: CARDS },
  )))
  const cards = decks.filter(Boolean).flatMap(d => d.cards)
  log(`${cards.length} function cards from ${A.modules.length} modules`)

  if (cards.length) {
    phase('Group')
    const grouped = await agent(
      `${CTX}\n\nFollow references/business-function.md. Group these function cards by (function, effectClass, rule), however different their means. Context is a veto: cards with the same key in different contexts join a group only if they pass the "stay apart" check. Only keep groups with 2+ locations. Mark which clone clusters cover the same code so they are not judged twice.\n\nClone clusters:\n${JSON.stringify(A.clusters || [])}\n\nCards:\n${JSON.stringify(cards)}`,
      { label: 'group', phase: 'Group', schema: GROUPS },
    )
    const fresh = (grouped?.clusters || []).filter(c => !c.overlapsClusters.length)
    const merged = (grouped?.clusters || []).filter(c => c.overlapsClusters.length)
    for (const g of merged) {
      for (const c of clusters) if (g.overlapsClusters.includes(c.id)) c.functionHint = g.function
    }
    clusters = clusters.concat(fresh.map(c => ({ ...c, source: 'function' })))
    log(`${fresh.length} function-only clusters added, ${merged.length} matched clone clusters`)
  }
}

if (!clusters.length) return { report: 'No clusters to judge.', verdicts: [] }

const judged = await pipeline(
  clusters,
  c => agent(
    `${CTX}\n\nJudge this cluster with SKILL.md Steps 3–5 and references/abstraction-forms.md.\n${JSON.stringify(c)}\n\nRead every location and its callers.${c.source === 'function' ? ' This cluster was grouped by function card, not by code shape: first verify it pairwise (inputs, outputs, side effects, edge cases, what the tests assert). If the members do not really do the same job, the verdict is Coincidental. Otherwise build the commonality/variability matrix from references/business-function.md and put it in variationShape.' : ''} For Extract/Absorb, pick the weakest form that fits the variation shape and fill form, name, signature, mdl and changeTest.`,
    { label: `judge:${c.id}`, phase: 'Judge', schema: VERDICT },
  ),
  (v, c) => {
    if (!v) return null
    const merge = v.verdict === 'Extract' || v.verdict === 'Absorb'
    const lens = merge
      ? 'Argue AGAINST this abstraction: coincidental duplication, variation by design, a flag per call site, a shallow wrapper, or a form stronger than the variation needs.'
      : v.verdict === 'Eliminate'
        ? 'Argue that something still depends on this code: callers, routes, jobs, tests, external consumers.'
        : 'Argue FOR a shared concept: one rule these sites must keep identical, drift between them, or a weaker form (parameter, table) that removes the duplication without coupling policy.'
    return agent(
      `${CTX}\n\nA judge ruled on this cluster:\n${JSON.stringify(c)}\n\nVerdict:\n${JSON.stringify(v)}\n\n${lens} Read the code yourself. Set refuted=true only if the evidence in the code or the index beats the judge's reasoning; otherwise refuted=false.`,
      { label: `challenge:${c.id}`, phase: 'Challenge', schema: CHALLENGE, effort: 'medium' },
    ).then(ch => ({ cluster: c, verdict: v, challenge: ch }))
  },
)

const results = judged.filter(Boolean)
const dropped = clusters.length - results.length
if (dropped) log(`${dropped} clusters failed to judge and are missing from the report`)

phase('Synthesize')
const report = await agent(
  `${CTX}\n\nWrite the final report in the SKILL.md Step 6 format from these judged clusters. Where a challenge refuted the judge, weigh both arguments and either change the verdict or mark it "contested" with both sides in one line each.\n\nBefore the per-cluster sections, add "## Missing concepts": clusters whose functions are facets of one domain concept that has no home — name the concept, list the clusters, and say what the owner would hold. Omit the section if there are none.\n\n${JSON.stringify(results)}`,
  { label: 'synthesize', phase: 'Synthesize' },
)

return { report, verdicts: results, dropped }
