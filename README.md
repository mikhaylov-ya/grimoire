# grimoire

A book of [Claude Code](https://claude.com/claude-code) skills.

| Skill | What it does |
|---|---|
| [`ux-flow-audit`](skills/ux-flow-audit/SKILL.md) | Reads a web app's source to reconstruct real user flows and find where users work harder than necessary: excess clicks, redundant data entry, pointless confirmations, missing bulk actions, dead ends, unreachable states. Framework-agnostic. |
| [`codebase-coherence-audit`](skills/codebase-coherence-audit/SKILL.md) | Finds families of similar code, both by shape (clone detection, compression distance) and by business function. It turns the families worth merging into domain-shaped abstractions in the right form, recommends leaving the rest duplicated, and names missing domain concepts. For large scopes it fans out through a bundled workflow. |

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
~/Documents/grimoire/install.sh           # --force moves existing copies to ~/.claude/skills-backup
```

Update with `git pull`. Set `CLAUDE_SKILLS_DIR` to install somewhere else.

## Layout

```
.claude-plugin/     plugin + marketplace manifests
skills/<name>/      one directory per skill: SKILL.md + references/
install.sh          symlink installer
```

To add a skill, create `skills/<name>/SKILL.md` with `name` and `description` frontmatter.
