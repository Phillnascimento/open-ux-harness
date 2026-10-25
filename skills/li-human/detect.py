#!/usr/bin/env python3
"""
detect.py - Bilingual (PT-BR & EN) five-check panel that scores how human a draft reads.

Five local heuristics:
  1. BURSTINESS    sentence-length variation (CV >= 0.50)
  2. SPECIFICITY   concrete numbers, metrics, currencies (R$, $), percentages, proper nouns
  3. SLOP DENSITY  hits against English + Portuguese (PT-BR) slop lexicon
  4. FINGERPRINT   invisible chars, em dashes, curly quotes per 1k chars
  5. VOICE         first/second person markers, natural spoken cadence (EN contractions OR PT-BR spoken markers), zero structural tells

Each check returns a HUMAN score from 0 to 100. Higher is better.
"""

import argparse
import json
import os
import re
import statistics
import sys
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
LEX = os.path.join(HERE, "slop.json")

SENT_RE = re.compile(r"[^.!?\n]+[.!?]*")
WORD_RE = re.compile(r"[A-Za-zÀ-ÿ']+")

# English & Portuguese markers
EN_CONTRACTIONS = re.compile(r"\b\w+'(?:s|t|re|ve|ll|d|m)\b", re.IGNORECASE)
PT_SPOKEN_MARKERS = re.compile(
    r"\b(pra|pro|pros|pras|né|a gente|na prática|no fim|lá|aqui|fiz|fizemos|testei|testamos|cortamos|mudamos|aprendi|descobrimos|vimos|achei|achávamos)\b",
    re.IGNORECASE,
)
PRONOUNS_BILINGUAL = re.compile(
    r"\b(i|me|my|mine|we|us|our|you|your|eu|mim|meu|minha|meus|minhas|nós|nosso|nossa|nossos|nossas|você|vocês|seu|sua|seus|suas)\b",
    re.IGNORECASE,
)
NUMBERS = re.compile(r"\b\d[\d,.]*%?\b|R\$\s*\d+|\$\d+")
PROPER = re.compile(r"(?<![.!?]\s)(?<!^)\b[A-ZÀ-Ý][a-zà-ÿ]{2,}\b", re.MULTILINE)
PT_STOPWORDS = re.compile(r"\b(que|não|para|com|uma|como|mais|por|dos|das|foi|isso|está|são)\b", re.IGNORECASE)


def clamp(n):
    return max(0.0, min(100.0, n))


def scale(value, human, machine):
    if human == machine:
        return 50.0
    return clamp((value - machine) / (human - machine) * 100)


def detect_language(text):
    pt_hits = len(PT_STOPWORDS.findall(text))
    w = WORD_RE.findall(text)
    if not w:
        return "en"
    return "pt-BR" if (pt_hits / len(w)) >= 0.04 else "en"


def sentences(text):
    return [s.strip() for s in SENT_RE.findall(text) if len(s.split()) > 2]


def words(text):
    return WORD_RE.findall(text)


def check_burstiness(text):
    lens = [len(s.split()) for s in sentences(text)]
    if len(lens) < 4:
        return 75.0, "curto (<4 frases) - isento de penalidade de uniformidade"
    mean = statistics.mean(lens)
    cv = statistics.pstdev(lens) / mean if mean else 0
    score = scale(cv, human=0.65, machine=0.22)
    return score, f"variation {cv:.2f} across {len(lens)} sentences (want 0.50+)"


def check_specificity(text):
    w = words(text)
    if len(w) < 20:
        return 75.0, "curto (<20 palavras) - isento"
    per100 = 100 / len(w)
    hits = len(NUMBERS.findall(text)) + len(set(PROPER.findall(text)))
    density = hits * per100
    score = scale(density, human=5.5, machine=0.5)
    return score, f"{hits} concrete markers, {density:.1f} per 100 words (want 4+)"


def check_slop(text, lex):
    w = words(text)
    if not w:
        return 50.0, "empty"
    hits, found = 0, []
    all_entries = (
        lex.get("words", [])
        + lex.get("phrases", [])
        + lex.get("words_pt", [])
        + lex.get("phrases_pt", [])
    )
    for entry in all_entries:
        find = entry.get("find", "")
        if not find:
            continue
        pattern = re.compile(
            r"(?<![A-Za-zÀ-ÿ])" + re.escape(find).replace(r"\ ", r"\s+") + r"(?![A-Za-zÀ-ÿ])",
            re.IGNORECASE,
        )
        n = len(pattern.findall(text))
        if n:
            hits += n
            found.append(find)
    density = hits * 100 / len(w)
    score = scale(density, human=0.0, machine=3.5)
    detail = f"{hits} stock terms, {density:.1f} per 100 words"
    if found:
        detail += " (" + ", ".join(sorted(set(found))[:4]) + (", ..." if len(set(found)) > 4 else "") + ")"
    return score, detail


def check_fingerprint(text):
    invisible = sum(1 for c in text if unicodedata.category(c) == "Cf")
    em = text.count("—")
    curly = sum(text.count(c) for c in "‘’“”")
    ellip = text.count("…")
    nbsp = sum(text.count(c) for c in "   ")
    total = invisible * 4 + em * 2 + curly + ellip + nbsp
    per1k = total * 1000 / max(len(text), 1)
    score = scale(per1k, human=0.0, machine=12.0)
    detail = f"{invisible} invisible, {em} em dash, {curly} curly quote, {ellip} ellipsis, {nbsp} hard space"
    return score, detail


