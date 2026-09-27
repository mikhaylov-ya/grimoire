# Detection tools — read before Step 1

Pick based on language and what's already installed. Try the precise tool first; fall back to the NCD script at the bottom if nothing fits or install isn't feasible in this environment.

## JavaScript / TypeScript

`jscpd` is the standard choice — fast, handles JS/TS/JSX/Vue, reports Type-1/2 clones with line ranges and a similarity percentage out of the box.

```bash
npx jscpd <path> --min-lines 5 --min-tokens 50 --reporters json --output ./jscpd-report
```

Read `jscpd-report/jscpd-report.json` — each entry has `firstFile`, `secondFile`, `lines`, and a `fragment` snippet. Group entries that share a file into clusters before moving to Step 2.

## Python

`pylint`'s duplicate-code checker or `flake8-copy-paste` both work for quick checks, but for real clustering across near-duplicates, PMD CPD (below) handles Python too and gives better line-range output.

## Java, C, C++, Python, Go, and 20+ others

PMD's **CPD** (Copy-Paste Detector) is language-agnostic across a wide set and is a solid default when jscpd doesn't cover the language:

```bash
pmd cpd --minimum-tokens 50 --language <java|python|cpp|go|...> --dir <path> --format json
```

## Any language, or when nothing above is installed/available

**Simian** (Similarity Analyser) is a single-jar, language-agnostic clone detector that works reasonably well across almost any C-like or block-structured language without per-language tuning.

## Structural (near-duplicate, not just token-identical) matching

Token-based tools like the above miss clones where variable names or literal values changed structurally, or statements were reordered. For that, a `tree-sitter`-based AST diff is worth it if the cluster from a token-tool looks promising but the match percentage is mediocre (60-85%) — parse both blocks, normalize identifiers, and diff the trees. This is heavier and should be used selectively on shortlisted candidates, not as a first pass over a whole repo.

## Fallback: NCD (compression-distance) — no tool install needed

Use this when no clone detector is available for the language, or as a cheap first filter over a very large scope to shortlist which files/directories deserve a closer look. It won't give you precise line ranges the way a clone detector does — pair it with `grep`/manual inspection to narrow down the exact overlapping lines once a pair of chunks scores as similar.

```python
import gzip
from pathlib import Path
from itertools import combinations

def c_len(text: str) -> int:
    return len(gzip.compress(text.encode()))

def ncd(a: str, b: str) -> float:
    ca, cb = c_len(a), c_len(b)
    cab = c_len(a + b)
    return (cab - min(ca, cb)) / max(ca, cb)

def chunk_functions(path: Path):
    """Naive splitter — swap for a real parser (ast/tree_sitter) per language
    if precision matters; this is intentionally dependency-free."""
    text = path.read_text(errors="ignore")
    # placeholder: split on blank-line-separated blocks as a crude proxy
    # for functions when no parser is wired up for this language
    blocks, current = [], []
    for line in text.splitlines():
        if line.strip() == "" and current:
            blocks.append("\n".join(current))
            current = []
        else:
            current.append(line)
    if current:
        blocks.append("\n".join(current))
    return [b for b in blocks if len(b.strip()) > 40]  # skip trivial blocks

def find_similar_pairs(root: Path, glob: str, threshold: float = 0.35):
    chunks = []
    for f in root.rglob(glob):
        for i, block in enumerate(chunk_functions(f)):
            chunks.append((f"{f}#{i}", block))
    pairs = []
    for (name_a, a), (name_b, b) in combinations(chunks, 2):
        d = ncd(a, b)
        if d < threshold:
            pairs.append((d, name_a, name_b))
    return sorted(pairs)

# example: find_similar_pairs(Path("src/"), "*.py")
```

Lower NCD = more similar (0 = compresses identically, ~1 = unrelated). A threshold around 0.3-0.4 is a reasonable starting point for flagging candidates worth a manual look; tune based on how noisy the first run's results are — if everything under the threshold is uninteresting, tighten it.

This is the same mechanism as scoring an LLM continuation's plausibility by compressed size — here the "context" and "candidate" are two code chunks instead of a prompt and a continuation, and a small `ncd()` means the two chunks share exploitable structure.
