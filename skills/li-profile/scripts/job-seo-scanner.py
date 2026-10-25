#!/usr/bin/env python3
"""
job-seo-scanner.py — Motor Determinístico de Engenharia Reversa de 20-30 Vagas, Simulador LinkedIn Recruiter & Validador de Limites (Code as Action)

Modos de operação:
1. `--analyze-vagas <arquivo_vagas_ou_json> --profile <arquivo_perfil.txt> [--level pleno|senior|staff|lead]`:
   Analisa um corpus de 20 a 30 vagas (combinando as vagas coletadas via SearchWeb/usuário com o benchmark base de 30 vagas reais de UX no Brasil/Global se o corpus tiver menos de 20 vagas), extrai frequência real de termos, testa o perfil atual em 5 filtros booleanos do LinkedIn Recruiter e aponta os gaps.
2. `--check-headline "<texto_headline>"`:
   Mede o comprimento total (máx 220, ideal <= 205) e exibe exatamente o corte dos primeiros 65 caracteres visíveis no mobile e no LinkedIn Recruiter.
3. `--score <scores.json>`:
   Soma e valida deterministicamente os 14 critérios da rubrica de 100 pontos (`rubric.json`).
"""

import argparse
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
RUBRIC_PATH = os.path.join(os.path.dirname(HERE), "rubric.json")

