---
name: release
description: Full release checklist — verify payments, logs, security, and deployment readiness
---

# Release Skill

Run this skill before any production deployment.

## Pre-Release Checklist

### 1. Code Quality
- [ ] All changes reviewed (run code-review skill)
- [ ] No TODO/FIXME left in production code paths
- [ ] No `console.log` debug statements in API routes
- [ ] No commented-out code blocks

### 2. Security Verification
- [ ] Run security-audit skill — all checks pass
- [ ] No secrets in source code or git history
- [ ] Environment variables are set in Vercel dashboard
- [ ] Firestore security rules are up to date and deployed
- [ ] CORS configuration is correct

### 3. Payment Verification
- [ ] Run payment-audit skill — all checks pass
- [ ] Paystack webhook URL is configured for production
- [ ] Webhook secret matches production environment
- [ ] Test payment flow end-to-end (if staging available)

### 4. Data Integrity
- [ ] Database schema matches expected structure
- [ ] Indexes are deployed (`firestore.indexes.json`)
- [ ] No orphaned data or broken references

### 5. Deployment
- [ ] Build succeeds without errors
- [ ] All serverless functions deploy cleanly
- [ ] Health check endpoint responds (`/api/health`)
- [ ] Frontend loads without console errors

### 6. Post-Deploy Verification
- [ ] Login flow works (tenant + landlord)
- [ ] Property listing loads
- [ ] Payment initiation works
- [ ] Dashboard renders correctly
- [ ] Monitor logs for 15 minutes after deploy

## Rollback Plan

If critical issues found post-deploy:
1. Revert to previous deployment in Vercel
2. Check if data was corrupted — reconcile if needed
3. Document issue in `docs/decisions/`
4. Fix and re-run release skill
