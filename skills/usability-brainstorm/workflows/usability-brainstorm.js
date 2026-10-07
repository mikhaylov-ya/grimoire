export const meta = {
  name: 'usability-brainstorm',
  description: 'Fan out a usability brainstorm: isolated lens agents diverge, then merge, reframe the thin spots, ground each opportunity area against the code, and converge',
  whenToUse: 'Launched by the usability-brainstorm skill when the brief is too large or too varied for one context',
  phases: [
    { title: 'Diverge', detail: 'one agent per lens group, none sees the others' },
    { title: 'Merge', detail: 'deduplicate and cluster into opportunity areas' },
    { title: 'Reframe', detail: 'one agent rethinks the targets the lenses left thin' },
    { title: 'Ground', detail: 'one agent per area checks every idea against the code and scores it' },
    { title: 'Converge', detail: 'top picks, quick wins, bold bets, report' },
  ],
}

// args: {
//   skillDir:   absolute path of the usability-brainstorm skill
//   briefPath:  absolute path of the brief the main agent wrote (Step 1)
//   scope:      one line — flows and roles agreed in Step 0
//   lensGroups: [["Remove", "Accelerate"], ["Fit"], ...]   optional; default below.
//               Reframe is not a lens group: it runs as its own phase after Merge.
// }
const A = args || {}
if (!A.skillDir || !A.briefPath) throw new Error('args.skillDir and args.briefPath are required')

const FAMILIES = ['Remove', 'Prevent', 'Reveal', 'Accelerate', 'Protect', 'Fit', 'Connect', 'Reframe']
const LENS_FAMILIES = FAMILIES.filter(f => f !== 'Reframe')
const GROUPS = A.lensGroups || [['Remove', 'Accelerate'], ['Prevent', 'Protect'], ['Reveal', 'Connect'], ['Fit']]
const unknown = GROUPS.flat().filter(f => !LENS_FAMILIES.includes(f))
if (unknown.length) throw new Error(`not a lens family here: ${unknown.join(', ')} (Reframe runs after Merge)`)

const CTX = [
  `Skill directory: ${A.skillDir} (references in references/). Brief: ${A.briefPath}.`,
  `Read the common rules and your role's section in ${A.skillDir}/references/roles.md first, then only the files that section names.`,
  `Scope: ${A.scope || 'as stated in the brief'}.`,
].join('\n')

const IDEA = {
  title: { type: 'string', description: 'what the user gets, with the domain noun' },
  idea: { type: 'string', description: '1-3 sentences: what changes for the user' },
  family: { enum: FAMILIES },
  scale: { enum: ['Tweak', 'Feature', 'Rethink'] },
  target: { type: 'string', description: 'the complaint, flow step, role or entity edge the lens was applied to' },
  anchors: { type: 'array', items: { type: 'string' }, description: 'brief ids (C3, R1, K4, D2, X1) or path:line' },
}
const IDEA_KEYS = Object.keys(IDEA)
const ideaList = (extra = {}, required = []) => ({
  type: 'object',
  properties: { ideas: { type: 'array', items: { type: 'object', properties: { ...IDEA, ...extra }, required: [...IDEA_KEYS, ...required] } } },
  required: ['ideas'],
})

const RAW = ideaList()
const REFRAMED = ideaList({ area: { type: 'string', description: 'the need of the area it belongs to, verbatim, or a new need' } }, ['area'])

const MERGED = {
  type: 'object',
  properties: {
    areas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          need: { type: 'string', description: "the user need, in the users' words" },
          ideas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                keep: { type: 'string', description: 'raw id of the idea kept, e.g. r12' },
                absorbs: { type: 'array', items: { type: 'string' }, description: 'raw ids merged into it' },
                title: { type: 'string', description: 'only if the merge improved the wording' },
                idea: { type: 'string', description: 'only if the merge improved the wording' },
                variants: { type: 'string', description: 'smaller and bigger versions folded in, if any' },
              },
              required: ['keep', 'absorbs'],
            },
          },
        },
        required: ['need', 'ideas'],
      },
    },
  },
  required: ['areas'],
}

const GROUNDED = {
  type: 'object',
  properties: {
    ideas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          keep: { type: 'boolean' },
          dropReason: { type: 'string', description: 'when keep is false: the grounding check that failed (converge.md)' },
          idea: { type: 'string', description: 'reworded text, only if the swap test changed it' },
          exists: { enum: ['no', 'partly', 'yes', 'hidden'] },
          anchors: { type: 'array', items: { type: 'string' }, description: 'anchors added by grounding' },
          feasibility: { type: 'string', description: 'what in the code supports or blocks it' },
          hurts: { type: 'string', description: 'who or what it might hurt, or "none found"' },
          value: { enum: ['H', 'M', 'L'] },
          confidence: { enum: ['H', 'M', 'L'] },
          effort: { enum: ['⚡', 'S', 'M', 'L'] },
        },
        required: ['id', 'keep', 'exists', 'feasibility', 'hurts', 'value', 'confidence', 'effort'],
      },
    },
  },
  required: ['ideas'],
}

const union = (...lists) => [...new Set(lists.flat().filter(Boolean))]

