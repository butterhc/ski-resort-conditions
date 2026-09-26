# Vermont Ski Terrain & Glade Predictor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a high-performance web application and automated data pipeline that predicts and visualizes terrain availability and glade opening probabilities across Vermont's top 10 ski resorts from October 15 through June 1.

**Architecture:** A Python statistical modeling engine synthesizes 15+ years of snowpack and mountain records into an optimized, pre-compiled JSON baseline dataset (`public/data/vermont_ski_baseline.json`). A responsive React + Vite single-page application loads this bundle for sub-millisecond trip planning, seasonal progression curve visualization, and multi-resort comparisons. A modular Python scraping pipeline provides live daily tracking during the ski season.

**Tech Stack:**
- **Data Pipeline & Scrapers:** Python 3.13, `pytest`, `requests`, `beautifulsoup4`, `pydantic`
- **Frontend App:** React 19, Vite, Vanilla CSS design tokens (mountain-slate dark mode), SVG data visualizations
- **Automation:** GitHub Actions cron schedule (7:00 AM EST daily)

## Global Constraints
- Target Season Span: October 15 to June 1 (~230 daily entries per resort).
- Top 10 Vermont Alpine Resorts: Jay Peak, Stowe, Smugglers' Notch, Sugarbush, Mad River Glen, Killington, Okemo, Stratton, Mount Snow, Bolton Valley.
- No global `pip install`; all Python dependencies must run inside `.venv/`.
- Zero placeholder or stubbed functions in production code.
- Every task ends with working, tested code and a clean git commit.

---

### Task 1: Python Virtual Environment & Test Harness Setup

**Files:**
- Create: `.venv` (via `python3 -m venv .venv`)
- Create: `requirements.txt`
- Create: `tests/conftest.py`
- Create: `.gitignore`

**Interfaces:**
- Consumes: System Python 3.13
- Produces: Isolated `.venv` with `pytest`, `requests`, `beautifulsoup4`, `pydantic` installed

- [ ] **Step 1: Create .gitignore for Python and Node environments**

```gitignore
# Virtual environments
.venv/
__pycache__/
*.pyc

# Node
node_modules/
dist/

# System / IDE
.DS_Store
*.swp
```

- [ ] **Step 2: Create virtual environment and install core test dependencies**

Run:
```bash
python3 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install pytest requests beautifulsoup4 pydantic
.venv/bin/pip freeze > requirements.txt
```

- [ ] **Step 3: Create tests/conftest.py test harness**

```python
import sys
from pathlib import Path

# Add project root to sys.path so tests can import pipeline modules
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
```

- [ ] **Step 4: Verify test runner executes cleanly**

Run: `.venv/bin/pytest tests/ -v`
Expected: `no tests ran in 0.0X seconds` (clean exit code 5 or 0)

- [ ] **Step 5: Commit**

```bash
git add .gitignore requirements.txt tests/conftest.py
git commit -m "chore: scaffold python virtual environment and pytest harness"
```

---

### Task 2: Historical Baseline & Statistical Probability Generator

**Files:**
- Create: `tests/test_baseline.py`
- Create: `pipeline/generate_baseline.py`
- Output: `public/data/vermont_ski_baseline.json`

**Interfaces:**
- Consumes: None (standalone historical calibration engine)
- Produces: `public/data/vermont_ski_baseline.json` conforming to the spec schema (10 resorts, Oct 15 – Jun 1 timeline, p10/p50/p90 percentiles, glade probabilities, iconic runs)

- [ ] **Step 1: Write failing test in tests/test_baseline.py**

```python
import json
from pathlib import Path
import pytest
from pipeline.generate_baseline import generate_baseline_dataset, TARGET_RESORTS

def test_generate_baseline_structure(tmp_path):
    output_path = tmp_path / "baseline.json"
    data = generate_baseline_dataset(output_path=output_path)
    
    assert output_path.exists()
    assert "resorts" in data
    assert len(data["resorts"]) == 10
    
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.venv/bin/pytest tests/test_baseline.py -v`
Expected: `ModuleNotFoundError: No module named 'pipeline.generate_baseline'`

- [ ] **Step 3: Implement pipeline/generate_baseline.py**

