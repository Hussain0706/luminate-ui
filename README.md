# Luminate UI — Multi-Agent Workflow Simulator & Visual LLM Playground

> **100% Browser-Based • Zero Backend • Zero Paid API Keys • React 19 + TypeScript + Tailwind CSS + Zustand + React Flow (`@xyflow/react`)**

---

## 🌟 Overview

**Luminate UI** is a visual playground and execution simulator for complex, directed multi-agent LLM systems. It operates **100% client-side inside the user's browser tab**, requiring **zero backend servers** and **zero paid API keys** (no OpenAI, Anthropic, or external credits required).

It features a **Dual-Mode Execution Engine**:
1. **Simulated Agent Engine (Default, Instant, Zero-Download):** An async generator engine simulating autonomous multi-agent reasoning, realistic token streaming speeds (35–70+ T/s), simulated DOM scraping actions, and structured JSON handoffs.
2. **Real Browser AI Mode (WebGPU Local SLM):** Integrates `@mlc-ai/web-llm` running open-weight models (`Qwen2.5-0.5B-Instruct` or `SmolLM2-360M-Instruct`) directly on the user's device GPU via WebGPU, complete with model weight caching in browser storage and live download progress tracking.

---

## 🚀 Key Features

### 1. Left Sidebar: "Agent Hub"
- **Click-to-Add Agent Nodes:**
  - 🧭 **Supervisor Agent:** Orchestrates graph execution, breaks down goals, and manages agent task schedules.
  - 🌐 **Web Scraper Agent:** Navigates mock browser DOMs, extracts text, attributes, and structured tables.
  - 🛡️ **Router / Guardrail Agent:** Evaluates confidence scores and decides conditional branches (`if/else`).
  - 📖 **Fact Researcher Agent:** Queries historical records, SKU databases, and verification archives.
  - 📝 **Summary Writer Agent:** Synthesizes verified data into executive markdown intelligence reports.
- **Preset Workflow Templates:**
  - **Competitor Pricing Analysis:** Scrapes competitor prices, verifies discounts, routes high-variance SKUs through deep verification, and produces an executive memo.
  - **Automated Fact-Checker:** Breaks down viral claims, crawls article citations, evaluates credibility scores, and issues empirical ratings.
- **Engine Switcher:** Seamlessly toggle between Instant Simulated Mode and WebGPU Local SLM.

### 2. Center Top: "Multi-Agent Node Canvas"
- **Built with `@xyflow/react`:**
  - Live animated status badges: `IDLE`, `THINKING`, `TOOL_CALL`, `AWAITING_APPROVAL`, `DONE`, `ERROR` with neon glowing borders.
  - **Conditional Branching Edges:** SVG bezier edges with glowing pulse animations and condition badges (`if confidence < 80%` vs `else (confidence ≥ 80%)`).
  - **Human-in-the-Loop Breakpoints:** Toggle a "Pause for Approval" pin on any node. When execution hits the breakpoint, the workflow pauses and opens an interactive modal to inspect and edit intermediate JSON handoffs before proceeding.
  - **Canvas Controls:** Interactive MiniMap, Zoom In/Out, Fit View, and State Reset.

### 3. Center Bottom: "Live Browser Sandbox Simulator"
- **Simulated Browser Window:**
  - Address bar (`https://store.hypertech.io/...` with SSL padlock).
  - Target page switcher (E-Commerce vs News Archive).
  - **Virtual Scraper Cursor:** When the Web Scraper Agent runs, a neon purple/blue virtual cursor glides across target elements, highlighting DOM elements in neon purple as it extracts pricing, specs, and citations.
  - **DOM Tree Inspector:** Click any element in the rendered preview or DOM hierarchy to inspect tags, attributes, text, and copy CSS selectors.
  - **Live Extracted JSON:** Real-time view of data extracted by the scraper.
  - **Height Toggle:** Maximize, normal (split view), or minimize to allocate canvas space.

### 4. Right Sidebar: "Task Orchestrator, Time-Travel & Visual Inspector"
- **Task Orchestrator:**
  - Goal input bar with Run, Pause, and Abort (`AbortController`) controls.
  - Speed multiplier buttons: `1x`, `2x`, `5x`.
- **Time-Travel Execution Scrubber:**
  - Scrub backward and forward across completed workflow steps to inspect past node states and memory snapshots at that exact moment in time!
- **Real-Time Telemetry:**
  - Live Token/Sec (`T/s`) gauge.
  - Total tokens counter.
  - Cost Counter: `$0.00 (100% Free Client-Side)`.
- **Live Streaming Terminal Logs:**
  - Color-coded log badges: `THOUGHT`, `TOOL`, `JSON`, `WARN`, `SYSTEM`, `ERROR`.
  - Filter chips and autoscroll.
- **Interactive JSON Payload Inspector:**
  - Collapsible syntax-highlighted tree, search filter, and edit-in-place mode for Human-in-the-Loop approval.
- **Export & Import:**
  - Export as **Mermaid Flowchart** (`.mmd`) or **Full JSON Schema** (`.json`).
  - Import external workflow JSON with one click.
  - Celebration confetti on workflow completion!

---

## ⚡ React Architecture & Performance

- **Finite-State Workflow Machine (`useReducer`):** Strict transitions (`IDLE` -> `RUNNING` -> `PAUSED_BREAKPOINT` -> `COMPLETED` -> `ABORTED`).
- **Concurrent React (`useTransition`):** High-frequency log updates and token streams run in non-blocking transitions so panning and zooming on the React Flow canvas remain buttery smooth.
- **Targeted Re-renders (`React.memo`):** Custom React Flow nodes use a fine-grained memo comparator so inactive nodes never re-render during active streaming on other nodes.
- **Error Boundaries:** Both the Browser Sandbox and JSON Inspector are wrapped in React Error Boundaries with fallback error cards and reset recovery buttons.

---

## 🛠️ Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Build for production
npm run build
```
