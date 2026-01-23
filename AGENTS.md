# AGENTS.md - RealPractice Development Guide

This document provides guidelines for agentic coding agents working on the RealPractice codebase.

## Project Overview

RealPractice is a Next.js + Firebase social app for logging and tracking time-based practice (musical instruments, meditation, studying, etc.). Practice sessions are logged with title, description, tags, and duration. Users can follow others and interact through likes/comments.

## Build, Lint, and Test Commands

```bash
# Development
npm run dev                    # Start Next.js dev server

# Build
npm run build                  # Production build
npm run build:firebase         # Build for Firebase deployment
npm run deploy:firebase        # Build and deploy to Firebase

# Linting
npm run lint                   # Run ESLint on all .ts/.tsx files
npm run lint:fix               # Run ESLint with auto-fix
npm run format                 # Format all files with Prettier

# Type Checking
npm run check-types            # Run TypeScript type check (noEmit)

# Testing
npm run test                   # Run all Jest tests
npm run test:watch             # Run Jest in watch mode
npm run test:coverage          # Run tests with coverage report

# To run a single test file, use Jest's pattern matching:
npm test -- --testPathPattern="filename.test.ts"
npm test -- filename.test.ts   # Shorthand for single file
```

## Code Style Guidelines

### Formatting (Prettier)

- Line width: 80 characters
- Tab width: 2 spaces
- Semicolons: required
- Single quotes: disabled (use double quotes)
- Trailing commas: ES5 compatible
- Bracket spacing: enabled
- Arrow function parens: always

Run `npm run format` to auto-format the codebase.

### Linting (ESLint)

- Extends: TypeScript-ESLint recommended, React, React-Hooks, JSX-A11y, Prettier
- JSX: React 16+ with automatic version detection
- Module system: ES Modules

Key rules:

- `no-explicit-any`: warning (avoid `any`, use `unknown` or proper types)
- `no-unused-vars`: warning (prefix unused params with `_`)
- `react/react-in-jsx-scope`: off (JSX transform handles this)
- `react/prop-types`: off (TypeScript handles this)

### TypeScript Configuration

- Target: ES6
- Strict mode enabled with all strict flags
- Module: ESNext with extension imports
- JSX: preserve (Next.js handles transformation)
- Path alias: `@/` maps to root directory

Import path style: `import X from "@/path"` not relative paths like `../../path`.

### Naming Conventions

- **Components**: PascalCase (e.g., `CreateLog`, `DateTimePickerField`)
- **Files**: PascalCase for components, camelCase for utilities (e.g., `errorLogger.ts`, `validation.ts`)
- **Variables/functions**: camelCase (e.g., `logError`, `validateDuration`)
- **Constants**: UPPER_SNAKE_CASE for enum values, camelCase for objects
- **Types/Interfaces**: PascalCase (e.g., `LogFormData`, `ErrorContext`)
- **Enums**: PascalCase with UPPER_SNAKE_CASE members (e.g., `LogLevel.INFO`)

### Component Patterns

- Client components: start with `"use client"` directive
- Default exports for page components
- Named exports for reusable components
- Barrel exports: use `index.ts` for component groups (see `app/_components/CreateLogForm/index.ts`)
- Folder structure: `app/_components/ComponentName/` for complex components with subfiles

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

For validation errors, return structured objects:

```typescript
return {
  valid: boolean,
  error?: string,
  sanitized?: T
};
```

Catch errors with proper type guards:

```typescript
try {
  await someAsyncOperation();
} catch (error) {
  if (error instanceof Error) {
    // Handle known error types by message
    if (error.message.includes("network")) { ... }
  }
  throw error; // Re-throw after logging
}
```

### File Organization

- `app/` - Next.js pages and layouts
- `app/_components/` - Shared components (underscore prefix = private)
- `app/_db/` - Firebase database operations
- `lib/utils/` - Shared utilities
- `lib/config/` - Configuration
- `__tests__/` - Test files (mirrors app structure)

### Testing

- Test files: `*.test.ts` or `*.test.tsx` in `__tests__/` or alongside source
- Test framework: Jest with `@testing-library/react`
- Mock Firebase in tests using patterns in `jest.setup.cjs`
- Use `ts-jest` for TypeScript test files
