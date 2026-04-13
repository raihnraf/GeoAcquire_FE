---
phase: 2
slug: map-core
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-12
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test -- --run` |
| **Full suite command** | `npm test:all` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run`
- **After every plan wave:** Run `npm test:all`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | MAP-06 | — | N/A | unit | `npm test -- --run LoadingSkeleton` | ✅ Plan 01 | ⬜ pending |
| 02-01-02 | 01 | 1 | MAP-07 | — | N/A | unit | `npm test -- --run EmptyState` | ✅ Plan 01 | ⬜ pending |
| 02-01-03 | 01 | 1 | Wave 0 stubs | — | N/A | integration | `npm test -- --run` | ✅ Plan 01 | ⬜ pending |
| 02-02-01 | 02 | 2 | MAP-04 | — | N/A | unit | `npm test -- --run MapHeader` | ✅ Plan 01 | ⬜ pending |
| 02-03-01 | 03 | 3 | MAP-01 | — | N/A | integration | `npm test -- --run MapView` | ✅ Plan 01 | ⬜ pending |
| 02-03-02 | 03 | 3 | MAP-02 | — | React auto-escapes parcel properties | unit | `npm test -- --run ParcelLayer` | ✅ Plan 01 | ⬜ pending |
| 02-03-03 | 03 | 3 | MAP-03 | — | N/A | unit | `npm test -- --run ParcelLayer` | ✅ Plan 01 | ⬜ pending |
| 02-03-04 | 03 | 3 | MAP-05 | — | N/A | unit | `npm test -- --run MapStatusBar` | ✅ Plan 01 | ⬜ pending |
| 02-04-01 | 04 | 4 | MAP-03 | — | N/A | unit | `npm test -- --run ParcelSidebar` | ⬜ N/A | ⬜ pending |
| 02-05-01 | 05 | 5 | Integration | — | N/A | integration | `npm test -- --run` | ⬜ N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `src/components/map/__tests__/MapView.test.tsx` — stubs for MAP-01 (created in Plan 01 Task 2)
- [x] `src/components/map/__tests__/ParcelLayer.test.tsx` — stubs for MAP-02, MAP-03 (created in Plan 01 Task 2)
- [x] `src/components/map/__tests__/MapHeader.test.tsx` — stubs for MAP-04 (created in Plan 01 Task 2)
- [x] `src/components/map/__tests__/MapStatusBar.test.tsx` — stubs for MAP-05 (created in Plan 01 Task 2)
- [x] `src/components/map/__tests__/LoadingSkeleton.test.tsx` — stubs for MAP-06 (created in Plan 01 Task 2)
- [x] `src/components/map/__tests__/EmptyState.test.tsx` — stubs for MAP-07 (created in Plan 01 Task 2)
- [x] `src/test/map-test-utils.tsx` — shared map testing utilities (created in Plan 01 Task 2)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual verification of map tile rendering | MAP-01 | Tile rendering requires visual inspection | Open app, verify OSM tiles load correctly |
| Visual verification of polygon colors | MAP-02 | Color accuracy requires visual check | Create test parcels, verify green/yellow/red colors |
| Sidebar slide-in animation | MAP-03 | Animation smoothness is subjective | Click parcel, verify sidebar animates in smoothly |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
