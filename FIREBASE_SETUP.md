# Firebase Setup Instructions

## Firebase Configuration
✅ **Done**: Firebase configuration has been set up with your project values.

## Firestore Database Structure
Make sure your Firestore database has the following structure:
```
api-keys (collection)
  └── REACT_APP_GROQ_API_KEY_1 (document)
      └── value: "your-groq-api-key-here"
```

## Firestore Security Rules
Update your Firestore rules to allow reading the api-keys collection from your GitHub Pages domain:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /api-keys/{document} {
      allow read: if true; // Or restrict to your domain
    }
    // Add other rules as needed
  }
}
```

## GitHub Pages Deployment
Your project is configured for GitHub Pages deployment with:
- Homepage: `https://DevRanbir.github.io/ptable`
- Deploy command: `npm run deploy`

## Authorized Domains in Firebase
Make sure to add your GitHub Pages domain to Firebase authorized domains:
1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add: `devranbir.github.io` (if not already present)

## Deployment Steps
1. Build and deploy: `npm run deploy`
2. Your app will be available at: https://DevRanbir.github.io/ptable

## Security Notes
- Firebase config values are safe to expose in client-side code
- The API key in Firestore should be the sensitive one that needs protection
- Consider implementing additional security measures for production use
