# Detection tools — read before Step 1

Pick by language and by what's installed. Try the precise tool first; fall back to NCD at the bottom
if nothing fits or nothing can be installed.

**Write every report to your scratchpad (`$OUT` below), never into the repo** — the audit is
read-only, and a report directory in the tree pollutes `git status` and the next scan.

## JavaScript / TypeScript / Vue — jscpd

Fast, covers JS/TS/JSX/Vue and ~150 other formats, reports Type-1/2 clones with line ranges.

```bash
npx -y jscpd <path> --min-lines 5 --min-tokens 50 --reporters json --output "$OUT/jscpd" --silent
```

`$OUT/jscpd/jscpd-report.json` has a `duplicates` array of **pairs**: `firstFile` and `secondFile`
(each with `name`, `start`, `end`), plus `lines`, `tokens` and `fragment`. A clone present in three
places is reported as two or three pairs, so pairs must be merged into clusters by overlapping
fragments — not by shared file name, which joins unrelated clones in one file and splits one clone
across files. Run `cluster_pairs.py` below on it.

## Java, C, C++, C#, Go, Python, Kotlin, Swift, … — PMD CPD

Language-agnostic across 30+ languages; the default when jscpd doesn't cover the language. PMD 7:

```bash
pmd cpd --minimum-tokens 50 --language <java|python|cpp|go|...> --dir <path> --format xml > "$OUT/cpd.xml"
```

Each `<duplication lines=… tokens=…>` holds 2+ `<file path=… line=… endline=…>` elements — already a
cluster, no merging needed. Add `--ignore-identifiers --ignore-literals` to catch Type-2 clones
(renamed variables, changed constants), at the cost of more noise.

## Python — quick check without PMD

```bash
pylint --disable=all --enable=duplicate-code --min-similarity-lines=6 <path>
```

Text output only, pairwise, and blind to renames; good for a yes/no on a small scope. Use CPD for
real clustering.

## Any language, nothing else available — Simian

A single jar that works on most C-like or block-structured languages without tuning. Free for
non-commercial use only; check the licence before using it on a client's code.

```bash
java -jar simian.jar -threshold=6 -formatter=xml "<path>/**/*.<ext>" > "$OUT/simian.xml"
```

## Near-duplicates the token tools score at 60–85%

Token tools miss clones with reordered statements or renamed structure. For a **shortlisted** pair
only — never a whole-repo pass — compare normalized syntax trees: parse both blocks, replace every
identifier and literal with a placeholder, and compare. For Python the standard library suffices:

```python
import ast, difflib

class Normalize(ast.NodeTransformer):
    def visit_Name(self, n): return ast.copy_location(ast.Name(id="_", ctx=n.ctx), n)
    def visit_arg(self, n): n.arg = "_"; return n
    def visit_Attribute(self, n): self.generic_visit(n); n.attr = "_"; return n
    def visit_Constant(self, n): return ast.copy_location(ast.Constant(value=0), n)

def shape(src: str) -> list[str]:
    tree = Normalize().visit(ast.parse(src))
    return ast.dump(tree).replace("(", "\n(").splitlines()

def structural_similarity(a: str, b: str) -> float:
    return difflib.SequenceMatcher(None, shape(a), shape(b)).ratio()
```

For other languages do the same with `tree-sitter` (`pip install tree-sitter tree-sitter-<lang>`):
walk the tree, emit node types, and drop identifier and literal text.

## Merging pairs into clusters — `cluster_pairs.py`

For jscpd, or any tool that reports pairs. Two fragments join a cluster when they share a file and
their line ranges overlap; clustering is transitive.

```python
import json, sys
from collections import defaultdict

pairs = json.load(open(sys.argv[1]))["duplicates"]
frags, parent = [], []

def find(i):
    while parent[i] != i:
        parent[i] = parent[parent[i]]
        i = parent[i]
    return i

def add(f):
    for i, (name, s, e) in enumerate(frags):
        if name == f["name"] and s <= f["end"] and f["start"] <= e:
            return i
    frags.append((f["name"], f["start"], f["end"])); parent.append(len(parent))
    return len(frags) - 1

for p in pairs:
    a, b = add(p["firstFile"]), add(p["secondFile"])
    parent[find(a)] = find(b)

clusters = defaultdict(list)
for i, (name, s, e) in enumerate(frags):
    clusters[find(i)].append(f"{name}:{s}-{e}")
for n, locs in enumerate(sorted(clusters.values(), key=len, reverse=True), 1):
    print(f"C{n} ({len(locs)} sites): " + ", ".join(sorted(locs)))
```

`python3 cluster_pairs.py "$OUT/jscpd/jscpd-report.json"`

## Fallback: NCD (compression distance) — no install needed

Two chunks that compress much smaller together than apart share real structure. Use it when no
clone detector covers the language, or to shortlist which directories deserve a real tool. It gives
no precise line ranges; narrow a flagged pair down by reading it.

It compares every chunk with every other, so the cost is quadratic: run it **per directory or on a
shortlist**, and keep each run under ~2,000 chunks (about two million comparisons).

```python
import gzip, sys
from pathlib import Path
from itertools import combinations

def c_len(text: str) -> int:
    return len(gzip.compress(text.encode()))

def ncd(a: str, b: str) -> float:
    ca, cb = c_len(a), c_len(b)
    return (c_len(a + b) - min(ca, cb)) / max(ca, cb)

def chunks(path: Path):
    """Blank-line-separated blocks: a crude, dependency-free proxy for functions.
    Swap in a real parser (ast, tree-sitter) when precision matters."""
    block, start = [], 1
    for n, line in enumerate(path.read_text(errors="ignore").splitlines() + [""], 1):
        if line.strip():
            if not block: start = n
            block.append(line)
        elif block:
            text = "\n".join(block)
            if len(text) > 200:  # skip trivial blocks
                yield f"{path}:{start}-{n - 1}", text
            block = []

def similar_pairs(root: Path, glob: str, threshold: float = 0.35, limit: int = 2000):
    items = [c for f in root.rglob(glob) for c in chunks(f)]
    if len(items) > limit:
        sys.exit(f"{len(items)} chunks: narrow the scope (limit {limit})")
    return sorted((d, a, b) for (a, x), (b, y) in combinations(items, 2)
                  if (d := ncd(x, y)) < threshold)

# for d, a, b in similar_pairs(Path("src/importers"), "*.py"): print(f"{d:.2f}  {a}  {b}")
```

Lower is more similar: 0 compresses identically, ~1 is unrelated. Start around 0.3–0.4 and tighten
if everything under the threshold is uninteresting.
