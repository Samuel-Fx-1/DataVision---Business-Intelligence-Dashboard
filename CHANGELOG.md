# DataVision Changelog

## Version 3.0 (Latest) - Next.js Rebuild
**Date**: 2026

### Complete Rebuild
The static HTML/CSS/JS site was rebuilt as a **Next.js 15 (App Router) + React 19**
application running on Node.js. `css/style.css` was carried over **unchanged**.

#### Stack
- Next.js 15.5 App Router, React 19, TypeScript strict mode
- Chart.js 4 as an npm dependency (was a CDN `<script>`)
- Next.js Route Handlers for the backend

#### Structure
- `app/layout.tsx` — root layout, Google Fonts + Font Awesome, stylesheet import
- `app/page.tsx` — server component rendering the dashboard (`force-dynamic`)
- `app/api/dashboard/route.ts` — `GET ?period=7d|1m|3m|1y|all`
- `app/api/stream/route.ts` — `GET` activity feed
- `app/api/subscribe/route.ts` — `POST` with server-side email validation
- `components/` — 11 components (client + server)
- `lib/data.ts` — server data source; `lib/chartConfigs.ts` — Chart.js configs
- `legacy/` — original static version kept for reference

#### New Backend Functionality
- **Time filters now work** — each of 7D / 1M / 3M / 1Y / ALL fetches real data from
  `GET /api/dashboard` (was a `console.log` stub)
- **Subscribe endpoint** — email validated server-side, `400` on invalid,
  duplicate detection (was an `alert()`)
- **Invalid period rejected** with `400`

#### Behavioural Parity Notes
Deliberate deviations from the original vanilla JS, all documented in the README:
- Total Revenue counter drops its `$` prefix (reproduced from the original)
- KPI card reveal relies on the CSS animation alone, preserving per-card stagger
- Live indicators use the CSS `@keyframes pulse` only (the JS was fighting it)
- Mobile menu toggle logic de-inverted; inline styles converted to React objects
- `href="#"` placeholder links are inert instead of throwing on `querySelector('#')`
- Default period is 1Y so the active filter matches the rendered data
- Parallax opacity clamped at 0

---

## Version 2.2 - Chart Grid Redesign
**Date**: 2024

### 🎨 Major Changes

#### Chart Section Redesign
- **Layout**: Changed from 2-column (with 1 full-width) to symmetric 3×2 grid
- **Chart Count**: 6 charts (was 5)
- **Chart Size**: All charts now uniform 320px height (was 350px with one large)
- **Visual Harmony**: Perfect symmetry with 3 columns × 2 rows

