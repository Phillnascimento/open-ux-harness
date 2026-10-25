#!/usr/bin/env python3
"""
reply-triage.py — Validador Determinístico de Triagem e Respostas da Golden Hour (Code as Action)
Verifica:
1. Classificação em 5 buckets: LEAD_OR_RECRUITER, TECHNICAL_SUBSTANCE, STRATEGIC_PEER, SUPPORT, NOISE_SPAM.
2. Presença de continuidade conversacional (Multi-Turn Threading = 6x-8x peso no 360Brew) para os buckets prioritários.
3. Ausência de travessões (—) e exclamações artificiais após o nome ("Oi João!").
"""

import argparse
import json
import os
import re
import sys

VALID_BUCKETS = {"LEAD_OR_RECRUITER", "TECHNICAL_SUBSTANCE", "STRATEGIC_PEER", "SUPPORT", "NOISE_SPAM"}
EXCLAMATION_GREETING_RE = re.compile(r"^\s*(?:oi|olá|hey|hi|thanks|obrigado|obrigada|valeu)\s+[A-ZÀ-Ý][a-zà-ÿ]+!", re.IGNORECASE)


def validate_replies(data: dict) -> dict:
    errors = []
    warnings = []

    if "triaged_comments" not in data or not isinstance(data["triaged_comments"], list):
        return {
            "status": "failed",
            "skill_id": "li-reply",
            "confidence_score": 0.0,
            "validation_errors": [{"code": "SCHEMA_MISMATCH", "message": "Lista 'triaged_comments' obrigatória."}],
        }

    items = data["triaged_comments"]
    counts = {b: 0 for b in VALID_BUCKETS}

    for idx, item in enumerate(items):
        bucket = item.get("bucket", "")
        reply = item.get("draft_reply", "").strip()
        commenter = item.get("commenter_name", f"Comment #{idx+1}")

        if bucket not in VALID_BUCKETS:
            errors.append({
                "code": "INVALID_BUCKET",
                "commenter": commenter,
                "message": f"Bucket '{bucket}' inválido. Use um de: {sorted(VALID_BUCKETS)}",
            })
            continue

        counts[bucket] += 1
        if bucket == "NOISE_SPAM":
            continue

        if not reply:
            errors.append({
                "code": "EMPTY_REPLY",
                "commenter": commenter,
                "message": f"Comentário de '{commenter}' ({bucket}) está sem resposta redigida.",
            })
            continue

        if "—" in reply:
            errors.append({
                "code": "EM_DASH_IN_REPLY",
                "commenter": commenter,
                "message": f"Travessão (—) detectado na resposta para '{commenter}'. Passe pelo `li-human`.",
            })

        if EXCLAMATION_GREETING_RE.search(reply):
            warnings.append({
                "code": "EXCLAMATION_GREETING",
                "commenter": commenter,
                "message": f"Evite abrir com exclamação após o nome em '{commenter}' (parece bot). Use vírgula: 'Boa pergunta, Nome.'",
            })

        w_count = len(reply.split())
        if bucket in ("LEAD_OR_RECRUITER", "TECHNICAL_SUBSTANCE") and w_count < 14:
            warnings.append({
                "code": "SHALLOW_PRIORITY_REPLY",
                "commenter": commenter,
                "message": f"A resposta para '{commenter}' ({bucket}) tem apenas {w_count} palavras. Adicione substância ou uma pergunta de retorno para gerar thread multi-turno (6x-8x alcance).",
            })

    confidence = max(0.0, round(1.0 - len(errors) * 0.25 - len(warnings) * 0.05, 2))
    return {
        "status": "passed" if len(errors) == 0 else "failed",
        "skill_id": "li-reply",
        "confidence_score": confidence,
        "bucket_counts": counts,
        "validation_errors": errors,
        "warnings": warnings,
    }


def main():
    ap = argparse.ArgumentParser(description="Validate Golden Hour comment triage and replies.")
    ap.add_argument("input", help="Path to replies JSON file")
    args = ap.parse_args()

    if not os.path.exists(args.input):
        print(json.dumps({
            "status": "failed",
            "skill_id": "li-reply",
            "validation_errors": [{"code": "FILE_NOT_FOUND", "message": f"File not found: {args.input}"}],
        }, indent=2, ensure_ascii=False))
        sys.exit(1)

    data = json.load(open(args.input, encoding="utf-8"))
    res = validate_replies(data)
    print(json.dumps(res, indent=2, ensure_ascii=False))
    sys.exit(0 if res["status"] == "passed" else 1)


if __name__ == "__main__":
    main()
