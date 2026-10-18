#!/usr/bin/env python3
"""Validate responsive search ad assets against Google Ads length limits.

Usage: python3 docs/google-ads/validate_assets.py [path/to/ads_assets.json]
Exits non-zero if any limit is violated.
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

BANNED_TERMS = [
    r"\bfree\b", r"24\s*/\s*7", r"\bno\.?\s*1\b", r"\bbest\b", r"\btrusted\b",
    r"\bcertified\b", r"\bguarantee", r"\blowest\b", r"\bcheapest\b",
    r"\bauthori[sz]ed\b", r"\bofficial\b", r"\bgoogle guaranteed\b",
    r"\b\d+\+?\s*(years|projects|clients)\b",
]


def main() -> int:
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).with_name("ads_assets.json")
    data = json.loads(path.read_text(encoding="utf-8"))
    limits = data["_meta"]["limits"]
    errors, warnings = [], []
    print(f"{'ad':<4} {'kind':<5} {'len':>3}/{'max':<3} text")

    for ad in data["ads"]:
        ad_id = ad["id"]
        for kind, key, cap in (("H", "headlines", limits["headline"]), ("D", "descriptions", limits["description"])):
            items = ad[key]
            for i, text in enumerate(items, 1):
                n = len(text)
                flag = "" if n <= cap else "  <-- TOO LONG"
                print(f"{ad_id:<4} {kind}{i:<4} {n:>3}/{cap:<3} {text}{flag}")
                if n > cap:
                    errors.append(f"{ad_id} {kind}{i} is {n} chars (max {cap}): {text!r}")
                if kind == "H" and "!" in text:
                    errors.append(f"{ad_id} {kind}{i} contains '!' (Editorial policy): {text!r}")
                if kind == "D" and text.count("!") > 1:
                    errors.append(f"{ad_id} {kind}{i} has more than one '!'")
                if text.isupper() and len(text) > 3:
                    errors.append(f"{ad_id} {kind}{i} is all caps: {text!r}")
                for pat in BANNED_TERMS:
                    if re.search(pat, text, re.I):
                        errors.append(f"{ad_id} {kind}{i} matches unverified-claim pattern {pat!r}: {text!r}")
            dupes = [t for t, c in Counter(x.lower() for x in items).items() if c > 1]
            if dupes:
                errors.append(f"{ad_id} duplicate {key}: {dupes}")

        if not limits["min_headlines"] <= len(ad["headlines"]) <= limits["max_headlines"]:
            errors.append(f"{ad_id} headline count {len(ad['headlines'])} outside {limits['min_headlines']}-{limits['max_headlines']}")
        if not limits["min_descriptions"] <= len(ad["descriptions"]) <= limits["max_descriptions"]:
            errors.append(f"{ad_id} description count {len(ad['descriptions'])} outside {limits['min_descriptions']}-{limits['max_descriptions']}")
        for p in ("path1", "path2"):
            if len(ad[p]) > limits["path"]:
                errors.append(f"{ad_id} {p} is {len(ad[p])} chars (max {limits['path']})")
        if not ad["final_url"].startswith("https://trulink.in/"):
            errors.append(f"{ad_id} final_url is not on trulink.in")
        if any(k in ad for k in ("pinned", "pins")):
            warnings.append(f"{ad_id} uses pinning; document the impact on combinations")

    by_group = {}
    for ad in data["ads"]:
        by_group.setdefault(ad["ad_group"], []).append(ad)
    for group, ads in by_group.items():
        seen = {}
        for ad in ads:
            for h in ad["headlines"]:
                seen.setdefault(h.lower(), []).append(ad["id"])
        shared = sorted(h for h, ids in seen.items() if len(ids) > 1)
        if shared:
            warnings.append(f"{group}: headlines reused across variations (fine for brand/CTA lines, review for overlap): {shared}")

    print()
    for w in warnings:
        print("WARN:", w)
    for e in errors:
        print("ERROR:", e)
    total_h = sum(len(a["headlines"]) for a in data["ads"])
    total_d = sum(len(a["descriptions"]) for a in data["ads"])
    print(f"\nChecked {len(data['ads'])} ads, {total_h} headlines, {total_d} descriptions: {len(errors)} errors, {len(warnings)} warnings")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
