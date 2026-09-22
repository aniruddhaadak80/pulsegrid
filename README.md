<div align="center">

# 🛰️ PulseGrid

**Live planetary risk intelligence — space weather × earthquakes × wildfires fused into one deterministic, hash-sealed Instability Index with MCP agent tools.**

[![Live Demo](https://img.shields.io/badge/demo-live-22d3ee?style=for-the-badge)](https://pulsegrid.vercel.app)
[![License: MIT](https://img.shields.io/badge/license-MIT-34d399?style=for-the-badge)](./LICENSE)
[![Next.js](https://img.shields.io/badge/next.js-16-black?style=for-the-badge)](https://nextjs.org)
[![Feeds](https://img.shields.io/badge/feeds-USGS_+_NOAA_+_EONET-fbbf24?style=for-the-badge)](#-data-feeds)
[![MCP](https://img.shields.io/badge/MCP-json--rpc-a78bfa?style=for-the-badge)](#-agent-interface)

[Live App](https://pulsegrid.vercel.app) · [API](https://pulsegrid.vercel.app/api/risk) · [MCP](https://pulsegrid.vercel.app/api/mcp) · [Issues](https://github.com/aniruddhaadak80/pulsegrid/issues)

</div>

## ✨ Features

- 🌍 **Library-grade 3D globe** (`react-globe.gl`): live quake points + pulse rings, disaster markers, solar-storm arcs, auto-rotate that pauses when you grab it
- ⚡ **3 live public feeds** (zero API keys): USGS earthquakes, NOAA space weather, NASA EONET disasters — cached API routes + sealed offline fallbacks
- 🧮 **Deterministic Instability Index 0–100** with itemized factors — the same function serves the UI, REST, and MCP
- 🤖 **MCP JSON-RPC** (`initialize` / `tools/list` / `tools/call`) + live in-page console proving it with one click
- 🔗 **Hash-chained seals** `SHA-384(prevSeal ‖ canonicalJson)` verifiable by replay
- 🌑 Dark-first glass design, live ticker, stats row, numbered narrative, custom scrollbar

## 🏗️ System architecture

```mermaid
flowchart LR
    U[USGS quakes] --> Q["/api/quakes"]
    N[NOAA SWPC] --> S["/api/space"]
    E[NASA EONET] --> D["/api/disasters"]
    Q --> G["computeRisk() engine"]
    S --> G
    D --> G
    G --> UI["Next.js page + 3D globe"]
    G --> R["/api/risk"]
    G --> M["/api/mcp tools"]
    classDef live fill:#22d3ee,color:#04060c
    classDef engine fill:#a78bfa,color:#04060c
    classDef agent fill:#34d399,color:#04060c
    classDef ext fill:#fbbf24,color:#04060c
    class U,N,E ext
    class Q,S,D live
    class G engine
    class UI,R agent
    class M agent
```

## 🌊 Data-pipeline flow

Each feed is fetched server-side with timeout + normalization; any failure falls back to a sealed offline sample so the build, demo, and first paint never break.

```mermaid
flowchart TB
    T[revalidate timer] --> F[fetch upstream]
    F --> OK{HTTP 200 + valid?}
    OK -->|yes| N[normalize + slice]
    OK -->|no| B[offline fallback sample]
    N --> E[FeedEnvelope + fetchedAt]
    B --> E
    E --> C[cached API response]
    classDef live fill:#22d3ee,color:#04060c
    classDef caution fill:#fbbf24,color:#04060c
    classDef infra fill:#94a3b8,color:#04060c
    class T,F,N,E live
    class OK,B caution
    class C infra
```

## 🧮 Engine / algorithm flow

```mermaid
flowchart LR
    M[max magnitude] --> P1[seismic energy 5-52]
    C[swarm count M4.5+] --> P2[swarm 0-18]
    K[Kp index] --> P3[geomagnetic 0-48]
    W[wind + Bz] --> P4[coupling 0-18]
    V[EONET categories] --> P5[disasters 0-30]
    P1 --> SUM[clamp sum 0-100]
    P2 --> SUM
    P3 --> SUM
    P4 --> SUM
    P5 --> SUM
    SUM --> LVL[Calm→Extreme + summary]
    classDef engine fill:#a78bfa,color:#04060c
    classDef live fill:#22d3ee,color:#04060c
    classDef risk fill:#fb7185,color:#04060c
    class M,C,K,W,V live
    class P1,P2,P3,P4,P5 engine
    class SUM,LVL risk
```

## 🤖 Agent (MCP) sequence

```mermaid
sequenceDiagram
    participant A as Agent
    participant M as /api/mcp
    participant E as computeRisk()
    A->>M: initialize
    M-->>A: capabilities + tools
    A->>M: tools/list
    M-->>A: get_live_risks, get_planetary_briefing, verify_seal
    A->>M: tools/call get_planetary_briefing
    M->>E: quakes + space + disasters
    E-->>M: briefing + seal
    M-->>A: JSON-RPC result
```

## 🔗 Integrity / seal chain

```mermaid
flowchart TB
    B[briefing body + prevSeal] --> J[canonicalJson sorted keys]
    J --> H["SHA-384 prevSeal + json"]
    H --> S[seal hex 96 chars]
    S --> V{verify_seal replay?}
    V -->|match| OK[trusted]
    V -->|mismatch| BAD[tampered]
    classDef agent fill:#34d399,color:#04060c
    classDef engine fill:#a78bfa,color:#04060c
    classDef risk fill:#fb7185,color:#04060c
    class B,J,H engine
    class S,V,OK agent
    class BAD risk
```

## 🚀 Deployment pipeline

```mermaid
flowchart LR
    P[push to main] --> CI[GitHub Actions: lint + build]
    CI --> V[vercel --prod]
    V --> H["/api/health check"]
    H --> F[feed checks count > 0]
    F --> M[MCP tools/list + briefing seal]
    M --> L[live alias verified]
    classDef infra fill:#94a3b8,color:#04060c
    classDef agent fill:#34d399,color:#04060c
    classDef live fill:#22d3ee,color:#04060c
    class P,CI,V infra
    class H,F live
    class M,L agent
```

## 🧭 User-journey flow

```mermaid
flowchart TB
    L[land on hero + score] --> T[read risk ticker]
    T --> G[spin 3D globe]
    G --> F[inspect factor cards]
    F --> A[run MCP console]
    A --> S[verify seal]
    classDef live fill:#22d3ee,color:#04060c
    classDef engine fill:#a78bfa,color:#04060c
    classDef agent fill:#34d399,color:#04060c
    class L,T,G live
    class F engine
    class A,S agent
```

## 🚀 Quickstart

```bash
git clone https://github.com/aniruddhaadak80/pulsegrid.git
cd pulsegrid
npm install
npm run dev   # zero env vars — open http://localhost:3000
```

## 🔌 API

```bash
curl https://pulsegrid.vercel.app/api/health
curl https://pulsegrid.vercel.app/api/quakes
curl https://pulsegrid.vercel.app/api/space
curl https://pulsegrid.vercel.app/api/disasters
curl https://pulsegrid.vercel.app/api/risk
curl -X POST https://pulsegrid.vercel.app/api/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
curl -X POST https://pulsegrid.vercel.app/api/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_planetary_briefing","arguments":{}}}'
```

Agent setup (`mcp.json` block — full manifest in `public/mcp.json`):

```json
{
  "mcpServers": {
    "pulsegrid": { "url": "https://pulsegrid.vercel.app/api/mcp", "transport": "json-rpc" }
  }
}
```

## 📁 Project map

| Path | What |
|---|---|
| `src/app/page.tsx` | Server page: fetches feeds, computes risk, numbered sections |
| `src/components/GlobeView.tsx` | `react-globe.gl` client globe (dynamic `ssr:false`) |
| `src/components/GlobeSection.tsx` | Client wrapper for the dynamic globe |
| `src/components/Hero.tsx` / `McpConsole.tsx` | Animated hero + one-click MCP proof |
| `src/lib/engine.ts` | Deterministic Instability Index (UI = API = MCP) |
| `src/lib/feeds.ts` / `fallback.ts` / `types.ts` | Live fetchers, offline samples, types |
| `src/lib/seal.ts` | SHA-384 chain + verify |
| `src/app/api/*/route.ts` | `health, quakes, space, disasters, risk, mcp` |

## 📡 Data feeds

- USGS Earthquake Hazards Program — `earthquake.usgs.gov` (GeoJSON, updated every minute)
- NOAA Space Weather Prediction Center — `services.swpc.noaa.gov` (K-index, plasma, mag)
- NASA EONET v3 — `eonet.gsfc.nasa.gov` (open wildfires, storms, volcanoes)

> ⚠️ Safety note: PulseGrid is an educational demo, not an official warning system. For real emergencies follow USGS / NOAA / local authorities.

## 🗺️ Roadmap

- [x] **Now — live + sealed + agentic** (this release: wow outcome = 10-second globe demo + one-click agent proof)
- [ ] **Next — alerts + history** (wow outcome = subscribe to a place and get a sealed push briefing)
- [ ] **Later — grid impact model** (wow outcome = per-grid-cell transformer/GPS risk overlay)

```mermaid
flowchart LR
    A[live feeds] --> B[history store]
    B --> C[alert subscriptions]
    C --> D[grid impact overlay]
    classDef live fill:#22d3ee,color:#04060c
    classDef engine fill:#a78bfa,color:#04060c
    classDef agent fill:#34d399,color:#04060c
    class A live
    class B,C engine
    class D agent
```

```mermaid
flowchart TB
    H[hourly snapshots] --> T[trend charts]
    T --> P[push briefings]
    classDef engine fill:#a78bfa,color:#04060c
    classDef agent fill:#34d399,color:#04060c
    class H,T engine
    class P agent
```

```mermaid
flowchart LR
    G[GPW grid cells] --> X[transformer risk]
    X --> O[overlay on globe]
    classDef risk fill:#fb7185,color:#04060c
    classDef live fill:#22d3ee,color:#04060c
    class G live
    class X,O risk
```

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). MIT licensed — see [LICENSE](./LICENSE). Security notes in [SECURITY.md](./SECURITY.md).