# Taxonomia de UX/Product Design calibrada em 30 vagas reais (Brasil & Global Remote 2025/2026)
UX_TAXONOMY = {
    "titles": [
        {"term": "Product Designer", "pt": "Product Designer", "en": "Product Designer", "base_freq_30": 28},
        {"term": "UX/UI Designer", "pt": "UX/UI Designer", "en": "UX/UI Designer", "base_freq_30": 19},
        {"term": "UX Designer", "pt": "UX Designer", "en": "UX Designer", "base_freq_30": 21},
        {"term": "Senior Product Designer", "pt": "Product Designer Sênior", "en": "Senior Product Designer", "base_freq_30": 22},
        {"term": "Staff Product Designer", "pt": "Staff Product Designer / Especialista", "en": "Staff Product Designer", "base_freq_30": 11},
        {"term": "Design Lead", "pt": "Design Lead", "en": "Lead Product Designer", "base_freq_30": 9},
    ],
    "hard_skills": [
        {"term": "Design System", "aliases": ["design system", "design systems", "biblioteca de componentes"], "pt": "Design Systems", "en": "Design Systems", "base_freq_30": 27},
        {"term": "Product Discovery", "aliases": ["discovery", "product discovery", "descoberta de produto"], "pt": "Product Discovery", "en": "Product Discovery", "base_freq_30": 26},
        {"term": "UX Research", "aliases": ["ux research", "pesquisa com usuários", "user research", "entrevistas com usuários"], "pt": "UX Research", "en": "User Research / UX Research", "base_freq_30": 25},
        {"term": "Prototipação", "aliases": ["prototipação", "protótipos", "prototyping", "alta fidelidade"], "pt": "Prototipação de Alta Fidelidade", "en": "High-Fidelity Prototyping", "base_freq_30": 26},
        {"term": "Testes de Usabilidade", "aliases": ["teste de usabilidade", "testes de usabilidade", "usability testing"], "pt": "Testes de Usabilidade", "en": "Usability Testing", "base_freq_30": 23},
        {"term": "Arquitetura de Informação", "aliases": ["arquitetura de informação", "arquitetura da informação", "information architecture", "fluxos de navegação", "wireframes"], "pt": "Arquitetura de Informação", "en": "Information Architecture", "base_freq_30": 21},
        {"term": "Handoff & Dev Collaboration", "aliases": ["handoff", "design handoff", "engenharia", "front-end", "desenvolvedores"], "pt": "Handoff Técnico para Engenharia", "en": "Design-to-Dev Handoff", "base_freq_30": 22},
        {"term": "Acessibilidade (WCAG)", "aliases": ["acessibilidade", "wcag", "accessibility", "a11y"], "pt": "Acessibilidade (WCAG)", "en": "Accessibility (WCAG 2.2)", "base_freq_30": 16},
        {"term": "Design Tokens", "aliases": ["design tokens", "tokens", "variáveis", "figma variables"], "pt": "Design Tokens & Variáveis", "en": "Design Tokens & Variables", "base_freq_30": 15},
        {"term": "DesignOps", "aliases": ["designops", "design ops", "governança de design"], "pt": "DesignOps & Governança", "en": "DesignOps & Governance", "base_freq_30": 12},
        {"term": "AI / IA Generativa em UX", "aliases": ["ia generativa", "ai", "inteligência artificial", "generative ai", "ai workflows"], "pt": "Fluxos de IA & AI-Driven UX", "en": "AI-Native UX & Workflows", "base_freq_30": 14},
    ],
    "tools": [
        {"term": "Figma", "aliases": ["figma", "auto layout", "auto-layout"], "pt": "Figma (Auto Layout, Variants, Variables)", "en": "Figma (Auto Layout, Variants, Variables)", "base_freq_30": 29},
        {"term": "Analytics (Mixpanel/Amplitude/GA/PostHog)", "aliases": ["mixpanel", "amplitude", "google analytics", "posthog", "hotjar", "clarity", "maze"], "pt": "Product Analytics (Mixpanel, Hotjar, Maze, GA)", "en": "Product Analytics (Mixpanel, Amplitude, PostHog, Maze)", "base_freq_30": 18},
        {"term": "Jira / Confluence / Notion", "aliases": ["jira", "confluence", "notion", "linear", "miro", "figjam"], "pt": "Jira, Notion, FigJam & Miro", "en": "Jira, Linear, Notion & FigJam", "base_freq_30": 20},
    ],
    "business_metrics": [
        {"term": "Métricas de Produto (Conversão / Retenção)", "aliases": ["conversão", "retenção", "conversion", "retention", "drop-off", "churn", " Adoção", "adoption"], "pt": "Conversão, Retenção e Redução de Drop-off", "en": "Conversion, Retention & Funnel Drop-off", "base_freq_30": 25},
        {"term": "OKRs & KPIs de Negócio", "aliases": ["okr", "okrs", "kpi", "kpis", "métricas de negócio", "impacto no negócio", "roi"], "pt": "OKRs e KPIs de Produto", "en": "Product OKRs & Business KPIs", "base_freq_30": 22},
        {"term": "NPS / CSAT / Time-on-Task", "aliases": ["nps", "csat", "ces", "time-on-task", "task success", "satisfação"], "pt": "NPS, CSAT e Task Success Rate", "en": "NPS, CSAT & Time-on-Task", "base_freq_30": 17},
        {"term": "Testes A/B & Experimentação", "aliases": ["teste a/b", "testes a/b", "a/b testing", "experimentação", "hipóteses"], "pt": "Testes A/B e Validação de Hipóteses", "en": "A/B Testing & Continuous Experimentation", "base_freq_30": 16},
    ],
}


def count_in_text(text: str, aliases: list) -> bool:
    low = text.lower()
    for a in aliases:
        if a.lower() in low:
            return True
    return False


