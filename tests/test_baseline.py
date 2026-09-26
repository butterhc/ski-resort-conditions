import gzip
import json
from pathlib import Path
import pytest
from pipeline.generate_baseline import generate_baseline_dataset, TARGET_RESORTS

def test_generate_baseline_structure(tmp_path):
    output_path = tmp_path / "baseline.json"
    data = generate_baseline_dataset(output_path=output_path, season_year=2026)
    
    assert output_path.exists()
    assert "resorts" in data
    assert len(data["resorts"]) == 10
    assert data["season"] == "2026-2027"
    
    # Check all 10 target resorts exist
    resort_ids = [r["id"] for r in data["resorts"]]
    for target in TARGET_RESORTS:
        assert target["id"] in resort_ids

    # Verify timeline properties
    for resort in data["resorts"]:
        timeline = resort["timeline"]
        assert len(timeline) >= 220  # Oct 15 to Jun 1 (~230 days)
        for point in timeline:
            assert "date" in point
            assert 0 <= point["p10_open_pct"] <= point["median_open_pct"] <= point["p90_open_pct"] <= 100
            assert 0.0 <= point["glade_probability"] <= 1.0
            assert 0 <= point["snowmaking_pct"] <= 100
            assert 0 <= point["natural_pct"] <= 100
            assert point["snowmaking_pct"] + point["natural_pct"] == 100

        # Check iconic runs
        assert len(resort["iconic_runs"]) >= 2
        for run in resort["iconic_runs"]:
            assert "name" in run
            assert "median_open_date" in run
            assert "holiday_odds" in run
            odds = run["holiday_odds"]
            for holiday in ["christmas", "mlk_weekend", "presidents_day", "spring_break"]:
                assert holiday in odds
                assert 0.0 <= odds[holiday] <= 1.0

def test_baseline_json_payload_size(tmp_path):
    """Baseline JSON must remain under 300KB gzipped to meet the performance budget."""
    output_path = tmp_path / "baseline.json"
    generate_baseline_dataset(output_path=output_path, season_year=2026)
    
    raw_bytes = output_path.read_bytes()
    compressed = gzip.compress(raw_bytes)
    compressed_kb = len(compressed) / 1024
    
    assert compressed_kb < 300, (
        f"Baseline JSON is {compressed_kb:.1f}KB gzipped, exceeding the 300KB budget. "
        f"Consider reducing indent level or trimming precision."
    )
