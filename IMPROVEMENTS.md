# RealPractice Improvements

A prioritized list of improvements needed for the codebase, organized by impact and effort.

---

## Critical Bugs (Fix Immediately)

### 1. Date Format Inconsistency ✅ FIXED

- **Issue:** `validation.ts` expects `MM-DD-YYYY-HH-MM-GMT+N` format while `dateUtils.ts` uses `YYYY-MM-DD-HH-mm` (UTC without GMT offset)
- **Impact:** Log submissions will fail validation when datetime strings don't match expected format
- **Location:** `lib/utils/validation.ts:15` vs `lib/utils/dateUtils.ts:12-18`
- **Fix:** Updated `toString()` to generate `MM-DD-YYYY-HH-MM-GMT+N` format with local timezone offset
- **Date Fixed:** 2026-01-29

### 2. Broken Pagination (Infinite Scroll Non-Functional) ✅ FIXED

- **Issue:** `loadMoreLogs()` in `LogsContext.tsx` is empty (does nothing), `refreshLogs()` also empty
- **Impact:** Infinite scroll on home page fetches all data at once (performance issue)
- **Location:** `app/context/LogsContext.tsx:174-190`
- **Fix:** Implemented pagination logic with page increment and proper loading states
- **Date Fixed:** 2026-01-29

### 3. N+1 Query Problem in Friends Feed ✅ FIXED

- **Issue:** Friends feed fetches user data via N individual `getDoc` calls for every update (N+1 query pattern)
- **Impact:** Unscalable - will degrade severely as user base grows
- **Location:** `app/_db/realtimeService.ts:98-215`
- **Fix:** Added `subscribeToUserLogsWithCache()` helper that caches user data from subscriptions, eliminating extra queries
- **Date Fixed:** 2026-01-29

---

## High Priority Technical Debt

### 4. Complete Data Model Migration

- **Issue:** Dual database systems exist - old (`db.ts`) and new (`newDataModel.ts`)
- **Impact:** Code complexity, potential data inconsistency between old and new users
- **Details:** New model uses `userLogs` collection but falls back to old user-document arrays
- **Location:** `app/_db/newDataModel.ts:205` has TODO comment
- **Fix:** Commit fully to new model, create migration script for existing data

### 5. Type Duplication ✅ FIXED

- **Issue:** `Log` interface in `LogsContext.tsx` duplicates `OrganizedLogEntry` from `types/index.ts`
- **Impact:** Maintenance burden, potential drift between definitions
- **Location:** `app/context/LogsContext.tsx:16-22`
- **Fix:** Consolidate to single type definition, export from `types/index.ts`
  - Removed local `Log` interface from `LogsContext.tsx`
  - Updated all references to use `OrganizedLogEntry` from `types/index.ts`
  - Deleted duplicate `types.ts` file from root (was not imported anywhere)
- **Date Fixed:** 2026-01-29

### 6. Missing DateTime String Generation in CreateLogForm ✅ FIXED

- **Issue:** `CreateLogForm.tsx` uses `toString()` which doesn't include GMT offset required by validation
- **Impact:** Logs created through UI will fail validation
- **Location:** `app/_components/CreateLogForm/CreateLogForm.tsx` (datetime formatting)
- **Fix:** Fixed in dateUtils.ts - `toString()` now generates correct format with GMT offset
- **Date Fixed:** 2026-01-29

---

## Testing (Critical Gap)

### 7. Expand Test Coverage

**Current State:** Only 1 test file exists (`__tests__/utils/validation.test.ts`)

**Missing Tests:**

- Database operations (`db.ts`, `newDataModel.ts`)
- Context providers (`AuthContext`, `LogsContext`, `UIContext`)
- Real-time service (`realtimeService.ts`)
- Error logger (`errorLogger.ts`)
- Components (`CreateLogForm`, `Log`, `like-button`, etc.)

**Priority Order:**

1. Database operations (core functionality)
2. Context providers (state management)
3. Error logging (reliability)
4. Key user-facing components

---

## Config & Tooling

### 8. Fix ESLint Configuration ✅ DONE

**Current Gaps:**

- ~~Missing React Hooks rules: `react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`~~ ✅ ADDED
- Missing import ordering rules (documented in AGENTS.md but not enforced)
- Missing Prettier integration with ESLint

**Fix:** Update `.eslintrc` or `eslint.config.js` with proper rule configuration

**Changes Made:**

- Added `eslint-plugin-react-hooks` import to `eslint.config.mjs`
- Configured `react-hooks/rules-of-hooks` as "error" (catch hook violations)
- Configured `react-hooks/exhaustive-deps` as "warn" (catch missing dependencies)
- ESLint runs successfully with new rules

