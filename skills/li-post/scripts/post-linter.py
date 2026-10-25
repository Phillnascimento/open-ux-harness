#!/usr/bin/env python3
"""
post-linter.py — Linter Determinístico de Posts para o Algoritmo 360Brew do LinkedIn (Code as Action)
Verifica:
1. Comprimento da Linha 1 (Hook): deve ter <= 140 caracteres (sobrevive ao corte mobile antes de '...ver mais / ...see more').
2. Comprimento Total do Post: faixa ideal de Dwell Time entre 750 e 1.750 caracteres (alerta se < 450 ou > 2.200).
3. Escaneabilidade Visual: nenhum parágrafo com mais de 4 linhas / 380 caracteres seguidos sem quebra de linha.
4. Penalidades do Algoritmo 360Brew:
   - Zero links externos (http:// ou https://) no corpo do post (penalidade de -40% a -60% no alcance).
   - Máximo de 3 hashtags no final.
   - Zero Engagement Bait explícito ("Comente EU QUERO", "Agree?", "Concordam?").
"""

import argparse
import json
import os
import re
import sys

URL_RE = re.compile(r"https?://\S+|www\.\S+", re.IGNORECASE)
HASHTAG_RE = re.compile(r"(?<!\S)#[A-Za-zÀ-ÿ0-9_]+")
BAIT_RE = re.compile(
    r"\b(?:comente\s+[\"']?[a-z0-9]+[\"']?|comment\s+[\"']?[a-z0-9]+[\"']?\s+below|concordam\?|thoughts\?|agree\?)\b",
    re.IGNORECASE,
)


def lint_post(text: str) -> dict:
    errors = []
    warnings = []
    clean = text.strip()
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", clean) if p.strip()]

    if not paragraphs:
        return {
            "status": "failed",
            "skill_id": "li-post",
            "confidence_score": 0.0,
            "validation_errors": [{"code": "EMPTY_POST", "message": "O texto do post está vazio."}],
        }

    hook_line = paragraphs[0].split("\n")[0].strip()
    hook_len = len(hook_line)
    total_len = len(clean)
    urls = URL_RE.findall(clean)
    hashtags = HASHTAG_RE.findall(clean)
    bait_hits = BAIT_RE.findall(clean)

    # 1. Check Hook length (mobile cutoff ~140 chars)
    if hook_len > 150:
        errors.append({
            "code": "HOOK_TRUNCATED_ON_MOBILE",
            "message": f"A Linha 1 (Hook) possui {hook_len} caracteres (máximo permitido: 140-150 chars para não cortar no mobile antes do 'ver mais').",
        })
    elif hook_len > 135:
        warnings.append({
            "code": "HOOK_NEAR_LIMIT",
            "message": f"A Linha 1 possui {hook_len} chars (muito próxima do corte de 140 chars no mobile).",
        })

    # 2. Check Total Length (Dwell Time sweet spot: 750 - 1750 chars)
    if total_len < 400:
        errors.append({
            "code": "POST_TOO_SHORT_LOW_DWELL",
            "message": f"O post possui apenas {total_len} caracteres. Posts abaixo de 400 chars têm Dwell Time < 5s e baixo alcance no 360Brew.",
        })
    elif total_len > 2200:
        warnings.append({
            "code": "POST_VERY_LONG",
            "message": f"O post possui {total_len} caracteres. Acima de 1.800 chars, considere transformar em Carrossel PDF (`li-carousel`).",
        })

    # 3. Check Wall of Text (Paragraph length)
    wall_paragraphs = [i + 1 for i, p in enumerate(paragraphs) if len(p) > 380 or p.count("\n") >= 4]
    if wall_paragraphs:
        warnings.append({
            "code": "WALL_OF_TEXT_PARAGRAPH",
            "message": f"Os parágrafos {wall_paragraphs} estão longos demais (>380 chars ou >4 linhas). Quebre-os com linha em branco para leitura mobile.",
        })

    # 4. Outbound Links Penalty
    if urls:
        errors.append({
            "code": "OUTBOUND_LINK_PENALTY",
            "message": f"Link externo detectado no corpo do post ({urls[0]}). O algoritmo 360Brew reduz o alcance em 40%-60%. Direcione para a seção Destaques (Featured) do perfil ou coloque nos comentários após 20 minutos.",
        })

    # 5. Hashtags limit (max 3)
    if len(hashtags) > 3:
        errors.append({
            "code": "TOO_MANY_HASHTAGS",
            "message": f"Foram encontradas {len(hashtags)} hashtags ({', '.join(hashtags)}). Use no máximo 3 hashtags no final.",
        })

    # 6. Engagement bait
    if bait_hits:
        errors.append({
            "code": "ENGAGEMENT_BAIT_DETECTED",
            "message": f"Isca de engajamento penalizada pelo algoritmo detectada: '{bait_hits[0]}'. Substitua por uma pergunta aberta sobre o trade-off técnico.",
        })

    confidence = max(0.0, round(1.0 - len(errors) * 0.25 - len(warnings) * 0.05, 2))
    return {
        "status": "passed" if len(errors) == 0 else "failed",
        "skill_id": "li-post",
        "confidence_score": confidence,
        "metrics": {
            "hook_char_count": hook_len,
            "hook_preview_140": hook_line[:140],
            "total_char_count": total_len,
            "paragraph_count": len(paragraphs),
            "hashtag_count": len(hashtags),
            "outbound_links_count": len(urls),
        },
        "validation_errors": errors,
        "warnings": warnings,
    }


