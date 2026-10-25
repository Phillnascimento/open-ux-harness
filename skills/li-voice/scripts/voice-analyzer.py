#!/usr/bin/env python3
"""
voice-analyzer.py — Minerador Determinístico de DNA de Escrita & Validador de Perfil de Voz (Code as Action)
Dois modos de uso:
1. `--analyze <arquivo_amostras.txt>`: Extrai métricas estilísticas reais do texto do designer (comprimento médio de frase, burstiness/variação, pronomes PT-BR e EN, conectivos, densidade de números).
2. `--validate <voice-profile.json>`: Valida o contrato JSON de Tom e Voz Bilíngue (PT-BR e EN) contra o schema da skill `li-voice`.
"""

import argparse
import json
import os
import re
import statistics
import sys

SENT_RE = re.compile(r"[^.!?\n]+[.!?]*")
WORD_RE = re.compile(r"[A-Za-zÀ-ÿ']+")
NUMBERS_RE = re.compile(r"\b\d[\d,.]*%?\b|R\$\s*\d+|\$\d+")
PT_FIRST_PERSON = re.compile(r"\b(eu|meu|minha|meus|minhas|nós|nosso|nossa|a gente)\b", re.IGNORECASE)
EN_FIRST_PERSON = re.compile(r"\b(i|me|my|mine|we|us|our|ours)\b", re.IGNORECASE)


def analyze_samples(text: str) -> dict:
    sents = [s.strip() for s in SENT_RE.findall(text) if len(s.split()) > 2]
    words = WORD_RE.findall(text)
    if not words or len(sents) < 2:
        return {
            "status": "insufficient_text",
            "message": "Forneça pelo menos 3 frases completas para extrair o DNA estatístico de escrita.",
        }

    lens = [len(s.split()) for s in sents]
    mean_len = round(statistics.mean(lens), 1)
    stdev_len = round(statistics.pstdev(lens), 1)
    cv = round(stdev_len / mean_len, 2) if mean_len else 0.0

    pt_pronouns = len(PT_FIRST_PERSON.findall(text))
    en_pronouns = len(EN_FIRST_PERSON.findall(text))
    numbers_count = len(NUMBERS_RE.findall(text))
    per_100 = 100.0 / max(len(words), 1)

    short_sentences_pct = round(sum(1 for l in lens if l <= 8) * 100.0 / len(lens), 1)
    long_sentences_pct = round(sum(1 for l in lens if l >= 20) * 100.0 / len(lens), 1)

    return {
        "status": "analyzed",
        "word_count": len(words),
        "sentence_count": len(sents),
        "metrics": {
            "avg_sentence_words": mean_len,
            "sentence_length_stddev": stdev_len,
            "burstiness_cv": cv,
            "short_punchy_sentences_pct": short_sentences_pct,
            "long_explanatory_sentences_pct": long_sentences_pct,
            "pt_first_person_per_100w": round(pt_pronouns * per_100, 2),
            "en_first_person_per_100w": round(en_pronouns * per_100, 2),
            "concrete_numbers_per_100w": round(numbers_count * per_100, 2),
        },
    }


def validate_voice_profile(data: dict) -> dict:
    errors = []
    warnings = []

    required = ["persona_style", "tone_axes", "cadence_rules", "bilingual_registers", "lexicon_rules"]
    for req in required:
        if req not in data:
            errors.append({
                "code": "SCHEMA_MISMATCH",
                "field": req,
                "message": f"Campo obrigatório ausente em voice-profile.json: '{req}'",
            })

    if errors:
        return {
            "status": "failed",
            "skill_id": "li-voice",
            "confidence_score": 0.0,
            "validation_errors": errors,
            "warnings": warnings,
        }

    # Check tone axes (1-5)
    axes = data.get("tone_axes", {})
    for axis_name in ("formality", "pragmatism_vs_narrative", "technical_density", "assertiveness"):
        val = axes.get(axis_name)
        if not isinstance(val, (int, float)) or not (1 <= val <= 5):
            errors.append({
                "code": "SCHEMA_MISMATCH",
                "field": f"tone_axes.{axis_name}",
                "message": f"Eixo '{axis_name}' deve ser um número entre 1 e 5.",
            })

    # Check bilingual registers (pt_br and en)
    regs = data.get("bilingual_registers", {})
    for lang in ("pt_br", "en"):
        reg = regs.get(lang, {})
        if not reg.get("voice_stance") or not reg.get("sample_paragraph"):
            errors.append({
                "code": "SCHEMA_MISMATCH",
                "field": f"bilingual_registers.{lang}",
                "message": f"Registro '{lang}' deve conter 'voice_stance' e 'sample_paragraph'.",
            })
        elif len(reg.get("sample_paragraph", "")) < 60:
            warnings.append({
                "code": "SAMPLE_TOO_SHORT",
                "field": f"bilingual_registers.{lang}.sample_paragraph",
                "message": f"O parágrafo de exemplo em '{lang}' é muito curto (< 60 chars).",
            })

    # Check lexicon rules
    lex = data.get("lexicon_rules", {})
    if not isinstance(lex.get("banned_words_pt"), list) or len(lex.get("banned_words_pt", [])) < 3:
        errors.append({
            "code": "SCHEMA_MISMATCH",
            "field": "lexicon_rules.banned_words_pt",
            "message": "Defina pelo menos 3 termos/clichês proibidos em 'banned_words_pt'.",
        })
    if not isinstance(lex.get("banned_words_en"), list) or len(lex.get("banned_words_en", [])) < 3:
        errors.append({
            "code": "SCHEMA_MISMATCH",
            "field": "lexicon_rules.banned_words_en",
            "message": "Defina pelo menos 3 termos/clichês proibidos em 'banned_words_en'.",
        })

    confidence = max(0.0, round(1.0 - len(errors) * 0.25 - len(warnings) * 0.05, 2))
    return {
        "status": "passed" if len(errors) == 0 else "failed",
        "skill_id": "li-voice",
        "confidence_score": confidence,
        "validation_errors": errors,
        "warnings": warnings,
    }


def main():
    ap = argparse.ArgumentParser(description="Analyze writing DNA or validate voice-profile.json")
    ap.add_argument("--analyze", help="Path to text file with user writing samples")
    ap.add_argument("--validate", help="Path to voice-profile.json")
    args = ap.parse_args()

    if args.analyze:
        if not os.path.exists(args.analyze):
            print(json.dumps({"status": "failed", "message": f"File not found: {args.analyze}"}))
            sys.exit(1)
        text = open(args.analyze, encoding="utf-8").read()
        print(json.dumps(analyze_samples(text), indent=2, ensure_ascii=False))
        sys.exit(0)

    if args.validate:
        if not os.path.exists(args.validate):
            print(json.dumps({
                "status": "failed",
                "skill_id": "li-voice",
                "confidence_score": 0.0,
                "validation_errors": [{"code": "FILE_NOT_FOUND", "message": f"File not found: {args.validate}"}],
            }, indent=2, ensure_ascii=False))
            sys.exit(1)
        data = json.load(open(args.validate, encoding="utf-8"))
        res = validate_voice_profile(data)
        print(json.dumps(res, indent=2, ensure_ascii=False))
        sys.exit(0 if res["status"] == "passed" else 1)

    ap.print_help()
    sys.exit(1)


if __name__ == "__main__":
    main()
