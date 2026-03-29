# Wallet Module — SYSTEM

> Context file for wallet balance management

## Location
- `api/wallet.js` — Read wallet balance
- `api/request-withdrawal.js` — Landlord requests payout
- `api/approve-withdrawal.js` — Admin approves withdrawal
- `api/get-withdrawals.js` — List withdrawal requests
- `src/components/tenantDashboard.js` — Wallet balance display (read-only UI)

## Balance Rules
- Wallet balance is the **single source of truth** in Firestore
- Balance is **ONLY** modified by server-side code (Admin SDK)
- Balance updates must be **atomic** (`FieldValue.increment`)
- Balance can **NEVER** go negative
- Every balance change requires a **transaction log entry**

## Risks
- **Client-side balance modification** — CRITICAL: wallet becomes unreliable
- **Non-atomic updates** — read-then-write creates race conditions
- **Negative balance** — withdrawal exceeds available funds
- **Missing audit trail** — balance changes without transaction logs
- **Unauthorized withdrawal** — user withdraws without admin approval

## Forbidden
- Modifying wallet balance from `src/components/` or `src/utils/`
- Using set/overwrite instead of atomic increment for balance changes
- Approving withdrawal without checking available balance
- Processing withdrawal without admin role verification
- Skipping transaction log on any balance change
- Computing balance client-side (always read from DB)

## Required Protections
- `FieldValue.increment()` for all balance modifications
- Balance check before withdrawal (reject if amount > balance)
- Admin role verification on withdrawal approval
- Transaction logging for: escrow release (credit), withdrawal (debit)
- Read-only wallet access from client (via Firestore security rules)
- Reconciliation: ability to verify balance matches sum of transaction logs
