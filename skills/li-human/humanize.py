#!/usr/bin/env python3
"""
humanize.py - Bilingual (PT-BR & EN) de-slop & typographic sanitizer.

Three passes, in this order:
  1. INVISIBLE   delete or normalise zero-width joiners, word joiners, soft hyphens,
                 BOMs, Unicode tag characters, non-breaking and narrow spaces.
  2. TYPOGRAPHIC em dash -> comma, en dash -> hyphen, curly quotes -> straight,
                 ellipsis -> three dots, bullet -> hyphen.
  3. LEXICAL     replace English and Portuguese (PT-BR) slop lexicon in slop.json
                 plus any user-banned words in ~/.claude/linkedin/voice-profile.json.

Structural tells are REPORTED, never auto-rewritten.
"""

import argparse
import json
import os
import re
import sys
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
LEX = os.path.join(HERE, "slop.json")
VOICE_PROFILE_PATH = os.path.expanduser("~/.claude/linkedin/voice-profile.json")

URL_RE = re.compile(r"https?://\S+|www\.\S+|\S+@\S+\.\S+")
SENT_RE = re.compile(r"[^.!?\n]+[.!?]*")


def load_lexicon(path=LEX):
    with open(path, encoding="utf-8") as fh:
        lex = json.load(fh)
    # Merge user-banned terms from voice-profile.json if available
    if os.path.exists(VOICE_PROFILE_PATH):
        try:
            vp = json.load(open(VOICE_PROFILE_PATH, encoding="utf-8"))
            lrules = vp.get("lexicon_rules", {})
            for w in lrules.get("banned_words_pt", []):
                if w and isinstance(w, str):
                    lex.setdefault("phrases_pt", []).append({
                        "find": w.strip(),
                        "replace": "",
                        "family": "user_banned_pt",
                    })
            for w in lrules.get("banned_words_en", []):
                if w and isinstance(w, str):
                    lex.setdefault("phrases", []).append({
                        "find": w.strip(),
                        "replace": "",
                        "family": "user_banned_en",
                    })
        except Exception:
            pass
    return lex


def _cp(spec):
    if "-" in spec:
        a, b = spec.split("-")
        return (int(a[2:], 16), int(b[2:], 16))
    return int(spec[2:], 16)


def protect_urls(text):
    found = []

    def stash(m):
        found.append(m.group(0))
        return f"\x00URL{len(found) - 1}\x00"

    return URL_RE.sub(stash, text), found


def restore_urls(text, found):
    for i, url in enumerate(found):
        text = text.replace(f"\x00URL{i}\x00", url)
    return text


def pass_invisible(text, lex):
    hits = []
    for entry in lex["invisible"]:
        cp = _cp(entry["cp"])
        if isinstance(cp, tuple):
            pattern = "[" + re.escape(chr(cp[0])) + "-" + re.escape(chr(cp[1])) + "]"
        else:
            pattern = re.escape(chr(cp))
        n = len(re.findall(pattern, text))
        if n:
            hits.append({"name": entry["cp"] + " " + entry["name"], "count": n, "action": entry["action"]})
            text = re.sub(pattern, "" if entry["action"] == "delete" else " ", text)
    stray = [c for c in text if unicodedata.category(c) == "Cf"]
    if stray:
        hits.append({"name": "other invisible format chars", "count": len(stray), "action": "delete"})
        text = "".join(c for c in text if unicodedata.category(c) != "Cf")
    return text, hits


def pass_typographic(text, lex):
    hits = []
    for entry in lex["typographic"]:
        ch = entry["from"]
        n = text.count(ch)
        if not n:
            continue
        hits.append({"name": f"{ch} {entry['name']}", "count": n, "to": entry["to"].strip() or "(space)"})
        if ch == "—":
            text = re.sub(r"\s*—\s*", ", ", text)
        elif ch == "–":
            text = re.sub(r"\s*–\s*(?=\d)", "-", text)
            text = re.sub(r"\s+–\s+", ", ", text)
            text = text.replace("–", "-")
        else:
            text = text.replace(ch, entry["to"])
    text = re.sub(r",\s*([,.;:!?])", r"\1", text)
    text = re.sub(r",\s*\n", "\n", text)
    return text, hits


def _match_case(src, repl):
    if not repl:
        return repl
    if src.isupper() and len(src) > 1:
        return repl.upper()
    if src[0].isupper():
        return repl[0].upper() + repl[1:]
    return repl


