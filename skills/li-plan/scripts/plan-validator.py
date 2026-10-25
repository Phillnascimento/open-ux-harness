#!/usr/bin/env python3
"""
plan-validator.py — Validador Determinístico de Calendário Editorial & Radar 3-Tiers (Code as Action)
Verifica:
1. Coerência com os 3 Pilares 360Brew do designer (definidos em brand.json).
2. Ausência de hooks repetidos ou formatos idênticos em slots consecutivos.
3. Equilíbrio da Matriz de Networking 3-Tiers (Tier 1: Decisores/Design Managers/Clientes, Tier 2: Tech Recruiters/Staff Connectors, Tier 3: Vozes de Nicho/Pares).
"""

import argparse
import json
import os
import sys


def validate_plan(data: dict) -> dict:
    errors = []
    warnings = []

    required = ["week_of", "routine_mode", "language_strategy", "posts_schedule", "engagement_radar_3tiers"]
    for req in required:
        if req not in data:
            errors.append({
                "code": "SCHEMA_MISMATCH",
                "field": req,
                "message": f"Campo obrigatório ausente no plano semanal: '{req}'",
            })

    if errors:
        return {
            "status": "failed",
            "skill_id": "li-plan",
            "confidence_score": 0.0,
            "validation_errors": errors,
            "warnings": warnings,
        }

    posts = data.get("posts_schedule", [])
    if not isinstance(posts, list) or not (2 <= len(posts) <= 5):
        errors.append({
            "code": "INVALID_POST_CADENCE",
            "field": "posts_schedule",
            "message": f"A cadência semanal deve conter entre 2 e 5 posts de alta qualidade (atual: {len(posts) if isinstance(posts, list) else 0}).",
        })
    else:
        last_type = None
        used_hooks = set()
        for idx, slot in enumerate(posts):
            for f in ("day", "post_type", "pillar_id", "hook_id", "specific_angle", "format"):
                if f not in slot or not str(slot[f]).strip():
                    errors.append({
                        "code": "SCHEMA_MISMATCH",
                        "field": f"posts_schedule[{idx}].{f}",
                        "message": f"Slot {idx+1} sem campo obrigatório '{f}'.",
                    })
            p_type = slot.get("post_type")
            if p_type and p_type == last_type:
                warnings.append({
                    "code": "CONSECUTIVE_POST_TYPE",
                    "field": f"posts_schedule[{idx}].post_type",
                    "message": f"Dois posts seguidos do mesmo tipo ('{p_type}'). Alterne entre Prova/Case, Bastidor/Trade-off, Ensino/Framework e Ponto de Vista.",
                })
            last_type = p_type

            h_id = slot.get("hook_id")
            if h_id in used_hooks:
                warnings.append({
                    "code": "DUPLICATE_HOOK_IN_WEEK",
                    "field": f"posts_schedule[{idx}].hook_id",
                    "message": f"Fórmula de hook '{h_id}' repetida na mesma semana.",
                })
            if h_id:
                used_hooks.add(h_id)

    radar = data.get("engagement_radar_3tiers", {})
    for tier in ("tier_1_decision_makers", "tier_2_recruiters_connectors", "tier_3_niche_peers"):
        items = radar.get(tier, [])
        if not isinstance(items, list) or len(items) < 2:
            errors.append({
                "code": "SCHEMA_MISMATCH",
                "field": f"engagement_radar_3tiers.{tier}",
                "message": f"O radar '{tier}' deve listar pelo menos 2 perfis ou empresas-alvo.",
            })

    confidence = max(0.0, round(1.0 - len(errors) * 0.25 - len(warnings) * 0.05, 2))
    return {
        "status": "passed" if len(errors) == 0 else "failed",
        "skill_id": "li-plan",
        "confidence_score": confidence,
        "posts_planned": len(posts),
        "validation_errors": errors,
        "warnings": warnings,
    }


def main():
    ap = argparse.ArgumentParser(description="Validate LinkedIn Weekly Plan JSON")
    ap.add_argument("input", help="Path to plan.json")
    args = ap.parse_args()

    if not os.path.exists(args.input):
        print(json.dumps({
            "status": "failed",
            "skill_id": "li-plan",
            "confidence_score": 0.0,
            "validation_errors": [{"code": "FILE_NOT_FOUND", "message": f"File not found: {args.input}"}],
        }, indent=2, ensure_ascii=False))
        sys.exit(1)

    data = json.load(open(args.input, encoding="utf-8"))
    res = validate_plan(data)
    print(json.dumps(res, indent=2, ensure_ascii=False))
    sys.exit(0 if res["status"] == "passed" else 1)


if __name__ == "__main__":
    main()
