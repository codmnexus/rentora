# ADR-001: Escrow-First Payment Design

**Status:** Accepted  
**Date:** 2026-03-29  
**Decision Makers:** Rentora Engineering

## Context

Rentora facilitates rent payments between tenants and landlords. Without safeguards, funds could be sent to fraudulent listings or landlords could fail to deliver on lease terms.

## Decision

All payments go through an **escrow-first** flow:

1. Tenant pays → funds are **held** in escrow (not credited to landlord)
2. Conditions are met (e.g., move-in confirmed) → escrow is **released** to landlord wallet
3. Dispute occurs → escrow can be **refunded** to tenant

## Consequences

### Positive
- Prevents fraud — landlords can't collect without fulfilling terms
- Builds tenant trust — money is protected until conditions are met
- Enables dispute resolution — funds can be returned if needed

### Negative
- Adds complexity to the payment flow
- Requires careful state machine management (held → released | refunded)
- Landlords experience delayed access to funds

## Alternatives Considered

1. **Direct payment** — rejected due to fraud risk
2. **Third-party escrow service** — rejected due to cost and integration complexity
3. **Platform-managed escrow (chosen)** — best balance of control and simplicity
