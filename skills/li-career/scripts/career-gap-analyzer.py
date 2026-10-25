#!/usr/bin/env python3
"""
Deterministic UX Career Gap & Competency Radar Analyzer for li-career.
Compares a designer's 8 competency dimensions against target level benchmarks
(pleno, senior, staff_principal, design_manager, head_director), evaluates
domain/company/geography transitions, and outputs structured gap analysis +
shared agent memory directives.
"""
import argparse
import json
import sys

BENCHMARKS = {
    "pleno": {
        "data_and_business_impact": 2.8,
        "craft_and_visual_execution": 3.5,
        "tooling_and_design_engineering": 3.5,
        "ai_augmented_ux_maturity": 3.0,
        "opportunity_discovery_and_framing": 2.8,
        "domain_and_product_repertoire": 3.0,
        "stakeholder_influence_and_leadership": 2.8,
        "global_readiness_and_english": 2.5,
    },
    "senior": {
        "data_and_business_impact": 4.0,
        "craft_and_visual_execution": 4.2,
        "tooling_and_design_engineering": 4.2,
        "ai_augmented_ux_maturity": 3.8,
        "opportunity_discovery_and_framing": 4.2,
        "domain_and_product_repertoire": 4.0,
        "stakeholder_influence_and_leadership": 4.0,
        "global_readiness_and_english": 3.5,
    },
    "staff_principal": {
        "data_and_business_impact": 4.6,
        "craft_and_visual_execution": 4.5,
        "tooling_and_design_engineering": 4.5,
        "ai_augmented_ux_maturity": 4.4,
        "opportunity_discovery_and_framing": 4.8,
        "domain_and_product_repertoire": 4.6,
        "stakeholder_influence_and_leadership": 4.8,
        "global_readiness_and_english": 4.2,
    },
    "design_manager": {
        "data_and_business_impact": 4.4,
        "craft_and_visual_execution": 3.8,
        "tooling_and_design_engineering": 3.6,
        "ai_augmented_ux_maturity": 4.0,
        "opportunity_discovery_and_framing": 4.5,
        "domain_and_product_repertoire": 4.2,
        "stakeholder_influence_and_leadership": 4.8,
        "global_readiness_and_english": 4.0,
    },
    "head_director": {
        "data_and_business_impact": 4.8,
        "craft_and_visual_execution": 4.0,
        "tooling_and_design_engineering": 3.6,
        "ai_augmented_ux_maturity": 4.4,
        "opportunity_discovery_and_framing": 4.8,
        "domain_and_product_repertoire": 4.6,
        "stakeholder_influence_and_leadership": 5.0,
        "global_readiness_and_english": 4.5,
    },
}

DIMENSION_LABELS = {
    "data_and_business_impact": "Maturidade de Dados & Impacto de Negócio (Funil, Retenção, NRR)",
    "craft_and_visual_execution": "Craft Visual, Interação & Repertório Artístico/Estético",
    "tooling_and_design_engineering": "Maturidade Ferramental, Figma Avançado, Design Systems & Código",
    "ai_augmented_ux_maturity": "Fluência em IA (Workflow de Discovery/Prototipação & AI-Native UX)",
    "opportunity_discovery_and_framing": "Levantamento de Oportunidades, Problem Framing & Recorte de Escopo",
    "domain_and_product_repertoire": "Repertório de Produto, Cultura & Domínio (B2B/B2C/SaaS)",
    "stakeholder_influence_and_leadership": "Influência, Defesa de Trade-offs & Liderança Transversal",
    "global_readiness_and_english": "Prontidão Internacional & Articulação Técnica em Inglês",
}

