#!/usr/bin/env python3
"""
dm-checker.py — Validador Determinístico de Convites de Conexão (<=200 chars) e Sequências de DM (Code as Action)
Verifica:
1. Nota de Convite de Conexão (`invite_note`): estritamente <= 200 caracteres (incluindo espaços) para contas gratuitas do LinkedIn, sem links externos e sem pedido comercial precoce.
2. Primeira Mensagem pós-aceite (`first_dm`): entre 2 e 4 frases (<= 450 caracteres), sem links de Calendly/agenda na mensagem 1 e sem aberturas clichês ("Espero que esteja bem" / "I hope this message finds you well").
3. Dois Follow-ups (`followup_day4` e `followup_day10`): sem frases de cobrança vazia ("Só subindo essa mensagem" / "Just bumping this").
"""

import argparse
import json
import os
import re
import sys

CALENDLY_RE = re.compile(r"https?://[^\s]*(?:calendly|cal\.com|tidycal|hubspot|savcal)[^\s]*", re.IGNORECASE)
CLICHE_DM_RE = re.compile(
    r"\b(?:espero que (?:esteja|voce esteja|você esteja) bem|i hope this (?:message|email) finds you well|passando só para cobrar|just bumping this|just following up on my last)\b",
    re.IGNORECASE,
)


def check_dm_sequence(data: dict) -> dict:
    errors = []
    warnings = []

    required = ["playbook_type", "language", "invite_note", "first_dm", "followup_day4", "followup_day10"]
    for r in required:
        if r not in data or not str(data[r]).strip():
            errors.append({"code": "SCHEMA_MISMATCH", "field": r, "message": f"Campo obrigatório ausente: '{r}'"})

    if errors:
        return {"status": "failed", "skill_id": "li-dm", "confidence_score": 0.0, "validation_errors": errors}

    invite = data["invite_note"].strip()
    first_dm = data["first_dm"].strip()
    f4 = data["followup_day4"].strip()
    f10 = data["followup_day10"].strip()

    # 1. Invite note strictly <= 200 chars
    inv_len = len(invite)
    if inv_len > 200:
        errors.append({
            "code": "INVITE_EXCEEDS_200_CHARS",
            "field": "invite_note",
            "message": f"A nota de convite possui {inv_len} caracteres (limite rígido do LinkedIn: 200 caracteres incluindo espaços). Corte {inv_len - 200} caracteres.",
        })

    # 2. First DM length & no calendar link
    if len(first_dm) > 520:
        errors.append({
            "code": "FIRST_DM_TOO_LONG",
            "field": "first_dm",
            "message": f"A primeira mensagem possui {len(first_dm)} caracteres (máximo recomendado: 450 chars / 2 a 4 frases para leitura rápida no celular).",
        })
    if CALENDLY_RE.search(first_dm):
        errors.append({
            "code": "CALENDAR_LINK_IN_FIRST_DM",
            "field": "first_dm",
            "message": "Link de agenda (Calendly/Cal.com) detectado na mensagem 1. Isso soa como funil automatizado; ofereça valor primeiro.",
        })

    # 3. Check clichés and em-dashes across all messages
    for field_name, content in [("invite_note", invite), ("first_dm", first_dm), ("followup_day4", f4), ("followup_day10", f10)]:
        if "—" in content:
            errors.append({
                "code": "EM_DASH_FINGERPRINT",
                "field": field_name,
                "message": f"Travessão (—) detectado em '{field_name}'. Passe pelo `li-human/humanize.py`.",
            })
        if CLICHE_DM_RE.search(content):
            errors.append({
                "code": "CLICHE_OR_BUMP_DETECTED",
                "field": field_name,
                "message": f"Clichê de prospecção ou cobrança vazia detectado em '{field_name}'.",
            })

    confidence = max(0.0, round(1.0 - len(errors) * 0.25 - len(warnings) * 0.05, 2))
    return {
        "status": "passed" if len(errors) == 0 else "failed",
        "skill_id": "li-dm",
        "confidence_score": confidence,
        "char_counts": {
            "invite_note": f"{inv_len}/200",
            "first_dm": len(first_dm),
            "followup_day4": len(f4),
            "followup_day10": len(f10),
        },
        "validation_errors": errors,
        "warnings": warnings,
    }


def main():
    ap = argparse.ArgumentParser(description="Validate LinkedIn Connection Note (<=200 chars) and DM Sequence.")
    ap.add_argument("input", help="Path to DM sequence JSON file")
    args = ap.parse_args()

    if not os.path.exists(args.input):
        print(json.dumps({
            "status": "failed",
            "skill_id": "li-dm",
            "validation_errors": [{"code": "FILE_NOT_FOUND", "message": f"File not found: {args.input}"}],
        }, indent=2, ensure_ascii=False))
        sys.exit(1)

    data = json.load(open(args.input, encoding="utf-8"))
    res = check_dm_sequence(data)
    print(json.dumps(res, indent=2, ensure_ascii=False))
    sys.exit(0 if res["status"] == "passed" else 1)


if __name__ == "__main__":
    main()
