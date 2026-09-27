# grimoire

A book of [Claude Code](https://claude.com/claude-code) skills.

| Skill | What it does |
|---|---|
| [`ux-flow-audit`](skills/ux-flow-audit/SKILL.md) | Reads a web app's source to reconstruct real user flows and find where users work harder than necessary: excess clicks, redundant data entry, pointless confirmations, missing bulk actions, dead ends, unreachable states. Framework-agnostic. |
| [`codebase-coherence-audit`](skills/codebase-coherence-audit/SKILL.md) | Finds duplicate and near-duplicate code and decides which duplication is worth abstracting and which should stay duplicated. Guards against over-abstraction and negotiates scope before scanning. |

## Install

### Option A: plugin marketplace (recommended)

Inside Claude Code:

```
/plugin marketplace add mikhaylov-ya/grimoire
/plugin install grimoire@grimoire
```

Update later with `/plugin marketplace update grimoire`. Plugin skills are namespaced,
e.g. `grimoire:ux-flow-audit`.

### Option B: symlink into `~/.claude/skills`

Keeps the plain skill names and makes edits in the clone live immediately:

```sh
git clone https://github.com/mikhaylov-ya/grimoire.git ~/Documents/grimoire
~/Documents/grimoire/install.sh           # add --force to back up existing copies
```

Update with `git pull`. Set `CLAUDE_SKILLS_DIR` to install somewhere else.

## Layout

```
.claude-plugin/     plugin + marketplace manifests
skills/<name>/      one directory per skill: SKILL.md + references/
install.sh          symlink installer
```

To add a skill, create `skills/<name>/SKILL.md` with `name` and `description` frontmatter.
