---
name: payment-audit
description: Payment system audit — verify webhook usage, transaction logs, escrow flow, wallet integrity
---

# Payment Audit Skill

Run this skill on ANY change touching payments, escrow, wallet, or transaction logic.

## Steps

### 1. Webhook Verification
- [ ] Payment confirmation comes ONLY from Paystack webhook, never from client
- [ ] Webhook handler verifies Paystack signature using `PAYSTACK_SECRET_KEY`
- [ ] Webhook handler is idempotent (duplicate events don't cause double-processing)
- [ ] Webhook responds with 200 quickly (heavy processing is async if needed)
- [ ] Failed verification returns 401 and stops processing

### 2. Transaction Logging
- [ ] Every money movement creates a transaction log entry
- [ ] Log includes: type, amount, sender, recipient, reference, timestamp, status
- [ ] Logs are write-only from server (no client writes to transactions collection)
- [ ] No financial operation completes without a corresponding log entry
- [ ] Log entries are never deleted or modified

### 3. Escrow Flow Integrity
- [ ] Escrow follows state machine: `held` → `released` | `refunded`
- [ ] Status transitions are validated (can't release a refunded escrow)
- [ ] Escrow creation only happens after verified payment
- [ ] Release only happens server-side with proper authorization
- [ ] Refund only happens server-side with proper authorization
- [ ] Amount in escrow matches original payment amount

### 4. Wallet Integrity
- [ ] Wallet balance is stored in database ONLY (never computed client-side)
- [ ] Balance updates are atomic (use Firestore transactions or FieldValue.increment)
- [ ] Balance can never go negative
- [ ] Every balance change has a corresponding transaction log
- [ ] Withdrawal requests require admin approval
- [ ] Withdrawal amount cannot exceed wallet balance

### 5. Data Consistency
- [ ] Payment reference is unique across all transactions
- [ ] Escrow records link to valid payment references
- [ ] Wallet balance matches sum of credits minus debits in transaction logs
- [ ] No orphaned escrow records (without corresponding payment)

## Critical Files to Check

| File | Check |
|------|-------|
| `api/initialize-payment.js` | Proper Paystack initialization, no amount tampering |
| `api/paystack-webhook.js` | Signature verification, idempotency |
| `api/create-escrow.js` | Only called after verified payment |
| `api/release-escrow.js` | Status validation, atomic wallet update |
| `api/refund-escrow.js` | Status validation, proper refund flow |
| `api/wallet.js` | Balance read-only from client perspective |
| `api/request-withdrawal.js` | Balance check, proper request creation |
| `api/approve-withdrawal.js` | Admin-only, balance check, atomic update |

## Output

- ✅ **SOUND** — payment system is secure and consistent
- ⚠️ **RISK** — potential financial integrity issue
- 🚫 **BREACH** — confirmed financial vulnerability, STOP and fix immediately
