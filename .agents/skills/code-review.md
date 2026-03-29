---
name: code-review
description: Systematic code review workflow — checks validation, rate limits, security, and RLS enforcement
---

# Code Review Skill

Run this skill when reviewing any code changes before merge or deploy.

## Steps

### 1. Input Validation Check
- [ ] All user inputs are validated (type, length, format)
- [ ] All API request bodies are validated before processing
- [ ] Query parameters are sanitized
- [ ] No raw user input is passed to database queries
- [ ] File uploads (if any) are type-checked and size-limited

### 2. Rate Limiting Check
- [ ] API endpoints have rate limiting or are behind auth
- [ ] Expensive operations (payment, search) are throttled
- [ ] Retry logic has exponential backoff where applicable

### 3. Security Check
- [ ] No secrets or API keys in client-side code
- [ ] No `eval()`, `innerHTML` with user data, or other injection vectors
- [ ] CORS is configured correctly
- [ ] Auth tokens are validated on every protected endpoint
- [ ] Error messages don't leak internal details

### 4. Row-Level Security (RLS) Check
- [ ] Firestore security rules enforce user-scoped access
- [ ] Users can only read/write their own data (unless admin)
- [ ] Financial collections (escrow, wallet, transactions) are server-write-only
- [ ] Admin operations require admin role verification

### 5. Code Quality Check
- [ ] No unused variables or imports
- [ ] Functions are focused (single responsibility)
- [ ] Error handling is consistent (try/catch, proper HTTP status codes)
- [ ] No hardcoded values that should be config/env

## Output

Report findings as:
- ✅ **PASS** — no issues found
- ⚠️ **WARN** — non-critical issue, should fix
- 🚫 **FAIL** — critical issue, must fix before merge
