# 📈 Real-time trading dashboard

A full-stack **coding challenge** implementation: a mock market engine powers **REST** and **WebSocket** APIs, and a **React + TypeScript** dashboard shows a live watchlist, **Recharts** price chart, and optional threshold **alerts**.

---

## 🎯 Objective

Build a **real-time trading dashboard** that displays live ticker prices and interactive charts for selected financial instruments—using a simulated or mock feed, clear API boundaries, and a responsive UI.

---

## ✨ What’s included

| Area | Highlights |
|------|------------|
| 🖥️ **Backend (Node.js)** | Mock market simulation, JWT-protected REST, WebSocket stream (`tick`, `alert`, `heartbeat`) |
| ⚛️ **Frontend (React + TS)** | Ticker list with live updates, symbol switching, Recharts time-series, responsive layout |
| ✅ **Quality** | Separated modules (`market/`, `services/`, `http/`, `ws/`), backend unit tests for cache and alerts |

---

## 🗺️ Challenge scope (mapped to this repo)

### ⚙️ Backend service

- 📡 **Mock market feed** — Random-walk style ticks for configured instruments (`backend/src/market/`).
- 🔌 **Real-time stream** — WebSocket: `GET ws://…/ws?token=JWT` with `tick`, `alert`, and `heartbeat` messages.
- 🌐 **REST API**
  - List tickers — `GET /api/tickers` (JWT).
  - Historical (mocked) series — `GET /api/tickers/:symbol/history?limit=&stepSec=` (JWT); short TTL in-process cache.

### 🎨 Frontend dashboard

- 📋 Ticker list with **live price updates** merged from the socket (`TickerList`, `useMarketDashboard`).
- 📊 **Interactive chart** for the selected symbol (`PriceChart` + Recharts).
- 🔀 **Switch between tickers** from the list.
- 📱 **Styling and responsiveness** — dashboard layout and CSS grid.

### 🏗️ Architecture & design

- 🧩 **Structure** — Microservice-friendly separation: market engine, HTTP routes, WebSocket layer, services (auth, alerts, history cache).
- 🧪 **Tests** — `npm test` in `backend/` (history cache + alert logic).
- 📦 **Docker** — Not wired in this submission; run with `npm` locally (see below).

### 🎁 Bonus features (implemented)

| Bonus | Notes |
|-------|--------|
| 🔐 **Mock authentication** | `POST /api/auth/login`, JWT on protected routes; demo accounts on the login UI / `demoAccounts.ts` |
| 💾 **Historical caching** | `HistoryCache` with TTL around built series |
| 🔔 **Price alerts** | Bands ~0.35% from each symbol’s base; `alert` events on WebSocket; dismissible toast-style UI |

**Not included:** ☸️ Kubernetes manifests (optional in the brief).

---

## 📋 Prerequisites

- **Node.js** ≥ 20  
- Two terminals (API + Vite dev server)

---

## ⚙️ Configuration

1. Copy environment for the API:

   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `backend/.env` — set `JWT_SECRET` to a long random string for production-like use.

Defaults: API **port 3001** (override with `PORT`). Optional: `MARKET_TICK_MS` (tick interval), `CORS_ORIGIN` (default `http://localhost:5173`).

For the frontend, copy `frontend/.env.example` to `frontend/.env.development` if you need to override API/WebSocket URLs (Vite dev server proxies `/api` and `/ws` to `localhost:3001` by default).

---

## 🚀 Run locally

**Terminal 1 — backend**

```bash
cd backend
npm install
npm run dev
```

**Terminal 2 — frontend**

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL (usually **http://localhost:5173**). Sign in with a **demo account** from the login page (or `frontend/src/features/auth/demoAccounts.ts`). The app loads tickers/history over REST and opens the WebSocket with the stored JWT.

---

## 🧪 Tests

Backend (Node.js native test runner):

```bash
cd backend
npm test
```

Frontend: use `npm run build` and `npm run lint` as needed; there is no separate frontend test suite yet.

---

## 📁 Project layout

| Path | Role |
|------|------|
| `backend/` | Express HTTP, WebSocket server, market simulation, auth, alerts, cache |
| `backend/src/http/routes/` | REST route definitions |
| `backend/src/ws/marketSocket.ts` | WebSocket protocol |
| `frontend/` | Vite + React, auth, dashboard, Recharts |

---

## ⚖️ Assumptions and trade-offs

- **Prices are simulated**, not live market data. Alert bands use each instrument’s base price so crossings occur under normal mock volatility.
- **JWT in `localStorage`** is acceptable for a challenge; production would favor httpOnly cookies, CSRF, and refresh flows.
- **Historical cache** is in-process with a short TTL — fine for a single instance, not a distributed cluster without shared storage.
- **Docker/Kubernetes** are omitted; the app is intended to run via `npm` as above.

---

## ✅ Evaluation criteria (how this repo addresses them)

| Criterion | Approach |
|-----------|----------|
| Code quality & structure | Layered backend modules; typed React hooks and components |
| Real-time handling | WebSocket ticks merged into dashboard state |
| API & WebSocket | REST for tickers/history; WS for live updates and alerts |
| UI responsiveness | Responsive grid, interactive chart and list |
| Tests & documentation | Backend unit tests; this README + inline route/socket code |

---

## 📄 License / submission

Submitted as a **GitHub repository** with this README covering overview, assumptions, how to run tests, and bonus features—as requested in the challenge brief.
