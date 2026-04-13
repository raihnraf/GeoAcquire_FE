---
phase: 4
slug: spatial-analysis
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-12
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2.x |
| **Config file** | vite.config.ts (test: vitest config) |
| **Quick run command** | `npm test -- --run` |
| **Full suite command** | `npm test -- --run --coverage` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run`
- **After every plan wave:** Run `npm test -- --run --coverage`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | FLT-01 | — | Filter buttons don't execute code | component | `npm test -- --run FilterBar.test.tsx` | ✅ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | FLT-01 | — | Status filter updates query key | unit | `npm test -- --run useFilterParams.test.ts` | ✅ W0 | ⬜ pending |
| 04-02-01 | 02 | 1 | FLT-02 | — | Bbox coords validated server-side | component | `npm test -- --run BBoxMode.test.tsx` | ✅ W0 | ⬜ pending |
| 04-03-01 | 03 | 2 | FLT-03, FLT-04 | T-04-01 | URL params sanitized before use | unit | `npm test -- --run useFilterParams.test.ts` | ✅ W0 | ⬜ pending |
| 04-04-01 | 04 | 2 | ANA-01, ANA-02 | T-04-02 | Buffer distance validated (1-10000m) | unit | `npm test -- --run useBufferAnalysis.test.ts` | ✅ W0 | ⬜ pending |
| 04-04-02 | 04 | 2 | ANA-03 | T-04-02 | Distance input clamps to range | component | `npm test -- --run BufferPanel.test.tsx` | ✅ W0 | ⬜ pending |
| 04-05-01 | 05 | 3 | ANA-04, ANA-05 | — | Circle renders from validated data | integration | `npm test -- --run BufferVisualization.test.tsx` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/map/__tests__/FilterBar.test.tsx` — stubs for FLT-01
- [ ] `src/components/map/__tests__/BBoxMode.test.tsx` — stubs for FLT-02
- [ ] `src/components/map/__tests__/BufferPanel.test.tsx` — stubs for ANA-03
- [ ] `src/components/map/__tests__/BufferVisualization.test.tsx` — stubs for ANA-04, ANA-05
- [ ] `src/hooks/__tests__/useFilterParams.test.ts` — stubs for FLT-03, FLT-04
- [ ] `src/hooks/__tests__/useBufferAnalysis.test.ts` — stubs for ANA-01, ANA-02
- [ ] Existing Vitest infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| BBox drawing interaction | FLT-02 | Mouse drag on map requires visual verification | 1. Open app, 2. Click bbox filter, 3. Draw rectangle on map, 4. Verify only parcels within rectangle are shown |
| Buffer circle visual accuracy | ANA-04 | Circle radius must match distance input visually | 1. Select parcel, 2. Click "Analyze Nearby", 3. Set distance to 500m, 4. Verify circle radius appears correct on map |
| Shareable URL functionality | FLT-04 | Requires opening URL in new browser/session | 1. Apply filters, 2. Copy URL, 3. Open in new tab, 4. Verify filters are restored |

*Note: Most behaviors have automated verification. Manual checks are for visual accuracy and cross-session state.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 45s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
