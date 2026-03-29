# Escrow Module — SYSTEM

> Context file for escrow holding and release logic

## Location
- `api/create-escrow.js` — Creates escrow hold after verified payment
- `api/release-escrow.js` — Releases held funds to landlord wallet
- `api/refund-escrow.js` — Returns held funds to tenant
- `api/get-escrows.js` — Lists escrow records

## State Machine
```
[held] ──→ [released]  (funds → landlord wallet)
       └─→ [refunded]  (funds → tenant)
```

Valid transitions:
- `held` → `released` ✅
- `held` → `refunded` ✅
- `released` → anything ❌ (terminal state)
- `refunded` → anything ❌ (terminal state)

## Risks
- **State corruption** — escrow in invalid state (e.g., both released AND refunded)
- **Double release** — funds credited twice to landlord
- **Unauthorized release** — tenant or non-admin triggers release
- **Orphaned escrow** — escrow created without a valid payment
- **Race condition** — concurrent release and refund requests

## Forbidden
- Releasing or refunding escrow from client-side code
- Skipping status validation before state transition
- Creating escrow without a verified payment reference
- Modifying escrow amount after creation
- Deleting escrow records (use status for lifecycle)
- Releasing to a wallet that doesn't exist

## Required Protections
- Server-side only state transitions (Firebase Admin SDK)
- Status check before every transition (reject invalid transitions)
- Atomic operations: update escrow status + credit wallet in single transaction
- Transaction logging for every state change
- Auth verification: only admin or authorized parties can trigger transitions
- Amount validation: release amount matches held amount
