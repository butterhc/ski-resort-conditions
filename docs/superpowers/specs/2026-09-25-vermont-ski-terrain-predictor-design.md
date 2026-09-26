# Vermont Ski Resort Terrain & Glade Predictor - Design Specification

- **Date**: 2026-09-25
- **Status**: Draft (Approved in Brainstorming)
- **Target Audience**: Skiers and riders planning trips to Vermont, specifically those seeking woods, glades, and natural/rare terrain.

---

## 1. Problem Statement & Goals

Skiers planning trips to Vermont face a persistent information gap:
1. **Misleading Marketing Percentages**: Early and mid-season resort reports boast high percentages of open terrain (e.g., "75% open by Christmas"), but this almost exclusively reflects snowmaking cruiser corridors.
2. **Glade & Rare Terrain Timing**: Glades, steep tree lines, and un-snowmade trophy terrain (e.g., Castlerock at Sugarbush, Paradise at Mad River Glen, Starr/Goat at Stowe, Black Hole at Smugglers' Notch) require deep, consolidated natural snowpack (typically 30–50+ inches).
3. **Trip Planning Window**: Skier booking decisions (flights, lodging, passes) happen weeks or months in advance, during the pre-season, when current conditions cannot tell them what will be open.

### Primary Goals
- Provide an interactive, date-based trip planning tool that calculates the historical average open terrain percentage and glade opening probability for any target date between November 15 and April 15.
- Specifically track and predict the opening dates and holiday odds for iconic "rare" terrain and glades across Vermont's major mountains.
- Deliver a fast, responsive, modern web application prioritizing pre-season planning capabilities first, paired with a daily automated scraping architecture for live season tracking.

---

## 2. Scope & Target Resorts

Initial release focuses on the **Top 10 Vermont Alpine Resorts**:

| Resort | Region | Summit / Vertical | Avg Snowfall | Signature Rare / Glade Zone | Primary Character |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Jay Peak** | Northern VT | 3,968' / 2,153' | 350"+ | The Beaver, Canyonland, Face Chutes | Natural snow champion, tree skiing capital |
| **Stowe Mountain Resort** | Northern VT | 4,395' / 2,360' | 300"+ | Front Four (Goat, Starr), Chapel Glades | Iconic steep terrain, high elevation |
| **Smugglers' Notch** | Northern VT | 3,640' / 2,610' | 300"+ | Black Hole (Triple Black), Freefall Glades | 100% natural glades, classic New England |
| **Sugarbush Resort** | Central VT | 4,083' / 2,600' | 250"+ | Castlerock Peak (Liftline, Rumble) | Legendary woods & expert natural terrain |
| **Mad River Glen** | Central VT | 3,637' / 2,000' | 250"+ | Paradise, Fall Line, 20th Hole | Ski it if you can; 95% natural snow dependent |
| **Killington Resort** | Central VT | 4,241' / 3,050' | 250"+ | The Stash, Outer Limits, Julio | Beast of the East; massive snowmaking power |
| **Okemo Mountain Resort** | Southern VT | 3,344' / 2,200' | 200"+ | Outrage, Super Star Glades | Snowmaking fortress, family-oriented cruising |
| **Stratton Mountain** | Southern VT | 3,875' / 2,003' | 180"+ | Emerald Forest, Test Pilot | Southern VT cruiser and glade progression |
| **Mount Snow** | Southern VT | 3,600' / 1,700' | 150"+ | The North Face, Olympic Glade | Heavy early snowmaking, southern accessibility |
| **Bolton Valley** | Northern VT | 3,150' / 1,704' | 300"+ | Lost Boys, Cobrass Glades | High base elevation, powder-stash woods |

---

## 3. Terrain Taxonomy & Glade Model

To accurately reflect terrain availability, all trails are categorized into four operational tiers:

```
┌────────────────────────────────────────────────────────────────────────┐
│ Tier 1: Snowmaking Backbone (Opens Nov – Dec)                          │
│ High-output snowguns, cold wet-bulb temps. High confidence early.      │
├────────────────────────────────────────────────────────────────────────┤
│ Tier 2: Natural Cruisers (Opens mid-Dec – early Jan)                   │
│ Intermediate groomed trails requiring 15–20" natural base.             │
├────────────────────────────────────────────────────────────────────────┤
│ Tier 3: Primary Glades & Woods (Opens late Dec – late Jan)             │
│ Off-piste woods requiring 30–45" consolidated natural base.            │
├────────────────────────────────────────────────────────────────────────┤
│ Tier 4: Rare / Extreme / Low Runout (Opens mid-Jan – Feb, high tide)   │
│ Severe rock/cliff lines, low runout bottlenecks requiring 45–60"+ base │
└────────────────────────────────────────────────────────────────────────┘
```

### Glade Readiness Probability Function
Glade opening readiness $P_{\text{glade}}(d, r)$ for date $d$ at resort $r$ is modeled using:
1. Historical cumulative snowpack curves from the **Mount Mansfield Snow Stake** (70-year record) and summit elevation profiles.
2. Resort-specific orographic snow factors (e.g., Jay Peak cloud multiplier = 1.35x vs. Southern VT = 0.85x).
3. Base depth thresholds:
   - **Base < 25"**: $P_{\text{glade}} \in [0.00, 0.10]$
   - **Base 25"–35"**: $P_{\text{glade}} \in [0.15, 0.45]$ (Cautious opening, rocky)
   - **Base 35"–48"**: $P_{\text{glade}} \in [0.55, 0.80]$ (Solid coverage, primary woods open)
   - **Base > 48"**: $P_{\text{glade}} \in [0.85, 0.98]$ (Peak condition, all woods viable)

### Iconic Run Milestone Profiling
Each resort highlights 3–5 signature rare runs with:
- **Median Opening Date** (50th percentile)
- **Earliest / Latest Recorded Opening Window**
- **Holiday Odds**:
  - Christmas / New Year's Week (Dec 25–Jan 1)
  - MLK Weekend (Mid-January)
  - Super Bowl Weekend (Early February)
  - Presidents' Day Weekend (Mid-February)
  - Spring Break (Mid-March)

---

## 4. System Architecture

A decoupled design separating the data engine from the frontend web application:

```
┌─────────────────────────────────────────────────────────┐
│                 Data & Modeling Engine                  │
│                      (Python CLI)                       │
│                                                         │
│  [Historical Ingestion]        [Live Morning Scrapers]  │
│  (BestSnow, OnTheSnow,         (Epic, Ikon, Killington, │
│   Mansfield Snow Stake)         Indies, SnoCountry)     │
│             │                            │              │
│             ▼                            ▼              │
│   [Statistical Engine]          [Daily Snapshots]       │
│             │                            │              │
│             └────────────┬───────────────┘              │
│                          ▼                              │
│         public/data/vermont_ski_baseline.json           │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│               Modern Frontend Application               │
│                  (React + Vite + CSS)                   │
│                                                         │
│  • Hero Trip Planner (Date Scrubber & Quick Presets)    │
│  • Ranked Mountain Cards with Glade Readiness Gauges    │
│  • Interactive Season Progression Curves (10th/50th/90th│
│  • Iconic Run Milestone Status Cards                    │
│  • Multi-Resort Comparison Matrix                       │
└─────────────────────────────────────────────────────────┘
```

### Components

#### 1. Data Pipeline (`pipeline/`)
- `generate_baseline.py`: Standalone Python script that synthesizes historical snowpack, resort terrain databases, and seasonal progression curves into `public/data/vermont_ski_baseline.json`.
- `scrapers/`: Modular resort scrapers ready for live season execution:
  - `epic_adapter.py`: Stowe, Okemo, Mount Snow via Epic SnowCloud JSON endpoint.
  - `alterra_adapter.py`: Sugarbush, Stratton mountain reports.
  - `killington_adapter.py`: Killington & Pico reports.
  - `indie_adapter.py`: Jay Peak, Smuggs, Mad River Glen, Bolton Valley.
  - `snocountry_adapter.py`: Resilient fallback syndication feed.
- `.github/workflows/daily-scraper.yml`: Scheduled GitHub Actions runner triggering daily at 7:00 AM EST during winter months.

#### 2. Frontend Application (`src/`)
- `App.jsx`: State management (selected date, active filter mode, selected resort modal/view).
- `components/Header.jsx`: Branding, navigation, and pre-season status indicator.
- `components/TripPlanner.jsx`: Interactive date slider, quick holiday buttons, filter tabs (All Terrain, Glade Priority, Snowmaking Fortress), and ranked resort card grid.
- `components/ResortCard.jsx`: High-level summary of expected % open, confidence range, glade readiness meter, and top rare run preview.
- `components/ResortDetailModal.jsx`: Deep dive with:
  - Canvas/SVG progression chart showing median curve, 10th-90th percentile envelope, and glade probability curve.
  - Terrain composition breakdown bar (Snowmaking Cruisers vs. Natural Cruisers vs. Glades).
  - Signature Run Milestone list with holiday odds gauges.
- `components/ResortComparison.jsx`: Side-by-side comparative table for all 10 mountains.
- `styles/`: Clean Vanilla CSS design system with mountain-slate dark mode, snow accents, and responsive layout.

---

## 5. Data Schema (`vermont_ski_baseline.json`)

```json
{
  "generated_at": "2026-09-25T00:00:00Z",
  "season": "2026-2027",
  "resorts": [
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
        "average_snowfall_in": 359
      },
      "timeline": [
        {
          "date": "12-15",
          "median_open_pct": 38,
          "p10_open_pct": 20,
          "p90_open_pct": 65,
          "glade_probability": 0.22,
          "snowmaking_pct": 75,
          "natural_pct": 25
        }
      ],
      "iconic_runs": [
        {
          "name": "The Beaver Glade",
          "type": "Glade",
          "difficulty": "Expert",
          "min_base_in": 34,
          "median_open_date": "01-08",
          "earliest_date": "12-18",
          "latest_date": "01-26",
          "holiday_odds": {
            "christmas": 0.35,
            "mlk_weekend": 0.85,
            "presidents_day": 0.98,
            "spring_break": 0.95
          }
        }
      ]
    }
  ]
}
```

---

## 6. Error Handling & Edge Cases

1. **Off-Season / Pre-Season Access**:
   - The site operates completely from the pre-computed historical baseline and displays clear contextual badges (`Pre-Season Historical Model: Based on 15+ Years of Snowpack & Terrain Records`).
2. **Missing or Altered Resort Feeds**:
   - The scraper engine includes try/catch wrappers around each resort adapter and falls back to the unified SnoCountry/Ski Vermont syndication feed.
3. **Extreme Weather Anomalies (Thaws / Polar Vortex)**:
   - When live weather is active, high-tide and low-tide bounds (10th and 90th percentiles) allow the user to see both best-case nor'easter years and worst-case thaw years.
4. **Offline / Slow Connectivity**:
   - Frontend dataset is compressed to under 200KB and cached via browser Service Worker/HTTP cache for instant reload on mobile devices.

---

## 7. Verification & Testing Strategy

1. **Baseline Generator Unit Tests**:
   - Validate that all 10 resorts have 150 daily data points (Nov 15 to Apr 15).
   - Ensure probability values stay bounded in $[0.0, 1.0]$.
   - Verify that 10th percentile $\le$ 50th percentile $\le$ 90th percentile for all dates.
2. **Frontend UI Verification**:
   - Validate date scrubber smoothly updates ranked cards and charts without jank.
   - Verify responsive behavior on both desktop (1440px) and mobile (375px/390px).
   - Verify modal opens and closes cleanly with accessible keyboard/escape controls.
3. **Scraper Dry-Run**:
   - Execute each scraper module to confirm network resilience and schema compliance.
