# DataVision - Business Intelligence Dashboard

A modern, professional business data visualization platform with enterprise-grade design,
real-time metrics, and interactive charts.

Rebuilt as a **Next.js (App Router) + React 19** application running on Node.js, with
`css/style.css` carried over **byte-for-byte unchanged** from the original static site.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

| Script              | Description                |
| ------------------- | -------------------------- |
| `npm run dev`       | Start the dev server       |
| `npm run build`     | Production build           |
| `npm start`         | Serve the production build |
| `npm run typecheck` | `tsc --noEmit`             |

## What changed in the rebuild

| Original (static)           | Rebuild (Node.js)                                             |
| --------------------------- | ------------------------------------------------------------- |
| `index.html` markup         | `app/page.tsx` + 11 components in `components/`               |
| `js/main.js` (~700 lines)   | React hooks/effects, split across components + `lib/`         |
| Hard-coded numbers in JS    | Server data layer in `lib/data.ts`                            |
| `console.log` time filter   | `GET /api/dashboard?period=` — filters now really reload data |
| `alert()` on subscribe      | `POST /api/subscribe` with server-side validation             |
| No backend                  | Next.js Route Handlers under `app/api/`                       |
| Chart.js via CDN `<script>` | `chart.js` npm package, instances managed by refs             |

`css/style.css` is untouched. It is imported by `app/layout.tsx` and continues to style the
page through the same class names and DOM structure.

### Notes on behavioural parity

A few small deviations from the original vanilla JS, all deliberate:

- **Counter on Total Revenue** — the original replaced the element's text, which silently
  dropped the leading `$`. Reproduced as-is for visual parity; the `initial="$0"` prop in
  `lib/data.ts` is the only trace of it. Remove the `initial` override plus the `>` 1000
  formatting rule in `components/Counter.tsx` if you want the `$` to persist.
- **KPI card reveal** — the original re-triggered `fadeInUp` from JS, which discarded the
  per-card stagger delays already defined in CSS. The rebuild relies on the CSS animation
  alone, so the stagger is preserved.
- **Live indicators** — the original toggled inline `opacity` every second on top of the
  CSS `@keyframes pulse`, fighting the animation. The rebuild uses the CSS keyframes only.
- **Mobile menu** — the original's toggle started inverted (first click showed an already
  visible menu) and its open state used `cssText`, which React does not support. The rebuild
  uses an equivalent inline `style` object; the button is still only injected at `≤640px`.
- **Placeholder links** — the original called `document.querySelector('#')` on every
  `href="#"` click, which throws. Those links are now inert instead of erroring.
- **Default period** — the 7D button shipped `active` while the charts displayed 12 months.
  The rebuild defaults to 1Y so the active filter always matches the rendered data.
- **Parallax opacity** is clamped at `0`; the original could go negative, which browsers
  treat as invalid and snap back to fully opaque.

## Project structure

```
datavision/
├── app/
│   ├── layout.tsx              # Root layout, fonts, stylesheet import
│   ├── page.tsx                # Server component, renders the dashboard
│   └── api/
│       ├── dashboard/route.ts  # GET  /api/dashboard?period=7d|1m|3m|1y|all
│       ├── stream/route.ts     # GET  /api/stream
│       └── subscribe/route.ts  # POST /api/subscribe  { email }
├── components/                 # React components (client + server)
├── lib/
│   ├── types.ts                # Shared domain types
│   ├── data.ts                 # Server-side data source
│   └── chartConfigs.ts         # Chart.js configurations (client-only)
├── css/
│   └── style.css               # UNCHANGED from the original
└── legacy/                     # Original static version, kept for reference
    ├── index.html
    └── js/main.js
```

## API

### `GET /api/dashboard?period=7d|1m|3m|1y|all`

Returns KPIs, chart series, comparison data, regions and the activity feed.
`400` on an unknown period.

```bash
curl "http://localhost:3000/api/dashboard?period=3m"
```

### `POST /api/subscribe`

```bash
curl -X POST http://localhost:3000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"analyst@example.com"}'
```

`201` on subscribe, `200` if already subscribed, `400` for a missing or invalid address.
Subscribers are held in memory — swap in a real datastore before deploying.

### `GET /api/stream`

Returns the activity feed used by the Live Data Stream section.

## Features

### Hero Section

- Full-screen immersive landing page with city skyline background
- Animated binary code and data elements floating background
- `[REAL-TIME ANALYTICS]` badge with decorative dots
- Title with gradient text effect and bracket decorations
- Statistics with `$` / `#` prefixes, `K` / `+` / `%` suffixes, animated scanning lines
- Geometric white line decorations, bounce scroll indicator, parallax scrolling

### Navigation System

- Fixed top navigation with glassmorphism backdrop blur
- Clean menu: HOME | SUBSCRIBE
- Vertical social sidebar, floating chat button
- Smooth scroll and active-state highlighting based on scroll position
- Collapsible mobile menu at `≤640px`

### KPI Dashboard

- 4 data cards: Total Revenue, Active Users, Total Orders, Conversion Rate
- Glassmorphism cards with hover glow, colour-coded change indicators
- Animated counters triggered on scroll into view

### Trend Analysis & Charts (3x2 grid)

- Time filters: 7D, 1M, 3M, 1Y, ALL — each period now loads real data from the API
- **Revenue Trend** — 2-dataset line chart with gradient fill
- **User Growth** — bar chart with gradient fills
- **Sales by Category** — doughnut chart with custom legend labels
- **Performance Metrics** — radar chart, current vs previous quarter
- **Market Share** — polar area chart
- **Traffic Sources** — 3-dataset line chart (Organic, Direct, Social)
- Uniform 320px chart containers, hover elevation

### Data Comparison Module

- Quarter-over-quarter horizontal bar comparison
- Regional performance with animated shimmer progress bars

### Real-time Data Stream

- Live activity feed with auto-updating timestamps
- Order, registration, payment, milestone and alert event types

### Subscription

- Email form posting to `/api/subscribe` with server-side validation
- Inline success/error feedback plus button confirmation
- Feature highlights: Weekly Reports, Secure & Private, No Spam

## Design system

### Colour palette

- **Primary Dark**: `#3C5563`
- **Secondary Dark**: `#2C4049`
- **Pure White**: `#FFFFFF`
- **Tech Blue**: `#00D9FF`
- **Data Green**: `#00FFA3`
- **Warning Orange**: `#FF6B35`
- **Card Background**: `rgba(44, 64, 73, 0.85)`

### Typography

- **Logo**: Poppins 300, letter-spacing 8px
- **Hero Badge / Subtitles / Data Numbers**: Roboto Mono
- **Main Titles**: Montserrat 900, letter-spacing 24px, gradient text
- **Body**: Inter

### Responsive breakpoints

- **Desktop Large**: 1200px+ (3 chart columns)
- **Desktop**: 968px – 1199px
- **Tablet**: 641px – 967px (2 chart columns)
- **Mobile**: ≤640px (1 chart column, collapsible nav)

## Not yet implemented

- Real database / WebSocket data source (`lib/data.ts` is the seam to replace)
- Authentication, saved dashboards, report scheduling
- PDF/CSV export, custom date ranges, dark/light toggle

## License

Created for demonstration purposes. Feel free to use and modify as needed.
