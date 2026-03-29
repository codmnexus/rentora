---
name: payment-guard
description: Payment guard hook — triggers audit on payment-related changes, blocks unsafe balance updates
---

# Payment Guard Hook

This hook provides **automatic financial safety enforcement**. It activates whenever payment, escrow, or wallet code is modified.

## Trigger Conditions

This hook activates when ANY of these files are modified:
- `api/initialize-payment.js`
- `api/paystack-webhook.js`
- `api/create-escrow.js`
- `api/release-escrow.js`
- `api/refund-escrow.js`
- `api/wallet.js`
- `api/request-withdrawal.js`
- `api/approve-withdrawal.js`
- `src/components/paymentPage.js`
- `src/components/tenantDashboard.js` (contains wallet UI)
- `functions/index.js` (contains cloud functions)
- Any file containing: `escrow`, `wallet`, `payment`, `transaction`, `withdraw`

## Automatic Actions

### 1. Trigger Payment Audit
**Action: MANDATORY — run `.agents/skills/payment-audit.md`**

When a trigger file is modified, the full payment audit skill must run before the change is considered complete.

### 2. Block Unsafe Balance Updates
**Action: BLOCK if any of these patterns found**

```
BLOCKED PATTERNS:
- Client-side wallet balance modification (in src/components/ or src/utils/)
- Direct Firestore write to 'wallets' collection from frontend
- Balance calculation in frontend code
- Escrow status change from frontend code
- Missing transaction log alongside balance change
```

### 3. Block Missing Transaction Logs
**Action: BLOCK if transaction log is missing**

Every code path that modifies wallet balance or escrow status MUST include a corresponding write to the `transactions` collection. If a balance change exists without a transaction log:
1. **STOP** — do not allow the change
2. **Report** — identify the missing log
3. **Fix** — add the transaction log entry
4. **Re-verify** — run payment audit again

## Enforcement Level

This hook uses **BLOCK** enforcement only. Payment safety is non-negotiable.

- No warnings — only pass or block
- No exceptions — even "temporary" or "test" code must comply
- No overrides — the agent cannot skip this hook
