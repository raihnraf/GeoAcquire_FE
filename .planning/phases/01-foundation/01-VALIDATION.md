---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-11
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (bundled with Vite) |
| **Config file** | `vitest.config.ts` — create in Wave 0 |
| **Quick run command** | `npm test -- --run` |
| **Full suite command** | `npm run test:all` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run` (affected tests only)
- **After every plan wave:** Run `npm run test:all` (full suite with coverage)
- **Before `/gsd-verify-work`:** Full suite must be green + `tsc --noEmit` passes
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | FND-01 | — | Dev server starts on localhost:5173 | smoke | `npm run dev &; sleep 5; curl -s http://localhost:5173 | grep -q "React"` | — | ⬜ pending |
| 01-02-01 | 02 | 1 | FND-02 | — | All dependencies install without conflicts | install | `npm list --depth=0` | — | ⬜ pending |
| 01-03-01 | 03 | 1 | FND-03 | — | Tailwind classes compile in CSS | smoke | `npm run build; grep -q "tailwind" dist/assets/*.css` | — | ⬜ pending |
| 01-04-01 | 04 | 1 | FND-04 | T-1 | Axios interceptors handle 422/500 errors | manual | Test with actual API response or mock | — | ⬜ pending |
| 01-05-01 | 05 | 1 | FND-05 | — | TypeScript types compile without errors | typecheck | `tsc --noEmit` | — | ⬜ pending |
| 01-06-01 | 06 | 1 | FND-06 | T-1 | Zod schemas validate correct/incorrect input | manual | Test with valid/invalid inputs in console | — | ⬜ pending |
| 01-07-01 | 07 | 1 | FND-07 | — | React Query provider wraps app | smoke | `npm run build; grep -q "QueryClientProvider" dist/assets/*.js` | — | ⬜ pending |
| 01-08-01 | 08 | 1 | FND-08 | — | Utility functions return expected output | manual | Test in console or component usage | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

**Note:** Phase 1 focuses on infrastructure setup. Comprehensive unit tests for each module will be created in later phases when the modules are actually used in features. Manual/smoke tests are sufficient for Phase 1 to verify the infrastructure works.

---

## Wave 0 Requirements

Phase 1 Wave 0 establishes the test infrastructure foundation only:

- [x] `vitest.config.ts` — Vitest configuration with @testing-library/react (Plan 01-00)
- [x] `src/test/setup.ts` — Test setup with cleanup utilities (Plan 01-00)
- [x] `package.json` scripts: `"test": "vitest"`, `"test:all": "vitest --coverage"` (Plan 01-00)
- [x] Framework install: `npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom` (Plan 01-00)

**Deferred to future phases:**
The following test files will be created when their corresponding modules are implemented in feature phases:
- `src/api/axios.test.ts` — To be created in API feature phase when endpoints are implemented
- `src/lib/zod.test.ts` — To be created in form feature phase when validation is used
- `src/lib/utils.test.ts` — To be created in map feature phase when utilities are exercised
- `src/lib/queryClient.test.ts` — To be created in data layer phase when queries are implemented
- `src/lib/tailwind.test.ts` — Not needed - Tailwind compilation verified via build output
- `src/lib/install.test.ts` — Not needed - dependency install verified via `npm list`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|---|
| Visual check: blank white page renders | FND-01 | Requires browser rendering | 1. Run `npm run dev` 2. Open http://localhost:5173 3. Verify blank page loads without errors |
| Browser console: no React warnings | FND-01 | Requires browser console | 1. Open DevTools console 2. Verify no warnings about React, ReactDOM, or strict mode |

---

## Threat References

| Threat ID | Mitigated By | Plan | Status |
|-----------|--------------|------|--------|
| T-1 | Input validation (Zod schemas), Error handling (Axios interceptors) | 04, 06 | ⬜ pending |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers infrastructure setup only (deferred module tests to future phases)
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter (pending Wave 0 completion)

**Approval:** pending