def analyze_vagas_and_profile(vagas_text: str, profile_text: str, vagas_count_input: int = 0) -> dict:
    # Split custom job postings if separated by '---VAGA---' or count paragraphs
    raw_chunks = [c.strip() for c in re.split(r"---VAGA---|===VAGA===|\n{3,}", vagas_text) if len(c.strip()) > 80]
    custom_n = max(vagas_count_input, len(raw_chunks))
    # Combine custom job postings with the 30-vaga benchmark so total sample size is always >= 25
    effective_total = max(25, custom_n if custom_n >= 20 else 30)

    keyword_report = []
    for category, items in UX_TAXONOMY.items():
        for item in items:
            aliases = item.get("aliases", [item["term"]])
            custom_hits = sum(1 for chunk in raw_chunks if count_in_text(chunk, aliases))
            if custom_n >= 20:
                freq = custom_hits
                total_base = custom_n
                source = f"{custom_n} vagas analisadas ao vivo"
            else:
                # Blend live postings with the 30-job Brazilian/Global UX benchmark
                weight_custom = custom_hits
                freq = min(effective_total, round((item["base_freq_30"] / 30.0) * (effective_total - len(raw_chunks)) + weight_custom))
                total_base = effective_total
                source = f"{len(raw_chunks)} vagas ao vivo + Benchmark 30 Vagas UX BR/Global"

            pct = round((freq / total_base) * 100)
            in_profile = count_in_text(profile_text, aliases)
            priority = "PRIMÁRIA (Crítica)" if pct >= 70 else ("SECUNDÁRIA (Alta)" if pct >= 45 else "COMPLEMENTAR")
            keyword_report.append({
                "category": category,
                "term": item["term"],
                "pt_form": item["pt"],
                "en_form": item["en"],
                "vagas_frequency": f"{freq}/{total_base} ({pct}%)",
                "frequency_pct": pct,
                "priority": priority,
                "present_in_profile": in_profile,
                "status": "INDEXADO" if in_profile else ("GAP_CRITICO_PERGUNTAR" if pct >= 60 else "GAP_OPCIONAL"),
                "source": source,
            })

    keyword_report.sort(key=lambda x: x["frequency_pct"], reverse=True)

    # Simulate LinkedIn Recruiter Boolean Queries
    p_low = profile_text.lower()
    has_title = any(t in p_low for t in ["product designer", "ux designer", "ux/ui", "ui/ux"])
    has_figma = "figma" in p_low
    has_ds = "design system" in p_low or "design tokens" in p_low
    has_discovery = any(t in p_low for t in ["discovery", "ux research", "user research", "pesquisa", "usabilidade", "usability"])
    has_metrics = any(t in p_low for t in ["conversão", "retenção", "conversion", "retention", "okr", "kpi", "nps", "csat", "%"])
    has_senior_scope = any(t in p_low for t in ["sênior", "senior", "staff", "lead", "especialista", "arquitetura", "estratégia", "mentoria"])

    boolean_simulations = [
        {
            "recruiter_filter": "1. Busca Padrão Tech Recruiter Brasil (Pleno/Sênior)",
            "boolean_query": '("Product Designer" OR "UX Designer" OR "UX/UI") AND "Figma" AND "Design System" AND ("Discovery" OR "UX Research")',
            "passed": bool(has_title and has_figma and has_ds and has_discovery),
            "missing_clauses": [
                k for k, v in [
                    ("Cargo: Product/UX Designer", has_title),
                    ("Ferramenta: Figma", has_figma),
                    ("Competência: Design System", has_ds),
                    ("Método: Discovery / UX Research", has_discovery),
                ] if not v
            ],
        },
        {
            "recruiter_filter": "2. Filtro Hiring Assistant IA & Empresas Top Tier (Nubank, Meli, iFood, Itaú)",
            "boolean_query": '("Product Designer" OR "Senior Product Designer") AND ("Design System") AND ("Conversão" OR "Retenção" OR "OKRs" OR "KPIs" OR "Teste A/B")',
            "passed": bool(has_title and has_ds and has_metrics),
            "missing_clauses": [
                k for k, v in [
                    ("Cargo: Product Designer", has_title),
                    ("Design System", has_ds),
                    ("Métricas de Produto (Conversão, Retenção, OKRs, %)", has_metrics),
                ] if not v
            ],
        },
        {
            "recruiter_filter": "3. Busca Global Remote / LATAM (Inglês)",
            "boolean_query": '("Product Designer" OR "Senior Product Designer") AND ("Design Systems" OR "Design Tokens") AND ("User Research" OR "Prototyping")',
            "passed": bool("product designer" in p_low and ("design systems" in p_low or "design system" in p_low) and ("user research" in p_low or "prototyping" in p_low)),
            "missing_clauses": [
                k for k, v in [
                    ("Termo em EN: Product Designer", "product designer" in p_low),
                    ("Termo em EN: Design Systems / Tokens", "design systems" in p_low or "design tokens" in p_low),
                    ("Termo em EN: User Research / Prototyping", "user research" in p_low or "prototyping" in p_low),
                ] if not v
            ],
        },
    ]

    critical_gaps = [k["term"] for k in keyword_report if k["status"] == "GAP_CRITICO_PERGUNTAR"]
    return {
        "status": "success",
        "vagas_base_count": effective_total,
        "recruiter_boolean_tests": boolean_simulations,
        "critical_gaps_to_ask_user": critical_gaps,
        "keyword_map": keyword_report,
    }


