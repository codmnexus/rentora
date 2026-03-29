# Auth Module — SYSTEM

> Context file for authentication and session security

## Location
- `src/utils/authSecurity.js` — Client-side auth guards and session handling
- `src/utils/firebase.js` — Firebase SDK initialization
- `src/components/loginPage.js` — Login/signup UI
- Firebase Authentication — external service (Google provider, email/password)

## Auth Flow
1. User signs in via Firebase Auth (email/password or Google)
2. Firebase issues ID token
3. Client stores auth state via Firebase SDK
4. API calls include ID token for server-side verification
5. Server verifies token via Firebase Admin SDK

## Risks
- Token expiry not handled → user sees errors instead of re-auth prompt
- Client-side role checks can be bypassed → must verify server-side
- Session persistence across tabs may cause stale state
- XSS could steal auth tokens from memory

## Forbidden
- Storing auth tokens in localStorage manually (use Firebase SDK)
- Trusting client-side role claims without server verification
- Allowing unauthenticated access to user-specific data
- Exposing Firebase Admin credentials in client code
- Disabling auth checks "temporarily" for testing

## Required Protections
- Firebase Auth state listener for reactive auth handling
- Server-side token verification on all protected API endpoints
- Admin role verification via custom claims (checked server-side)
- Proper sign-out that clears all client state
- Auth error handling with user-friendly messages