#### New Chart Added
**Traffic Sources Chart**
- Type: Multi-line chart
- Data Series: 3 (Organic Search, Direct, Social Media)
- Time Range: 24-hour traffic pattern (00:00 - 24:00)
- Colors: 
  - Organic Search: Tech Blue (#00D9FF)
  - Direct: Data Green (#00FFA3)
  - Social Media: Warning Orange (#FF6B35)
- Features: Gradient fills, smooth curves, interactive legend

#### Layout Improvements
- **Grid**: 3 columns on desktop (1200px+)
- **Gap**: Reduced to 25px (was 30px) for tighter composition
- **Padding**: Reduced card padding to 25px (was 30px)
- **Hover Effect**: Added translateY(-3px) elevation on hover
- **Removed**: `.chart-card.large` class no longer needed

#### Responsive Breakpoints
1. **Desktop (1200px+)**: 3-column grid
2. **Tablet (641px - 1199px)**: 2-column grid, gap 20px
3. **Mobile (≤640px)**: 1-column grid, gap 15px

### 📊 Complete Chart List
1. **Revenue Trend** - Line chart (2024 vs 2023)
2. **User Growth** - Bar chart with gradient
3. **Sales by Category** - Doughnut chart (6 categories)
4. **Performance Metrics** - Radar chart (6 metrics)
5. **Market Share** - Polar area chart (4 quarters)
6. **Traffic Sources** - Multi-line chart (3 sources)

---

## Version 2.1 - Layout Optimization
**Date**: 2024

### 🛠️ Bug Fixes & Improvements

#### Hero Section Visibility
- **Fixed**: Title text being obscured by geometric decorations
- **Enhanced**: Z-index layering (content: 100, decorations: 1)
- **Added**: Radial gradient background to hero-content
- **Improved**: All text shadow effects for better contrast

#### Geometric Decorations
- **Optimized**: Line positions to avoid text overlap
- **Reduced**: Line lengths (60% → 45%)
- **Adjusted**: Opacity (0.1 → 0.08) for subtler effect
- **Repositioned**: All 4 decoration lines

#### Text Enhancements
- **Hero Badge**: Added background, border glow, text shadow
- **Title**: Enhanced shadow with multiple layers
- **Accent Dot (·)**: Triple-layer glow effect
- **Brackets [ ]**: Increased opacity and glow (0.5 → 0.7)
- **Statistics Cards**: Glassmorphism background with blur

#### Responsive Adjustments
- **Desktop**: padding 60px 40px
- **Tablet**: padding 40px 25px
- **Mobile**: padding 30px 20px

---

## Version 2.0 - Major Design Overhaul
**Date**: 2024

### 🎨 Design System Update

#### Hero Section Redesign
**New Elements:**
- `[REAL-TIME ANALYTICS]` badge with decorative dots
- Split title: "DATA·DRIVEN" / "[INSIGHTS]"
- Gradient text effect on "INSIGHTS"
- Bracket decorations [ ]
- Large dot separator (·)
- Monospace subtitle with bracket symbols
- Numbered tagline: "01 | Transform..."

**Enhanced Statistics:**
- Symbol prefixes: $, #
- Symbol suffixes: K, +, %
- Animated scanning lines under each stat
- Individual glassmorphism cards
- Enhanced glow effects

#### Background Layer
**Data Elements:**
- Binary code sequences
- Business metrics (2847, 99.8%, $2.8M, etc.)
- Tech keywords (AI, ML, BI, API, JSON, etc.)
- Rotating animation (-15deg)
- Low opacity (0.05) tech-blue color
- 180s scroll animation

#### Typography System
- **Logo**: Bordered box style
- **Badge**: Roboto Mono with dots
- **Title**: Montserrat 900, 24px letter-spacing
- **Gradient Text**: White → Tech Blue → Data Green
- **Subtitle**: Roboto Mono with brackets
- **Numbers**: Roboto Mono Bold with symbols

#### Chart Addition
- Added 5th chart: Market Share (Polar Area)

---

## Version 1.0 - Initial Release
**Date**: 2024

### ✨ Core Features

#### Components
- Hero section with city skyline background
- KPI Dashboard (4 cards)
- Chart section (4 charts initially)
- Data comparison module
- Real-time data stream
- Subscription form
- Footer

#### Charts (Initial 4)
1. Revenue Trend
2. User Growth
3. Sales by Category
4. Performance Metrics

#### Design System
- Color palette: Deep cyan gray, tech blue, data green
- Glassmorphism cards
- Geometric decorations
- Smooth animations
- Responsive design

#### Technology Stack
- HTML5, CSS3, JavaScript ES6+
- Chart.js for visualizations
- Google Fonts (Montserrat, Poppins, Inter, Roboto Mono)
- Font Awesome 6 icons

---

## Summary of Progress

### Chart Evolution
- v1.0: 4 charts in 2-column grid
- v2.0: 5 charts (added Market Share)
- v2.2: 6 charts in perfect 3×2 symmetric grid ✨

### Design Evolution
- v1.0: Traditional corporate style
- v2.0: Data science theme with symbols and effects
- v2.1: Enhanced visibility and layering
- v2.2: Perfect visual balance and harmony ✨

### Layout Quality
- v1.0: Functional but asymmetric
- v2.0: Enhanced but unbalanced (1 large + 4 small)
- v2.2: Perfect symmetry and visual harmony ✨

---

**Current Version**: 2.2
**Total Charts**: 6
**Layout**: 3×2 Grid (Perfect Symmetry)
**Status**: Production Ready ✨
