#!/usr/bin/env python3
"""
Hard Gatekeeper & Token-Optimized Context Slicer (`career-context.py`) for LinkedIn UX Skills.
1. Checks if `career-strategy.json` exists in `.linkedin-workspace/`, `~/.claude/linkedin/`, or `open-ux-harness/memory/semantic/`.
2. If missing, returns `{"gate_status": "CAREER_GATE_LOCKED", "required_action": "STOP_AND_RUN_LI_CAREER_FIRST"}`.
3. If present, slices ONLY the ~120-token micro-context needed for `--skill <skill-id>`, saving ~90% of context tokens.
"""
import argparse
import json
import os
import sys

SEARCH_DIRS = [
    os.path.abspath(".linkedin-workspace"),
    os.path.expanduser("~/.claude/linkedin"),
    os.path.abspath("open-ux-harness/memory/semantic"),
    os.path.abspath(".harness/memory"),
]


def find_json(filename):
    for d in SEARCH_DIRS:
        p = os.path.join(d, filename)
        if os.path.isfile(p):
            try:
                with open(p, encoding="utf-8") as fh:
                    return json.load(fh), p
            except Exception:
                continue
    return None, None


def slice_for_skill(skill_id, career, brand, voice, profile):
    ps = career.get("profile_summary", {})
    radar = career.get("competency_radar", {})
    directives = career.get("agent_memory_directives", {})
    action = career.get("action_plan", {})

    base = {
        "gate_status": "UNLOCKED",
        "skill": skill_id,
        "target_level": ps.get("target_level"),
        "target_domain": ps.get("target_domain"),
        "target_geography": ps.get("target_geography"),
        "english_cefr": ps.get("english_cefr"),
    }

    if skill_id == "li-brand":
        base["top_strengths"] = radar.get("top_strengths", [])[:2]
        base["critical_gaps"] = radar.get("critical_gaps", [])[:2]
        base["directive"] = directives.get("li_brand_positioning_focus")
    elif skill_id == "li-voice":
        base["target_company_type"] = ps.get("target_company_type")
        base["voice_initialized"] = bool(voice)
    elif skill_id == "li-profile":
        base["target_companies"] = ps.get("target_companies", [])[:8]
        base["directive"] = directives.get("li_profile_seo_and_framing")
        base["cases_with_metrics"] = career.get("evidence_inventory", {}).get("cases_with_hard_metrics", [])[:3]
        if brand:
            base["uvp_pt"] = brand.get("positioning", {}).get("uvp_pt")
            base["uvp_en"] = brand.get("positioning", {}).get("uvp_en")
    elif skill_id in ("li-plan", "li-repurpose"):
        base["priority_themes"] = directives.get("li_plan_and_post_priority_themes", [])[:3]
        base["case_angles"] = directives.get("li_repurpose_case_angles", [])[:3]
        base["bridge_projects"] = [b.get("title") for b in action.get("bridge_projects", [])[:2]]
        if brand:
            base["pillars"] = [p.get("name") for p in brand.get("pillars", [])[:3]]
    elif skill_id in ("li-post", "li-carousel"):
        base["priority_themes"] = directives.get("li_plan_and_post_priority_themes", [])[:2]
        if brand:
            base["tokens"] = brand.get("visual_tokens", {})
        if voice:
            base["tone_rules"] = voice.get("core_rules", [])[:4]
    elif skill_id in ("li-comment", "li-reply", "li-dm", "li-inbox"):
        base["target_companies"] = ps.get("target_companies", [])[:6]
        base["target_personas"] = directives.get("li_comment_and_dm_target_personas", [])[:2]
        if voice:
            base["tone_rules"] = voice.get("core_rules", [])[:3]
    elif skill_id == "li-audit":
        base["readiness_score_pct"] = radar.get("readiness_score_pct")
        base["critical_gaps"] = radar.get("critical_gaps", [])[:2]

    return base


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description="Hard Gatekeeper & Context Slicer for LinkedIn UX Skills.")
    ap.add_argument("--skill", required=True, help="Target skill ID (e.g. li-post, li-profile)")
    args = ap.parse_args()

    career, career_path = find_json("career-strategy.json")
    if not career or "profile_summary" not in career:
        print(
            json.dumps(
                {
                    "gate_status": "CAREER_GATE_LOCKED",
                    "skill_requested": args.skill,
                    "required_action": "STOP_AND_RUN_LI_CAREER_FIRST",
                    "message": "Bloqueado: O diagnóstico estratégico li-career é o Passo 0 obrigatório antes de usar qualquer skill do LinkedIn.",
                },
                ensure_ascii=False,
            )
        )
        return

    brand, _ = find_json("brand.json")
    if not brand:
        brand, _ = find_json("brand-profile.json")
    voice, _ = find_json("voice-profile.json")
    profile, _ = find_json("profile-dossier.json")

    sliced = slice_for_skill(args.skill, career, brand, voice, profile)
    print(json.dumps(sliced, ensure_ascii=False))


if __name__ == "__main__":
    main()
