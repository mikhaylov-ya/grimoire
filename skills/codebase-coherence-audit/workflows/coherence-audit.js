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
  `Skill: ${A.skillDir}/SKILL.md; references in ${A.skillDir}/references/. Domain index: ${A.indexPath}.`,
  `Your role is defined in ${A.skillDir}/references/roles.md — read its common rules and your section before anything else.`,
  `Scope: ${A.scope || 'as stated in the domain index'}.`,
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
    confidence: { type: 'string', description: 'Observed, or "Inferred: <the assumption>"' },
    variationShape: { type: 'string', description: 'what varies between sites, e.g. value, flag, step, algorithm, state, data' },
    form: { type: 'string', description: 'abstraction form, for Extract/Absorb only' },
    name: { type: 'string' },
    signature: { type: 'string' },
    mdl: { type: 'string', description: 'abstraction cost vs duplicated cost, one line each' },
    changeTest: { type: 'string', description: 'likely future change and sites it touches before vs after' },
    drift: { type: 'array', items: { type: 'string' }, description: 'canon rules the copies disagree on, and which copy is right' },
    reasoning: { type: 'string' },
  },
  required: ['function', 'index', 'authority', 'verdict', 'confidence', 'variationShape', 'drift', 'reasoning'],
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
    `${CTX}\n\nRole: Inventory. Module: ${m}`,
    { label: `inventory:${m}`, phase: 'Inventory', schema: CARDS },
  )))
  const cards = decks.filter(Boolean).flatMap(d => d.cards)
  log(`${cards.length} function cards from ${A.modules.length} modules`)

  if (cards.length) {
    phase('Group')
    const grouped = await agent(
      `${CTX}\n\nRole: Group.\n\nClone clusters:\n${JSON.stringify(A.clusters || [])}\n\nCards:\n${JSON.stringify(cards)}`,
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
    `${CTX}\n\nRole: Judge. Cluster (source "${c.source}" — grouped by ${c.source === 'function' ? 'function card, so verify it pairwise first' : 'code shape'}):\n${JSON.stringify(c)}`,
    { label: `judge:${c.id}`, phase: 'Judge', schema: VERDICT },
  ),
  (v, c) => {
    if (!v) return null
    return agent(
      `${CTX}\n\nRole: Skeptic. Cluster:\n${JSON.stringify(c)}\n\nThe judge's verdict:\n${JSON.stringify(v)}`,
      { label: `challenge:${c.id}`, phase: 'Challenge', schema: CHALLENGE, effort: 'medium' },
    ).then(ch => ({ cluster: c, verdict: v, challenge: ch }))
  },
)

const results = judged.filter(Boolean)
const failed = clusters.filter(c => !results.some(r => r.cluster === c)).map(c => c.id)
const dropped = failed.length
if (dropped) log(`${dropped} clusters failed to judge: ${failed.join(', ')}`)

phase('Synthesize')
const report = await agent(
  `${CTX}\n\nRole: Synthesizer. Clusters that failed to judge: ${failed.length ? JSON.stringify(failed) : 'none'}.\n\nJudged clusters:\n${JSON.stringify(results)}`,
  { label: 'synthesize', phase: 'Synthesize' },
)

return { report, verdicts: results, dropped }
