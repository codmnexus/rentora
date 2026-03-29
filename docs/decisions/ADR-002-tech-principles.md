# ADR-002: Engineering Principles — DO / DON'T

**Status:** Accepted  
**Date:** 2026-03-29  
**Decision Makers:** Rentora Engineering

## Context

Defining a set of startup engineering best practices to avoid common time-wasting mistakes and ensure the codebase scales safely.

## Decision

Adopt the following DO / DON'T rules as binding engineering principles for all work on Rentora.

## ✅ DO

| # | Principle | Rentora Implementation |
|---|-----------|----------------------|
| 1 | Use ready-made auth | Firebase Authentication |
| 2 | Use a design system for UI | Vanilla CSS design tokens in `index.css` |
| 3 | Keep state management simple | Firebase SDK + component-local state |
| 4 | Use structured API patterns | Vercel serverless functions with consistent validation |
| 5 | Deploy with one-click | Vercel auto-deploy on push |
| 6 | Use managed database | Firebase Firestore (managed NoSQL) |
| 7 | Validate all inputs | `validation-patterns.md` skill |
| 8 | Use established payment provider | Paystack with webhook verification |
| 9 | Add error tracking early | `observability.md` skill |
| 10 | Set up analytics | PostHog / Plausible recommended |
| 11 | Store secrets in env files | `.env` + `.env.example` template |
| 12 | Use file upload services | Firebase Storage / Cloudinary |
| 13 | Set up preview deployments | Vercel branch previews (auto) |
| 14 | Use component patterns | Reusable components in `src/components/` |
| 15 | Write README from Day 1 | `README.md` maintained |
| 16 | Keep folders clean and modular | `refactor.md` skill enforces |
| 17 | Add onboarding + empty states | `ux-patterns.md` runbook |
| 18 | Use performance tools | `performance-audit.md` skill |
| 19 | Use clear app structure | SYSTEM.md + module SYSTEM.md files |
| 20 | Document env vars | `.env.example` file |

## 🚫 DON'T

| # | Anti-Pattern | Why | Enforcement |
|---|-------------|-----|-------------|
| 1 | Build auth from scratch | Security risk, time waste | SYSTEM.md rules |
| 2 | Write raw CSS for everything | Slow, inconsistent | Design tokens in `index.css` |
| 3 | Over-engineer state management | Premature complexity | Keep local state + Firebase SDK |
| 4 | Build custom APIs too early | Yak shaving | Use serverless functions |
| 5 | Deploy manually | Error-prone, slow | Vercel auto-deploy |
| 6 | Write raw SQL/queries everywhere | Bugs, no safety | `firebaseStore.js` data layer |
| 7 | Build your own payment system | Legal/security risk | `payment-guard.md` hook blocks |
| 8 | Roll your own search engine | Reinventing the wheel | Use Firestore queries + indexes |
| 9 | Skip logging & monitoring | Flying blind | `observability.md` skill |
| 10 | Hardcode API keys | Security breach | `pre-commit.md` hook blocks |
| 11 | DIY file uploads | Storage, security issues | Use Firebase Storage |
| 12 | Push straight to main | No review gate | Branch → PR → merge workflow |
| 13 | Build realtime systems alone | Complexity explosion | Use Firebase realtime listeners |
| 14 | Ignore performance | Users leave | `performance-audit.md` skill |
| 15 | Assume users "will figure it out" | Poor UX, churn | `ux-patterns.md` runbook |
| 16 | Postpone refactoring forever | Tech debt grows exponential | `refactor.md` skill |
| 17 | Rely on memory for decisions | Context lost | ADRs in `docs/decisions/` |
| 18 | Chase "perfect" before shipping | Never ships | Ship → iterate → improve |
| 19 | Skip error boundaries/fallbacks | Blank screens, crashes | `dependency-guard.md` hook |
| 20 | Forget health check endpoint | Can't verify deployment | `/api/health` exists |

## Consequences

### Positive
- Faster development velocity
- Fewer security incidents
- Better user experience
- Easier onboarding for new contributors

### Negative
- Some rules constrain flexibility (by design)
- Requires discipline to follow consistently
