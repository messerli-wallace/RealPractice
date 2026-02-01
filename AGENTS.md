# AGENTS.md - RealPractice Development Guide

Guidelines for agentic coding agents working on the RealPractice codebase.

## Project Overview

Next.js + Firebase social app for logging time-based practice (musical instruments, meditation, studying, etc.). Practice sessions include title, description, tags, and duration. Users can follow others and interact through likes/comments.

## Build, Lint, and Test Commands

```bash
# Development
npm run dev                    # Start Next.js dev server on port 3000

# Build
npm run build                  # Production build (static export)
npm run build:firebase         # Build for Firebase deployment (cleans .next/ out/ first)
npm run deploy:firebase        # Build and deploy to Firebase

# Linting and Formatting
npm run lint                   # Run ESLint with caching
npm run lint:fix               # Run ESLint with auto-fix
npm run format                 # Format all files with Prettier

# Type Checking
npm run check-types            # Run TypeScript check (noEmit)

# Testing
npm run test                   # Run all Jest tests once
npm run test:watch             # Run Jest in watch mode
npm run test:coverage          # Run tests with coverage report

# Run a single test file
npm test -- --testPathPattern="filename.test.ts"
npm test -- filename.test.ts   # Shorthand
```

## Code Style Guidelines

### Formatting (Prettier)

- `printWidth`: 80
- `tabWidth`: 2
- `semi`: true
- `singleQuote`: false
- `trailingComma`: es5
- `bracketSpacing`: true
- `arrowParens`: always

### Linting (ESLint)

Key rules configured:

- `@typescript-eslint/no-explicit-any`: warn
- `@typescript-eslint/no-unused-vars`: warn (ignores `_` prefix)
- `react/react-in-jsx-scope`: off
- `react/prop-types`: off
- `react-hooks/rules-of-hooks`: error
- `react-hooks/exhaustive-deps`: warn

Ignores: `node_modules/`, `.next/`, `out/`, `dist/`, `coverage/`, config files

### TypeScript Configuration

- `target`: ES6
- `strict`: true (all strict flags enabled)
- `module`: ESNext with `allowImportingTsExtensions`
- `jsx`: react-jsx
- Path alias: `@/` maps to root directory

Always use `@/path` imports, never relative paths like `../../path`.

### Naming Conventions

- **Components**: PascalCase (`CreateLog`, `DateTimePickerField`)
- **Files**: PascalCase for components, camelCase for utilities
- **Variables/functions**: camelCase (`logError`, `validateDuration`)
- **Constants**: UPPER_SNAKE_CASE for enum values
- **Types/Interfaces**: PascalCase (`LogFormData`, `ErrorContext`)
- **Enums**: PascalCase with UPPER_SNAKE_CASE members (`LogLevel.INFO`)

### Component Patterns

- Client components: start with `"use client"` directive
- Default exports for page components
- Named exports for reusable components
- Barrel exports: use `index.ts` for component groups
- Folder structure: `app/_components/ComponentName/` for complex components

### Imports Order

```typescript
import { ... } from "react";
import { ... } from "firebase/auth";
import { ... } from "@/context/AuthContext";
import { ... } from "../_db/db";
import { ... } from "../../lib/utils/validation";
import { ... } from "./CreateLogForm/types";
import { ... } from "./CreateLogForm";
```

Order: React → Firebase → Path aliases (@/) → Relative parent imports → Relative sibling imports → Local components

### Error Handling

Use the centralized error logging system in `lib/utils/errorLogger.ts`:

```typescript
import {
  logError,
  createComponentContext,
  LogLevel,
} from "@/lib/utils/errorLogger";

const errorContext = createComponentContext("ComponentName");
logError("Descriptive message", error, errorContext.withUser(user));
```

Catch errors with proper type guards:

```typescript
try {
  await someAsyncOperation();
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes("network")) { ... }
  }
  throw error;
}
```

### File Organization

- `app/` - Next.js pages and layouts
- `app/_components/` - Shared components (underscore = private)
- `app/_db/` - Firebase database operations
- `app/context/` - React context providers
- `lib/utils/` - Shared utilities
- `lib/config/` - Configuration
- `__tests__/` - Test files (mirrors app structure)

### Testing

- Test files: `*.test.ts` or `*.test.tsx` in `__tests__/` or alongside source
- Framework: Jest with `@testing-library/react`, `ts-jest`, `jsdom` environment
- Setup: `jest.setup.cjs` includes `@testing-library/jest-dom` and Firebase mocks
- Pattern: Use `beforeEach` to clear mocks/state, `afterEach` for cleanup
- Path mapping: `@/` resolves to `<rootDir>/`

### Git Hooks

Pre-commit runs `lint-staged` which lints and formats staged files automatically.
