# 🏔️ Vermont Ski Terrain & Glade Predictor

[![CI — Build, Test & Verify](https://github.com/butterhc/ski-resort-conditions/actions/workflows/ci.yml/badge.svg)](https://github.com/butterhc/ski-resort-conditions/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Live Site](https://img.shields.io/badge/Live_Site-GitHub_Pages-brightgreen)](https://butterhc.github.io/ski-resort-conditions/)

A high-performance web application designed to help East Coast skiers and riders plan trips to Vermont ski resorts with confidence. It visualizes calibrated terrain availability, glade opening readiness, and seasonal progression curves across Vermont's top 10 ski destinations from **October 15 through June 1**.

🔗 **Live Demo:** [https://butterhc.github.io/ski-resort-conditions/](https://butterhc.github.io/ski-resort-conditions/)

---

## ✨ Features

- **📅 Season Timeline Scrubber (Oct 15 – Jun 1):** Continuous range scrubber spanning over 220+ days of the ski season, complete with quick holiday presets (*First Turns*, *Holiday Week*, *MLK Weekend*, *Presidents' Day*, and *Spring Moguls*).
- **📊 10th / 50th / 90th Percentile Projections:** Evaluates realistic terrain ranges (p10 pessimistic, p50 median, p90 optimistic) rather than relying on single-point guesses.
- **🌲 Woods & Glades Readiness Gauge:** Instant toggle to re-rank all 10 mountains specifically for natural snow coverage and off-piste tree skiing viability.
- **📈 Interactive SVG Seasonal Progression Curves:** Modal deep dive featuring full-season curves with confidence envelopes, snowmaking vs. natural terrain composition bars, and date cursors.
- **🔓 Signature & Rare Terrain Unlock Tracker:** Probability odds and base-depth thresholds for iconic East Coast trails (*The Beaver Glade*, *Goat*, *The Black Hole*, *Castlerock Liftline*, *Paradise*, *Outer Limits*, *Ripcord*, etc.).
- **📋 Multi-Resort Comparison Matrix:** Sortable, multi-column matrix with regional filtering (Northern Powder Spine vs. Central & Southern Hubs).
- **♿ Accessible & Mobile-First:** WCAG 2.1 AA compliant keyboard navigation (`:focus-visible` rings, ARIA roles, escape-key modal trapping) and fully responsive mountain-slate dark mode design.

---

## 🏔️ Resorts Covered

1. **Jay Peak Resort** (Northern Vermont)
2. **Stowe Mountain Resort** (Northern Vermont)
3. **Smugglers' Notch** (Northern Vermont)
4. **Bolton Valley** (Northern Vermont)
5. **Mad River Glen** (Central Vermont)
6. **Sugarbush Resort** (Central Vermont)
7. **Killington Resort** (Central Vermont)
8. **Okemo Mountain Resort** (Southern Vermont)
9. **Stratton Mountain** (Southern Vermont)
10. **Mount Snow** (Southern Vermont)

---

## 🛠️ Architecture & Tech Stack

```text
├── pipeline/
│   └── generate_baseline.py    # Python calibrated baseline estimation engine
├── public/
│   └── data/
│       └── vermont_ski_baseline.json  # Pre-compiled, gzipped 36KB JSON payload
├── src/
│   ├── components/             # React UI components (DateScrubber, Modal, SVG Charts, etc.)
│   ├── utils/                  # Timeline & date mathematics utilities
│   └── index.css               # Mountain-slate design system tokens
└── .github/workflows/
    └── ci.yml                  # Quality gates (pytest, build, audit, and GitHub Pages deploy)
```

- **Frontend:** React 19, Vite, Vanilla CSS design tokens (mountain-slate dark theme), SVG visualization
- **Data Engine:** Python 3.13, `pytest`, `pydantic`, `requests`, `beautifulsoup4`
- **CI/CD & Hosting:** GitHub Actions with SHA-pinned actions, GitHub Pages static hosting

---

## 🚀 Quickstart & Local Development

### Prerequisites
- Node.js 20+
- Python 3.13+

### 1. Clone the repository
```bash
git clone https://github.com/butterhc/ski-resort-conditions.git
cd ski-resort-conditions
```

### 2. Run the Frontend
```bash
npm install
npm run dev
```
Open [http://localhost:5173/ski-resort-conditions/](http://localhost:5173/ski-resort-conditions/) in your browser.

### 3. (Optional) Run the Python Baseline Engine
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run test suite
pytest tests/ -v

# Re-generate the baseline dataset
python pipeline/generate_baseline.py --season 2026
```

### 4. Build for Production
```bash
npm run build
npx vite preview --port 4173
```

---

## 📄 Data Transparency Notice

The baseline dataset produces calibrated estimates synthesized from expert-curated resort profiles, historical snowmaking infrastructure, terrain taxonomy, and regional orographic factors. All probabilities and progression curves represent informed approximations designed for seasonal planning, not real-time ski patrol reports. Real historical data ingestion (Mount Mansfield Snow Stake archives, NOAA GHCN-Daily) and live scraper overlays are planned for Phase 2.

---

## 📜 License

Distributed under the [MIT License](LICENSE).
