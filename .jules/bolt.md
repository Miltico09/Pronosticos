# Bolt's Journal

Critical learnings only.

## 2026-11-09 - Debouncing Search and Calculator Inputs
**Learning:** In a vanilla ES module sports prediction SPA with large DOM cards and complex rendering (calculating odds, profit, telemetry fever bar, and star ratings on every render), firing full re-renders synchronously on every keystroke (`input` event) causes noticeable typing latency and layout thrashing.
**Action:** Always debounce search (`150ms`) and stake input (`100ms`) using a lightweight utility function to allow smooth typing without lagging main-thread layout and DOM operations.

## 2026-11-10 - Reusing Intl.DateTimeFormat in High-Frequency Timers
**Learning:** Instantiating `Intl.DateTimeFormat` inside a 1-second `setInterval` loop creates unnecessary garbage collection churn and internal ICU/locale re-initialization. Additionally, updating `textContent` blindly every tick triggers style/layout invalidations even when text hasn't changed.
**Action:** Always instantiate `Intl.DateTimeFormat` once outside ticking loops, cache pre-parsed target timestamps on element objects to avoid repeated `new Date()` calls, and guard `textContent` assignments with strict equality checks (`if (el.textContent !== nextText)`).

## 2026-11-11 - In-Memory Cache for Client-Side Master Feeds
**Learning:** When client-side SPA architectures rely on `localStorage` as their primary persistence and state store, calling `getAllMasterFeed()` on every UI render, tab switch, filter toggle, and share action causes repetitive synchronous `localStorage.getItem()` and `JSON.parse()` on multi-kilobyte records (~29KB). This blocks the main JavaScript thread, burns CPU cycles on redundant string parsing, and generates massive heap churn.
**Action:** Always wrap `localStorage`-backed feed accessors in a module-scoped in-memory cache variable (`masterFeedCache`). Return the in-memory array directly, updating it only upon explicit write/mutation (`saveMasterFeed()`) or database resets (`resetLocalDatabase()`).
