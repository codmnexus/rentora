---
name: post-change
description: Post-change enforcement hook — runs validation and security checks after any file modification
---

# Post-Change Hook

This hook defines checks to run AFTER any file modification. The agent should evaluate these after completing edits.

## Trigger Conditions

This hook activates when ANY of these files are modified:
- `api/**` — serverless functions
- `src/utils/**` — core utilities
- `src/components/**` — UI components
- `firestore.rules` — database security rules
- `firebase.json` — Firebase configuration
- `functions/**` — cloud functions

## Checks

### 1. Validation Check
**After editing any API route (`api/`):**
- [ ] Request body validation exists
- [ ] Required fields are checked
- [ ] Types are validated (string, number, etc.)
- [ ] Error responses use correct HTTP status codes

**After editing any component (`src/components/`):**
- [ ] Form inputs have validation
- [ ] User-facing errors are friendly (not raw error objects)
- [ ] Loading states are handled

### 2. Security Check
**After editing any file:**
- [ ] No new secrets introduced
- [ ] No auth bypass created
- [ ] No financial logic moved to client side

**After editing Firestore rules (`firestore.rules`):**
- [ ] Rules are not more permissive than before
- [ ] Financial collections remain write-protected from clients
- [ ] Test with security rules emulator if possible

### 3. Consistency Check
- [ ] Related files are updated together (e.g., API + component that calls it)
- [ ] Module SYSTEM.md is still accurate after changes
- [ ] No broken imports or references

## Enforcement

- **WARN** for validation and consistency issues
- **BLOCK** for security regressions (more permissive rules, auth bypasses)
