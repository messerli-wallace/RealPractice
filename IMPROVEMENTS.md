# RealPractice Improvements

A prioritized list of improvements needed for the codebase, organized by impact and effort.

---

## Testing (Critical Gap)

### 7. Expand Test Coverage

**Current State:** 2 test files exist (validation, database operations)

**Still Missing Tests:**

- Context providers (`AuthContext`, `LogsContext`, `UIContext`)
- Real-time service (`realtimeService.ts`)
- Error logger (`errorLogger.ts`)
- Components (`CreateLogForm`, `Log`, `like-button`, etc.)

**Priority Order:**

1. Context providers (state management)
2. Error logging (reliability)
3. Key user-facing components

---

## Config & Tooling

### 9. Remove `any` Types

- **Issue:** Codebase has remaining `any` types that bypass TypeScript safety
- **Location:** Search for `: any` and `as any` patterns
- **Fix:** Replace with `unknown` or proper types, enable stricter TypeScript rules

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

## Features

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
- **Location:** `app/_db/db.ts` (friends array in user documents)
- **Fix:** Build friend request UI and backend logic

### 23. Follow/Unfollow

- **Issue:** `following` and `followers` arrays exist but unused
- **Fix:** Implement follow/unfollow functionality with proper UI

---

## Estimated Effort Summary

| Priority | Tasks                                         | Estimated Effort |
| -------- | --------------------------------------------- | ---------------- |
| High     | Testing expansion                             | 2-3 days         |
| High     | Remove `any` types, enforce stricter TS       | 1-2 days         |
| Medium   | Query optimization, offline support, presence | 3-5 days         |
| Medium   | API routes, optimistic updates                | 2-3 days         |
| Low      | Social features, design polish, a11y          | 5-7 days         |
