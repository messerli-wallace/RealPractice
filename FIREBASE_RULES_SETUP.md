# Firebase Firestore Security Rules Setup Guide

## Problem
The `fetchRecentPosts` function is failing with "Missing or insufficient permissions" error because the Firebase Firestore security rules are not configured to allow the required queries.

## Solution
You need to deploy the following security rules to your Firebase project.

## Step-by-Step Instructions

### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase in your project (if not already done)
```bash
firebase init firestore
```
- Select your Firebase project when prompted
- Choose "Firestore: Configure security rules and indexes files"

### 4. Deploy the Security Rules
You have two options:

#### Option A: Use the provided rules file
```bash
# Copy the rules file to the Firebase configuration location
cp firebase.rules firestore.rules

# Deploy the rules
firebase deploy --only firestore:rules
```

#### Option B: Manually update your existing rules
If you already have a `firestore.rules` file, update it with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all users collection documents
    // This allows the fetchRecentPosts function to query and read user data
    match /users/{userId} {
      allow read: if true; // Allow all reads for now (adjust for production)
      allow write: if request.auth != null && request.auth.uid == userId; // Only allow users to write to their own documents
    }
  }
}
```

Then deploy:
```bash
firebase deploy --only firestore:rules
```

### 5. Verify the Deployment
After deployment, you should see output like:
```
=== Deploying to 'your-project-id'...

i  deploying firestore
✅  firestore: rules ready for deployment
i  firestore: checking firestore.rules for compilation errors...
✅  firestore: rules file firestore.rules compiled successfully
✅  firestore: released rules to cloud.firestore

✅  Deploy complete!
```

## Security Considerations

### Current Rules (Development)
The provided rules allow:
- **Read access**: Anyone can read any user document (for development/testing)
- **Write access**: Only authenticated users can write to their own documents

### Production Recommendations
For production, you should tighten the read rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Only allow reads if user is authenticated
      allow read: if request.auth != null;
      
      // Only allow writes to own document
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Or even more restrictive:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Allow reads only for friends or public data
      allow read: if request.auth != null && 
                  (request.auth.uid == userId || 
                   get(/databases/$(database)/documents/users/$(userId)).data.friends.hasAny([request.auth.uid]));
      
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Troubleshooting

### If you still get permission errors:
1. **Check your Firebase project ID**: Ensure you're deploying to the correct project
2. **Verify authentication**: Make sure users are properly authenticated before making queries
3. **Check the Firestore console**: Go to Firebase Console > Firestore > Rules to see the deployed rules
4. **Test rules in the emulator**: Use the Firebase emulator to test rules locally

### Common Issues:
- **Wrong project**: You might be deploying to a different project than your app is using
- **Caching**: Firebase rules can take a few minutes to propagate
- **Authentication**: The user might not be properly authenticated in your app

## Additional Resources
- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Rules Testing](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
- [Firebase Rules Reference](https://firebase.google.com/docs/reference/rules/rules)

## Next Steps
After deploying these rules, the `fetchRecentPosts` function should work without permission errors. The function queries the users collection by name and reads log data from multiple users, which is now allowed by these rules.