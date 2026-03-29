# Persistence Module — SYSTEM

> Context file for database operations and security rules

## Location
- `src/utils/firebaseStore.js` — All Firestore CRUD operations (client-side)
- `src/utils/store.js` — Legacy localStorage-based store (deprecated)
- `firestore.rules` — Firestore security rules
- `firestore.indexes.json` — Composite index definitions
- `functions/index.js` — Cloud functions with Admin SDK access

## Collections

| Collection | Access | Description |
|-----------|--------|-------------|
| `users` | Read: owner; Write: owner | User profiles |
| `properties` | Read: all; Write: owner | Property listings |
| `takeovers` | Read: all; Write: owner | Lease takeover listings |
| `messages` | Read: participants; Write: participants | Chat messages |
| `escrows` | Read: parties; Write: **server only** | Escrow records |
| `wallets` | Read: owner; Write: **server only** | Wallet balances |
| `transactions` | Read: parties; Write: **server only** | Transaction logs |
| `withdrawals` | Read: owner/admin; Write: **server only** | Withdrawal requests |

## Risks
- Overly permissive Firestore rules → unauthorized data access
- Missing indexes → slow queries or query failures
- Race conditions on concurrent writes → data inconsistency
- Client-side writes to financial collections → integrity breach

## Forbidden
- Writing to `escrows`, `wallets`, `transactions`, `withdrawals` from client code
- Weakening Firestore security rules without ADR documentation
- Using `store.js` (deprecated) for new features
- Raw Firestore queries without error handling
- Deleting financial records

## Required Protections
- Firestore security rules enforce RLS (row-level security)
- Financial collections are write-restricted to Admin SDK (server only)
- All database operations in `firebaseStore.js` include error handling
- Concurrent writes use transactions or atomic operations
- Schema changes are documented in architecture decisions
