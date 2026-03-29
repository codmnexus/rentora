# Runbook: Payment Handling

## When to Use
When processing, debugging, or modifying any payment-related functionality.

## Payment Flow (Happy Path)

1. **Tenant initiates payment** → Frontend calls `POST /api/initialize-payment`
2. **Server creates Paystack transaction** → Returns authorization URL
3. **Tenant completes payment on Paystack** → Redirected back to app
4. **Paystack sends webhook** → `POST /api/paystack-webhook`
5. **Server verifies webhook signature** → Using `PAYSTACK_SECRET_KEY`
6. **Server creates escrow record** → Status: `held`
7. **Server logs transaction** → In `transactions` collection

## Verification Checklist

- [ ] Webhook signature is validated before processing
- [ ] Transaction amount matches expected amount
- [ ] Escrow record is created with correct status
- [ ] Transaction log entry exists with all required fields
- [ ] Duplicate webhooks are handled idempotently
- [ ] Error cases return appropriate HTTP status codes

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Payment not reflected | Webhook failed/delayed | Check Paystack dashboard events, verify webhook URL |
| Duplicate charges | Webhook retry without idempotency | Check `reference` uniqueness before processing |
| Wrong amount | Currency/amount mismatch | Verify amount is in kobo (NGN smallest unit) |
| Webhook 401 | Invalid secret | Verify `PAYSTACK_SECRET_KEY` in environment |

## Emergency Actions

1. **Payment stuck**: Check Paystack dashboard → verify event delivery → manually reconcile if needed
2. **Overcharge**: Create refund via Paystack API → update escrow status → log transaction
3. **Webhook endpoint down**: Paystack retries for 72h → fix endpoint → events will replay
