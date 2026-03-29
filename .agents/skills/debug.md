---
name: debug
description: Structured debugging workflow — trace root cause, isolate issue, fix without breaking the system
---

# Debug Skill

Run this skill when investigating a bug or unexpected behavior.

## Steps

### 1. Reproduce
- [ ] Confirm the bug exists (don't fix phantom issues)
- [ ] Identify exact steps to reproduce
- [ ] Note which user role is affected (tenant, landlord, admin)
- [ ] Note which module/page is affected

### 2. Trace Root Cause
- [ ] Check browser console for frontend errors
- [ ] Check Vercel function logs for API errors
- [ ] Check Firebase console for Firestore/Auth errors
- [ ] Trace the data flow: frontend → API → database → response
- [ ] Identify the exact line/function where behavior diverges

### 3. Isolate
- [ ] Is this a frontend-only issue? (rendering, routing, state)
- [ ] Is this an API issue? (validation, logic, response)
- [ ] Is this a database issue? (rules, data shape, missing records)
- [ ] Is this an integration issue? (Paystack, Firebase, timing)

### 4. Fix
- [ ] Apply minimal fix — don't refactor while debugging
- [ ] Ensure fix doesn't break other functionality
- [ ] If fix touches financial code → run payment-audit skill
- [ ] If fix touches auth code → run security-audit skill
- [ ] Add defensive code to prevent recurrence

### 5. Verify
- [ ] Reproduce original steps — bug is gone
- [ ] Test adjacent functionality — nothing else broke
- [ ] Check edge cases related to the fix

## Rules

1. **Never guess** — always trace to root cause
2. **Fix one thing at a time** — avoid bundling fixes
3. **Don't suppress errors** — fix the cause, not the symptom
4. **Log your findings** — update relevant SYSTEM.md if you discover new risks
