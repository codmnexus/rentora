# Rentora — System Architecture

## Overview

Rentora is a single-page application (SPA) with a serverless backend. The frontend renders in the browser and communicates with Vercel serverless functions for secure operations. Firebase provides authentication and persistent storage.

---

## Architecture Diagram

```mermaid
graph TD
    subgraph "Browser (Client)"
        A["SPA - src/components/"]
        B["Auth Security - src/utils/authSecurity.js"]
        C["Firebase Store - src/utils/firebaseStore.js"]
        D["Router - src/utils/router.js"]
    end

    subgraph "Vercel Serverless (Server)"
        E["Payment APIs - api/"]
        F["Escrow APIs"]
        G["Wallet APIs"]
    end

    subgraph "External Services"
        H["Firebase Auth"]
        I["Firestore DB"]
        J["Paystack"]
    end

    A --> D
    A --> B
    A --> C
    C --> I
    B --> H
    A --> E
    E --> J
    J -->|webhook| F
    F --> I
    G --> I
    E --> I
```

## Data Flow: Payment → Escrow → Wallet

```mermaid
sequenceDiagram
    participant T as Tenant
    participant FE as Frontend
    participant API as Vercel API
    participant PS as Paystack
    participant DB as Firestore

    T->>FE: Click "Pay Rent"
    FE->>API: POST /api/initialize-payment
    API->>PS: Initialize transaction
    PS-->>API: Authorization URL
    API-->>FE: Redirect URL
    FE->>PS: Redirect to Paystack checkout
    T->>PS: Complete payment
    PS->>API: POST /api/paystack-webhook (signed)
    API->>API: Verify webhook signature
    API->>DB: Create escrow record (status: held)
    API->>DB: Log transaction
    Note over API,DB: Later, on release trigger:
    API->>DB: Update escrow (status: released)
    API->>DB: Credit landlord wallet
    API->>DB: Log transaction
```

## Module Interactions

| Module | Reads From | Writes To | Depends On |
|--------|-----------|-----------|------------|
| Frontend Components | Firestore (via store) | Firestore (non-financial) | Auth, Router, Store |
| Payment APIs | Paystack, Firestore | Firestore (escrow, transactions) | Firebase Admin SDK |
| Escrow APIs | Firestore | Firestore (escrow, wallet, transactions) | Firebase Admin SDK |
| Wallet APIs | Firestore | Firestore (wallet, transactions) | Firebase Admin SDK |
| Auth Security | Firebase Auth | — | Firebase SDK |
| Firestore Rules | — | — | Firebase Auth (for RLS) |

## Security Boundaries

1. **Client ↔ Server**: Client NEVER handles financial confirmations. All payment verification happens server-side via Paystack webhooks.
2. **Server ↔ Database**: Server uses Firebase Admin SDK (bypasses client rules). Firestore security rules protect against direct client writes to financial collections.
3. **Server ↔ Paystack**: Webhook signature verification ensures only authentic Paystack events are processed.