def check_voice(text, lex):
    w = words(text)
    if len(w) < 20:
        return 75.0, "curto (<20 palavras) - isento"
    lang = detect_language(text)
    per100 = 100 / len(w)

    if lang == "pt-BR":
        colloquial_hits = len(PT_SPOKEN_MARKERS.findall(text)) * per100
        colloquial_score = scale(colloquial_hits, human=2.2, machine=0.0)
    else:
        colloquial_hits = len(EN_CONTRACTIONS.findall(text)) * per100
        colloquial_score = scale(colloquial_hits, human=2.8, machine=0.0)

    person = len(PRONOUNS_BILINGUAL.findall(text)) * per100
    tells = 0
    names = []
    for s in lex["structures"]:
        try:
            n = len(re.compile(s["regex"], re.MULTILINE).findall(text))
        except re.error:
            continue
        if n:
            tells += n
            names.append(s["id"])
    bullets = [len(b.split()) for b in re.findall(r"(?m)^\s*[-*•]\s+(.+)$", text)]
    uniform = len(bullets) >= 3 and statistics.pstdev(bullets) < 1.6
    score = (
        colloquial_score * 0.30
        + scale(person, human=6.0, machine=0.8) * 0.35
        + clamp(100 - tells * 22) * 0.35
    )
    if uniform:
        score -= 12
        names.append("uniform-bullets")
    detail = f"[{lang}] {colloquial_hits:.1f} spoken markers, {person:.1f} pronouns/100w, {tells} structural tell(s)"
    if names:
        detail += " [" + ", ".join(names[:4]) + "]"
    return clamp(score), detail


CHECKS = ["BURSTINESS", "SPECIFICITY", "SLOP DENSITY", "FINGERPRINT", "VOICE"]


def run(text, lex):
    results = {}
    results["BURSTINESS"] = check_burstiness(text)
    results["SPECIFICITY"] = check_specificity(text)
    results["SLOP DENSITY"] = check_slop(text, lex)
    results["FINGERPRINT"] = check_fingerprint(text)
    results["VOICE"] = check_voice(text, lex)
    scores = [results[c][0] for c in CHECKS]
    overall = statistics.mean(scores) * 0.6 + min(scores) * 0.4
    verdict = "PASS" if overall >= 70 and min(scores) >= 55 else ("REVIEW" if overall >= 50 else "FLAGGED")
    return results, overall, verdict


def bar(score, width=24):
    filled = round(score / 100 * width)
    return "#" * filled + "." * (width - filled)


def render(results, overall, verdict, label=None, out=sys.stdout):
    title = "AI DETECTION PANEL (BILINGUAL PT-BR & EN)" + (f"  -  {label}" if label else "")
    print("\n" + title, file=out)
    print("=" * max(len(title), 62), file=out)
    for name in CHECKS:
        score, detail = results[name]
        print(f"  {name:<13} {bar(score)} {score:5.1f}", file=out)
        print(f"  {'':<13} {detail}", file=out)
    print("-" * 62, file=out)
    print(f"  {'HUMAN SCORE':<13} {bar(overall)} {overall:5.1f}   {verdict}", file=out)
    if verdict != "PASS":
        weakest = min(CHECKS, key=lambda c: results[c][0])
        print(f"\n  Weakest signal: {weakest}. Fix that first.", file=out)
    print("", file=out)


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description="Score how human a draft looks (PT-BR & EN).")
    ap.add_argument("input", nargs="?", default="-", help="file, or - for stdin")
    ap.add_argument("compare", nargs="?", help="second file, to show before/after")
    ap.add_argument("--text", help="inline text to score instead of reading a file")
    ap.add_argument("--lang", choices=["pt", "en", "auto"], default="auto", help="language hint")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--lexicon", default=LEX)
    args = ap.parse_args()

    lex = json.load(open(args.lexicon, encoding="utf-8"))
    read = lambda p: sys.stdin.read() if p == "-" else open(p, encoding="utf-8").read()

    if args.text is not None:
        targets = [("inline", args.text)]
    else:
        targets = [(args.input, read(args.input))]
        if args.compare:
            targets.append((args.compare, read(args.compare)))

    payload = []
    for name, text in targets:
        results, overall, verdict = run(text, lex)
        payload.append({
            "source": name,
            "language_detected": detect_language(text),
            "checks": {k: {"score": round(v[0], 1), "detail": v[1]} for k, v in results.items()},
            "human_score": round(overall, 1),
            "verdict": verdict,
        })

    if args.json:
        print(json.dumps(payload if args.compare else payload[0], indent=2, ensure_ascii=False))
        return

    for (name, text), p in zip(targets, payload):
        results, overall, verdict = run(text, lex)
        render(results, overall, verdict, label=os.path.basename(name) if args.compare else None)
    if args.compare:
        a, b = payload
        delta = b["human_score"] - a["human_score"]
        print(f"  {a['human_score']:.1f} {a['verdict']}  ->  {b['human_score']:.1f} {b['verdict']}   ({delta:+.1f})\n")

    sys.exit(0 if payload[-1]["verdict"] == "PASS" else 1)


if __name__ == "__main__":
    main()
