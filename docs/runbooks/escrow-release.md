# Runbook: Escrow Release Process

## When to Use
When releasing held escrow funds to a landlord's wallet, or when investigating escrow state issues.

## Escrow State Machine

```
[created] → [held] → [released] → (funds in wallet)
                   → [refunded] → (funds returned to tenant)
```

### State Transitions
| From | To | Trigger | API |
|------|----|---------|-----|
| — | held | Successful payment webhook | `api/create-escrow.js` |
| held | released | Admin/system approval | `api/release-escrow.js` |
| held | refunded | Dispute resolution | `api/refund-escrow.js` |

## Release Checklist

- [ ] Escrow record exists and status is `held`
- [ ] Payment was verified via webhook (not client-side)
- [ ] Release conditions are met (move-in confirmed, etc.)
- [ ] Landlord wallet exists in database
- [ ] Wallet balance update is atomic
- [ ] Transaction log is created for the release
- [ ] Escrow status is updated to `released`

## Safety Rules

1. **NEVER release escrow from client-side code**
2. **NEVER release without verifying the escrow is in `held` status**
3. **ALWAYS update wallet and escrow status in the same operation**
4. **ALWAYS create a transaction log entry**

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Escrow stuck in `held` | Release not triggered | Check release conditions, trigger manually if valid |
| Balance mismatch | Non-atomic update | Reconcile wallet balance against transaction logs |
| Double release | Missing status check | Verify status is `held` before release |