**Date Completed:** 2026-01-29

### 9. Remove `any` Types

**Issue:** Codebase has remaining `any` types that bypass TypeScript safety
**Location:** Search for `: any` and `as any` patterns
**Fix:** Replace with `unknown` or proper types, enable stricter TypeScript rules

### 10. Prettier Integration ✅ DONE

**Issue:** Format script exists (`npm run format`) but not integrated with ESLint
**Fix:** Add `eslint-config-prettier` to prevent rule conflicts

**Changes Made:**

- Installed `eslint-config-prettier` package
- Updated `eslint.config.mjs` to import and include prettier config as final item
- Prettier now disables ESLint rules that conflict with formatting
- ESLint runs successfully with no conflicts

**Date Completed:** 2026-01-29

---

## Architecture & Performance

### 11. Optimize Friends Feed Queries

- **Issue:** Currently fetches ALL friend logs then filters/sorts client-side
- **Location:** `app/_db/db.ts:getFriendFeedLogs()`
- **Fix:** Use Firestore compound queries with composite indexes

### 12. Implement Offline Support

- **Issue:** Network retry logic exists but no offline queue for writes
- **Location:** `lib/utils/networkUtils.ts`
- **Enhancement:** Add offline queue with automatic sync when connectivity returns

### 13. Presence System Integration

- **Issue:** `presence` collection and `updateUserPresence()` exist but not integrated
- **Location:** `app/_db/realtimeService.ts`
- **Fix:** Add presence tracking to app lifecycle (login/logout, window focus)

---

## Features (From Original List)

### 14. Optimistic Updates

- Implement optimistic updates with rollback for likes and log creation
- Proper error recovery and state reconciliation

### 15. Debouncing & Rate Limiting

- Add debouncing for search inputs
- Rate limiting for form submissions to prevent abuse

### 16. Proper Routing & API Routes

- Implement Next.js API routes for server-side operations
- Move heavy database logic to API layer

### 17. Security Scanning

- Add dependency scanning
- Implement Firebase App Check for production

### 18. Sorting Options

- Fix sorting logic
- Add multiple sorting options (date, duration, popularity)

### 19. User Profile Customization

- Add profile customization features
- Implement user onboarding flow

### 20. Accessibility (a11y)

- Add ARIA attributes to interactive components
- Implement keyboard navigation
- Add screen reader support
- Test with assistive technologies

### 21. Design System Polish

- Create consistent spacing system
- Standardize typography
- Add visual feedback states (hover, active, disabled)

---

## Social Features (Incomplete)

### 22. Friend Requests

- **Issue:** Data model exists but no implementation
- **Location:** `app/_db/dataModel.md:42-47`
- **Fix:** Build friend request UI and backend logic

### 23. Follow/Unfollow

- **Issue:** `following` and `followers` arrays exist but unused
- **Fix:** Implement follow/unfollow functionality with proper UI

---

## Completed Items (Keep for Reference)

- ~~Filter on logs (tags, users, own posts)~~
- ~~Like button moved inside log component~~
- ~~New log component hidden until button press with smooth animation~~
- ~~Skeleton loaders for loading states~~
- ~~Loading states for auth operations~~
- ~~Date format inconsistency between validation.ts and dateUtils.ts~~ (2026-01-29)
- ~~Broken pagination in LogsContext.tsx (loadMoreLogs was empty)~~ (2026-01-29)
- ~~N+1 query problem in realtimeService.ts friends feed~~ (2026-01-29)
- ~~Add React Hooks ESLint rules to eslint.config.mjs~~ (2026-01-29)
- ~~Consolidate duplicate type definitions (Log interface vs OrganizedLogEntry)~~ (2026-01-29)

---

## Quick Wins (Low Effort, High Impact)

1. ~~Fix ESLint configuration (add React Hooks rules)~~ ✅ DONE
2. ~~Consolidate duplicate type definitions~~ ✅ DONE
3. ~~Add Prettier integration with ESLint~~ ✅ DONE
4. ~~Fix datetime string format alignment~~ ✅ DONE (fixed in dateUtils.ts)
5. ~~Remove unused `any` types~~ ✅ DONE (no `any` types in source code, only in build output)
6. Add basic tests for database operations

---

## Estimated Effort Summary

| Priority | Tasks                                         | Estimated Effort |
| -------- | --------------------------------------------- | ---------------- |
| Critical | Date format, pagination, data model           | 2-3 days         |
| High     | Testing, ESLint, types                        | 1-2 days         |
| Medium   | Query optimization, offline support, presence | 3-5 days         |
| Low      | Social features, design polish                | 5-7 days         |
