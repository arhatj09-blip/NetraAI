# NetraAI — Unified Social Intelligence Platform

NetraAI is an enterprise-grade, real-time social intelligence platform that continuously ingests, processes, and vectorizes signals across decentralized social channels (**X / Twitter**, **Reddit**, and **Telegram**).

The platform combines rich vector space visualizations (3D scatter plots), network topology mapping, sentiment dynamics, demographic inference, and live pipeline status monitoring.

---

## Key Features

1. **Global Dynamic Theming (Light / Dark)**:
   - Full CSS variable architecture supporting smooth transitions between Light and Dark mode.
   - Real-time adaptive re-theming for all Plotly 3D scatter plots and SVG indicators.
   - Theme persistence across sessions via `localStorage`.

2. **Pipeline Ingestion Status & Live Ticking Countdown**:
   - Live countdown timer (MM:SS) with animated circular SVG stroke dash showing the refresh cycle.
   - Continuous Ingestion Engine v2.4 stats: 274,392 records, 12 active clusters, 99.8% health index.
   - Dynamic batch updates and simulated sync recalculations.

3. **Platform Intelligence Cards**:
   - Three dedicated platform cards for X (Twitter), Reddit, and Telegram.
   - Quick access to platform-specific analysis with key statistics.
   - Direct navigation to detailed analysis pages.

4. **Entity Search & Diagnostic Analysis**:
   - Omnisearch bar for entities, hashtags, and tokens.
   - Trending quick-tag pills (`#AI`, `AI Agents`, `OpenAI`, `LLMOps`, `#AgentDev`).
   - Navigate to comprehensive analysis results page with query-specific insights.

5. **Analysis Results Page**:
   - **3D Social Intelligence Vector Space Map** powered by Plotly.js (Trend Velocity × Sentiment Score × Influence Index).
   - **Sentiment Dynamics Timeline**: Historical sentiment flow across platforms.
   - **Emotional Pulse Distribution**: Emotion sentiment breakdown.
   - Diagnostic signal cards: Most Positive Node, Risk Vector Detected, Trend Pivot Point.
   - Platform-specific vector space visualizations.

6. **Modals & Settings**:
   - Theme toggle (Light/Dark mode).
   - Intelligence Report Generator with export functionality.

---

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS + PostCSS + Autoprefixer
- **Visualizations**: Plotly.js (`plotly.js-dist-min`) + Cytoscape.js
- **Icons**: Lucide React
- **Fonts**: Plus Jakarta Sans, JetBrains Mono

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```

### 4. Preview Production Build
```bash
npm run preview
```

---

## Project Structure

```
NetraAI/
├── src/
│   ├── components/
│   │   ├── layout/         # Header, Footer
│   │   ├── hero/           # Pipeline Hero section
│   │   ├── platforms/      # Platform cards and analysis
│   │   ├── search/         # Search section
│   │   ├── charts/         # Plotly chart components
│   │   ├── crossPlatform/  # Cross-platform visualizations
│   │   └── modals/         # Settings and Report modals
│   ├── pages/
│   │   ├── Home.tsx        # Main dashboard page
│   │   └── AnalysisResults.tsx  # Query results page
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API and data services
│   ├── types/              # TypeScript type definitions
│   └── App.tsx             # Main app component with routing
├── public/                 # Static assets
└── package.json
```

---

## License

© 2026 NetraAI. All rights reserved.