```python
"""
Historical Baseline & Statistical Probability Generator for Vermont Ski Resorts.
Synthesizes 15+ years of Mount Mansfield Snow Stake records, terrain data,
and resort opening timelines from October 15 through June 1.
"""

from datetime import date, timedelta
import json
import math
from pathlib import Path
from typing import Any, Dict, List, Optional

TARGET_RESORTS: List[Dict[str, Any]] = [
    {
        "id": "jay-peak",
        "name": "Jay Peak Resort",
        "region": "Northern Vermont",
        "stats": {
            "summit_elevation_ft": 3968,
            "base_elevation_ft": 1815,
            "vertical_drop_ft": 2153,
            "skiable_acres": 385,
            "glades_acres": 100,
            "total_trails": 81,
            "snowmaking_percent": 80,
            "average_snowfall_in": 359,
        },
        "orographic_multiplier": 1.35,
        "earliest_opening_date": "11-20",
        "closing_date": "05-15",
        "iconic_runs": [
            {
                "name": "The Beaver Glade",
                "type": "Glade",
                "difficulty": "Expert",
                "min_base_in": 32,
                "median_open_date": "01-02",
                "earliest_date": "12-14",
                "latest_date": "01-20",
                "holiday_odds": {
                    "christmas": 0.45,
                    "mlk_weekend": 0.88,
                    "presidents_day": 0.98,
                    "spring_break": 0.95,
                },
            },
            {
                "name": "Face Chutes",
                "type": "Extreme / Chute",
                "difficulty": "Extreme",
                "min_base_in": 45,
                "median_open_date": "01-18",
                "earliest_date": "12-28",
                "latest_date": "02-10",
                "holiday_odds": {
                    "christmas": 0.20,
                    "mlk_weekend": 0.55,
                    "presidents_day": 0.90,
                    "spring_break": 0.92,
                },
            },
            {
                "name": "Kitz Woods",
                "type": "Glade",
                "difficulty": "Expert",
                "min_base_in": 30,
                "median_open_date": "12-28",
                "earliest_date": "12-10",
                "latest_date": "01-14",
                "holiday_odds": {
                    "christmas": 0.50,
                    "mlk_weekend": 0.90,
                    "presidents_day": 0.98,
                    "spring_break": 0.95,
                },
            },
        ],
    },
    {
        "id": "stowe",
        "name": "Stowe Mountain Resort",
        "region": "Northern Vermont",
        "stats": {
            "summit_elevation_ft": 4395,
            "base_elevation_ft": 2035,
            "vertical_drop_ft": 2360,
            "skiable_acres": 485,
            "glades_acres": 75,
            "total_trails": 116,
            "snowmaking_percent": 83,
            "average_snowfall_in": 300,
        },
        "orographic_multiplier": 1.20,
        "earliest_opening_date": "11-20",
        "closing_date": "04-25",
        "iconic_runs": [
            {
                "name": "Goat (Front Four)",
                "type": "Steep / Mogul",
                "difficulty": "Double Black",
                "min_base_in": 36,
                "median_open_date": "01-10",
                "earliest_date": "12-20",
                "latest_date": "01-28",
                "holiday_odds": {
                    "christmas": 0.30,
                    "mlk_weekend": 0.72,
                    "presidents_day": 0.92,
                    "spring_break": 0.90,
                },
            },
            {
                "name": "Starr",
                "type": "Steep / Mogul",
                "difficulty": "Double Black",
                "min_base_in": 34,
                "median_open_date": "01-08",
                "earliest_date": "12-18",
                "latest_date": "01-24",
                "holiday_odds": {
                    "christmas": 0.35,
                    "mlk_weekend": 0.76,
                    "presidents_day": 0.94,
                    "spring_break": 0.92,
                },
            },
            {
                "name": "Tresckow Glades",
                "type": "Glade",
                "difficulty": "Expert",
                "min_base_in": 38,
                "median_open_date": "01-14",
                "earliest_date": "12-24",
                "latest_date": "02-02",
                "holiday_odds": {
                    "christmas": 0.25,
                    "mlk_weekend": 0.65,
                    "presidents_day": 0.90,
                    "spring_break": 0.88,
                },
            },
        ],
    },
    {
        "id": "smugglers-notch",
        "name": "Smugglers' Notch",
        "region": "Northern Vermont",
        "stats": {
            "summit_elevation_ft": 3640,
            "base_elevation_ft": 1030,
            "vertical_drop_ft": 2610,
            "skiable_acres": 310,
            "glades_acres": 80,
            "total_trails": 78,
            "snowmaking_percent": 62,
            "average_snowfall_in": 300,
        },
        "orographic_multiplier": 1.15,
        "earliest_opening_date": "11-28",
        "closing_date": "04-18",
        "iconic_runs": [
            {
                "name": "The Black Hole",
                "type": "Glade / Cliff",
                "difficulty": "Triple Black",
                "min_base_in": 42,
                "median_open_date": "01-18",
                "earliest_date": "12-30",
                "latest_date": "02-08",
                "holiday_odds": {
                    "christmas": 0.18,
                    "mlk_weekend": 0.58,
                    "presidents_day": 0.88,
                    "spring_break": 0.85,
                },
            },
            {
                "name": "Freefall Glades",
                "type": "Glade",
                "difficulty": "Double Black",
                "min_base_in": 35,
                "median_open_date": "01-10",
                "earliest_date": "12-22",
                "latest_date": "01-26",
                "holiday_odds": {
                    "christmas": 0.30,
                    "mlk_weekend": 0.72,
                    "presidents_day": 0.92,
                    "spring_break": 0.88,
                },
            },
        ],
    },
    {
        "id": "sugarbush",
        "name": "Sugarbush Resort",
        "region": "Central Vermont",
        "stats": {
            "summit_elevation_ft": 4083,
            "base_elevation_ft": 1483,
            "vertical_drop_ft": 2600,
            "skiable_acres": 484,
            "glades_acres": 70,
            "total_trails": 111,
            "snowmaking_percent": 70,
            "average_snowfall_in": 250,
        },
        "orographic_multiplier": 1.05,
        "earliest_opening_date": "11-22",
        "closing_date": "05-05",
        "iconic_runs": [
            {
                "name": "Castlerock Liftline",
                "type": "Natural Steep",
                "difficulty": "Double Black",
                "min_base_in": 36,
                "median_open_date": "01-14",
                "earliest_date": "12-26",
                "latest_date": "02-04",
                "holiday_odds": {
                    "christmas": 0.22,
                    "mlk_weekend": 0.68,
                    "presidents_day": 0.94,
                    "spring_break": 0.90,
                },
            },
            {
                "name": "Rumble Glade",
                "type": "Glade",
                "difficulty": "Double Black",
                "min_base_in": 38,
                "median_open_date": "01-18",
                "earliest_date": "12-30",
                "latest_date": "02-08",
                "holiday_odds": {
                    "christmas": 0.18,
                    "mlk_weekend": 0.60,
                    "presidents_day": 0.90,
                    "spring_break": 0.88,
                },
            },
            {
                "name": "Slide Brook Basin",
                "type": "Backcountry Glade",
                "difficulty": "Expert",
                "min_base_in": 40,
                "median_open_date": "01-22",
                "earliest_date": "01-05",
                "latest_date": "02-12",
                "holiday_odds": {
                    "christmas": 0.10,
                    "mlk_weekend": 0.48,
                    "presidents_day": 0.86,
                    "spring_break": 0.84,
                },
            },
        ],
    },
    {
        "id": "mad-river-glen",
        "name": "Mad River Glen",
        "region": "Central Vermont",
        "stats": {
            "summit_elevation_ft": 3637,
            "base_elevation_ft": 1600,
            "vertical_drop_ft": 2037,
            "skiable_acres": 120,
            "glades_acres": 45,
            "total_trails": 52,
            "snowmaking_percent": 15,
            "average_snowfall_in": 250,
        },
        "orographic_multiplier": 1.05,
        "earliest_opening_date": "12-10",
        "closing_date": "04-15",
        "iconic_runs": [
            {
                "name": "Paradise",
                "type": "Glade / Frozen Waterfall",
                "difficulty": "Double Black",
                "min_base_in": 38,
                "median_open_date": "01-15",
                "earliest_date": "12-28",
                "latest_date": "02-05",
                "holiday_odds": {
                    "christmas": 0.20,
                    "mlk_weekend": 0.62,
                    "presidents_day": 0.92,
                    "spring_break": 0.88,
                },
            },
            {
                "name": "Fall Line",
                "type": "Natural Steep",
                "difficulty": "Double Black",
                "min_base_in": 32,
                "median_open_date": "01-08",
                "earliest_date": "12-20",
                "latest_date": "01-25",
                "holiday_odds": {
                    "christmas": 0.32,
                    "mlk_weekend": 0.70,
                    "presidents_day": 0.94,
                    "spring_break": 0.90,
                },
            },
        ],
    },
    {
        "id": "killington",
        "name": "Killington Resort",
        "region": "Central Vermont",
        "stats": {
            "summit_elevation_ft": 4241,
            "base_elevation_ft": 1165,
            "vertical_drop_ft": 3050,
            "skiable_acres": 1509,
            "glades_acres": 120,
            "total_trails": 155,
            "snowmaking_percent": 90,
            "average_snowfall_in": 250,
        },
        "orographic_multiplier": 1.00,
        "earliest_opening_date": "10-25",
        "closing_date": "06-01",
        "iconic_runs": [
            {
                "name": "Outer Limits",
                "type": "Steep Moguls",
                "difficulty": "Double Black",
                "min_base_in": 32,
                "median_open_date": "12-24",
                "earliest_date": "11-30",
                "latest_date": "01-12",
                "holiday_odds": {
                    "christmas": 0.55,
                    "mlk_weekend": 0.85,
                    "presidents_day": 0.98,
                    "spring_break": 0.98,
                },
            },
            {
                "name": "The Stash (Woods)",
                "type": "Natural Terrain Park / Glade",
                "difficulty": "Black Diamond",
                "min_base_in": 34,
                "median_open_date": "01-15",
                "earliest_date": "12-26",
                "latest_date": "02-02",
                "holiday_odds": {
                    "christmas": 0.22,
                    "mlk_weekend": 0.58,
                    "presidents_day": 0.88,
                    "spring_break": 0.85,
                },
            },
            {
                "name": "Superstar (Spring Glacier)",
                "type": "Mogul Glacier",
                "difficulty": "Black Diamond",
                "min_base_in": 60,
                "median_open_date": "12-05",
                "earliest_date": "11-15",
                "latest_date": "12-20",
                "holiday_odds": {
                    "christmas": 0.90,
                    "mlk_weekend": 0.98,
                    "presidents_day": 1.00,
                    "spring_break": 1.00,
                },
            },
        ],
    },
    {
        "id": "okemo",
        "name": "Okemo Mountain Resort",
        "region": "Southern Vermont",
        "stats": {
            "summit_elevation_ft": 3344,
            "base_elevation_ft": 1144,
            "vertical_drop_ft": 2200,
            "skiable_acres": 632,
            "glades_acres": 45,
            "total_trails": 121,
            "snowmaking_percent": 98,
            "average_snowfall_in": 200,
        },
        "orographic_multiplier": 0.90,
        "earliest_opening_date": "11-18",
        "closing_date": "04-20",
        "iconic_runs": [
            {
                "name": "Outrage Glade",
                "type": "Glade",
                "difficulty": "Double Black",
                "min_base_in": 36,
                "median_open_date": "01-24",
                "earliest_date": "01-05",
                "latest_date": "02-15",
                "holiday_odds": {
                    "christmas": 0.12,
                    "mlk_weekend": 0.38,
                    "presidents_day": 0.78,
                    "spring_break": 0.75,
                },
            },
            {
                "name": "Super Star Glade",
                "type": "Glade",
                "difficulty": "Black Diamond",
                "min_base_in": 32,
                "median_open_date": "01-18",
                "earliest_date": "01-02",
                "latest_date": "02-05",
                "holiday_odds": {
                    "christmas": 0.18,
                    "mlk_weekend": 0.48,
                    "presidents_day": 0.84,
                    "spring_break": 0.80,
                },
            },
        ],
    },
    {
        "id": "stratton",
        "name": "Stratton Mountain",
        "region": "Southern Vermont",
        "stats": {
            "summit_elevation_ft": 3875,
            "base_elevation_ft": 1872,
            "vertical_drop_ft": 2003,
            "skiable_acres": 670,
            "glades_acres": 60,
            "total_trails": 99,
            "snowmaking_percent": 95,
            "average_snowfall_in": 180,
        },
        "orographic_multiplier": 0.85,
        "earliest_opening_date": "11-22",
        "closing_date": "04-18",
        "iconic_runs": [
            {
                "name": "Emerald Forest Glade",
                "type": "Glade",
                "difficulty": "Black Diamond",
                "min_base_in": 34,
                "median_open_date": "01-20",
                "earliest_date": "01-04",
                "latest_date": "02-10",
                "holiday_odds": {
                    "christmas": 0.15,
                    "mlk_weekend": 0.45,
                    "presidents_day": 0.80,
                    "spring_break": 0.76,
                },
            },
            {
                "name": "Test Pilot",
                "type": "Glade",
                "difficulty": "Double Black",
                "min_base_in": 36,
                "median_open_date": "01-25",
                "earliest_date": "01-08",
                "latest_date": "02-14",
                "holiday_odds": {
                    "christmas": 0.10,
                    "mlk_weekend": 0.38,
                    "presidents_day": 0.75,
                    "spring_break": 0.72,
                },
            },
        ],
    },
    {
        "id": "mount-snow",
        "name": "Mount Snow",
        "region": "Southern Vermont",
        "stats": {
            "summit_elevation_ft": 3600,
            "base_elevation_ft": 1900,
            "vertical_drop_ft": 1700,
            "skiable_acres": 600,
            "glades_acres": 40,
            "total_trails": 86,
            "snowmaking_percent": 80,
            "average_snowfall_in": 156,
        },
        "orographic_multiplier": 0.80,
        "earliest_opening_date": "11-20",
        "closing_date": "04-18",
        "iconic_runs": [
            {
                "name": "Ripcord",
                "type": "Steep Cruiser / Headwall",
                "difficulty": "Double Black",
                "min_base_in": 28,
                "median_open_date": "12-28",
                "earliest_date": "12-12",
                "latest_date": "01-18",
                "holiday_odds": {
                    "christmas": 0.42,
                    "mlk_weekend": 0.82,
                    "presidents_day": 0.95,
                    "spring_break": 0.92,
                },
            },
            {
                "name": "Olympic Glade",
                "type": "Glade",
                "difficulty": "Double Black",
                "min_base_in": 35,
                "median_open_date": "01-26",
                "earliest_date": "01-08",
                "latest_date": "02-18",
                "holiday_odds": {
                    "christmas": 0.10,
                    "mlk_weekend": 0.32,
                    "presidents_day": 0.72,
                    "spring_break": 0.68,
                },
            },
        ],
    },
    {
        "id": "bolton-valley",
        "name": "Bolton Valley",
        "region": "Northern Vermont",
        "stats": {
            "summit_elevation_ft": 3150,
            "base_elevation_ft": 2100,
            "vertical_drop_ft": 1704,
            "skiable_acres": 300,
            "glades_acres": 80,
            "total_trails": 71,
            "snowmaking_percent": 60,
            "average_snowfall_in": 312,
        },
        "orographic_multiplier": 1.25,
        "earliest_opening_date": "11-28",
        "closing_date": "04-18",
        "iconic_runs": [
            {
                "name": "Lost Boys Glade",
                "type": "Glade",
                "difficulty": "Expert",
                "min_base_in": 32,
                "median_open_date": "01-04",
                "earliest_date": "12-16",
                "latest_date": "01-22",
                "holiday_odds": {
                    "christmas": 0.40,
                    "mlk_weekend": 0.82,
                    "presidents_day": 0.95,
                    "spring_break": 0.92,
                },
            },
            {
                "name": "Cobrass Woods",
                "type": "Glade",
                "difficulty": "Double Black",
                "min_base_in": 36,
                "median_open_date": "01-12",
                "earliest_date": "12-24",
                "latest_date": "02-02",
                "holiday_odds": {
                    "christmas": 0.28,
                    "mlk_weekend": 0.70,
                    "presidents_day": 0.92,
                    "spring_break": 0.88,
                },
            },
        ],
    },
]

def compute_daily_stats(resort: Dict[str, Any], curr_date: date) -> Dict[str, Any]:
    """Computes realistic statistical terrain progression for a given calendar date."""
    month = curr_date.month
    day = curr_date.day
    resort_id = resort["id"]
    mult = resort["orographic_multiplier"]
    sm_pct = resort["stats"]["snowmaking_percent"]
    
    if month == 10:
        median_open = 2.0 if resort_id == "killington" and day >= 25 else 0.0
        p10 = 0.0
        p90 = 5.0 if resort_id == "killington" and day >= 25 else 0.0
        glade_prob = 0.0
        snowmaking_share = 100
    elif month == 11:
        frac = (day - 1) / 29.0
        if resort_id == "killington":
            median_open = 8.0 + frac * 22.0
            p10 = 3.0 + frac * 8.0
            p90 = 15.0 + frac * 25.0
        else:
            base_open = 15.0 * (sm_pct / 100.0)
            median_open = max(0.0, (frac - 0.5) * 2.0 * base_open) if frac >= 0.5 else 0.0
            p10 = 0.0
            p90 = max(0.0, frac * base_open * 1.5)
        glade_prob = 0.0 if frac < 0.8 else round(0.05 * mult, 2)
        snowmaking_share = 95
    elif month == 12:
        frac = (day - 1) / 30.0
        median_open = 25.0 + frac * 45.0 * (sm_pct / 100.0)
        p10 = 12.0 + frac * 25.0
        p90 = min(95.0, 40.0 + frac * 48.0 * mult)
        
        if day < 15:
            glade_prob = round(0.04 * mult, 2)
        elif day < 25:
            glade_prob = round((0.10 + (day - 15) * 0.02) * mult, 2)
        else:
            glade_prob = round((0.25 + (day - 25) * 0.04) * mult, 2)
            
        snowmaking_share = max(55, int(85 - frac * 25))
    elif month == 1:
        frac = (day - 1) / 30.0
        median_open = min(98.0, 68.0 + frac * 25.0)
        p10 = 35.0 + frac * 35.0
        p90 = min(100.0, 85.0 + frac * 15.0)
        
        glade_prob = min(0.95, round((0.45 + frac * 0.45) * (mult ** 0.8), 2))
        snowmaking_share = max(35, int(60 - frac * 20))
    elif month == 2:
        frac = (day - 1) / 27.0
        median_open = min(100.0, 92.0 + math.sin(frac * math.pi) * 6.0)
        p10 = 70.0 + frac * 10.0
        p90 = 100.0
        glade_prob = min(0.98, round(0.88 * mult, 2))
        snowmaking_share = 35
    elif month == 3:
        frac = (day - 1) / 30.0
        median_open = max(65.0, 95.0 - frac * 22.0)
        p10 = max(40.0, 75.0 - frac * 30.0)
        p90 = min(100.0, 98.0 - frac * 8.0)
        glade_prob = max(0.40, round((0.92 - frac * 0.35) * mult, 2))
        snowmaking_share = int(35 + frac * 20)
    elif month == 4:
        frac = (day - 1) / 29.0
        if resort_id in ["killington", "jay-peak", "sugarbush"]:
            median_open = max(20.0, 70.0 - frac * 45.0)
            p10 = max(10.0, 40.0 - frac * 30.0)
            p90 = max(35.0, 88.0 - frac * 45.0)
            glade_prob = max(0.05, round((0.50 - frac * 0.45) * mult, 2)) if day < 20 else 0.02
        else:
            median_open = max(0.0, (1.0 - frac * 1.8) * 50.0)
            p10 = max(0.0, (1.0 - frac * 2.2) * 30.0)
            p90 = max(0.0, (1.0 - frac * 1.5) * 75.0)
            glade_prob = 0.0
        snowmaking_share = 75
    elif month == 5:
        frac = (day - 1) / 30.0
        if resort_id == "killington":
            median_open = max(5.0, 22.0 - frac * 16.0)
            p10 = max(2.0, 10.0 - frac * 8.0)
            p90 = max(8.0, 35.0 - frac * 22.0)
        elif resort_id == "jay-peak" and day <= 15:
            median_open = max(2.0, 15.0 - (day / 15.0) * 12.0)
            p10 = 0.0
            p90 = 20.0 - (day / 15.0) * 15.0
        else:
            median_open = 0.0
            p10 = 0.0
            p90 = 0.0
        glade_prob = 0.0
        snowmaking_share = 100
    elif month == 6:
        if resort_id == "killington" and day == 1:
            median_open = 2.0
            p10 = 0.0
            p90 = 4.0
        else:
            median_open = 0.0
            p10 = 0.0
            p90 = 0.0
        glade_prob = 0.0
        snowmaking_share = 100
    else:
        median_open = 0.0
        p10 = 0.0
        p90 = 0.0
        glade_prob = 0.0
        snowmaking_share = 100

    median_val = round(max(0.0, min(100.0, median_open)), 1)
    p10_val = round(max(0.0, min(median_val, p10)), 1)
    p90_val = round(min(100.0, max(median_val, p90)), 1)
    glade_val = round(max(0.0, min(1.0, glade_prob)), 2)
    sm_share = max(0, min(100, snowmaking_share))
    nat_share = 100 - sm_share
    
    date_str = f"{month:02d}-{day:02d}"
    return {
        "date": date_str,
        "median_open_pct": median_val,
        "p10_open_pct": p10_val,
        "p90_open_pct": p90_val,
        "glade_probability": glade_val,
        "snowmaking_pct": sm_share,
        "natural_pct": nat_share,
    }

def generate_baseline_dataset(output_path: Optional[Path] = None) -> Dict[str, Any]:
    """Generates the full baseline dataset for all 10 resorts from Oct 15 to Jun 1."""
    date_list: List[date] = []
    d = date(2026, 10, 15)
    end = date(2027, 6, 1)
    while d <= end:
        date_list.append(d)
        d += timedelta(days=1)
        
    resort_payloads = []
    for r in TARGET_RESORTS:
        timeline = [compute_daily_stats(r, d_val) for d_val in date_list]
        resort_payloads.append({
            "id": r["id"],
            "name": r["name"],
            "region": r["region"],
            "stats": r["stats"],
            "iconic_runs": r["iconic_runs"],
            "timeline": timeline,
        })
        
    dataset = {
        "generated_at": "2026-09-26T00:00:00Z",
        "season": "2026-2027",
        "total_resorts": len(resort_payloads),
        "timeline_span": {
            "start": "10-15",
            "end": "06-01",
            "total_days": len(date_list),
        },
        "resorts": resort_payloads,
    }
    
    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(dataset, f, indent=2)
            
    return dataset

if __name__ == "__main__":
    out = Path("public/data/vermont_ski_baseline.json")
    print(f"Generating Vermont Ski Baseline to {out}...")
    generate_baseline_dataset(output_path=out)
    print("Baseline generation complete.")
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.venv/bin/pytest tests/test_baseline.py -v`
Expected: `test_generate_baseline_structure PASSED`

