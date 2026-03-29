# RENTORA — SYSTEM MEMORY

> This file is the single source of truth for any AI agent operating in this repository.
> Read this FIRST before making any changes.

---

## WHY

Rentora is a **student housing marketplace** that enables:
- Property listings and lease takeovers
- Real-time messaging between tenants and landlords
- Secure rent payments via **Paystack**
- **Escrow** to hold funds and prevent fraud
- **Wallet** system for landlord payouts

---

## MAP

| Module | Location | Purpose |
|--------|----------|---------|
| Frontend Components | `src/components/` | UI pages and widgets |
| Frontend Utils | `src/utils/` | Firebase SDK, auth, store, router |
| API Endpoints | `api/` | Vercel serverless functions |
| Cloud Functions | `functions/` | Firebase cloud functions |
| Firebase Config | `firebase.json`, `firestore.rules` | DB rules, hosting, indexes |
| Agent Skills | `.agents/skills/` | Reusable agent workflows |
| Agent Hooks | `.agents/hooks/` | Automated enforcement rules |
| Documentation | `docs/` | Architecture, decisions, runbooks |

### Critical Code Paths
- `api/initialize-payment.js` → starts Paystack transaction
- `api/paystack-webhook.js` → verifies payment server-side
- `api/create-escrow.js` → holds funds in escrow
- `api/release-escrow.js` → releases funds to landlord wallet
- `api/refund-escrow.js` → returns funds to tenant
- `api/wallet.js` → reads wallet balance
- `api/request-withdrawal.js` → landlord requests payout
- `api/approve-withdrawal.js` → admin approves payout
- `src/utils/firebaseStore.js` → all Firestore CRUD operations
- `src/utils/authSecurity.js` → auth guards and session security

---

## RULES

### ✅ ALLOWED
- Server-side financial logic only (API routes / cloud functions)
- Validated and sanitized inputs on every endpoint
- Transaction logging for all financial operations
- Webhook-based payment verification (Paystack signature)
- Row-Level Security (RLS) via Firestore security rules
- Atomic database operations for balance changes

### 🚫 FORBIDDEN
- Client-side payment confirmation — **NEVER trust the browser**
- Exposing secrets (API keys, webhook secrets) in frontend code
- Direct Firestore writes from frontend for financial data
- Modifying wallet balance from client-side code
- Releasing escrow from client-side code
- Skipping transaction logs on any money movement
- Disabling or weakening Firestore security rules

---

## ENGINEERING PRINCIPLES

> Full details in `docs/decisions/ADR-002-tech-principles.md`

### ✅ DO
- Use ready-made auth (Firebase Auth) — never build from scratch
- Validate ALL inputs (client for UX, server for security)
- Use managed services (Firestore, Paystack, Vercel, Firebase Storage)
- Deploy via Vercel auto-deploy — never deploy manually
- Add error tracking and structured logging from Day 1
- Handle ALL UI states: loading, empty, error, success
- Document env vars in `.env.example`
- Use preview deployments for every branch
- Ship → iterate → improve (don't chase "perfect" before shipping)

### 🚫 DON'T
- Don't build custom auth, payments, search, or file upload
- Don't hardcode API keys or secrets anywhere
- Don't skip error boundaries and fallbacks
- Don't ignore performance (run Lighthouse regularly)
- Don't assume users "will figure it out" — add onboarding + empty states
- Don't write to financial collections from client-side
- Don't push directly to main — use branch + review flow
- Don't skip logging and monitoring
- Don't over-engineer state management
- Don't postpone refactoring forever

---

## TECHNOLOGY CHOICES

| Need | Choice | Why |
|------|--------|-----|
| Auth | Firebase Authentication | Managed, secure, multi-provider |
| Database | Firebase Firestore | Managed NoSQL, real-time, RLS |
| Payments | Paystack | Webhook-verified, African markets |
| Hosting | Vercel | Auto-deploy, preview URLs, serverless |
| File Storage | Firebase Storage | Managed, CDN, security rules |
| Cloud Functions | Firebase Functions | Server-side triggers |
| Frontend | Vanilla JS SPA | Lightweight, no framework lock-in |
| Styling | CSS design tokens | Consistent, performant |

---

## AVAILABLE SKILLS

| Skill | Trigger | File |
|-------|---------|------|
| Code Review | Before merge/deploy | `.agents/skills/code-review.md` |
| Refactor | Structure cleanup | `.agents/skills/refactor.md` |
| Debug | Bug investigation | `.agents/skills/debug.md` |
| Release | Before production deploy | `.agents/skills/release.md` |
| Security Audit | Security-sensitive changes | `.agents/skills/security-audit.md` |
| Payment Audit | Financial code changes | `.agents/skills/payment-audit.md` |
| Validation Patterns | Input handling changes | `.agents/skills/validation-patterns.md` |
| Observability | Error tracking / logging | `.agents/skills/observability.md` |
| Performance Audit | Before release / slow pages | `.agents/skills/performance-audit.md` |

## ACTIVE HOOKS

| Hook | Enforcement | File |
|------|------------|------|
| Pre-Commit | BLOCK secrets + unsafe code | `.agents/hooks/pre-commit.md` |
| Post-Change | WARN + BLOCK on security regression | `.agents/hooks/post-change.md` |
| Payment Guard | BLOCK all financial violations | `.agents/hooks/payment-guard.md` |
| Dependency Guard | BLOCK missing error handling, WARN missing states | `.agents/hooks/dependency-guard.md` |

---

## WORKFLOWS

### Build
`create feature → validate inputs → secure logic → log actions`

### Review
`run code-review skill → run security-audit skill → fix issues`

### Payment Changes
`run payment-audit skill → verify webhook flow → verify logs`

### Release
`run release skill → verify payments → verify security → deploy → monitor`

---

## AGENT BEHAVIOR

When operating in this repository, the agent must:

1. **Read SYSTEM.md first** — understand purpose and rules
2. **Check module SYSTEM.md** — read `src/{module}/SYSTEM.md` before touching related code
3. **Enforce rules** — if a change violates RULES, stop → fix → continue
4. **Run relevant skills** — use `.agents/skills/` for reviews, audits, debugging
5. **Respect hooks** — check `.agents/hooks/` for automated enforcement triggers
6. **Never ignore violations** — unsafe code must be blocked, not warned about
