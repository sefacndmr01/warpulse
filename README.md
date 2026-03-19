# Warpulse

Real-time conflict event tracking platform. Users report events (attacks, airstrikes, missile launches, protests, political developments) on an interactive world map. No registration required. Submissions are AI-verified via Groq (Llama 3.3) and reviewed by moderators.

## Stack

- **Nuxt 4** — frontend with Vue 3 + TypeScript
- **Supabase** — PostgreSQL + Realtime WebSocket subscriptions
- **Supabase Edge Functions** — Deno-based serverless API (`supabase/functions/`)
- **Leaflet + CartoDB** — map tiles (light/dark)
- **Tailwind CSS** — styling
- **Groq** — free AI verification (Llama 3.3 70B)

## Setup

### 1. Install

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in your `.env`:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
GROQ_API_KEY=your-groq-api-key
ADMIN_PASSWORD=your-admin-password
NUXT_PUBLIC_GTAG_ID=G-XXXXXXXXXX
```

Get a free Groq API key at [console.groq.com](https://console.groq.com).

### 3. Database

Apply all migrations to your Supabase project:

```bash
npx supabase db push
```

Then seed demo data:

```bash
npx supabase db query --linked -f supabase/seed.sql
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment (Vercel)

```bash
npm run build
```

Set the following environment variables in your Vercel project settings:

```
SUPABASE_URL          # required — @nuxtjs/supabase reads this at build time
SUPABASE_ANON_KEY
NUXT_PUBLIC_GTAG_ID
```

## Features

- **Live Map** — world map with color-coded markers, click for detail popups
- **Event Feed** — Latest/Popular sorted list with full detail view and discussion
- **AI Verification** — Groq Llama 3.3 checks submissions; verified events show badge
- **Report Event** — 2-step form: fill details → pick location on mini-map
- **Realtime** — Supabase WebSocket subscriptions, no polling
- **Voting** — IP-based upvote/downvote per event (one vote per IP, stored as SHA-256 hash)
- **Moderation** — admin queue for pending events, discussions, and reports
- **No registration** — fully anonymous submissions and discussion
- **Light/Dark** — CartoDB Positron and DarkMatter map tiles

## Event Types

Attack · Missile · Airstrike · Explosion · Political · Protest · Ceasefire · Humanitarian · Displacement · Other

## Architecture

```
Browser
  └─ Nuxt 4 (app/)
       ├─ layouts/default.vue      sidebar + map, always mounted
       ├─ pages/map.vue            full-width map view
       ├─ pages/event/[id].vue     event detail (map route)
       ├─ pages/archive/           searchable event archive (no map)
       ├─ pages/admin/             moderation queue (password-protected)
       └─ composables/
            ├─ useEvents           shared state + Realtime subscription
            ├─ useSubmit           2-step submit form state
            ├─ useEdge             typed fetch wrapper for Edge Functions
            ├─ useTheme            light/dark toggle + localStorage
            └─ useEventTypes       event type config + marker SVG

Supabase
  ├─ Tables: events, discussions, reports, votes
  ├─ RLS: anon read (all statuses for Realtime), open insert
  ├─ Realtime: events, discussions, reports publications
  └─ Edge Functions (`supabase/functions/`):
       ├─ events          GET list / GET archive / POST submit / POST vote / POST report
       ├─ discussions     GET by event / POST new
       ├─ admin           login / queue / approve / reject / resolve
       └─ verify-event    Groq AI check → auto-approve if confidence ≥ 0.75
```