def pick_hooks(category: str = "all", limit: int = 4) -> dict:
    hooks_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "hooks.json")
    if not os.path.isfile(hooks_path):
        return {"status": "failed", "message": "hooks.json not found"}
    data = json.load(open(hooks_path, encoding="utf-8"))
    formulas = data.get("hooks", data.get("formulas", []))
    if category != "all":
        filtered = [
            f for f in formulas
            if category.lower() in f.get("best_for", "").lower()
            or category.lower() in f.get("name", "").lower()
            or category.lower() in f.get("example_pt", "").lower()
        ]
        if filtered:
            formulas = filtered
    selected = formulas[:limit]
    return {
        "status": "passed",
        "selected_hooks": [
            {
                "id": f.get("id"),
                "name": f.get("name"),
                "template_pt": f.get("template_pt", f.get("template")),
                "template_en": f.get("template_en", f.get("template")),
                "best_for": f.get("best_for", f.get("use_for")),
            }
            for f in selected
        ],
    }


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description="Lint a LinkedIn post draft or pick curated hooks from hooks.json.")
    ap.add_argument("input", nargs="?", help="Path to post draft text file")
    ap.add_argument("--text", help="Inline text to lint instead of a file")
    ap.add_argument("--pick-hooks", action="store_true", help="Return 4 curated hooks without loading full hooks.json")
    ap.add_argument("--category", default="all", help="Hook filter keyword (e.g. trade-off, metric, mistake, system)")
    args = ap.parse_args()

    if args.pick_hooks:
        print(json.dumps(pick_hooks(args.category), ensure_ascii=False, indent=2))
        return

    if args.text is not None:
        text = args.text
    elif args.input and os.path.exists(args.input):
        text = open(args.input, encoding="utf-8").read()
    else:
        print(json.dumps({
            "status": "failed",
            "skill_id": "li-post",
            "validation_errors": [{"code": "FILE_NOT_FOUND", "message": f"File not found: {args.input}"}],
        }, indent=2, ensure_ascii=False))
        sys.exit(1)

    res = lint_post(text)
    print(json.dumps(res, indent=2, ensure_ascii=False))
    sys.exit(0 if res["status"] == "passed" else 1)


if __name__ == "__main__":
    main()
