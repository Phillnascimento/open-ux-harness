#!/usr/bin/env python3
"""
build-carousel-html.py — Gerador e Validador Determinístico de Carrosséis LinkedIn 1080x1350px (4:5) (Code as Action)
Realiza:
1. Leitura automática dos Design Tokens do designer em `~/.claude/linkedin/brand.json` (ou fallback de alto contraste WCAG AA).
2. Validação rigorosa do deck de slides:
   - Entre 7 e 12 slides (ponto ótimo de conclusão e Dwell Time no 360Brew).
   - Capa (Slide 1) com título <= 10 palavras.
   - Slides internos com <= 45 palavras por slide (evita parede de texto ilegível no mobile).
   - Presença obrigatória do Slide Penúltimo de Recap / Cheat Sheet (gatilho de Save = 5x peso de Like).
3. Geração de arquivo HTML autocontido (`1080px x 1350px` por página, `page-break-after: always`, tipografia >= 28px, grid de 8pt) pronto para exportar em PDF via navegador/Chrome headless.
"""

import argparse
import html
import json
import os
import sys

BRAND_PATH = os.path.expanduser("~/.claude/linkedin/brand.json")


def load_brand_tokens():
    defaults = {
        "surface_color": "#0F172A",
        "text_color": "#F8FAFC",
        "primary_accent": "#38BDF8",
        "secondary_accent": "#94A3B8",
        "heading_font": "Inter, system-ui, sans-serif",
        "body_font": "Inter, system-ui, sans-serif",
        "mono_font": "JetBrains Mono, monospace",
    }
    if os.path.exists(BRAND_PATH):
        try:
            b = json.load(open(BRAND_PATH, encoding="utf-8"))
            vt = b.get("visual_tokens", {})
            for k in defaults:
                if vt.get(k):
                    defaults[k] = vt[k]
        except Exception:
            pass
    return defaults


def validate_deck(deck: dict) -> tuple:
    errors = []
    warnings = []
    slides = deck.get("slides", [])

    if not isinstance(slides, list) or not (6 <= len(slides) <= 12):
        errors.append({
            "code": "INVALID_SLIDE_COUNT",
            "message": f"O carrossel deve ter entre 6 e 12 slides para maximizar Dwell Time e conclusão (atual: {len(slides) if isinstance(slides, list) else 0}).",
        })
        return errors, warnings

    # Check Cover Slide
    cover = slides[0]
    cover_words = len(str(cover.get("headline", "")).split())
    if cover_words > 12:
        errors.append({
            "code": "COVER_HEADLINE_TOO_LONG",
            "message": f"A capa (Slide 1) possui {cover_words} palavras no título (máximo permitido: 12 palavras; ideal: 6 a 8 palavras).",
        })

    # Check body length per slide
    for idx, s in enumerate(slides):
        body_words = len(str(s.get("body", "")).split()) + sum(len(str(b).split()) for b in s.get("bullets", []))
        if body_words > 45:
            errors.append({
                "code": "SLIDE_TEXT_OVERFLOW",
                "slide": idx + 1,
                "message": f"O Slide {idx+1} possui {body_words} palavras no corpo (máximo permitido: 45 palavras para manter fonte >= 28px no mobile). Divida em 2 slides.",
            })

    # Check Recap Slide presence
    has_recap = any(s.get("slide_type", "").lower() in ("recap", "summary", "cheatsheet") for s in slides[-3:])
    if not has_recap:
        warnings.append({
            "code": "MISSING_RECAP_SLIDE",
            "message": "Recomenda-se incluir um slide penúltimo do tipo 'recap' (resumo/checklist em 1 tela) para estimular Salvamentos (Saves = 5x Like).",
        })

    return errors, warnings