GAP_RECOMMENDATIONS = {
    "data_and_business_impact": {
        "action": "Reconstruir a linha de base (baseline -> pós-entrega) de 2 projetos usando métricas de funil, tempo de tarefa, redução de tickets de suporte ou adoção de feature.",
        "post_theme": "Bastidores de como uma métrica de funil ou comportamento real mudou uma decisão de interface.",
    },
    "craft_and_visual_execution": {
        "action": "Criar um ritual semanal de curadoria visual/artística (tipografia editorial, motion, direção de arte fora da bolha tech) e refinar micro-interações e estados limites dos 2 cases principais.",
        "post_theme": "Análise visual de alto craft mostrando escolhas tipográficas, hierarquia espacial e micro-interações que elevam a percepção de valor.",
    },
    "tooling_and_design_engineering": {
        "action": "Estruturar governança de variáveis/modos no Figma, tokens W3C DTCG e documentação de handoff zero-drift com critérios claros para engenharia.",
        "post_theme": "Demonstração técnica de arquitetura de componentes, tokens semânticos e redução de atrito no handoff com devs.",
    },
    "ai_augmented_ux_maturity": {
        "action": "Documentar um fluxo real onde IA acelerou síntese de pesquisa, exploração de cenários extremos ou prototipação funcional, incluindo estados probabilísticos/erros de IA.",
        "post_theme": "Como integrar IA no workflow de Product Design com julgamento crítico humano sem cair em telas genéricas.",
    },
    "opportunity_discovery_and_framing": {
        "action": "Reescrever a abertura dos cases destacando qual premissa de negócio foi desriscada antes de abrir o Figma e o que você decidiu NÃO construir para proteger o prazo.",
        "post_theme": "Estudo de caso focado em Problem Framing: o problema que o stakeholder pediu vs. o problema raiz que descobrimos.",
    },
    "domain_and_product_repertoire": {
        "action": "Executar 1 projeto-ponte (Teardown profundo + redesign focado em métricas) no domínio alvo (ex.: B2C Consumer ou Fintech Global) comparando padrões da indústria.",
        "post_theme": "Teardown comparativo de fluxos reais do setor alvo (B2B SaaS / B2C / Fintech) analisando fricção, conversão e arquitetura.",
    },
    "stakeholder_influence_and_leadership": {
        "action": "Mapear 3 episódios reais de negociação de escopo com PM/Engenharia usando matriz de esforço vs. impacto e conduzir design critiques estruturadas.",
        "post_theme": "Como alinhar PMs e Engenheiros céticos defendendo decisões de UX através de trade-offs de negócio e restrições técnicas.",
    },
    "global_readiness_and_english": {
        "action": "Ativar perfil secundário em inglês no LinkedIn, gravar walkthroughs em vídeo de 5 min explicando seus cases em inglês e publicar 1 post técnico por semana em EN.",
        "post_theme": "Publicação bilíngue (PT-BR + EN) analisando desafios de produto com vocabulário global de Product Design.",
    },
}


