"""
Brand V3 Automated Compliance & Accessibility Test Suite
Test Framework: pytest / Python 3.12

Enforces:
1. Zero occurrences of retired copper (#B84C32, --tc-copper, 'Worksite Cobalt + Copper')
2. Zero unauthorized purple, violet, lavender, or teal in styles and classes
3. Zero white text on Action Lime (#DDF16A) & mathematical WCAG contrast proof
4. Active import and structural integrity of design/tokens.css
5. Full WCAG 2.2 AA contrast matrix mathematical validation (qa/contrast_matrix.json)
6. Accessible secondary text rule (Steel Text #596B70 vs Steel Grey #66767A)
"""

import json
import math
import os
import re
from pathlib import Path
import pytest


def get_project_root() -> Path:
    """Find repository root by walking upward until design/tokens.css is found."""
    cur = Path(__file__).resolve().parent
    while cur != cur.parent:
        if (cur / "design" / "tokens.css").exists() and (cur / "qa" / "contrast_matrix.json").exists():
            return cur
        cur = cur.parent
    return Path(__file__).resolve().parent.parent.parent


ROOT = get_project_root()


def get_project_source_files():
    """Collect all source, styling, markup, and design files across the project."""
    extensions = {".ts", ".tsx", ".js", ".jsx", ".css", ".scss", ".html"}
    excluded_dirs = {"node_modules", ".next", ".git", ".agents", "dist", "out", "coverage"}
    target_dirs = ["src", "app", "components", "styles", "design", "prototype", "public"]

    files = []
    for d in target_dirs:
        dir_path = ROOT / d
        if not dir_path.exists():
            continue
        for root, dirs, filenames in os.walk(dir_path):
            dirs[:] = [d for d in dirs if d not in excluded_dirs]
            for f in filenames:
                if Path(f).suffix.lower() in extensions:
                    files.append(Path(root) / f)
    return files


def strip_comments(text: str) -> str:
    """Strip CSS/JS block and line comments to avoid false-positives on explanatory comments."""
    text = re.sub(r"/\*[\s\S]*?\*/", "", text)
    text = re.sub(r"(^|[^:])//[^\r\n]*", r"\1", text)
    return text


def srgb_to_linear(c: float) -> float:
    """Calculate sRGB linear luminance for a normalized channel value."""
    return c / 12.92 if c <= 0.04045 else math.pow((c + 0.055) / 1.055, 2.4)


def get_relative_luminance(hex_code: str) -> float:
    """Calculate WCAG 2.2 relative luminance for a given hex color string."""
    clean = hex_code.strip().lstrip("#")
    r = int(clean[0:2], 16) / 255.0
    g = int(clean[2:4], 16) / 255.0
    b = int(clean[4:6], 16) / 255.0
    return 0.2126 * srgb_to_linear(r) + 0.7152 * srgb_to_linear(g) + 0.0722 * srgb_to_linear(b)