phase('Diverge')
const banks = await parallel(GROUPS.map(g => () => agent(
  `${CTX}\n\nRole: Lens. Your families: ${g.join(', ')}.`,
  { label: `lens:${g.join('+')}`, phase: 'Diverge', schema: RAW },
)))
const failedLenses = GROUPS.filter((g, i) => !banks[i]).map(g => g.join('+'))
const raw = banks.flatMap((b, i) => (b?.ideas || []).map(x => ({ ...x, lens: GROUPS[i].join('+') })))
raw.forEach((x, i) => { x.rid = `r${i + 1}` })
const byRid = Object.fromEntries(raw.map(x => [x.rid, x]))
log(`${raw.length} raw ideas from ${GROUPS.length - failedLenses.length} lens groups`)
if (failedLenses.length) log(`lens groups that failed: ${failedLenses.join(', ')}`)
if (!raw.length) return { report: 'No ideas generated.', failedLenses }

phase('Merge')
const merged = await agent(
  `${CTX}\n\nRole: Merge.\n\nRaw ideas:\n${JSON.stringify(raw.map(({ lens, ...x }) => x))}`,
  { label: 'merge', phase: 'Merge', schema: MERGED },
)
if (!merged?.areas?.length) return { report: 'Merge failed; raw ideas returned unmerged.', raw, failedLenses }

let n = 0
const nextId = () => `I${++n}`
const areas = merged.areas.map(a => ({
  need: a.need,
  ideas: a.ideas.filter(m => byRid[m.keep]).map(m => {
    const members = [m.keep, ...(m.absorbs || [])].map(r => byRid[r]).filter(Boolean)
    const { rid, lens, ...base } = byRid[m.keep]
    return {
      ...base,
      id: nextId(),
      title: m.title || base.title,
      idea: m.idea || base.idea,
      variants: m.variants,
      anchors: union(...members.map(x => x.anchors)),
      lenses: union(members.map(x => x.lens)),
    }
  }),
}))
const placed = new Set(merged.areas.flatMap(a => a.ideas.flatMap(m => [m.keep, ...(m.absorbs || [])])))
const unplaced = raw.filter(x => !placed.has(x.rid))
if (unplaced.length) {
  areas.push({ need: 'Not placed by the merge', ideas: unplaced.map(({ rid, lens, ...x }) => ({ ...x, id: nextId(), lenses: [lens] })) })
  log(`${unplaced.length} raw ideas the merge left out, kept in their own area`)
}
log(`${n} ideas in ${areas.length} areas`)

phase('Reframe')
const outline = areas.map(a => ({ need: a.need, ideas: a.ideas.map(({ id, title, scale, target }) => ({ id, title, scale, target })) }))
const reframed = await agent(
  `${CTX}\n\nRole: Reframe.\n\nMerged areas:\n${JSON.stringify(outline)}`,
  { label: 'reframe', phase: 'Reframe', schema: REFRAMED },
)
const reframeFailed = !reframed
for (const { area, ...x } of reframed?.ideas || []) {
  let home = areas.find(a => a.need === area)
  if (!home) areas.push(home = { need: area, ideas: [] })
  home.ideas.push({ ...x, id: nextId(), lenses: ['Reframe'] })
}
if (reframeFailed) log('reframe pass failed')

phase('Ground')
const grounded = await parallel(areas.map(a => () => agent(
  `${CTX}\n\nRole: Grounder. Opportunity area: "${a.need}".\n\nIdeas:\n${JSON.stringify(a.ideas)}`,
  { label: `ground:${a.need.slice(0, 40)}`, phase: 'Ground', schema: GROUNDED },
)))
const failedAreas = areas.filter((a, i) => !grounded[i]).map(a => a.need)
if (failedAreas.length) log(`areas that failed to ground: ${failedAreas.join(' | ')}`)

const dropped = []
const bank = areas.map((a, i) => {
  const checks = Object.fromEntries((grounded[i]?.ideas || []).map(g => [g.id, g]))
  const ideas = []
  for (const x of a.ideas) {
    const g = checks[x.id]
    if (!grounded[i]) ideas.push({ ...x, ungrounded: true })
    else if (g && !g.keep) dropped.push({ id: x.id, title: x.title, dropReason: g.dropReason })
    else if (g) ideas.push({ ...x, ...g, idea: g.idea || x.idea, anchors: union(x.anchors, g.anchors) })
    else ideas.push({ ...x, ungrounded: true })
  }
  return { need: a.need, ideas }
})

phase('Converge')
const report = await agent(
  `${CTX}\n\nRole: Synthesizer. Failed: lens groups ${failedLenses.length ? JSON.stringify(failedLenses) : 'none'}; ` +
  `reframe ${reframeFailed ? 'failed' : 'ok'}; areas ${failedAreas.length ? JSON.stringify(failedAreas) : 'none'}.\n\n` +
  `Bank, by area:\n${JSON.stringify(bank)}\n\nDropped in grounding:\n${JSON.stringify(dropped)}`,
  { label: 'synthesize', phase: 'Converge' },
)

return report
  ? { report, failedLenses, reframeFailed, failedAreas }
  : { report: 'Synthesis failed; grounded bank returned.', bank, dropped, failedLenses, reframeFailed, failedAreas }
