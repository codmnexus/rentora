# Runbook: Incident Response

## When to Use
When a production incident is detected — system outage, data inconsistency, security breach, or financial discrepancy.

## Severity Levels

| Level | Description | Response Time | Examples |
|-------|------------|---------------|----------|
| **P0** | Financial data loss or security breach | Immediate | Unauthorized wallet modification, escrow bypass |
| **P1** | Core feature broken | < 1 hour | Payments failing, auth broken |
| **P2** | Feature degraded | < 4 hours | Slow queries, UI glitches |
| **P3** | Minor issue | Next business day | Cosmetic bugs, non-critical errors |

## Response Steps

### 1. Identify
- What is broken? (payments, auth, listings, etc.)
- When did it start?
- Who is affected? (all users, specific roles, specific actions)
- Is financial data at risk?

### 2. Contain
- **If financial**: Immediately disable affected payment endpoints
- **If security**: Rotate compromised credentials
- **If data**: Stop writes to affected collections
- **If auth**: Force session invalidation if needed

### 3. Fix
- Identify root cause
- Apply fix in a branch
- Run relevant agent skills (security-audit, payment-audit)
- Test thoroughly before deploying

### 4. Verify
- Confirm fix resolves the issue
- Check for data inconsistencies
- Reconcile financial records if applicable
- Monitor for recurrence

### 5. Document
- Create ADR in `docs/decisions/` if architectural change was needed
- Update relevant module SYSTEM.md if new rules emerged
- Log incident timeline for future reference

## Emergency Contacts & Tools

- **Paystack Dashboard**: Check payment events 
- **Firebase Console**: Check Firestore data, Auth users, logs
- **Vercel Dashboard**: Check serverless function logs and deployments
