**Features**

- ~~Filter on logs. Should have filter on tags, filter on users (by name) and a box that makes it so the user only sees their posts.~~ (COMPLETED)
- In each log, the user's name should be displayed instead of user id
- ~~The like button should be changed from a bool to an actual like button, and moved inside the log component.~~ (COMPLETED)
- ~~the new log component should be hidden until the user presses the "new log" button, then it should appear smoothly.~~ (COMPLETED)
- Implement optimistic updates with rollback for likes and log creation with proper error recovery
- Implement debouncing and rate limiting for search inputs and form submissions
- Complete infinite scroll pagination using Firestore cursor-based queries
- ~~Add loading states for authentication operations (sign in, sign out) to prevent duplicate requests~~ (COMPLETED)

**Build & Config**

- Remove artificial delays and implement consistent loading indicators
- Implement proper routing strategies and add API routes
- Update dependencies and implement security scanning
- Remove remaining implicit `any` types and add proper Firebase imports

**UI/UX**

- Add ARIA attributes, keyboard navigation, and screen reader support
- Create consistent design system with spacing, typography, and visual feedback
- ~~Implement skeleton loaders for better loading states instead of only GIF spinner~~ (COMPLETED)

**Fixes**

- Fix sorting logic and add multiple sorting options
- Add user profile customization and onboarding
