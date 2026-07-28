# PulseCareAI — Project State (saved 2026-07-28)

## Stack
Next.js 16.2.11 (App Router), React 19, Tailwind CSS v4, Shadcn UI, Framer Motion, Zustand, Dexie.js, Recharts, jsPDF, OpenRouter API (model: inclusionai/ling-3.0-flash:free)

## What is DONE (all files written)
- `src/lib/db.ts` — Dexie IndexedDB schema (UserProfile, HealthLog, Medication, MedicationLog, ChatMessage, TriageEvent)
- `src/lib/store.ts` — Zustand store with hydrate(), addHealthLog(), toggleMedication(), addChatMessage(), etc.
- `src/lib/resources.ts` — LOCAL_RESOURCES array of PHCs/clinics/emergency
- `src/app/layout.tsx` — Merriweather + Inter fonts, StoreProvider wrapping AppLayout
- `src/app/globals.css` — font-serif variable added
- `src/app/page.tsx` — Dashboard with bento grid, pulls from store
- `src/app/onboarding/page.tsx` — 3-step onboarding with react-hook-form + zod
- `src/app/triage/page.tsx` — wraps TriageForm
- `src/app/logs/page.tsx` — wraps HealthLogForm with Suspense + searchParams tab
- `src/app/analytics/page.tsx` — wraps AnalyticsCharts
- `src/app/chat/page.tsx` — full-height ChatInterface
- `src/app/reports/page.tsx` — PDF generation with jsPDF + AI summary
- `src/app/settings/page.tsx` — profile editing from store
- `src/app/api/triage/route.ts` — structured JSON triage prompt → HOME_CARE/CONSULT_48H/IMMEDIATE_FACILITY
- `src/app/api/chat/route.ts` — context-aware chat with language support
- `src/components/StoreProvider.tsx` — hydrates Zustand, redirects to /onboarding if no profile
- `src/components/NudgeBanner.tsx` — amber trend alert banner
- `src/components/layout/AppLayout.tsx` — skips chrome for /onboarding
- `src/components/layout/Header.tsx` — real store data, dynamic greeting
- `src/components/layout/Sidebar.tsx` — real store data, no mock dependency
- `src/components/dashboard/HealthSummaryCard.tsx` — live DB readings
- `src/components/dashboard/MedicationCard.tsx` — real DB + confetti on check
- `src/components/dashboard/StreakWidget.tsx` — real streak from store
- `src/components/dashboard/RecentActivityCard.tsx` — today's logs from store
- `src/components/triage/triageHelpers.tsx` — shared types, useSpeechRecognition, ResourceCard
- `src/components/triage/TriageForm.tsx` — 4-step wizard, voice input, structured AI result, facility cards
- `src/components/health-log/HealthLogForm.tsx` — condition-aware tabs, real DB writes, toast
- `src/components/chat/ChatInterface.tsx` — voice, bilingual, context injection, DB persistence
- `src/components/analytics/AnalyticsCharts.tsx` — 7-day real data, Recharts, reference lines
- `next.config.ts` — updated
- `package.json` — added: dexie, dexie-react-hooks, zustand, canvas-confetti, jspdf, html2canvas, @types/canvas-confetti

## REMAINING WORK (what still needs to be done)
1. Fix TriageForm: add `trigger` to useForm destructure; fix step-1 Next button to call `trigger("symptoms")` instead of manual check
2. Fix AnalyticsCharts: remove dead `useMemo` wrapper export function, keep only `AnalyticsChartsInner` exported as `AnalyticsCharts`
3. Run `npm install` to install new packages
4. Fix `src/app/help/page.tsx` — currently uses mock data, update to remove it
5. Verify build compiles with no errors

## Key patterns
- Store hydration: `StoreProvider` calls `store.hydrate()` once on mount
- All DB writes go through store actions, never direct DB calls from components (except AnalyticsCharts which needs 7-day data)
- OpenRouter key: in `.env.local` as `OPENROUTER_API_KEY`
- Onboarding guard: StoreProvider redirects `!profile && pathname !== "/onboarding"` → `/onboarding`
- TriageForm submit: `handleSubmit(async (data) => {...})` named `submitForm`, called via `onClick={() => submitForm()}`
