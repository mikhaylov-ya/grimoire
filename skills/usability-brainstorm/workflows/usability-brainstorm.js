export const meta = {
  name: 'usability-brainstorm',
  description: 'Fan out a usability brainstorm: isolated lens agents diverge, then merge, ground each opportunity area against the code, and converge',
  whenToUse: 'Launched by the usability-brainstorm skill when the brief is too large or too varied for one context',
  phases: [
    { title: 'Diverge', detail: 'one agent per lens group, none sees the others' },
    { title: 'Merge', detail: 'deduplicate and cluster into opportunity areas' },
    { title: 'Ground', detail: 'one agent per area checks every idea against the code and scores it' },
    { title: 'Converge', detail: 'top picks, quick wins, bold bets, report' },
  ],
}

// args: {
//   skillDir:   absolute path of the usability-brainstorm skill
//   briefPath:  absolute path of the brief the main agent wrote (Step 1)
//   scope:      one line — flows and roles agreed in Step 0
//   lensGroups: [["Remove", "Accelerate"], ["Fit"], ...]   optional; default below
// }
const A = args || {}
if (!A.skillDir || !A.briefPath) throw new Error('args.skillDir and args.briefPath are required')

const FAMILIES = ['Remove', 'Prevent', 'Reveal', 'Accelerate', 'Protect', 'Fit', 'Connect', 'Reframe']
const GROUPS = A.lensGroups || [['Remove', 'Accelerate'], ['Prevent', 'Protect'], ['Reveal', 'Connect'], ['Fit'], ['Reframe']]
const unknown = GROUPS.flat().filter(f => !FAMILIES.includes(f))
if (unknown.length) throw new Error(`unknown lens families: ${unknown.join(', ')}`)

const CTX = [
  `Skill: ${A.skillDir}/SKILL.md; references in ${A.skillDir}/references/. Brief: ${A.briefPath}.`,
  `Your role is defined in ${A.skillDir}/references/roles.md — read its common rules and your section before anything else.`,
  `Scope: ${A.scope || 'as stated in the brief'}.`,
].join('\n')

const IDEA = {
  title: { type: 'string', description: 'what the user gets, with the domain noun' },
  idea: { type: 'string', description: '1-3 sentences: what changes for the user' },
  family: { enum: FAMILIES },
  scale: { enum: ['Tweak', 'Feature', 'Rethink'] },
  target: { type: 'string', description: 'the complaint, flow step, role or entity edge the lens was applied to' },
  anchors: { type: 'array', items: { type: 'string' }, description: 'brief ids (C3, R1, K4, D2) or path:line' },
}
const IDEA_KEYS = ['title', 'idea', 'family', 'scale', 'target', 'anchors']

const RAW = {
  type: 'object',
  properties: { ideas: { type: 'array', items: { type: 'object', properties: IDEA, required: IDEA_KEYS } } },
  required: ['ideas'],
}

const AREAS = {
  type: 'object',
  properties: {
    areas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          need: { type: 'string', description: 'the user need, in the users\' words' },
          ideas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'I1, I2, ... unique across areas' },
                ...IDEA,
                variants: { type: 'string', description: 'smaller and bigger versions folded into this idea, if any' },
                lenses: { type: 'array', items: { type: 'string' }, description: 'lens groups that proposed it' },
              },
              required: ['id', ...IDEA_KEYS, 'lenses'],
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
          title: { type: 'string' },
          keep: { type: 'boolean' },
          dropReason: { type: 'string', description: 'when keep is false: exists, unanchored, generic, hurts a role, removes a guard' },
          exists: { enum: ['no', 'partly', 'yes', 'hidden capability'] },
          anchors: { type: 'array', items: { type: 'string' } },
          feasibility: { type: 'string', description: 'what in the code supports or blocks it' },
          hurts: { type: 'string', description: 'who or what it might hurt, or "none found"' },
          value: { enum: ['H', 'M', 'L'] },
          confidence: { enum: ['H', 'M', 'L'] },
          effort: { enum: ['⚡', 'S', 'M', 'L'] },
        },
        required: ['id', 'title', 'keep', 'exists', 'anchors', 'feasibility', 'hurts', 'value', 'confidence', 'effort'],
      },
    },
  },
  required: ['ideas'],
}

phase('Diverge')
const banks = await parallel(GROUPS.map(g => () => agent(
  `${CTX}\n\nRole: Lens. Your families: ${g.join(', ')}.`,
  { label: `lens:${g.join('+')}`, phase: 'Diverge', schema: RAW },
)))
const failedLenses = GROUPS.filter((g, i) => !banks[i]).map(g => g.join('+'))
const raw = banks.flatMap((b, i) => (b?.ideas || []).map(x => ({ ...x, lens: GROUPS[i].join('+') })))
log(`${raw.length} raw ideas from ${GROUPS.length - failedLenses.length} lens groups`)
if (failedLenses.length) log(`lens groups that failed: ${failedLenses.join(', ')}`)
if (!raw.length) return { report: 'No ideas generated.', areas: [], failedLenses }

phase('Merge')
const merged = await agent(
  `${CTX}\n\nRole: Merge.\n\nRaw ideas:\n${JSON.stringify(raw)}`,
  { label: 'merge', phase: 'Merge', schema: AREAS },
)
const areas = merged?.areas || []
if (!areas.length) return { report: 'Merge failed; raw ideas returned unmerged.', raw, failedLenses }
log(`${areas.reduce((n, a) => n + a.ideas.length, 0)} ideas in ${areas.length} areas`)

phase('Ground')
const grounded = await parallel(areas.map(a => () => agent(
  `${CTX}\n\nRole: Grounder. Opportunity area: "${a.need}".\n\nIdeas:\n${JSON.stringify(a.ideas)}`,
  { label: `ground:${a.need.slice(0, 40)}`, phase: 'Ground', schema: GROUNDED },
)))
const results = areas.map((a, i) => ({ need: a.need, ideas: a.ideas, grounding: grounded[i]?.ideas || null }))
const failedAreas = results.filter(r => !r.grounding).map(r => r.need)
if (failedAreas.length) log(`areas that failed to ground: ${failedAreas.join(' | ')}`)

phase('Converge')
const report = await agent(
  `${CTX}\n\nRole: Synthesizer. Lens groups that failed: ${failedLenses.length ? JSON.stringify(failedLenses) : 'none'}. ` +
  `Areas that failed to ground: ${failedAreas.length ? JSON.stringify(failedAreas) : 'none'}.\n\nGrounded areas:\n${JSON.stringify(results)}`,
  { label: 'synthesize', phase: 'Converge' },
)

return { report, areas: results, failedLenses, failedAreas }
