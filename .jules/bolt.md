# Bolt's Journal

Critical learnings only.

## 2026-11-09 - Debouncing Search and Calculator Inputs
**Learning:** In a vanilla ES module sports prediction SPA with large DOM cards and complex rendering (calculating odds, profit, telemetry fever bar, and star ratings on every render), firing full re-renders synchronously on every keystroke (`input` event) causes noticeable typing latency and layout thrashing.
**Action:** Always debounce search (`150ms`) and stake input (`100ms`) using a lightweight utility function to allow smooth typing without lagging main-thread layout and DOM operations.