def get_contrast_ratio(hex1: str, hex2: str) -> float:
    """Calculate WCAG 2.2 contrast ratio between two hex colors."""
    l1 = get_relative_luminance(hex1)
    l2 = get_relative_luminance(hex2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


class TestBrandCompliance:
    """Authoritative Brand V3 Compliance Verification."""

    def test_zero_retired_copper_hex(self):
        """Zero occurrences of retired hex #B84C32 in all source and stylesheet files."""
        files = get_project_source_files()
        violations = []
        for f in files:
            content = f.read_text(encoding="utf-8")
            for idx, line in enumerate(content.splitlines(), start=1):
                if "#B84C32" in line.upper():
                    violations.append(f"{f.relative_to(ROOT)}:{idx} -> {line.strip()}")
        assert not violations, f"Found retired copper hex #B84C32:\n" + "\n".join(violations)

    def test_zero_retired_copper_token(self):
        """Zero occurrences of --tc-copper in any CSS or component files."""
        files = get_project_source_files()
        violations = []
        for f in files:
            content = f.read_text(encoding="utf-8")
            for idx, line in enumerate(content.splitlines(), start=1):
                if "--tc-copper" in line:
                    violations.append(f"{f.relative_to(ROOT)}:{idx} -> {line.strip()}")
        assert not violations, f"Found retired --tc-copper token:\n" + "\n".join(violations)

    def test_zero_legacy_brand_string(self):
        """Zero occurrences of legacy 'Worksite Cobalt + Copper' in prototype or markup."""
        files = get_project_source_files()
        violations = []
        for f in files:
            content = f.read_text(encoding="utf-8")
            if "Worksite Cobalt + Copper" in content:
                violations.append(str(f.relative_to(ROOT)))
        assert not violations, f"Found legacy brand string in files:\n" + "\n".join(violations)

    def test_tokens_json_palette_purity(self):
        """tokens.json palette must not contain copper or #B84C32."""
        tokens_file = ROOT / "design" / "tokens.json"
        assert tokens_file.exists(), "design/tokens.json does not exist"
        data = json.loads(tokens_file.read_text(encoding="utf-8"))
        palette_str = json.dumps(data.get("palette", {}))
        assert "#B84C32" not in palette_str.upper()
        assert "copper" not in palette_str.lower()
        assert "Copper #B84C32" in data.get("prohibitions", [])

    def test_zero_unauthorized_purple_and_teal(self):
        """Zero unauthorized purple, violet, lavender, or teal in styles and classes."""
        files = get_project_source_files()
        violations = []
        prohibited_tailwind = re.compile(
            r"\b(?:text|bg|border|ring|fill|stroke|from|to|via)-(?:purple|violet|fuchsia|lavender|teal)(?:-[0-9]+)?\b",
            re.IGNORECASE,
        )
        prohibited_css = re.compile(r":\s*[^;]*(?:\b(?:purple|violet|lavender|teal)\b)", re.IGNORECASE)

        for f in files:
            raw_content = f.read_text(encoding="utf-8")
            clean_content = strip_comments(raw_content)
            for idx, line in enumerate(clean_content.splitlines(), start=1):
                if prohibited_tailwind.search(line) or prohibited_css.search(line):
                    violations.append(f"{f.relative_to(ROOT)}:{idx} -> {line.strip()}")
        assert not violations, f"Found unauthorized purple/teal usage:\n" + "\n".join(violations)

    def test_zero_white_text_on_action_lime(self):
        """Mathematical proof and source scan: White text on Action Lime is strictly prohibited."""
        contrast = get_contrast_ratio("#FFFFFF", "#DDF16A")
        assert round(contrast, 2) == 1.25
        assert contrast < 4.5, "White on Lime unexpectedly passed WCAG AA!"

        # Ink on Lime must pass
        ink_contrast = get_contrast_ratio("#182336", "#DDF16A")
        assert ink_contrast >= 4.5, "Ink on Lime failed WCAG AA!"

        # Scan for simultaneous pairing in code
        files = get_project_source_files()
        violations = []
        for f in files:
            content = strip_comments(f.read_text(encoding="utf-8"))
            for idx, line in enumerate(content.splitlines(), start=1):
                has_lime = bool(re.search(r"bg-action-lime|bg-\[#DDF16A\]|--tc-action-lime", line, re.I))
                has_white = bool(re.search(r"text-white|text-\[#fff(?:fff)?\]|color:\s*#fff(?:fff)?", line, re.I))
                if has_lime and has_white:
                    violations.append(f"{f.relative_to(ROOT)}:{idx} -> {line.strip()}")
        assert not violations, f"Found white text on Action Lime in:\n" + "\n".join(violations)

    def test_tokens_css_declarations(self):
        """Active existence and completeness of design/tokens.css with all 19 tokens."""
        css_file = ROOT / "design" / "tokens.css"
        assert css_file.exists(), "design/tokens.css not found"
        css = css_file.read_text(encoding="utf-8")

        required_tokens = [
            "--tc-ink",
            "--tc-primary",
            "--tc-primary-hover",
            "--tc-action-lime",
            "--tc-lime-hover",
            "--tc-canvas",
            "--tc-chalk",
            "--tc-surface",
            "--tc-surface-soft",
            "--tc-blue-light",
            "--tc-graphite",
            "--tc-text-secondary",
            "--tc-steel-grey-on-white-only",
            "--tc-border",
            "--tc-border-strong",
            "--tc-warning",
            "--tc-success",
            "--tc-error",
            "--tc-focus",
        ]
        for token in required_tokens:
            assert f"{token}:" in css, f"Missing required token {token} in tokens.css"

        assert "--font-heading: 'Manrope'" in css
        assert "--font-body: 'IBM Plex Sans'" in css

    def test_contrast_matrix_wcag_validation(self):
        """Validate all 19 entries of qa/contrast_matrix.json against WCAG 2.2 formula."""
        matrix_file = ROOT / "qa" / "contrast_matrix.json"
        assert matrix_file.exists(), "qa/contrast_matrix.json not found"
        items = json.loads(matrix_file.read_text(encoding="utf-8"))
        assert len(items) == 19

        for item in items:
            ratio = get_contrast_ratio(item["foreground"], item["background"])
            rounded = round(ratio, 2)
            assert abs(rounded - item["ratio"]) <= 0.05, f"Contrast mismatch for {item['use']}"

            if "do not use" in item["use"].lower():
                assert not item["pass_wcag"], f"Prohibited item {item['use']} marked passing"
                assert ratio < item["threshold"]
            else:
                assert item["pass_wcag"], f"Approved item {item['use']} marked failing"
                assert ratio >= item["threshold"]

    def test_secondary_text_rules(self):
        """Steel Text #596B70 passes on canvas and cloud; Steel Grey #66767A fails on canvas."""
        assert get_contrast_ratio("#66767A", "#F7F8F5") < 4.5
        assert get_contrast_ratio("#596B70", "#F7F8F5") >= 4.5
        assert get_contrast_ratio("#596B70", "#EAF0FF") >= 4.5
