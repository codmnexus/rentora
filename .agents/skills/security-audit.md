---
name: security-audit
description: Security audit workflow — scan for secrets, validate input handling, verify auth safety
---

# Security Audit Skill

Run this skill on any security-sensitive changes, or as part of a release.

## Steps

### 1. Secret Scanning
- [ ] No API keys, tokens, or passwords in source code
- [ ] No secrets in git history (check recent commits)
- [ ] `.env` files are in `.gitignore`
- [ ] Firebase config uses only public-safe keys on client side
- [ ] Paystack secret key is ONLY in server-side code and environment variables

### 2. Input Validation
- [ ] All API endpoints validate request body schema
- [ ] Numeric inputs are bounds-checked (no negative amounts, etc.)
- [ ] String inputs are length-limited
- [ ] Email/phone inputs are format-validated
- [ ] File paths (if any) are sanitized against traversal

### 3. Authentication Safety
- [ ] All protected routes check Firebase Auth token
- [ ] Token verification happens server-side (Firebase Admin SDK)
- [ ] Session handling has proper expiry
- [ ] Admin routes verify admin role claim
- [ ] Failed auth returns 401, not 500

### 4. Authorization (RLS)
- [ ] Firestore rules enforce ownership checks
- [ ] Users cannot access other users' data
- [ ] Financial collections are write-protected from clients
- [ ] Admin operations require verified admin claims
- [ ] Listing modifications require owner verification

### 5. Transport Security
- [ ] All external API calls use HTTPS
- [ ] Webhook endpoints verify payload signatures
- [ ] CORS allows only expected origins
- [ ] No sensitive data in URL query parameters

### 6. Client-Side Safety
- [ ] No `eval()` or `Function()` with dynamic input
- [ ] No `innerHTML` with unsanitized user content
- [ ] No sensitive data stored in localStorage (except auth tokens)
- [ ] Error messages don't expose stack traces or internal paths

## Output

For each category, report:
- ✅ **SECURE** — no issues
- ⚠️ **RISK** — potential vulnerability, investigate
- 🚫 **VULNERABLE** — confirmed security issue, must fix immediately