def analyze_career(payload):
    summary = payload.get("profile_summary", {})
    target_level = summary.get("target_level", "senior")
    target_geo = summary.get("target_geography", "br_local")
    current_domain = summary.get("current_domain", "b2b")
    target_domain = summary.get("target_domain", "b2b")
    current_comp = summary.get("current_company_type", "startup")
    target_comp = summary.get("target_company_type", "scaleup_unicorn")
    target_companies = summary.get("target_companies", [])

    benchmark = dict(BENCHMARKS.get(target_level, BENCHMARKS["senior"]))
    if target_geo == "global_remote_usd_eur":
        benchmark["global_readiness_and_english"] = max(
            benchmark["global_readiness_and_english"], 4.2
        )

    scores = payload.get("competency_radar", {}).get("scores", {})
    deltas = []
    total_ratio = 0.0

    for dim, req_score in benchmark.items():
        actual = float(scores.get(dim, 2.5))
        gap = round(req_score - actual, 2)
        ratio = min(1.0, actual / req_score) if req_score > 0 else 1.0
        total_ratio += ratio
        deltas.append(
            {
                "dimension": dim,
                "label": DIMENSION_LABELS.get(dim, dim),
                "current_score": actual,
                "target_benchmark": req_score,
                "gap": gap,
            }
        )

    readiness_pct = int(round((total_ratio / len(benchmark)) * 100))
    sorted_by_gap = sorted(deltas, key=lambda x: x["gap"], reverse=True)
    sorted_by_strength = sorted(deltas, key=lambda x: x["current_score"], reverse=True)

    top_strengths = [
        f"{d['label']} ({d['current_score']}/5.0)" for d in sorted_by_strength[:3]
    ]
    critical_gaps = [
        f"{d['label']} (Atual: {d['current_score']} -> Meta {target_level}: {d['target_benchmark']})"
        for d in sorted_by_gap[:3]
        if d["gap"] > 0
    ]

    bridge_projects = []
    priority_themes = []
    for d in sorted_by_gap[:3]:
        if d["gap"] > 0:
            rec = GAP_RECOMMENDATIONS[d["dimension"]]
            bridge_projects.append(
                {
                    "title": f"Bridge Project — {DIMENSION_LABELS[d['dimension']].split('(')[0].strip()}",
                    "gap_addressed": d["dimension"],
                    "deliverable_for_linkedin": rec["action"],
                }
            )
            priority_themes.append(rec["post_theme"])

    if current_domain != target_domain and target_domain in ("b2b", "b2c", "ai_native"):
        bridge_projects.append(
            {
                "title": f"Transição de Domínio ({current_domain.upper()} -> {target_domain.upper()})",
                "gap_addressed": "domain_and_product_repertoire",
                "deliverable_for_linkedin": (
                    f"Publicar 1 estudo aplicado / teardown resolvendo um gargalo real de produto {target_domain.upper()} "
                    f"(conectando sua bagagem de {current_domain.upper()} às métricas de {target_domain.upper()})."
                ),
            }
        )

    companies_str = (
        ", ".join(target_companies[:5])
        if target_companies
        else f"empresas do perfil {target_comp}"
    )

    directives = {
        "li_brand_positioning_focus": (
            f"Posicionar como {target_level.upper()} focado em {target_domain.upper()} ({target_comp}), "
            f"usando {sorted_by_strength[0]['dimension']} como diferencial imediato enquanto constrói autoridade em "
            f"{', '.join(d['dimension'] for d in sorted_by_gap[:2])}."
        ),
        "li_profile_seo_and_framing": (
            f"Otimizar Headline, Sobre e Experiências para a barra de {target_level.upper()} em {companies_str} "
            f"(geografia: {target_geo}), destacando decisões de escopo, métricas e impacto de negócio."
        ),
        "li_plan_and_post_priority_themes": priority_themes,
        "li_repurpose_case_angles": [
            "Enquadramento do problema (Problem Framing) e o que escolhemos NÃO construir",
            "Triangulação de dados quantitativos e pesquisa qualitativa antes e depois do deploy",
            "Decisões de arquitetura, craft visual e negociação de trade-offs com PM e Engenharia",
        ],
        "li_comment_and_dm_target_personas": [
            f"Design Managers, Staff Designers, PMs e Tech Recruiters em {companies_str}",
            f"Líderes de Produto e Design discutindo {target_domain.upper()} e maturidade de UX ({target_geo})",
        ],
    }

    return {
        "status": "analyzed",
        "target_level": target_level,
        "readiness_score_pct": readiness_pct,
        "dimension_breakdown": deltas,
        "top_strengths": top_strengths,
        "critical_gaps": critical_gaps,
        "recommended_bridge_projects": bridge_projects,
        "agent_memory_directives": directives,
    }


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(
        description="Analyze UX career maturity gaps and generate agent memory directives."
    )
    ap.add_argument("input", help="Path to career input or strategy JSON file")
    args = ap.parse_args()

    with open(args.input, encoding="utf-8") as fh:
        data = json.load(fh)

    result = analyze_career(data)
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
