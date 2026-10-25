#!/usr/bin/env python3
"""
comment-scorer.py — Validador Determinístico de Comentários Estratégicos para o Algoritmo 360Brew (Code as Action)
Verifica:
1. Comprimento Algorítmico: entre 16 e 75 palavras (comentários >15 palavras têm 4x o peso de um Like no 360Brew; acima de 75 palavras soam como tentativa de sequestrar o post do autor).
2. Bloqueio de Aberturas Invisíveis (PT-BR & EN): "Ótimo post", "Excelente reflexão", "Concordo totalmente", "Parabéns pelo post", "Great post", "Love this", "So true", "Couldn't agree more", "This resonates", ou primeiro caractere sendo emoji (🔥, 👏, 🚀).
3. Ausência de travessões (—) e jargões de IA.
"""

import argparse
import json
import os
import re
import sys

CLICHE_OPENERS_RE = re.compile(
    r"^\s*(?:ótimo post|excelente post|excelente reflexão|muito bom|concordo plenamente|concordo totalmente|parabéns pelo post|great post|love this|so true|couldn'?t agree more|this resonates|spot on|well said|totalmente de acordo)\b",
    re.IGNORECASE,
)
EMOJI_START_RE = re.compile(r"^\s*[\U0001F300-\U0001FAFF\u2600-\u27BF]")
WORD_RE = re.compile(r"[A-Za-zÀ-ÿ0-9%']+")


def score_comment(text: str, option_label: str = "Option") -> dict:
    errors = []
    warnings = []
    clean = text.strip()
    words = WORD_RE.findall(clean)
    w_count = len(words)

    if w_count < 16:
        errors.append({
            "code": "BELOW_360BREW_15WORD_THRESHOLD",
            "option": option_label,
            "message": f"O comentário possui apenas {w_count} palavras (mínimo exigido pelo algoritmo 360Brew para peso máximo: 16 palavras).",
        })
    elif w_count > 75:
        errors.append({
            "code": "COMMENT_TOO_LONG_HIJACK",
            "option": option_label,
            "message": f"O comentário possui {w_count} palavras (máximo recomendado: 75 palavras para manter de 2 a 4 frases diretas).",
        })

    if CLICHE_OPENERS_RE.search(clean):
        errors.append({
            "code": "CLICHE_OPENER_DETECTED",
            "option": option_label,
            "message": "Abertura invisível/clichê detectada ('Ótimo post', 'Concordo', 'Great post'). Comece direto pelo ponto técnico ou dado.",
        })

    if EMOJI_START_RE.search(clean):
        errors.append({
            "code": "EMOJI_OPENER_DETECTED",
            "option": option_label,
            "message": "Nunca inicie um comentário profissional com emoji (🔥, 👏, 🚀).",
        })

    if "—" in clean:
        errors.append({
            "code": "EM_DASH_FINGERPRINT",
            "option": option_label,
            "message": "Travessão (—) detectado no comentário. Passe pelo `li-human/humanize.py`.",
        })

    return {
        "option": option_label,
        "word_count": w_count,
        "passes_360brew_threshold": 16 <= w_count <= 75 and len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
    }


def main():
    ap = argparse.ArgumentParser(description="Validate LinkedIn comment options against 360Brew >15w rules.")
    ap.add_argument("input", help="Path to JSON file containing comment options or plain text file")
    args = ap.parse_args()

    if not os.path.exists(args.input):
        print(json.dumps({
            "status": "failed",
            "skill_id": "li-comment",
            "validation_errors": [{"code": "FILE_NOT_FOUND", "message": f"File not found: {args.input}"}],
        }, indent=2, ensure_ascii=False))
        sys.exit(1)

    raw = open(args.input, encoding="utf-8").read()
    all_errors = []
    results = []

    try:
        data = json.loads(raw)
        options = data.get("options", [])
        if len(options) < 2:
            all_errors.append({
                "code": "SCHEMA_MISMATCH",
                "message": "Forneça pelo menos 2 opções de comentário de arquétipos diferentes.",
            })
        for idx, opt in enumerate(options):
            res = score_comment(opt.get("text", ""), opt.get("archetype", f"Option {idx+1}"))
            results.append(res)
            all_errors.extend(res["errors"])
    except Exception:
        res = score_comment(raw, "Single Comment")
        results.append(res)
        all_errors.extend(res["errors"])

    confidence = max(0.0, round(1.0 - len(all_errors) * 0.25, 2))
    print(json.dumps({
        "status": "passed" if len(all_errors) == 0 else "failed",
        "skill_id": "li-comment",
        "confidence_score": confidence,
        "evaluated_options": results,
        "validation_errors": all_errors,
    }, indent=2, ensure_ascii=False))
    sys.exit(0 if len(all_errors) == 0 else 1)


if __name__ == "__main__":
    main()
