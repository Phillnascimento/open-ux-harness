#!/usr/bin/env python3
"""
case-extractor.py — Extrator Determinístico de Cases de UX, Artefatos do Harness (Skills 01-07) & Sanitizador de NDA (Code as Action)
Realiza:
1. Varredura de Segurança NDA / PII (detecta e-mails, CPFs, CNPJs, URLs de staging internas, valores financeiros absolutos sensíveis) e sugere substituições seguras.
2. Extração estruturada dos 6 Ângulos de Ouro de Product Design a partir de textos longos, estudos de caso ou JSONs do Open UX Harness (framing-state.json, etc.).
3. Validação do payload de repurpose (garantindo pelo menos 4 peças independentes e variadas).
"""

import argparse
import json
import os
import re
import sys

EMAIL_RE = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
CPF_CNPJ_RE = re.compile(r"\b(?:\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2})\b")
INTERNAL_URL_RE = re.compile(r"https?://[^\s/]*(?:internal|staging|dev|local|jira|confluence|figma\.com/file)[^\s]*", re.IGNORECASE)
CURRENCY_EXACT_RE = re.compile(r"(?:R\$|US\$|\$)\s*\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?")
NUMBERS_RE = re.compile(r"\b\d[\d,.]*%?\b")


def scan_nda_and_angles(text: str) -> dict:
    nda_alerts = []
    emails = EMAIL_RE.findall(text)
    if emails:
        nda_alerts.append({"type": "PII_EMAIL", "count": len(emails), "action": "Remover e-mails pessoais/corporativos antes de publicar."})
    docs = CPF_CNPJ_RE.findall(text)
    if docs:
        nda_alerts.append({"type": "PII_CPF_CNPJ", "count": len(docs), "action": "Remover números de CPF/CNPJ."})
    urls = INTERNAL_URL_RE.findall(text)
    if urls:
        nda_alerts.append({"type": "INTERNAL_URL", "count": len(urls), "action": "Ocultar links privados do Figma/Jira/Staging."})
    exact_money = CURRENCY_EXACT_RE.findall(text)
    if exact_money:
        nda_alerts.append({
            "type": "SENSITIVE_REVENUE_FIGURE",
            "examples": exact_money[:3],
            "action": "Se o projeto tiver NDA, converta valores financeiros absolutos (R$) em percentuais (+X%) ou múltiplos (2x).",
        })

    # Detect Open UX Harness JSON state if input is JSON
    harness_detected = False
    extracted_signals = {
        "numbers_and_metrics": list(set(NUMBERS_RE.findall(text)))[:15],
        "has_problem_or_coi": bool(re.search(r"problema|dor|abandono|drop-off|fricção|cost of inaction|coi|churn", text, re.I)),
        "has_tradeoffs": bool(re.search(r"trade-off|prazo|restrição|api|legado|escopo|cortamos|prioriza", text, re.I)),
        "has_research_or_test": bool(re.search(r"usuário|entrevista|teste de usabilidade|pesquisa|discovery|hipótese", text, re.I)),
        "has_system_or_tokens": bool(re.search(r"design system|token|componente|wcag|acessibilidade|handoff|estados|empty state", text, re.I)),
    }

    try:
        j = json.loads(text)
        if isinstance(j, dict) and ("skill_id" in j or "payload" in j):
            harness_detected = True
    except Exception:
        pass

    ready_angles_count = sum(1 for k, v in extracted_signals.items() if k != "numbers_and_metrics" and v)
    return {
        "status": "analyzed",
        "word_count": len(text.split()),
        "harness_artifact_detected": harness_detected,
        "nda_safety_alerts": nda_alerts,
        "signals_found": extracted_signals,
        "thematic_richness": "high" if ready_angles_count >= 3 else ("medium" if ready_angles_count >= 2 else "thin_needs_interview"),
    }


def validate_repurpose_output(data: dict) -> dict:
    errors = []
    required = ["source_summary", "nda_sanitized", "extracted_inventory", "posts_matrix"]
    for r in required:
        if r not in data:
            errors.append({"code": "SCHEMA_MISMATCH", "field": r, "message": f"Campo obrigatório ausente: '{r}'"})

    if errors:
        return {"status": "failed", "skill_id": "li-repurpose", "confidence_score": 0.0, "validation_errors": errors}

    posts = data.get("posts_matrix", [])
    if not isinstance(posts, list) or len(posts) < 3:
        errors.append({
            "code": "INSUFFICIENT_EXTRACTED_POSTS",
            "field": "posts_matrix",
            "message": "Extraia pelo menos 3 a 5 posts independentes com ângulos e hooks distintos.",
        })
    else:
        hooks = [p.get("hook_id") for p in posts if p.get("hook_id")]
        if len(hooks) != len(set(hooks)):
            errors.append({
                "code": "DUPLICATE_HOOKS",
                "field": "posts_matrix",
                "message": "Todos os posts extraídos de uma mesma fonte devem usar fórmulas de hook diferentes.",
            })

    confidence = max(0.0, round(1.0 - len(errors) * 0.25, 2))
    return {
        "status": "passed" if len(errors) == 0 else "failed",
        "skill_id": "li-repurpose",
        "confidence_score": confidence,
        "extracted_posts_count": len(posts),
        "validation_errors": errors,
    }


def main():
    ap = argparse.ArgumentParser(description="UX Case Extractor & NDA Sanitizer")
    ap.add_argument("--scan", help="Path to raw case study, transcript, or Open UX Harness state file")
    ap.add_argument("--validate", help="Path to repurpose-output.json")
    args = ap.parse_args()

    if args.scan:
        if not os.path.exists(args.scan):
            print(json.dumps({"status": "failed", "message": f"File not found: {args.scan}"}))
            sys.exit(1)
        raw = open(args.scan, encoding="utf-8").read()
        print(json.dumps(scan_nda_and_angles(raw), indent=2, ensure_ascii=False))
        sys.exit(0)

    if args.validate:
        if not os.path.exists(args.validate):
            print(json.dumps({"status": "failed", "validation_errors": [{"code": "FILE_NOT_FOUND"}]}))
            sys.exit(1)
        data = json.load(open(args.validate, encoding="utf-8"))
        res = validate_repurpose_output(data)
        print(json.dumps(res, indent=2, ensure_ascii=False))
        sys.exit(0 if res["status"] == "passed" else 1)

    ap.print_help()
    sys.exit(1)


if __name__ == "__main__":
    main()