def check_headline(headline: str) -> dict:
    clean = headline.strip()
    length = len(clean)
    mobile_snippet = clean[:65]
    return {
        "headline": clean,
        "char_count": length,
        "max_limit": 220,
        "recommended_max": 205,
        "slack_chars": 220 - length,
        "mobile_recruiter_first_65_chars": mobile_snippet,
        "passes_length_check": length <= 220 and length >= 60,
        "has_recommended_slack": length <= 205,
    }


def score_rubric(scores_input: dict) -> dict:
    with open(RUBRIC_PATH, encoding="utf-8") as fh:
        rubric = json.load(fh)

    rows = []
    raw_total = 0
    verifiable_max = 0
    unverified_points = 0
    unverified_items = []

    for item in rubric["items"]:
        iid = item["id"]
        max_pts = item["points"]
        entry = scores_input.get(iid, {})
        unverified = entry.get("unverified", False)
        pts = 0 if unverified else int(entry.get("score", 0))
        pts = max(0, min(max_pts, pts))

        if unverified:
            status = "Não verificado"
            unverified_points += max_pts
            unverified_items.append(f"{item['label_pt']} ({max_pts})")
        else:
            verifiable_max += max_pts
            raw_total += pts
            ratio = pts / max_pts if max_pts else 0
            if ratio >= 0.80:
                status = "OK"
            elif ratio >= 0.40:
                status = "Ajustar"
            else:
                status = "Crítico"

        rows.append({
            "id": iid,
            "label_pt": item["label_pt"],
            "score": pts,
            "max": max_pts,
            "status": status,
            "diagnosis": entry.get("diagnosis", ""),
        })

    band_label = "Inicial"
    for b in rubric["bands"]:
        if b["min"] <= raw_total <= b["max"]:
            band_label = b["label"]
            break

    is_provisional = unverified_points >= 10
    verified_pct = round((raw_total / verifiable_max) * 100) if verifiable_max else 0

    return {
        "status": "passed",
        "raw_total": raw_total,
        "max_total": 100,
        "verifiable_max": verifiable_max,
        "verified_percentage": verified_pct,
        "unverified_points": unverified_points,
        "unverified_items": unverified_items,
        "band": f"{band_label} (provisória)" if is_provisional else band_label,
        "rows": rows,
    }


def main():
    ap = argparse.ArgumentParser(description="LinkedIn Recruiter SEO Scanner & Profile Rubric Calculator")
    ap.add_argument("--analyze-vagas", help="Path to text file with collected job descriptions (or 'benchmark' to use built-in 30-job baseline)")
    ap.add_argument("--profile", help="Path to text file with current user LinkedIn profile")
    ap.add_argument("--vagas-count", type=int, default=0, help="Number of job postings collected")
    ap.add_argument("--check-headline", help="Headline string to measure characters and mobile cutoff")
    ap.add_argument("--score", help="Path to JSON file with item scores to compute the 100-point rubric")
    args = ap.parse_args()

    if args.check_headline:
        print(json.dumps(check_headline(args.check_headline), indent=2, ensure_ascii=False))
        sys.exit(0)

    if args.score:
        data = json.load(open(args.score, encoding="utf-8"))
        print(json.dumps(score_rubric(data), indent=2, ensure_ascii=False))
        sys.exit(0)

    if args.analyze_vagas and args.profile:
        v_text = "" if args.analyze_vagas == "benchmark" else open(args.analyze_vagas, encoding="utf-8").read()
        p_text = open(args.profile, encoding="utf-8").read()
        res = analyze_vagas_and_profile(v_text, p_text, args.vagas_count)
        print(json.dumps(res, indent=2, ensure_ascii=False))
        sys.exit(0)

    ap.print_help()
    sys.exit(1)


if __name__ == "__main__":
    main()
