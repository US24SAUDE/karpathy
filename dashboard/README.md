# CLAUDE OS — Mission Control

A locally-hosted, dopamine-inducing operating system for orchestrating Claude
and a fleet of AI agents. An animated command center with a boot sequence,
aurora glassmorphism, live telemetry, draggable agent windows, a `⌘K` command
palette, and a real Claude console.

Built with **Next.js**, **Tailwind CSS**, and **Framer Motion**.

![stack](https://img.shields.io/badge/Next.js-15-black) ![stack](https://img.shields.io/badge/Tailwind-4-38bdf8) ![stack](https://img.shields.io/badge/Framer_Motion-11-ec4899)

## Features

- **Boot sequence** — animated OS cold-start.
- **Mission Control** — KPI counters, system vitals (animated rings),
  live throughput sparklines, and the full agent fleet at a glance.
- **Agent Fleet** — six autonomous agents (Atlas, Nova, Orion, Echo, Sentinel,
  Forge), each with live CPU/MEM/token telemetry. Click any node to open its
  draggable control surface with a live log stream and pause / restart / halt
  controls.
- **Activity Stream** — a unified, live event timeline across the lattice.
- **Analytics** — weekly throughput bars, per-agent token share, and a
  real-time inference chart.
- **Claude Console** — a real chat link to Claude. Add your Anthropic API key in
  Settings and it talks to the live Messages API; without a key it runs in a
  graceful simulation mode.
- **Command palette** — press `⌘K` / `Ctrl+K` to jump anywhere.

## Run it

```bash
cd dashboard
npm install
npm run dev
```

Open **http://localhost:3000**.

## Connecting your Claude

1. Open **Settings** in the dock.
2. Paste your Anthropic API key (`sk-ant-...`) and hit **Save**.

The key is stored only in your browser's `localStorage` and is sent solely to
the local `/api/chat` route, which proxies directly to Anthropic. You can also
set `ANTHROPIC_API_KEY` in the environment as a server-side fallback.

> Telemetry (agents, metrics, activity) is simulated for a vivid demo. The
> Console is the live link to Claude.
