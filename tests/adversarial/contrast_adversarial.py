"""
Independent contrast verification oracle.
Calculates WCAG 2.1 / 2.2 relative luminance and contrast ratio from first principles.
"""
import json
import math
from pathlib import Path

def srgb_to_linear(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else math.pow((c + 0.055) / 1.055, 2.4)

def relative_luminance(hex_color: str) -> float:
    clean = hex_color.strip().lstrip("#")
    r = int(clean[0:2], 16) / 255.0
    g = int(clean[2:4], 16) / 255.0
    b = int(clean[4:6], 16) / 255.0
    return 0.2126 * srgb_to_linear(r) + 0.7152 * srgb_to_linear(g) + 0.0722 * srgb_to_linear(b)

def contrast_ratio(hex1: str, hex2: str) -> float:
    l1 = relative_luminance(hex1)
    l2 = relative_luminance(hex2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

def main():
    matrix_path = Path(__file__).resolve().parent.parent.parent / "qa" / "contrast_matrix.json"
    items = json.loads(matrix_path.read_text(encoding="utf-8"))
    
    print(f"Verifying {len(items)} pairings from {matrix_path.name}:")
    print("-" * 80)
    
    failures = []
    for item in items:
        use = item["use"]
        fg = item["foreground"]
        bg = item["background"]
        recorded_ratio = item["ratio"]
        threshold = item["threshold"]
        pass_wcag = item["pass_wcag"]
        
        calculated_ratio = round(contrast_ratio(fg, bg), 2)
        diff = abs(calculated_ratio - recorded_ratio)
        
        status = "OK" if diff <= 0.05 else "MISMATCH"
        print(f"[{status}] {use:<34} fg={fg} bg={bg} rec={recorded_ratio:<5} calc={calculated_ratio:<5} diff={diff:.2f}")
        
        if diff > 0.05:
            failures.append(f"Ratio mismatch for '{use}': recorded {recorded_ratio}, calculated {calculated_ratio}")
            
        if "do not use" in use.lower():
            if pass_wcag is not False or calculated_ratio >= threshold:
                failures.append(f"Prohibited pair '{use}' should fail threshold {threshold}, got {calculated_ratio}")
        else:
            if pass_wcag is not True or calculated_ratio < threshold:
                failures.append(f"Approved pair '{use}' should pass threshold {threshold}, got {calculated_ratio}")
                
    print("-" * 80)
    if failures:
        print(f"FAILED with {len(failures)} errors:")
        for f in failures:
            print("  - " + f)
        exit(1)
    else:
        print("SUCCESS: All 19 pairings independently mathematically verified and match WCAG 2.2 specifications.")

if __name__ == "__main__":
    main()
