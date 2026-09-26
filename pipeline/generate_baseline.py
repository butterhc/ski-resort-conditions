"""
Historical Baseline & Calibrated Estimation Generator for Vermont Ski Resorts.
Synthesizes expert-curated resort profiles, orographic snow factors, terrain
taxonomy, and seasonal progression curves from October 15 through June 1.

Note: This engine produces calibrated estimates derived from curated resort data,
not raw statistical inference from historical snowfall datasets. Ingesting real
historical data (Mount Mansfield Snow Stake, NOAA GHCN-Daily) is a Phase 2 goal.
"""

import argparse
from datetime import date, datetime, timedelta
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

def _detect_season_year() -> int:
    """Auto-detect the season start year. If current month >= October, use current year; otherwise prior year."""
    now = datetime.now()
    return now.year if now.month >= 10 else now.year - 1

def generate_baseline_dataset(output_path: Optional[Path] = None, season_year: Optional[int] = None) -> Dict[str, Any]:
    """Generates the full baseline dataset for all 10 resorts from Oct 15 to Jun 1.
    
    Args:
        output_path: Where to write the JSON output. None = don't write to disk.
        season_year: The starting year of the season (e.g., 2026 for the 2026-2027 season).
                     Defaults to auto-detection based on current date.
    """
    if season_year is None:
        season_year = _detect_season_year()
    
    date_list: List[date] = []
    d = date(season_year, 10, 15)
    end = date(season_year + 1, 6, 1)
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
        "generated_at": datetime.now().isoformat() + "Z",
        "season": f"{season_year}-{season_year + 1}",
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
    parser = argparse.ArgumentParser(description="Generate Vermont Ski Baseline Dataset")
    parser.add_argument(
        "--season", type=int, default=None,
        help="Season start year (e.g., 2026 for 2026-2027). Defaults to auto-detect."
    )
    parser.add_argument(
        "--output", type=str, default="public/data/vermont_ski_baseline.json",
        help="Output file path for the baseline JSON."
    )
    args = parser.parse_args()
    out = Path(args.output)
    season = args.season
    print(f"Generating Vermont Ski Baseline (season={season or 'auto-detect'}) to {out}...")
    generate_baseline_dataset(output_path=out, season_year=season)
    print("Baseline generation complete.")