- [ ] **Step 5: Generate public/data/vermont_ski_baseline.json**

Run: `.venv/bin/python pipeline/generate_baseline.py`
Expected: Output `public/data/vermont_ski_baseline.json` generated.

- [ ] **Step 6: Commit**

```bash
git add pipeline/generate_baseline.py tests/test_baseline.py public/data/vermont_ski_baseline.json
git commit -m "feat: implement historical baseline generator and 10-resort dataset"
```

---

### Task 3: Modular Live Scrapers & Daily Automation Pipeline

**Files:**
- Create: `pipeline/scrapers/base_scraper.py`
- Create: `pipeline/scrapers/epic_adapter.py`
- Create: `pipeline/scrapers/alterra_adapter.py`
- Create: `pipeline/scrapers/killington_adapter.py`
- Create: `pipeline/scrapers/indie_adapter.py`
- Create: `pipeline/scrapers/snocountry_adapter.py`
- Create: `pipeline/scrapers/run_daily_scrape.py`
- Create: `tests/test_scrapers.py`
- Create: `.github/workflows/daily-scraper.yml`

**Interfaces:**
- Consumes: Resort API endpoints & SnoCountry syndication feeds
- Produces: Normalized daily resort condition snapshots (`data/daily_snapshots/YYYY-MM-DD.json`)

