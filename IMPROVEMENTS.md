# RealPractice Improvements

A prioritized list of improvements needed for the codebase, organized by impact and effort.

---

## Critical Bugs (Fix Immediately)

### 1. Date Format Inconsistency

- **Issue:** `validation.ts` expects `MM-DD-YYYY-HH-MM-GMT+N` format while `dateUtils.ts` uses `YYYY-MM-DD-HH-mm` (UTC without GMT offset)
- **Impact:** Log submissions will fail validation when datetime strings don't match expected format
- **Location:** `lib/utils/validation.ts:15` vs `lib/utils/dateUtils.ts:12-18`
- **Fix:** Align formats or use ISO 8601 consistently

### 2. Broken Pagination (Infinite Scroll Non-Functional)

- **Issue:** `loadMoreLogs()` in `LogsContext.tsx` is empty (does nothing), `refreshLogs()` also empty
- **Impact:** Infinite scroll on home page fetches all data at once (performance issue)
- **Location:** `app/context/LogsContext.tsx:112-128`
- **Fix:** Implement Firestore cursor-based pagination with proper batching

### 3. Unimplemented Pagination on Friends Feed

- **Issue:** Friends feed retrieves ALL logs then filters client-side (N+1 query pattern)
- **Impact:** Unscalable - will degrade severely as user base grows
- **Location:** `app/_db/db.ts:180-230` and `app/context/LogsContext.tsx`
- **Fix:** Use compound queries with proper indexing and server-side pagination

---

## High Priority Technical Debt

### 4. Complete Data Model Migration

- **Issue:** Dual database systems exist - old (`db.ts`) and new (`newDataModel.ts`)
- **Impact:** Code complexity, potential data inconsistency between old and new users
- **Details:** New model uses `userLogs` collection but falls back to old user-document arrays
- **Location:** `app/_db/newDataModel.ts:205` has TODO comment
- **Fix:** Commit fully to new model, create migration script for existing data

### 5. Type Duplication

- **Issue:** `Log` interface in `LogsContext.tsx` duplicates `OrganizedLogEntry` from `types/index.ts`
- **Impact:** Maintenance burden, potential drift between definitions
- **Location:** `app/context/LogsContext.tsx:16-22`
- **Fix:** Consolidate to single type definition, export from `types/index.ts`

### 6. Missing DateTime String Generation in CreateLogForm

- **Issue:** `CreateLogForm.tsx` uses `toString()` which doesn't include GMT offset required by validation
- **Impact:** Logs created through UI will fail validation
- **Location:** `app/_components/CreateLogForm/CreateLogForm.tsx` (datetime formatting)
- **Fix:** Update datetime string generation to match validation format

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

### 8. Fix ESLint Configuration

**Current Gaps:**

- Missing React Hooks rules: `react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`
- Missing import ordering rules (documented in AGENTS.md but not enforced)
- Missing Prettier integration with ESLint

**Fix:** Update `.eslintrc` or `eslint.config.js` with proper rule configuration

### 9. Remove `any` Types

**Issue:** Codebase has remaining `any` types that bypass TypeScript safety
**Location:** Search for `: any` and `as any` patterns
**Fix:** Replace with `unknown` or proper types, enable stricter TypeScript rules

### 10. Prettier Integration

**Issue:** Format script exists (`npm run format`) but not integrated with ESLint
**Fix:** Add `eslint-config-prettier` to prevent rule conflicts

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

---

## Quick Wins (Low Effort, High Impact)

1. Fix ESLint configuration (add React Hooks rules)
2. Consolidate duplicate type definitions
3. Add basic tests for database operations
4. Fix datetime string format alignment
5. Remove unused `any` types

---

## Estimated Effort Summary

| Priority | Tasks                                         | Estimated Effort |
| -------- | --------------------------------------------- | ---------------- |
| Critical | Date format, pagination, data model           | 2-3 days         |
| High     | Testing, ESLint, types                        | 1-2 days         |
| Medium   | Query optimization, offline support, presence | 3-5 days         |
| Low      | Social features, design polish                | 5-7 days         |
