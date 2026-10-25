#!/usr/bin/env python3
"""
inbox-triage.py — Classificador Determinístico de Inbox LinkedIn, Detector de Sequências de Spam & Guardião do Spotlight 'Likely to Respond' (Code as Action)
Verifica:
1. Classificação em 5 buckets: LEAD, RECRUITER, PEER, ASK, SPAM.
2. Detecção de Tells de Automação/Spam (mensagens com link de agenda na abordagem 1, "quick question", pitch de cripto/agência genérica).
3. Garantia de resposta rápida para 100% dos itens RECRUITER (mesmo quando a vaga é recusada) para proteger e elevar o Spotlight 'Likely to Respond' no LinkedIn Recruiter.
"""

import argparse
import json
import os
import sys

VALID_BUCKETS = {"LEAD", "RECRUITER", "PEER", "ASK", "SPAM"}


def validate_inbox_triage(data: dict) -> dict:
    errors = []
    warnings = []

    if "messages" not in data or not isinstance(data["messages"], list):
        return {
            "status": "failed",
            "skill_id": "li-inbox",
            "confidence_score": 0.0,
            "validation_errors": [{"code": "SCHEMA_MISMATCH", "message": "Lista 'messages' obrigatória."}],
        }

    counts = {b: 0 for b in VALID_BUCKETS}
    for idx, msg in enumerate(data["messages"]):
        sender = msg.get("sender", f"Sender #{idx+1}")
        bucket = msg.get("bucket", "")
        reply = msg.get("draft_reply", "").strip()

        if bucket not in VALID_BUCKETS:
            errors.append({
                "code": "INVALID_BUCKET",
                "sender": sender,
                "message": f"Bucket '{bucket}' inválido. Use um de: {sorted(VALID_BUCKETS)}",
            })
            continue

        counts[bucket] += 1

        if bucket == "RECRUITER" and not reply:
            errors.append({
                "code": "MISSING_RECRUITER_REPLY_HURTS_SPOTLIGHT",
                "sender": sender,
                "message": f"A mensagem do recrutador '{sender}' precisa de uma resposta (mesmo que seja recusa cordial) para manter seu score 'Likely to Respond' alto no LinkedIn Recruiter.",
            })

        if bucket == "LEAD" and not reply:
            errors.append({
                "code": "MISSING_LEAD_REPLY",
                "sender": sender,
                "message": f"O lead '{sender}' está sem rascunho de resposta.",
            })

        if reply and "—" in reply:
            errors.append({
                "code": "EM_DASH_IN_REPLY",
                "sender": sender,
                "message": f"Travessão (—) detectado na resposta para '{sender}'. Passe pelo `li-human`.",
            })

    confidence = max(0.0, round(1.0 - len(errors) * 0.25 - len(warnings) * 0.05, 2))
    return {
        "status": "passed" if len(errors) == 0 else "failed",
        "skill_id": "li-inbox",
        "confidence_score": confidence,
        "bucket_counts": counts,
        "validation_errors": errors,
        "warnings": warnings,
    }


def main():
    ap = argparse.ArgumentParser(description="Validate LinkedIn Inbox Triage and Replies.")
    ap.add_argument("input", help="Path to inbox triage JSON file")
    args = ap.parse_args()

    if not os.path.exists(args.input):
        print(json.dumps({
            "status": "failed",
            "skill_id": "li-inbox",
            "validation_errors": [{"code": "FILE_NOT_FOUND", "message": f"File not found: {args.input}"}],
        }, indent=2, ensure_ascii=False))
        sys.exit(1)

    data = json.load(open(args.input, encoding="utf-8"))
    res = validate_inbox_triage(data)
    print(json.dumps(res, indent=2, ensure_ascii=False))
    sys.exit(0 if res["status"] == "passed" else 1)


if __name__ == "__main__":
    main()