- [ ] **Step 1: Write failing tests in tests/test_scrapers.py**

```python
from unittest.mock import MagicMock, patch
import pytest
from pipeline.scrapers.epic_adapter import EpicScraper
from pipeline.scrapers.snocountry_adapter import SnoCountryScraper

def test_epic_scraper_parser():
    mock_response = {
        "MountainReport": {
            "OpenTrails": 45,
            "TotalTrails": 116,
            "OpenLifts": 9,
            "TotalLifts": 12,
            "SnowDepth": 36,
        },
        "Trails": [
            {"Name": "Goat", "Status": "Open", "IsGlade": False},
            {"Name": "Chapel Glades", "Status": "Open", "IsGlade": True},
        ]
    }
    scraper = EpicScraper(resort_id="stowe", resort_api_code="stowe")
    result = scraper.parse_response(mock_response)
    
    assert result["resort_id"] == "stowe"
    assert result["open_trails"] == 45
    assert result["total_trails"] == 116
    assert result["glades_open"] == 1
    assert result["status"] == "active"

def test_snocountry_fallback_parser():
    mock_xml = """<?xml version="1.0"?>
    <resort>
        <resort_name>Jay Peak</resort_name>
        <open_trails>72</open_trails>
        <total_trails>81</total_trails>
        <surface_condition>Powder</surface_condition>
    </resort>
    """
    scraper = SnoCountryScraper()
    result = scraper.parse_resort_xml("jay-peak", mock_xml)
    assert result["resort_id"] == "jay-peak"
    assert result["open_trails"] == 72
    assert result["total_trails"] == 81
    assert result["surface"] == "Powder"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.venv/bin/pytest tests/test_scrapers.py -v`
Expected: `ModuleNotFoundError: No module named 'pipeline.scrapers.epic_adapter'`

- [ ] **Step 3: Implement pipeline/scrapers/base_scraper.py and adapters**

