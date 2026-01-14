# Agent Guidelines

## Project Overview

**RealPractice** is a social time-based practice logging application built with Next.js and Firebase. The app allows users to track and log their practice sessions (musical instruments, meditation, studying, etc.) with detailed analytics, social features, and community interaction.

### Key Features

- **Practice Logging**: Track practice sessions with duration, descriptions, and tags
- **User Profiles**: View practice analytics and statistics over time
- **Social Features**: Follow other users, like and comment on practice logs
- **Search Functionality**: Find users and practice logs
- **Real-time Updates**: Firebase-powered live data synchronization

## Architecture

### Technology Stack

- **Frontend**: Next.js 14 with React functional components and hooks
- **Database**: Firebase Firestore (NoSQL document database)
- **Authentication**: Firebase Authentication with Google Auth Provider
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: React Context API for authentication state

### Component Structure

- **Core Components**: `Navbar`, `post`, `like-button`, `CreateLog`, `LoadingGif`
- **Database Layer**: `app/_db/db.ts` with Firebase CRUD operations
- **Authentication**: `app/context/AuthContext.tsx` for user session management
- **Firebase Integration**: `app/firebase.tsx` for Firebase initialization

### Data Flow

1. **User Authentication**: Firebase Auth → AuthContext → Protected routes
2. **Data Operations**: UI Components → Database functions → Firestore
3. **Real-time Updates**: Firestore listeners → React state updates

## Commands

- **Build**: `npm run build`
- **Dev server**: `npm run dev`
- **Start production**: `npm run start`
- **Lint**: `npx eslint .` (runs via pre-commit hook with --fix)
- **Format**: `npx prettier --write .` (runs via pre-commit hook)
- **Type check**: `npx tsc --noEmit`
- **Test**: No tests configured yet

## Code Style

- **TypeScript**: strictNullChecks enabled, strict mode disabled
- **React**: Functional components with hooks, no prop-types
- **Imports**: Named imports preferred, destructure from React
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Types**: Explicit interfaces for props, data structures, context
- **Formatting**: Prettier (semicolons, double quotes, 2-space indent, 80 char width)
- **Linting**: ESLint with TypeScript, React, React Hooks, JSX a11y rules
- **Styling**: Tailwind CSS classes in JSX
- **Error handling**: try/catch with console.log, throw Error for context issues
- **Comments**: Minimal, no inline comments unless complex logic

## Firebase Configuration

### Security Rules

The project uses Firebase Firestore security rules defined in `firebase.rules`:

- **Read Access**: Public read access for all user documents (adjust for production)
- **Write Access**: Authenticated users can only write to their own documents

### Services Used

- **Firestore Database**: Stores user data, practice logs, and social connections
- **Firebase Authentication**: Handles user sign-in/sign-up with Google provider
- **Firebase App**: Core Firebase initialization and configuration

## Testing Strategy

Currently, the project has no formal testing setup. Recommended testing approach:

### Unit Testing

- **Framework**: Jest with React Testing Library
- **Coverage**: Component rendering, user interactions, utility functions
- **Mocking**: Firebase services using `@firebase/rules-unit-testing`

### Integration Testing

- **Authentication Flow**: Sign-in/sign-out processes
- **Database Operations**: CRUD operations validation
- **Real-time Updates**: Firestore listener testing

### End-to-End Testing

- **Framework**: Cypress or Playwright
- **Scenarios**: User registration, practice logging, social interactions

## Development Workflow

1. **Environment Setup**: Copy `.env.example` to `.env.local` and add Firebase credentials
2. **Feature Development**: Implement components with TypeScript interfaces
3. **Database Operations**: Use the database utility functions in `app/_db/db.ts`
4. **Styling**: Apply Tailwind CSS classes directly in JSX
5. **Code Quality**: Pre-commit hooks run ESLint and Prettier automatically
6. **Type Checking**: Run `npx tsc --noEmit` to verify TypeScript types

## Production Considerations

- **Security**: Review and tighten Firebase security rules before deployment
- **Performance**: Optimize Firestore queries and implement pagination
- **Error Monitoring**: Add error tracking for production issues
- **Analytics**: Consider adding Firebase Analytics for user behavior tracking</content>
  <parameter name="filePath">/home/jack/Desktop/RealPractice/AGENTS.md
