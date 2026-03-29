# API Module — SYSTEM

> Context file for `api/` — Vercel serverless functions

## Location
All API endpoints live in `api/` as individual serverless functions.

## Existing Endpoints

| File | Method | Purpose |
|------|--------|---------|
| `health.js` | GET | Health check |
| `initialize-payment.js` | POST | Start Paystack transaction |
| `paystack-webhook.js` | POST | Handle Paystack payment confirmation |
| `create-escrow.js` | POST | Create escrow hold |
| `release-escrow.js` | POST | Release escrow to wallet |
| `refund-escrow.js` | POST | Refund escrow to tenant |
| `wallet.js` | GET | Read wallet balance |
| `request-withdrawal.js` | POST | Landlord requests payout |
| `approve-withdrawal.js` | POST | Admin approves payout |
| `get-escrows.js` | GET | List escrow records |
| `get-withdrawals.js` | GET | List withdrawal requests |

## Shared Code
- `api/_lib/admin.js` — Firebase Admin SDK initialization

## Risks
- Endpoints exposed to internet — must validate all inputs
- Financial endpoints are high-value targets — require auth + signature verification
- Misconfigured CORS could allow unauthorized origins

## Forbidden
- Returning raw error objects to client (information leakage)
- Processing payments without webhook signature verification
- Allowing unauthenticated access to financial endpoints
- Hardcoding secrets in source files

## Required Protections
- Every endpoint validates request method
- Every financial endpoint verifies Firebase Auth token
- Webhook endpoint verifies Paystack signature
- All responses use appropriate HTTP status codes
- All errors are logged server-side, sanitized for client