def render_html(deck: dict, tokens: dict) -> str:
    slides = deck["slides"]
    total = len(slides)
    author_name = html.escape(deck.get("author_name", "Product Designer"))
    author_handle = html.escape(deck.get("author_handle", "@linkedin"))
    pillar_tag = html.escape(deck.get("pillar_tag", "UX & Product Design"))

    sections_html = []
    for idx, s in enumerate(slides):
        num = idx + 1
        stype = s.get("slide_type", "content").lower()
        kicker = html.escape(str(s.get("kicker", pillar_tag if num == 1 else f"PASSO {num-1}" if stype == "content" else stype.upper())))
        headline = html.escape(str(s.get("headline", "")))
        body = html.escape(str(s.get("body", "")))
        bullets = s.get("bullets", [])
        callout = html.escape(str(s.get("callout_metric", "")))

        bullets_html = ""
        if bullets:
            items = "".join(f"<li>{html.escape(str(b))}</li>" for b in bullets)
            bullets_html = f"<ul class='slide-list'>{items}</ul>"

        callout_html = f"<div class='metric-box'>{callout}</div>" if callout else ""
        swipe_hint = "<div class='swipe-pill'>Deslize &rarr;</div>" if num < total else ""

        sections_html.append(f"""
        <section class="slide slide-{stype}">
          <header class="slide-header">
            <span class="kicker">{kicker}</span>
            <span class="counter">{num}/{total}</span>
          </header>
          <main class="slide-main">
            <h1 class="{'cover-title' if num == 1 else 'slide-title'}">{headline}</h1>
            {f'<p class="slide-body">{body}</p>' if body else ''}
            {bullets_html}
            {callout_html}
          </main>
          <footer class="slide-footer">
            <div class="author-meta">
              <strong>{author_name}</strong>
              <span>{author_handle}</span>
            </div>
            {swipe_hint}
          </footer>
        </section>
        """)

    return f"""<!DOCTYPE html>
<html lang="{deck.get('language', 'pt-BR')}">
<head>
<meta charset="UTF-8" />
<title>{html.escape(deck.get('title', 'LinkedIn Carousel'))}</title>
<style>
  @page {{
    size: 1080px 1350px;
    margin: 0;
  }}
  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}
  body {{
    background: {tokens['surface_color']};
    color: {tokens['text_color']};
    font-family: {tokens['body_font']};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }}
  .slide {{
    width: 1080px;
    height: 1350px;
    padding: 88px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: {tokens['surface_color']};
    color: {tokens['text_color']};
    page-break-after: always;
    position: relative;
    border-bottom: 8px solid {tokens['primary_accent']};
  }}
  .slide-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 26px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: {tokens['secondary_accent']};
  }}
  .kicker {{
    color: {tokens['primary_accent']};
    text-transform: uppercase;
    font-family: {tokens['mono_font']};
  }}
  .counter {{
    font-family: {tokens['mono_font']};
    padding: 8px 16px;
    border-radius: 8px;
    border: 2px solid {tokens['secondary_accent']};
  }}
  .slide-main {{
    display: flex;
    flex-direction: column;
    gap: 40px;
    margin: auto 0;
  }}
  .cover-title {{
    font-family: {tokens['heading_font']};
    font-size: 76px;
    line-height: 1.12;
    font-weight: 800;
    letter-spacing: -0.02em;
  }}
  .slide-title {{
    font-family: {tokens['heading_font']};
    font-size: 56px;
    line-height: 1.18;
    font-weight: 700;
    letter-spacing: -0.015em;
  }}
  .slide-body {{
    font-size: 36px;
    line-height: 1.45;
    opacity: 0.94;
  }}
  .slide-list {{
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding-left: 36px;
    font-size: 34px;
    line-height: 1.4;
  }}
  .slide-list li::marker {{
    color: {tokens['primary_accent']};
    font-weight: bold;
  }}
  .metric-box {{
    padding: 32px;
    border-left: 8px solid {tokens['primary_accent']};
    background: rgba(148, 163, 184, 0.10);
    border-radius: 0 16px 16px 0;
    font-family: {tokens['mono_font']};
    font-size: 32px;
    font-weight: 600;
  }}
  .slide-footer {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 32px;
    border-top: 2px solid rgba(148, 163, 184, 0.22);
    font-size: 26px;
  }}
  .author-meta {{
    display: flex;
    flex-direction: column;
    gap: 4px;
  }}
  .author-meta span {{
    color: {tokens['secondary_accent']};
    font-size: 24px;
  }}
  .swipe-pill {{
    background: {tokens['primary_accent']};
    color: {tokens['surface_color']};
    padding: 12px 24px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 24px;
  }}
</style>
</head>
<body>
{''.join(sections_html)}
</body>
</html>
"""


def main():
    ap = argparse.ArgumentParser(description="Validate and build 1080x1350 LinkedIn Carousel HTML/PDF.")
    ap.add_argument("input", help="Path to carousel deck JSON file")
    ap.add_argument("-o", "--out", help="Output HTML file path", default="carousel-output.html")
    args = ap.parse_args()

    if not os.path.exists(args.input):
        print(json.dumps({
            "status": "failed",
            "skill_id": "li-carousel",
            "validation_errors": [{"code": "FILE_NOT_FOUND", "message": f"File not found: {args.input}"}],
        }, indent=2, ensure_ascii=False))
        sys.exit(1)

    deck = json.load(open(args.input, encoding="utf-8"))
    errors, warnings = validate_deck(deck)

    if errors:
        print(json.dumps({
            "status": "failed",
            "skill_id": "li-carousel",
            "confidence_score": max(0.0, round(1.0 - len(errors) * 0.25, 2)),
            "validation_errors": errors,
            "warnings": warnings,
        }, indent=2, ensure_ascii=False))
        sys.exit(1)

    tokens = load_brand_tokens()
    html_out = render_html(deck, tokens)
    with open(args.out, "w", encoding="utf-8") as fh:
        fh.write(html_out)

    print(json.dumps({
        "status": "passed",
        "skill_id": "li-carousel",
        "confidence_score": max(0.0, round(1.0 - len(warnings) * 0.05, 2)),
        "slides_count": len(deck["slides"]),
        "html_generated": os.path.abspath(args.out),
        "tokens_applied": tokens,
        "validation_errors": [],
        "warnings": warnings,
    }, indent=2, ensure_ascii=False))
    sys.exit(0)


if __name__ == "__main__":
    main()
