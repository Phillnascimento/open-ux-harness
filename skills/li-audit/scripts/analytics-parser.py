#!/usr/bin/env python3
"""
analytics-parser.py — Motor Determinístico de Auditoria de Conteúdo e Conversão de Perfil (Code as Action)
Lê arquivos JSON ou CSV de performance de posts do LinkedIn e calcula:
1. Engagement Rate Tradicional: (reactions + comments + reposts) / impressions
2. 360Brew Weighted Authority Score: (reactions*1 + comments*4 + reposts*5 + saves*5 + profile_clicks*4) / impressions
3. Comment-to-Reaction Ratio: comments / max(reactions, 1)
4. Reach Multiple: impressions / max(followers, 1)
5. Ranking Top 5 vs Bottom 5 e diagnóstico estatístico por formato e hook.
"""

import argparse
import csv
import json
import os
import statistics
import sys


def compute_post_metrics(posts: list, followers: int = 1000) -> dict:
    if not posts:
        return {
            "status": "failed",
            "validation_errors": [{"code": "EMPTY_DATASET", "message": "Nenhum post fornecido para auditoria."}],
        }

    enriched = []
    for idx, p in enumerate(posts):
        imp = max(int(p.get("impressions", 1)), 1)
        react = int(p.get("reactions", 0))
        comm = int(p.get("comments", 0))
        rep = int(p.get("reposts", 0))
        saves = int(p.get("saves", 0))
        p_clicks = int(p.get("profile_clicks", 0))

        std_er = round(((react + comm + rep) / imp) * 100, 2)
        weighted_pts = (react * 1) + (comm * 4) + (rep * 5) + (saves * 5) + (p_clicks * 4)
        brew_score = round((weighted_pts / imp) * 100, 2)
        comm_ratio = round(comm / max(react, 1), 2)
        reach_mult = round(imp / max(followers, 1), 2)

        enriched.append({
            "id": p.get("id", f"post-{idx+1}"),
            "date": p.get("date", ""),
            "hook_id": p.get("hook_id", "unknown"),
            "format": p.get("format", "text"),
            "pillar": p.get("pillar", "general"),
            "language": p.get("language", "pt-BR"),
            "title_or_hook": p.get("title_or_hook", "")[:80],
            "impressions": imp,
            "reactions": react,
            "comments": comm,
            "reposts": rep,
            "saves": saves,
            "profile_clicks": p_clicks,
            "engagement_rate_pct": std_er,
            "brew_weighted_score": brew_score,
            "comment_to_reaction_ratio": comm_ratio,
            "reach_multiple": reach_mult,
        })

    ranked = sorted(enriched, key=lambda x: x["brew_weighted_score"], reverse=True)
    top_5 = ranked[:5]
    bottom_5 = list(reversed(ranked[-5:])) if len(ranked) >= 5 else list(reversed(ranked))

    # Group by format
    by_format = {}
    for item in enriched:
        fmt = item["format"]
        by_format.setdefault(fmt, []).append(item["brew_weighted_score"])
    format_summary = {
        k: {
            "count": len(v),
            "mean_brew_score": round(statistics.mean(v), 2),
        }
        for k, v in by_format.items()
    }

    return {
        "status": "passed",
        "skill_id": "li-audit",
        "post_count": len(enriched),
        "sample_confidence": "high" if len(enriched) >= 15 else ("medium" if len(enriched) >= 6 else "low_preliminary"),
        "overall_mean_er_pct": round(statistics.mean(x["engagement_rate_pct"] for x in enriched), 2),
        "overall_mean_brew_score": round(statistics.mean(x["brew_weighted_score"] for x in enriched), 2),
        "format_breakdown": format_summary,
        "top_5_by_360brew": top_5,
        "bottom_5_by_360brew": bottom_5,
        "validation_errors": [],
    }


def load_csv(path: str) -> list:
    rows = []
    with open(path, encoding="utf-8-sig") as fh:
        reader = csv.DictReader(fh)
        for r in reader:
            rows.append({
                "date": r.get("Date") or r.get("Data") or "",
                "title_or_hook": r.get("Post") or r.get("Título") or r.get("Hook") or "",
                "format": r.get("Format") or r.get("Formato") or "text",
                "impressions": int(str(r.get("Impressions") or r.get("Impressões") or "1").replace(",", "").replace(".", "")),
                "reactions": int(str(r.get("Reactions") or r.get("Reações") or "0").replace(",", "").replace(".", "")),
                "comments": int(str(r.get("Comments") or r.get("Comentários") or "0").replace(",", "").replace(".", "")),
                "reposts": int(str(r.get("Reposts") or r.get("Compartilhamentos") or "0").replace(",", "").replace(".", "")),
                "saves": int(str(r.get("Saves") or r.get("Salvamentos") or "0").replace(",", "").replace(".", "")),
                "profile_clicks": int(str(r.get("Profile clicks") or r.get("Cliques no perfil") or "0").replace(",", "").replace(".", "")),
            })
    return rows


def main():
    ap = argparse.ArgumentParser(description="Deterministic LinkedIn Content & 360Brew Analytics Auditor")
    ap.add_argument("input", help="Path to JSON or CSV file with post metrics")
    ap.add_argument("--followers", type=int, default=1000, help="Follower count for Reach Multiple")
    args = ap.parse_args()

    if not os.path.exists(args.input):
        print(json.dumps({
            "status": "failed",
            "skill_id": "li-audit",
            "validation_errors": [{"code": "FILE_NOT_FOUND", "message": f"File not found: {args.input}"}],
        }, indent=2, ensure_ascii=False))
        sys.exit(1)

    if args.input.lower().endswith(".csv"):
        posts = load_csv(args.input)
    else:
        raw = json.load(open(args.input, encoding="utf-8"))
        posts = raw if isinstance(raw, list) else raw.get("posts", [])
        if isinstance(raw, dict) and "followers" in raw:
            args.followers = int(raw["followers"])

    result = compute_post_metrics(posts, args.followers)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    sys.exit(0 if result["status"] == "passed" else 1)


if __name__ == "__main__":
    main()
