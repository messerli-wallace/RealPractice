# RealPractice Time-Based Practice Logger (Work in Progress)

RealPractice is a social app meant to log and track one's time-based practice (musical instrument practice, meditation, studying, etc).
Practice is tracked via logging individual practice sessions. The user inputs time practiced and can provide a title, description, and tags for the type of practice they do.
Analytics for one's practice is provided on their profile page. Practice time over different intervals is provided.
Users can follow others, allowing for interaction on individual logs (liking and commenting).

Development is done by two university students using Next.js and Firebase.

## Configuration Setup

The application uses environment variables for Firebase configuration. Follow these steps to set up your development environment:

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Go to Project Settings > General
4. Scroll down to "Your apps" and register a web app
5. Copy the Firebase configuration object

### 2. Set Up Environment Variables

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Then fill in your Firebase credentials in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain-here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id-here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket-here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id-here
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id-here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id-here
```

### 3. Firebase Services Configuration

The application uses the following Firebase services:

- **Authentication**: Google Auth Provider
- **Firestore Database**: For storing user data and practice logs
- **Firebase Auth**: For user authentication

### 4. Development Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

### 5. Production Build

Create an optimized production build:

```bash
npm run build
npm start
```

## Configuration Files

- `.env.local`: Local environment variables (gitignored)
- `.env.example`: Example environment variables (committed to repo)
- `lib/config/firebaseConfig.ts`: Firebase configuration type definitions
- `app/firebase.tsx`: Firebase initialization

## Important Notes

- Never commit your actual Firebase credentials to version control
- The `.env.local` file is automatically ignored by git
- All Firebase configuration variables are prefixed with `NEXT_PUBLIC_` to make them available to the client-side code
- For security, consider using Firebase App Check in production
