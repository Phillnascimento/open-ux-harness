#!/usr/bin/env python3
"""
brand-validator.py — Validador Determinístico de Personal Branding & Design Tokens (Code as Action)
Verifica:
1. Conformidade estrutural com o contrato JSON de `li-brand` (PT-BR e EN).
2. Soma exata dos pesos dos 3 Pilares Editoriais para o algoritmo 360Brew (deve somar 100%, exatamente 3 pilares).
3. Cálculo matemático de Luminância Relativa e Contraste WCAG 2.2 AA (>= 4.5:1 para texto sobre superfície; >= 3.0:1 para destaque visual).
4. Comprimento da linha de posicionamento de Banner (<= 65 caracteres em PT-BR e EN para leitura mobile).
"""

import argparse
import json
import os
import re
import sys

HEX_RE = re.compile(r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
VALID_MODES = {"carreira-clt", "remoto-global", "negocios-b2b", "hibrido-autoridade"}


def hex_to_rgb(hex_str: str):
    h = hex_str.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return tuple(int(h[i : i + 2], 16) / 255.0 for i in (0, 2, 4))


def relative_luminance(hex_str: str) -> float:
    r, g, b = hex_to_rgb(hex_str)
    transform = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b)


def contrast_ratio(hex1: str, hex2: str) -> float:
    l1 = relative_luminance(hex1)
    l2 = relative_luminance(hex2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return round((lighter + 0.05) / (darker + 0.05), 2)


def validate_brand(data: dict) -> dict:
    errors = []
    warnings = []

    # 1. Check required top-level keys
    required_keys = ["mode", "seniority_real", "positioning", "pillars_360brew", "visual_tokens", "banner_spec"]
    for k in required_keys:
        if k not in data:
            errors.append({"code": "SCHEMA_MISMATCH", "field": k, "message": f"Campo obrigatório ausente: '{k}'"})

    if errors:
        return {
            "status": "failed",
            "confidence_score": 0.0,
            "validation_errors": errors,
            "warnings": warnings,
        }

    # 2. Validate mode
    if data["mode"] not in VALID_MODES:
        errors.append({
            "code": "INVALID_MODE",
            "field": "mode",
            "message": f"Modo '{data['mode']}' inválido. Use um de: {sorted(VALID_MODES)}",
        })

    # 3. Validate bilingual positioning (PT-BR & EN)
    pos = data.get("positioning", {})
    for lang in ("pt_br", "en"):
        lang_obj = pos.get(lang, {})
        if not lang_obj.get("uvp_statement") or len(lang_obj.get("uvp_statement", "").strip()) < 20:
            errors.append({
                "code": "SCHEMA_MISMATCH",
                "field": f"positioning.{lang}.uvp_statement",
                "message": f"Proposta de Valor Única (UVP) em '{lang}' ausente ou curta demais (< 20 chars).",
            })
        if not lang_obj.get("target_titles") or not isinstance(lang_obj.get("target_titles"), list):
            errors.append({
                "code": "SCHEMA_MISMATCH",
                "field": f"positioning.{lang}.target_titles",
                "message": f"Lista de cargos/títulos-alvo em '{lang}' obrigatória.",
            })

    # 4. Validate 360Brew Pillars (2 to 3 pillars, sum == 100)
    pillars = data.get("pillars_360brew", [])
    if not isinstance(pillars, list) or not (2 <= len(pillars) <= 3):
        errors.append({
            "code": "PILLAR_COUNT_INVALID",
            "field": "pillars_360brew",
            "message": "O algoritmo 360Brew exige foco vetorial em exatamente 2 ou 3 pilares temáticos.",
        })
    else:
        total_weight = sum(int(p.get("weight", 0)) for p in pillars)
        if total_weight != 100:
            errors.append({
                "code": "PILLAR_WEIGHT_MISMATCH",
                "field": "pillars_360brew",
                "message": f"A soma dos pesos dos pilares deve ser exatamente 100% (atual: {total_weight}%).",
            })
        for idx, p in enumerate(pillars):
            if not p.get("name_pt") or not p.get("name_en"):
                errors.append({
                    "code": "SCHEMA_MISMATCH",
                    "field": f"pillars_360brew[{idx}]",
                    "message": "Cada pilar deve conter 'name_pt' e 'name_en'.",
                })

    # 5. Validate Visual Tokens & WCAG 2.2 AA Contrast
    tokens = data.get("visual_tokens", {})
    color_fields = ["surface_color", "text_color", "primary_accent", "secondary_accent"]
    for cf in color_fields:
        val = tokens.get(cf, "")
        if not HEX_RE.match(str(val)):
            errors.append({
                "code": "INVALID_HEX_COLOR",
                "field": f"visual_tokens.{cf}",
                "message": f"Cor '{val}' em '{cf}' não é um código HEX válido (#RRGGBB).",
            })

    wcag_metrics = {}
    if not any(e["code"] == "INVALID_HEX_COLOR" for e in errors):
        text_vs_surface = contrast_ratio(tokens["text_color"], tokens["surface_color"])
        accent_vs_surface = contrast_ratio(tokens["primary_accent"], tokens["surface_color"])
        wcag_metrics = {
            "text_vs_surface_ratio": text_vs_surface,
            "primary_accent_vs_surface_ratio": accent_vs_surface,
            "wcag_aa_normal_text_passed": text_vs_surface >= 4.5,
            "wcag_aa_ui_component_passed": accent_vs_surface >= 3.0,
        }
        if text_vs_surface < 4.5:
            errors.append({
                "code": "WCAG_CONTRAST_FAILURE",
                "field": "visual_tokens.text_color",
                "message": f"Contraste insuficiente entre text_color e surface_color: {text_vs_surface}:1 (mínimo exigido WCAG AA: 4.5:1).",
            })
        if accent_vs_surface < 3.0:
            warnings.append({
                "code": "WCAG_ACCENT_WARNING",
                "field": "visual_tokens.primary_accent",
                "message": f"Contraste de primary_accent sobre surface_color é {accent_vs_surface}:1 (recomendado >= 3.0:1 para elementos gráficos e destaques).",
            })

    # 6. Validate Banner Spec
    banner = data.get("banner_spec", {})
    for lang_key in ("headline_pt", "headline_en"):
        b_text = banner.get(lang_key, "")
        if not b_text:
            errors.append({
                "code": "SCHEMA_MISMATCH",
                "field": f"banner_spec.{lang_key}",
                "message": f"Frase de posicionamento da capa ('{lang_key}') obrigatória.",
            })
        elif len(b_text) > 75:
            warnings.append({
                "code": "BANNER_TEXT_TOO_LONG",
                "field": f"banner_spec.{lang_key}",
                "message": f"Frase da capa ('{lang_key}') possui {len(b_text)} caracteres. Recomenda-se <= 65 chars para leitura imediata no mobile.",
            })

    confidence = max(0.0, round(1.0 - len(errors) * 0.25 - len(warnings) * 0.05, 2))
    return {
        "status": "passed" if len(errors) == 0 else "failed",
        "skill_id": "li-brand",
        "confidence_score": confidence,
        "wcag_audit": wcag_metrics,
        "validation_errors": errors,
        "warnings": warnings,
    }


def main():
    ap = argparse.ArgumentParser(description="Validate UX Personal Brand JSON specification.")
    ap.add_argument("input", help="Path to brand.json file")
    args = ap.parse_args()

    if not os.path.exists(args.input):
        print(json.dumps({
            "status": "failed",
            "skill_id": "li-brand",
            "confidence_score": 0.0,
            "validation_errors": [{"code": "FILE_NOT_FOUND", "message": f"Arquivo não encontrado: {args.input}"}],
        }, indent=2, ensure_ascii=False))
        sys.exit(1)

    with open(args.input, encoding="utf-8") as fh:
        data = json.load(fh)

    result = validate_brand(data)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    sys.exit(0 if result["status"] == "passed" else 1)


if __name__ == "__main__":
    main()