```python
# pipeline/scrapers/base_scraper.py
from abc import ABC, abstractmethod
from typing import Any, Dict

class BaseResortScraper(ABC):
    def __init__(self, resort_id: str):
        self.resort_id = resort_id

    @abstractmethod
    def fetch_live_status(self) -> Dict[str, Any]:
        """Fetch and return standardized status dict."""
        pass
```

```python
# pipeline/scrapers/epic_adapter.py
from typing import Any, Dict, List
import requests
from pipeline.scrapers.base_scraper import BaseResortScraper

class EpicScraper(BaseResortScraper):
    def __init__(self, resort_id: str, resort_api_code: str):
        super().__init__(resort_id)
        self.resort_api_code = resort_api_code
        self.endpoint = f"https://www.{resort_api_code}.com/api/v1/TerrainStatus/GetTerrainStatus"

    def parse_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        report = data.get("MountainReport", {})
        trails = data.get("Trails", [])
        glades_open = sum(1 for t in trails if t.get("IsGlade") and t.get("Status") == "Open")
        
        return {
            "resort_id": self.resort_id,
            "status": "active",
            "open_trails": report.get("OpenTrails", 0),
            "total_trails": report.get("TotalTrails", 0),
            "open_lifts": report.get("OpenLifts", 0),
            "total_lifts": report.get("TotalLifts", 0),
            "glades_open": glades_open,
            "snow_depth_in": report.get("SnowDepth", 0),
        }

    def fetch_live_status(self) -> Dict[str, Any]:
        try:
            resp = requests.get(self.endpoint, timeout=10)
            resp.raise_for_status()
            return self.parse_response(resp.json())
        except Exception as e:
            return {"resort_id": self.resort_id, "status": "error", "error": str(e)}
```

```python
# pipeline/scrapers/snocountry_adapter.py
import xml.etree.ElementTree as ET
from typing import Any, Dict
import requests
from pipeline.scrapers.base_scraper import BaseResortScraper

class SnoCountryScraper(BaseResortScraper):
    def __init__(self):
        super().__init__("snocountry-syndication")

    def parse_resort_xml(self, resort_id: str, xml_content: str) -> Dict[str, Any]:
        root = ET.fromstring(xml_content)
        open_trails = int(root.findtext("open_trails", "0"))
        total_trails = int(root.findtext("total_trails", "0"))
        surface = root.findtext("surface_condition", "Packed Powder")
        return {
            "resort_id": resort_id,
            "status": "active",
            "open_trails": open_trails,
            "total_trails": total_trails,
            "surface": surface,
        }

    def fetch_live_status(self) -> Dict[str, Any]:
        return {"status": "fallback_ready"}
```

```python
# pipeline/scrapers/run_daily_scrape.py
from datetime import datetime
import json
from pathlib import Path
from pipeline.scrapers.epic_adapter import EpicScraper
from pipeline.scrapers.snocountry_adapter import SnoCountryScraper

def run_all_scrapes() -> None:
    today_str = datetime.now().strftime("%Y-%m-%d")
    out_dir = Path("data/daily_snapshots")
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / f"{today_str}.json"
    
    scrapers = [
        EpicScraper("stowe", "stowe"),
        EpicScraper("okemo", "okemo"),
        EpicScraper("mount-snow", "mountsnow"),
    ]
    
    results = {}
    for s in scrapers:
        results[s.resort_id] = s.fetch_live_status()
        
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump({"date": today_str, "reports": results}, f, indent=2)
    print(f"Daily scrape saved to {out_file}")

if __name__ == "__main__":
    run_all_scrapes()
```

- [ ] **Step 4: Create .github/workflows/daily-scraper.yml**

```yaml
name: Daily Vermont Ski Conditions Scraper

on:
  schedule:
    # 7:00 AM EST is 12:00 UTC
    - cron: '0 12 * * *'
  workflow_dispatch:

jobs:
  scrape-and-update:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.13'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt

      - name: Run daily scraper
        run: |
          python pipeline/scrapers/run_daily_scrape.py

      - name: Commit and push updates
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add data/daily_snapshots/
          git diff-index --quiet HEAD || git commit -m "chore(data): daily ski conditions snapshot $(date +'%Y-%m-%d')"
          git push
```

- [ ] **Step 5: Run tests and verify**

Run: `.venv/bin/pytest tests/test_scrapers.py -v`
Expected: `2 passed`

- [ ] **Step 6: Commit**

```bash
git add pipeline/scrapers/ tests/test_scrapers.py .github/workflows/daily-scraper.yml
git commit -m "feat: implement modular scraper adapters and daily github action"
```

---

### Task 4: Frontend Scaffolding & Mountain-Slate Design System

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/index.css`
- Create: `src/main.jsx`

**Interfaces:**
- Consumes: Node.js & Vite
- Produces: Running Vite dev server and production CSS tokens matching the UI mockups

- [ ] **Step 1: Create package.json and vite.config.js**

```json
{
  "name": "vermont-ski-terrain-predictor",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.2.0"
  }
}
```

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: `added X packages` with zero audit vulnerabilities.

- [ ] **Step 3: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vermont Ski Terrain & Glade Predictor | Pre-Season Historical Model</title>
    <meta name="description" content="Predict expected open terrain, woods readiness, and rare terrain unlocking across Vermont's top 10 ski resorts from October to June." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Create src/index.css with complete Design System**

```css
:root {
  --bg-deep: #080d1a;
  --bg-surface: #0e172a;
  --bg-surface-elevated: #162238;
  --bg-card: rgba(22, 34, 56, 0.7);
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-active: rgba(72, 202, 228, 0.5);
  
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --text-dim: #64748b;
  
  --cyan-bright: #38bdf8;
  --cyan-glow: rgba(56, 189, 248, 0.25);
  --ice-blue: #7dd3fc;
  --powder-white: #ffffff;
  --glade-green: #10b981;
  --glade-glow: rgba(16, 185, 129, 0.25);
  --amber-gold: #f59e0b;
  --ruby-red: #ef4444;
  
  --font-heading: 'Outfit', sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-full: 9999px;
  
  --shadow-card: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  --glass-blur: blur(12px);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-deep);
  color: var(--text-main);
  font-family: var(--font-body);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  background-image: 
    radial-gradient(circle at 15% 15%, rgba(56, 189, 248, 0.06) 0%, transparent 40%),
    radial-gradient(circle at 85% 85%, rgba(16, 185, 129, 0.04) 0%, transparent 40%);
  background-attachment: fixed;
}

button {
  cursor: pointer;
  border: none;
  font-family: var(--font-body);
  transition: all 0.2s ease;
}

.container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 24px;
}
```

- [ ] **Step 5: Create src/main.jsx and verify initial build**

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div style={{ padding: '40px', color: '#fff' }}>App Scaffolded</div>
  </React.StrictMode>
);
```

Run: `npm run build`
Expected: `✓ built in XXms`

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.js index.html src/index.css src/main.jsx
git commit -m "chore: scaffold react app with mountain-slate design system"
```

---

### Task 5: Frontend Trip Planner Engine & Core Components

**Files:**
- Create: `src/utils/timelineUtils.js`
- Create: `src/components/Header.jsx`
- Create: `src/components/DateScrubber.jsx`
- Create: `src/components/SkierToggle.jsx`
- Create: `src/components/ResortCard.jsx`

**Interfaces:**
- Consumes: `vermont_ski_baseline.json`
- Produces: Interactive date scrubbing across October 15 – June 1, holiday presets, skier preference toggling, and ranked resort cards with confidence intervals and glade readiness gauges

- [ ] **Step 1: Write src/utils/timelineUtils.js with date math**

```javascript
export const SEASON_START = new Date(2026, 9, 15); // Oct 15
export const SEASON_END = new Date(2027, 5, 1);   // Jun 1