def pass_lexical(text, lex):
    hits = []
    all_entries = (
        lex.get("phrases", [])
        + lex.get("words", [])
        + lex.get("phrases_pt", [])
        + lex.get("words_pt", [])
    )
    entries = sorted(all_entries, key=lambda e: len(e["find"]), reverse=True)
    for entry in entries:
        find = entry["find"]
        if not find:
            continue
        pattern = re.compile(
            r"(?<![A-Za-zÀ-ÿ])" + re.escape(find).replace(r"\ ", r"\s+") + r"(?![A-Za-zÀ-ÿ])",
            re.IGNORECASE,
        )
        found = pattern.findall(text)
        if not found:
            continue
        hits.append({
            "find": find,
            "replace": entry["replace"] or "(deleted)",
            "count": len(found),
            "family": entry["family"],
        })
        text = pattern.sub(lambda m: _match_case(m.group(0), entry["replace"]), text)

    text = re.sub(r"[ \t]{2,}", " ", text)
    text = re.sub(r"(?m)^[ \t]*([,.;:])\s*", "", text)
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    text = re.sub(r"(?m)^[ \t]+$", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(
        r",\s*(also|so|still|basically|in the end|além disso|por isso|na prática|no fim)\s*,\s*",
        lambda m: ". " + m.group(1)[0].upper() + m.group(1)[1:] + ", ",
        text,
    )
    return text, hits


def scan_structures(text, lex):
    flags = []
    for s in lex["structures"]:
        try:
            pattern = re.compile(s["regex"], re.MULTILINE)
        except re.error:
            continue
        found = pattern.findall(text)
        if found:
            flags.append({"name": s["name"], "count": len(found), "fix": s["fix"]})
    lens = [len(s.split()) for s in SENT_RE.findall(text) if len(s.split()) > 2]
    if len(lens) >= 4:
        mean = sum(lens) / len(lens)
        var = sum((n - mean) ** 2 for n in lens) / len(lens)
        cv = (var ** 0.5) / mean if mean else 0
        if cv < 0.35:
            flags.append({
                "name": f"Uniform sentence length (variation {cv:.2f})",
                "count": len(lens),
                "fix": "Quebre uma frase ao meio e deixe outra mais longa. Modelos de IA escrevem frases com tamanho uniforme.",
            })
    return flags


def humanize(text, lex):
    text, urls = protect_urls(text)
    text, inv = pass_invisible(text, lex)
    text, typo = pass_typographic(text, lex)
    text, lexi = pass_lexical(text, lex)
    text = restore_urls(text, urls)
    return text.strip() + "\n", {
        "invisible": inv,
        "typographic": typo,
        "lexical": lexi,
        "structures": scan_structures(text, lex),
    }


def render_report(report, out=sys.stderr):
    def head(title):
        print(f"\n{title}\n" + "-" * len(title), file=out)

    total = (
        sum(h["count"] for h in report["invisible"])
        + sum(h["count"] for h in report["typographic"])
        + sum(h["count"] for h in report["lexical"])
    )

    head("HUMANIZE REPORT (BILINGUAL PT-BR & EN)")
    print(
        f"{total} machine artefacts removed, "
        f"{len(report['structures'])} structural tells flagged for rewrite",
        file=out,
    )

    if report["invisible"]:
        head("1. INVISIBLE CHARACTERS")
        for h in report["invisible"]:
            print(f"  {h['count']:>3}x  {h['name']}  -> {h['action']}", file=out)
    if report["typographic"]:
        head("2. TYPOGRAPHY")
        for h in report["typographic"]:
            print(f"  {h['count']:>3}x  {h['name']}  -> {h['to']}", file=out)
    if report["lexical"]:
        head("3. SLOP LEXICON (EN + PT-BR)")
        for h in report["lexical"]:
            print(f"  {h['count']:>3}x  {h['find']}  -> {h['replace']}   [{h['family']}]", file=out)
    if report["structures"]:
        head("4. STRUCTURAL TELLS  (not auto-fixed - rewrite these yourself)")
        for h in report["structures"]:
            print(f"  {h['count']:>3}x  {h['name']}\n        {h['fix']}", file=out)
    if not any(report.values()):
        head("CLEAN")
        print("  Nothing to strip.", file=out)
    print("", file=out)


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description="Strip the machine fingerprint out of a draft (PT-BR & EN).")
    ap.add_argument("input", nargs="?", default="-", help="file, or - for stdin")
    ap.add_argument("--text", help="inline text to humanize instead of reading a file")
    ap.add_argument("--lang", choices=["pt", "en", "auto"], default="auto", help="language hint (pt, en, auto)")
    ap.add_argument("-o", "--out", help="write cleaned text here instead of stdout")
    ap.add_argument("--report", action="store_true", help="print what changed, to stderr")
    ap.add_argument("--json", action="store_true", help="emit {text, report} as JSON")
    ap.add_argument("--lexicon", default=LEX, help="path to slop.json")
    args = ap.parse_args()

    if args.text is not None:
        raw = args.text
    else:
        raw = sys.stdin.read() if args.input == "-" else open(args.input, encoding="utf-8").read()
    lex = load_lexicon(args.lexicon)
    clean, report = humanize(raw, lex)

    if args.json:
        print(json.dumps({"text": clean, "report": report}, indent=2, ensure_ascii=False))
        return
    if args.out:
        with open(args.out, "w", encoding="utf-8") as fh:
            fh.write(clean)
        print(f"wrote {args.out}", file=sys.stderr)
    else:
        sys.stdout.write(clean)
    if args.report:
        render_report(report)


if __name__ == "__main__":
    main()
