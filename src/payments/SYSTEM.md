# Payments Module — SYSTEM

> Context file for payment processing logic

## Location
- `api/initialize-payment.js` — Starts Paystack transaction
- `api/paystack-webhook.js` — Receives payment confirmation from Paystack
- `src/components/paymentPage.js` — Payment UI (client-side)

## Payment Flow
```
Tenant → Frontend → POST /api/initialize-payment → Paystack
Paystack → Tenant completes payment
Paystack → POST /api/paystack-webhook (server-to-server)
Webhook handler → verify signature → create escrow → log transaction
```

## Risks
- **Client-side payment confirmation** — CRITICAL: never trust the browser for payment status
- **Webhook replay attacks** — duplicate events could cause double-processing
- **Amount tampering** — client could send modified amount to initialization
- **Missing webhook** — Paystack event doesn't arrive → payment not recorded

## Forbidden
- Confirming payment based on client-side callback/redirect
- Processing webhook without verifying Paystack signature
- Allowing client to specify payment amount (must be server-calculated)
- Skipping transaction logging on any payment event
- Exposing Paystack secret key in client code
- Storing full card details anywhere

## Required Protections
- Webhook signature verification using `PAYSTACK_SECRET_KEY`
- Idempotent webhook processing (check for existing transaction by reference)
- Server-side amount calculation (don't trust client-submitted amounts)
- Transaction logging for every payment event
- Error handling with appropriate HTTP status codes
- Rate limiting on payment initialization endpoint