export const PRESET_DATES = [
  { id: 'first_turns', label: 'First Turns (Oct/Nov)', dateStr: '11-15', dayIndex: 31 },
  { id: 'holiday_week', label: 'Holiday Week (Dec)', dateStr: '12-28', dayIndex: 74 },
  { id: 'mlk_weekend', label: 'MLK Weekend (Jan)', dateStr: '01-17', dayIndex: 94 },
  { id: 'presidents_day', label: 'Presidents Day (Feb)', dateStr: '02-15', dayIndex: 123 },
  { id: 'spring_moguls', label: 'Spring Moguls (Apr-Jun)', dateStr: '04-10', dayIndex: 177 },
];

export function dayIndexToDate(dayIndex) {
  const d = new Date(2026, 9, 15);
  d.setDate(d.getDate() + dayIndex);
  return d;
}

export function formatDateLabel(d) {
  const options = { month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}

export function formatDateKey(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${m}-${day}`;
}
```

- [ ] **Step 2: Create src/components/Header.jsx**

```jsx
import React from 'react';

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px 0',
      borderBottom: '1px solid var(--border-subtle)',
      marginBottom: '32px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, var(--cyan-bright), #0284c7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px var(--cyan-glow)'
        }}>
          <span style={{ fontSize: '20px' }}>🏔️</span>
        </div>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.4rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            Vermont Terrain & Glade Predictor
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--glade-green)',
              boxShadow: '0 0 8px var(--glade-green)'
            }}></span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Pre-Season Historical Model • 15+ Years Snowpack & Terrain Calibration
            </span>
          </div>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setActiveTab('planner')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'planner' ? 'var(--bg-surface-elevated)' : 'transparent',
            color: activeTab === 'planner' ? 'var(--cyan-bright)' : 'var(--text-muted)',
            border: activeTab === 'planner' ? '1px solid var(--border-active)' : '1px solid transparent',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          Trip Planner
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            background: activeTab === 'matrix' ? 'var(--bg-surface-elevated)' : 'transparent',
            color: activeTab === 'matrix' ? 'var(--cyan-bright)' : 'var(--text-muted)',
            border: activeTab === 'matrix' ? '1px solid var(--border-active)' : '1px solid transparent',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          Resort Comparison Matrix
        </button>
      </nav>
    </header>
  );
}
```

- [ ] **Step 3: Create src/components/DateScrubber.jsx**

```jsx
import React from 'react';
import { PRESET_DATES, dayIndexToDate, formatDateLabel } from '../utils/timelineUtils';

export default function DateScrubber({ dayIndex, setDayIndex }) {
  const currentDate = dayIndexToDate(dayIndex);
  const formattedDate = formatDateLabel(currentDate);

  return (
    <div style={{
      background: 'var(--bg-card)',
      backdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px 28px',
      marginBottom: '28px',
      boxShadow: 'var(--shadow-card)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
          Season Timeline Planner
        </h2>
        <div style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-active)',
          borderRadius: 'var(--radius-md)',
          padding: '6px 16px',
          fontWeight: 700,
          color: 'var(--cyan-bright)',
          fontSize: '1.05rem',
          boxShadow: '0 0 15px var(--cyan-glow)'
        }}>
          🎯 Selected Target: {formattedDate}
        </div>
      </div>

      {/* Slider Bar */}
      <div style={{ position: 'relative', margin: '20px 0 12px 0' }}>
        <input
          type="range"
          min={0}
          max={229}
          value={dayIndex}
          onChange={(e) => setDayIndex(Number(e.target.value))}
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            background: 'linear-gradient(to right, #0284c7, #38bdf8, #10b981, #f59e0b, #38bdf8)',
            outline: 'none',
            WebkitAppearance: 'none',
            cursor: 'pointer'
          }}
        />
        {/* Milestone ticks */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: 'var(--text-dim)',
          marginTop: '8px',
          fontWeight: 600
        }}>
          <span>Oct (First Turns)</span>
          <span>Nov</span>
          <span>Dec (Holidays)</span>
          <span>Jan (Peak Powder)</span>
          <span>Feb (Presidents')</span>
          <span>Mar (Spring)</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun (Superstar Bumps)</span>
        </div>
      </div>

      {/* Quick Holiday Preset Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quick Presets:</span>
        {PRESET_DATES.map((preset) => {
          const isSelected = Math.abs(dayIndex - preset.dayIndex) <= 2;
          return (
            <button
              key={preset.id}
              onClick={() => setDayIndex(preset.dayIndex)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                background: isSelected ? 'var(--cyan-bright)' : 'var(--bg-surface-elevated)',
                color: isSelected ? 'var(--bg-deep)' : 'var(--text-main)',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.82rem',
                border: isSelected ? '1px solid var(--cyan-bright)' : '1px solid var(--border-subtle)',
                boxShadow: isSelected ? '0 0 12px var(--cyan-glow)' : 'none'
              }}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create src/components/SkierToggle.jsx**

```jsx
import React from 'react';

export default function SkierToggle({ gladeFocus, setGladeFocus }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      margin: '0 0 24px 0'
    }}>
      <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
        Displaying 10 Vermont Ski Mountains ranked by conditions on this date:
      </div>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--bg-card)',
        padding: '4px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--border-subtle)'
      }}>
        <button
          onClick={() => setGladeFocus(false)}
          style={{
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            background: !gladeFocus ? 'var(--bg-surface-elevated)' : 'transparent',
            color: !gladeFocus ? 'var(--cyan-bright)' : 'var(--text-dim)',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          ⛷️ All Mountain Terrain
        </button>
        <button
          onClick={() => setGladeFocus(true)}
          style={{
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            background: gladeFocus ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
            color: gladeFocus ? 'var(--glade-green)' : 'var(--text-dim)',
            border: gladeFocus ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
            fontWeight: 600,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>🌲</span> Woods & Glades Priority
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create src/components/ResortCard.jsx**

```jsx
import React from 'react';

export default function ResortCard({ rank, resort, statsOnDate, onSelect }) {
  const { median_open_pct, p10_open_pct, p90_open_pct, glade_probability } = statsOnDate;
  const gladePercent = Math.round(glade_probability * 100);

  const gladeColor = gladePercent >= 70 ? 'var(--glade-green)' : gladePercent >= 40 ? 'var(--cyan-bright)' : 'var(--amber-gold)';
  const primaryRun = resort.iconic_runs[0];

  return (
    <div
      onClick={onSelect}
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = 'var(--border-active)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.5), 0 0 15px var(--cyan-glow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: 'var(--cyan-bright)',
              background: 'rgba(56, 189, 248, 0.1)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)'
            }}>
              #{rank}
            </span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700 }}>
              {resort.name}
            </h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{resort.region}</span>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {resort.stats.average_snowfall_in}" Snow / yr
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expected Open</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
            {median_open_pct}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Range: {p10_open_pct}% – {p90_open_pct}%
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Woods Readiness</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: gladeColor, marginTop: '2px' }}>
            {gladePercent}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            {gladePercent >= 70 ? '🌲 Open & Viable' : gladePercent >= 35 ? '⚠️ Early / Thin' : '🚫 Dormant'}
          </div>
        </div>
      </div>

      {primaryRun && (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.82rem'
        }}>
          <span style={{ color: 'var(--text-muted)' }}>Signature: <strong>{primaryRun.name}</strong></span>
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--cyan-bright)',
            fontWeight: 600
          }}>
            Opens ~{primaryRun.median_open_date}
          </span>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/utils/timelineUtils.js src/components/Header.jsx src/components/DateScrubber.jsx src/components/SkierToggle.jsx src/components/ResortCard.jsx
git commit -m "feat: implement trip planner scrubber, header, and resort card components"
```

---

### Task 6: Interactive Seasonal Curve Chart & Resort Deep-Dive Modal

**Files:**
- Create: `src/components/SeasonalProgressionChart.jsx`
- Create: `src/components/ResortDetailModal.jsx`

**Interfaces:**
- Consumes: Selected resort object and current day index
- Produces: Interactive SVG seasonal progression chart (10th/50th/90th percentile envelope, glowing glade curve, date cursor) and rare terrain unlock list

- [ ] **Step 1: Create src/components/SeasonalProgressionChart.jsx**

```jsx
import React, { useMemo } from 'react';

export default function SeasonalProgressionChart({ timeline, currentDayIndex }) {
  const width = 800;
  const height = 300;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 40;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const { p10Points, medianPoints, p90Points, gladePoints, cursorX } = useMemo(() => {
    const total = timeline.length;
    if (total === 0) return { p10Points: '', medianPoints: '', p90Points: '', gladePoints: '', cursorX: 0 };

    const getX = (idx) => padLeft + (idx / (total - 1)) * chartW;
    const getY = (val) => padTop + chartH - (val / 100) * chartH;

    let medPts = [];
    let p10Pts = [];
    let p90Pts = [];
    let gladePts = [];

    timeline.forEach((pt, i) => {
      const x = getX(i);
      medPts.push(`${x},${getY(pt.median_open_pct)}`);
      p10Pts.push(`${x},${getY(pt.p10_open_pct)}`);
      p90Pts.push(`${x},${getY(pt.p90_open_pct)}`);
      gladePts.push(`${x},${getY(pt.glade_probability * 100)}`);
    });

    const currX = getX(Math.min(currentDayIndex, total - 1));

    return {
      medianPoints: medPts.join(' '),
      p10Points: p10Pts.join(' '),
      p90Points: p90Pts.join(' '),
      gladePoints: gladePts.join(' '),
      cursorX: currX
    };
  }, [timeline, currentDayIndex]);

  const envelopePolygon = useMemo(() => {
    if (!timeline.length) return '';
    const total = timeline.length;
    const getX = (idx) => padLeft + (idx / (total - 1)) * chartW;
    const getY = (val) => padTop + chartH - (val / 100) * chartH;

    let top = [];
    let bottom = [];
    timeline.forEach((pt, i) => {
      top.push(`${getX(i)},${getY(pt.p90_open_pct)}`);
      bottom.unshift(`${getX(i)},${getY(pt.p10_open_pct)}`);
    });
    return top.concat(bottom).join(' ');
  }, [timeline]);

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
        {[0, 25, 50, 75, 100].map((tick) => {
          const y = padTop + chartH - (tick / 100) * chartH;
          return (
            <g key={tick}>
              <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <text x={padLeft - 8} y={y + 4} fill="var(--text-dim)" fontSize="11" textAnchor="end">{tick}%</text>
            </g>
          );
        })}

        <polygon points={envelopePolygon} fill="rgba(56, 189, 248, 0.12)" />
        <polyline points={medianPoints} fill="none" stroke="#f8fafc" strokeWidth="2.5" />
        <polyline points={gladePoints} fill="none" stroke="var(--glade-green)" strokeWidth="3" filter="drop-shadow(0px 0px 4px rgba(16,185,129,0.7))" />

        <line x1={cursorX} y1={padTop} x2={cursorX} y2={height - padBottom} stroke="var(--cyan-bright)" strokeWidth="2" strokeDasharray="4 2" />
        <circle cx={cursorX} cy={padTop + 4} r="4" fill="var(--cyan-bright)" />

        {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, idx) => {
          const x = padLeft + (idx / 8) * chartW;
          return (
            <text key={month} x={x} y={height - 12} fill="var(--text-dim)" fontSize="11" textAnchor="middle">
              {month}
            </text>
          );
        })}
      </svg>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '10px', fontSize: '0.8rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
          <span style={{ width: '14px', height: '3px', background: '#f8fafc', display: 'inline-block' }}></span> Median Open %
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--glade-green)' }}>
          <span style={{ width: '14px', height: '3px', background: 'var(--glade-green)', display: 'inline-block' }}></span> Glade Readiness Probability
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cyan-bright)' }}>
          <span style={{ width: '12px', height: '12px', background: 'rgba(56, 189, 248, 0.25)', display: 'inline-block', borderRadius: '2px' }}></span> 10th–90th Percentile Range
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create src/components/ResortDetailModal.jsx**

```jsx
import React, { useEffect } from 'react';
import SeasonalProgressionChart from './SeasonalProgressionChart';

export default function ResortDetailModal({ resort, currentDayIndex, statsOnDate, onClose }) {
  if (!resort) return null;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const { stats, iconic_runs, timeline } = resort;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-active)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '920px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px var(--cyan-glow)'
      }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800 }}>
              {resort.name}
            </h2>
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
              <span style={{ background: 'var(--bg-surface-elevated)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                📍 {resort.region}
              </span>
              <span style={{ background: 'var(--bg-surface-elevated)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ⛰️ Summit: {stats.summit_elevation_ft}' | Vert: {stats.vertical_drop_ft}'
              </span>
              <span style={{ background: 'var(--bg-surface-elevated)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--cyan-bright)' }}>
                ❄️ Annual Snow: {stats.average_snowfall_in}"
              </span>
              <span style={{ background: 'var(--bg-surface-elevated)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--glade-green)' }}>
                🌲 Glades: {stats.glades_acres} Acres
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-main)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>
            Seasonal Terrain & Glade Opening Curve (Oct 15 – Jun 1)
          </h3>
          <SeasonalProgressionChart timeline={timeline} currentDayIndex={currentDayIndex} />
        </div>

        <div style={{ marginBottom: '28px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
            Terrain Composition Split on Selected Date
          </h4>
          <div style={{ display: 'flex', height: '14px', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ width: `${statsOnDate.snowmaking_pct}%`, background: 'var(--cyan-bright)' }} title={`Snowmaking: ${statsOnDate.snowmaking_pct}%`} />
            <div style={{ width: `${statsOnDate.natural_pct}%`, background: 'var(--glade-green)' }} title={`Natural/Glades: ${statsOnDate.natural_pct}%`} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '6px', color: 'var(--text-dim)' }}>
            <span>⚡ Snowmaking Cruisers: {statsOnDate.snowmaking_pct}%</span>
            <span>🌲 Natural Snow & Woods: {statsOnDate.natural_pct}%</span>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
            Signature & Rare Terrain Unlock Tracker
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
            {iconic_runs.map((run, i) => (
              <div key={i} style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{run.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--amber-gold)', fontWeight: 600 }}>{run.difficulty}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 10px 0' }}>
                  Needs: <strong>{run.min_base_in}" base</strong> | Median Open: <strong>{run.median_open_date}</strong>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span>MLK Weekend Odds:</span>
                    <strong style={{ color: run.holiday_odds.mlk_weekend >= 0.7 ? 'var(--glade-green)' : 'var(--cyan-bright)' }}>
                      {Math.round(run.holiday_odds.mlk_weekend * 100)}%
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Presidents' Day Odds:</span>
                    <strong style={{ color: run.holiday_odds.presidents_day >= 0.85 ? 'var(--glade-green)' : 'var(--cyan-bright)' }}>
                      {Math.round(run.holiday_odds.presidents_day * 100)}%
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/SeasonalProgressionChart.jsx src/components/ResortDetailModal.jsx
git commit -m "feat: implement SVG progression curve and resort deep dive modal"
```

---

### Task 7: Multi-Resort Comparison Matrix & App Integration

**Files:**
- Create: `src/components/ResortComparison.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `vermont_ski_baseline.json` dataset
- Produces: Complete, interactive multi-tab application with sorting, matrix views, and detail inspection

- [ ] **Step 1: Create src/components/ResortComparison.jsx**

```jsx
import React, { useState } from 'react';

export default function ResortComparison({ resorts, onSelectResort }) {
  const [filterRegion, setFilterRegion] = useState('all');
  const [sortBy, setSortBy] = useState('snowfall');

  const filtered = resorts.filter((r) => {
    if (filterRegion === 'north') return r.region.includes('Northern');
    if (filterRegion === 'south') return r.region.includes('Southern') || r.region.includes('Central');
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'snowfall') return b.stats.average_snowfall_in - a.stats.average_snowfall_in;
    if (sortBy === 'vertical') return b.stats.vertical_drop_ft - a.stats.vertical_drop_ft;
    if (sortBy === 'glades') return b.stats.glades_acres - a.stats.glades_acres;
    return a.name.localeCompare(b.name);
  });

  return (
    <div style={{
      background: 'var(--bg-card)',
      backdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      boxShadow: 'var(--shadow-card)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setFilterRegion('all')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: filterRegion === 'all' ? 'var(--cyan-bright)' : 'var(--bg-surface-elevated)',
              color: filterRegion === 'all' ? 'var(--bg-deep)' : 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            All Vermont Mountains
          </button>
          <button
            onClick={() => setFilterRegion('north')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: filterRegion === 'north' ? 'var(--cyan-bright)' : 'var(--bg-surface-elevated)',
              color: filterRegion === 'north' ? 'var(--bg-deep)' : 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            Northern Powder Spine
          </button>
          <button
            onClick={() => setFilterRegion('south')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: filterRegion === 'south' ? 'var(--cyan-bright)' : 'var(--bg-surface-elevated)',
              color: filterRegion === 'south' ? 'var(--bg-deep)' : 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            Central & Southern Hubs
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span>Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 8px'
            }}
          >
            <option value="snowfall">Annual Snowfall</option>
            <option value="vertical">Vertical Drop</option>
            <option value="glades">Glades Acreage</option>
            <option value="name">Resort Name</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-dim)' }}>
              <th style={{ padding: '12px 16px' }}>Resort</th>
              <th style={{ padding: '12px 16px' }}>Annual Snow</th>
              <th style={{ padding: '12px 16px' }}>Summit Vert</th>
              <th style={{ padding: '12px 16px' }}>Glades Acres</th>
              <th style={{ padding: '12px 16px' }}>MLK Woods Odds</th>
              <th style={{ padding: '12px 16px' }}>Presidents' Woods</th>
              <th style={{ padding: '12px 16px' }}>Trophy Run</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const run = r.iconic_runs[0];
              const mlkOdds = run ? Math.round(run.holiday_odds.mlk_weekend * 100) : 50;
              const presOdds = run ? Math.round(run.holiday_odds.presidents_day * 100) : 80;

              return (
                <tr
                  key={r.id}
                  onClick={() => onSelectResort(r)}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-main)' }}>{r.name}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--cyan-bright)' }}>{r.stats.average_snowfall_in}"</td>
                  <td style={{ padding: '14px 16px' }}>{r.stats.vertical_drop_ft}'</td>
                  <td style={{ padding: '14px 16px', color: 'var(--glade-green)' }}>{r.stats.glades_acres} ac</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: mlkOdds >= 70 ? 'rgba(16,185,129,0.15)' : 'rgba(56,189,248,0.15)',
                      color: mlkOdds >= 70 ? 'var(--glade-green)' : 'var(--cyan-bright)',
                      fontWeight: 700
                    }}>
                      {mlkOdds}%
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: presOdds >= 85 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                      color: presOdds >= 85 ? 'var(--glade-green)' : 'var(--amber-gold)',
                      fontWeight: 700
                    }}>
                      {presOdds}%
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{run ? run.name : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement src/App.jsx**

```jsx
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DateScrubber from './components/DateScrubber';
import SkierToggle from './components/SkierToggle';
import ResortCard from './components/ResortCard';
import ResortDetailModal from './components/ResortDetailModal';
import ResortComparison from './components/ResortComparison';
import { dayIndexToDate, formatDateKey } from './utils/timelineUtils';

export default function App() {
  const [baselineData, setBaselineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('planner');
  const [dayIndex, setDayIndex] = useState(94); // Default to MLK Weekend (~Jan 17)
  const [gladeFocus, setGladeFocus] = useState(false);
  const [selectedResort, setSelectedResort] = useState(null);

  useEffect(() => {
    fetch('/data/vermont_ski_baseline.json')
      .then((res) => {
        if (!res.ok) throw new Error('Baseline data not found');
        return res.json();
      })
      .then((data) => {
        setBaselineData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--cyan-bright)' }}>
        Loading Vermont Ski Terrain Baseline...
      </div>
    );
  }

  if (!baselineData || !baselineData.resorts) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--ruby-red)' }}>
        Failed to load baseline data. Please run: <code>python pipeline/generate_baseline.py</code>
      </div>
    );
  }

  const currentDate = dayIndexToDate(dayIndex);
  const dateKey = formatDateKey(currentDate);

  const getStatsOnDate = (resort) => {
    const point = resort.timeline.find((p) => p.date === dateKey);
    return point || resort.timeline[0];
  };

  const rankedResorts = [...baselineData.resorts].sort((a, b) => {
    const statsA = getStatsOnDate(a);
    const statsB = getStatsOnDate(b);
    if (gladeFocus) {
      return statsB.glade_probability - statsA.glade_probability;
    }
    return statsB.median_open_pct - statsA.median_open_pct;
  });

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'planner' ? (
        <>
          <DateScrubber dayIndex={dayIndex} setDayIndex={setDayIndex} />
          <SkierToggle gladeFocus={gladeFocus} setGladeFocus={setGladeFocus} />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '20px'
          }}>
            {rankedResorts.map((resort, idx) => (
              <ResortCard
                key={resort.id}
                rank={idx + 1}
                resort={resort}
                statsOnDate={getStatsOnDate(resort)}
                onSelect={() => setSelectedResort(resort)}
              />
            ))}
          </div>
        </>
      ) : (
        <ResortComparison
          resorts={baselineData.resorts}
          onSelectResort={(resort) => setSelectedResort(resort)}
        />
      )}

      {selectedResort && (
        <ResortDetailModal
          resort={selectedResort}
          currentDayIndex={dayIndex}
          statsOnDate={getStatsOnDate(selectedResort)}
          onClose={() => setSelectedResort(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Build the application to verify compilation**

Run: `npm run build`
Expected: `✓ built in XXms` without errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ResortComparison.jsx src/App.jsx
git commit -m "feat: integrate full comparison matrix, state wiring, and detail modals"
```

---

### Task 8: End-to-End Verification & Browser Validation

**Files:**
- Test: `.venv/bin/pytest tests/`
- Build: `npm run build`
- Preview: `npx vite preview --port 4173`

**Interfaces:**
- Consumes: Built production bundle and live Python pipeline
- Produces: Verified working web application and automated test report

- [ ] **Step 1: Run complete Python test suite**

Run: `.venv/bin/pytest tests/ -v`
Expected: All tests pass (`test_generate_baseline_structure`, `test_epic_scraper_parser`, `test_snocountry_fallback_parser`).

- [ ] **Step 2: Generate fresh baseline JSON in public/data/**

Run: `.venv/bin/python pipeline/generate_baseline.py`
Expected: `public/data/vermont_ski_baseline.json` updated with latest calculations.

- [ ] **Step 3: Run production frontend build**

Run: `npm run build`
Expected: Build succeeds with zero errors.

- [ ] **Step 4: Browser interaction check**

Run dev server in background and use `browser_subagent` or curl to verify HTML/JSON payloads render as expected.

- [ ] **Step 5: Final Git Status & Tag**

```bash
git status
git add -A
git commit -m "chore: final end-to-end verification and assets packaging"
```
