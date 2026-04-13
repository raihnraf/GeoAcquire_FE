---
phase: 3
slug: crud-operations
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-12
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm test -- --run {test-file}` |
| **Full suite command** | `npm test:all` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run {test-file}`
- **After every plan wave:** Run `npm test:all`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | CRUD-06 | T-01-01 | Zod schema validates input bounds | unit | `npm test -- --run src/lib/__tests__/zod.test.ts` | ✅ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | CRUD-07 | T-01-02 | 422 errors mapped, no raw HTML exposed | unit | `npm test -- --run src/api/__tests__/axios.test.ts` | ✅ W0 | ⬜ pending |
| 03-03-01 | 03 | 2 | CRUD-01, CRUD-08, CRUD-09 | T-01-03 | Geometry validated, cache invalidated after mutation | integration | `npm test -- --run src/hooks/__tests__/useCreateParcel.test.ts` | ✅ W0 | ⬜ pending |
| 03-04-01 | 04 | 2 | CRUD-02, CRUD-06 | T-01-04 | Form fields sanitized, XSS prevented | unit | `npm test -- --run src/components/map/__tests__/ParcelForm.test.ts` | ✅ W0 | ⬜ pending |
| 03-05-01 | 05 | 3 | CRUD-03, CRUD-04 | T-01-05 | Read-only data not modified without intent | unit | `npm test -- --run src/components/map/__tests__/ParcelSidebar.test.ts` | ✅ W0 | ⬜ pending |
| 03-06-01 | 06 | 3 | CRUD-04, CRUD-08, CRUD-09 | T-01-03 | Update mutation invalidates cache | integration | `npm test -- --run src/hooks/__tests__/useUpdateParcel.test.ts` | ✅ W0 | ⬜ pending |
| 03-07-01 | 07 | 4 | CRUD-05, CRUD-08, CRUD-09 | T-01-06 | Delete requires confirmation, cache invalidated | integration | `npm test -- --run src/hooks/__tests__/useDeleteParcel.test.ts` | ✅ W0 | ⬜ pending |
| 03-08-01 | 04 | 2 | CRUD-01, CRUD-04 | T-01-07 | Drawing state resets after completion | integration | `npm test -- --run src/components/map/__tests__/DrawingHandler.test.ts` | ✅ W0 | ⬜ pending |
| 03-09-01 | 07 | 4 | CRUD-01 | T-01-08 | Drawing toolbar cancels/completes correctly | unit | `npm test -- --run src/components/map/__tests__/DrawingToolbar.test.ts` | ✅ W0 | ⬜ pending |
| 03-10-01 | 06 | 3 | CRUD-05 | T-01-09 | Delete modal confirms before action | unit | `npm test -- --run src/components/map/__tests__/DeleteConfirmModal.test.ts` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `src/lib/__tests__/zod.test.ts` — CRUD-06 schema validation
- [x] `src/api/__tests__/axios.test.ts` — CRUD-07 422 error mapping
- [x] `src/components/map/__tests__/ParcelForm.test.ts` — CRUD-02 form validation
- [x] `src/components/map/__tests__/ParcelSidebar.test.ts` — CRUD-03, CRUD-04 view/edit modes
- [x] `src/components/map/__tests__/DeleteConfirmModal.test.ts` — CRUD-05 delete confirmation
- [x] `src/hooks/__tests__/useCreateParcel.test.ts` — CRUD-01, CRUD-08, CRUD-09
- [x] `src/hooks/__tests__/useUpdateParcel.test.ts` — CRUD-04, CRUD-08, CRUD-09
- [x] `src/hooks/__tests__/useDeleteParcel.test.ts` — CRUD-05, CRUD-08, CRUD-09
- [x] `src/components/map/__tests__/DrawingHandler.test.ts` — CRUD-01, CRUD-04 drawing logic
- [x] `src/components/map/__tests__/DrawingToolbar.test.ts` — CRUD-01 drawing controls

**Framework install:** Already installed — @testing-library/react, @testing-library/jest-dom, @testing-library/user-event

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual polygon drawing feedback | CRUD-01 | Visual feedback on map (cursor, preview) | 1. Click Add Parcel, 2. Click map points, 3. Verify blue line connects points, 4. Verify fill appears at 30% opacity |
| Toast notification position and animation | CRUD-08 | Visual UI element | 1. Create/update/delete parcel, 2. Verify toast appears top-right, 3. Verify slide-in animation, 4. Verify auto-dismiss timing |
| Sidebar slide-in animation | CRUD-03, CRUD-04 | Visual transition | 1. Click parcel, 2. Verify sidebar slides in from right, 3. Verify smooth animation |
| Delete confirmation modal | CRUD-05 | Visual confirmation | 1. Click delete button, 2. Verify modal appears with overlay, 3. Verify warning message visible |
| Escape key cancels drawing | CRUD-01 | Keyboard interaction | 1. Start drawing polygon, 2. Press Escape, 3. Verify drawing mode exits, points cleared |

---

## Threat References

| Threat ID | Description | Standard Mitigation |
|-----------|-------------|---------------------|
| T-01-01 | XSS in parcel owner name | React auto-escapes JSX; Zod sanitizes input |
| T-01-02 | Raw HTML in 422 error messages | Axios interceptor formats errors; react-hook-form displays as text |
| T-01-03 | Cache poisoning via stale data | queryClient.invalidateQueries after mutations |
| T-01-04 | Form bypass via direct API calls | Client validation is defense-in-depth; server validation is authoritative |
| T-01-05 | Unauthorized data modification | Phase 3 is portfolio/demo without auth; ensure read-only state isn't mutated |
| T-01-06 | Accidental deletion | Confirmation modal required before delete mutation |
| T-01-07 | Drawing state persistence bug | Explicit state reset in completion/cancellation handlers |
| T-01-08 | Drawing toolbar state sync | Toolbar disabled state matches drawing points count |
| T-01-09 | Delete modal bypass | Modal overlay prevents interaction with underlying UI |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter
- [x] `wave_0_complete: true` set in frontmatter

**Approval:** pending
