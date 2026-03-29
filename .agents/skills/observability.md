---
name: observability
description: Error tracking, logging, monitoring, and analytics skill — structured logging, error boundaries, health checks
---

# Observability Skill

Run this skill when setting up or reviewing error handling, logging, monitoring, or analytics.

## Principle

> **If you can't see it, you can't fix it.** Every production system needs structured logging, error tracking, and health monitoring from Day 1.

## Steps

### 1. Error Tracking
- [ ] Global error handler catches uncaught exceptions
- [ ] Frontend has error boundaries / try-catch around critical renders
- [ ] API routes wrap logic in try-catch with structured error responses
- [ ] Errors include context: user role, action, timestamp, module
- [ ] Stack traces are logged server-side, NEVER sent to client
- [ ] Consider integrating Sentry, LogRocket, or equivalent service

**Frontend Error Boundary Pattern:**
```javascript
try {
  renderComponent();
} catch (error) {
  console.error('[ModuleName] Render failed:', error.message);
  showFallbackUI('Something went wrong. Please refresh.');
}
```

**API Error Pattern:**
```javascript
try {
  // business logic
} catch (error) {
  console.error('[EndpointName] Error:', { message: error.message, userId, action });
  return res.status(500).json({ error: 'Internal server error' });
}
```

### 2. Structured Logging
- [ ] Logs use consistent format: `[Module] Action: details`
- [ ] Financial operations log: action, amount, userId, reference, timestamp
- [ ] Auth events log: login, logout, failed attempt, role change
- [ ] No sensitive data in logs (no passwords, tokens, full card numbers)
- [ ] Log levels are appropriate: `error` for failures, `warn` for degraded, `info` for events

### 3. Health Checks
- [ ] `/api/health` endpoint exists and returns system status
- [ ] Health check verifies: server running, DB connected, env vars set
- [ ] Health check does NOT expose secrets (only boolean checks)
- [ ] Consider adding uptime monitoring (UptimeRobot, Vercel checks)

### 4. Analytics Integration
- [ ] Key user actions tracked: signup, listing view, payment initiated, payment completed
- [ ] Privacy-friendly analytics preferred (PostHog, Plausible over Google Analytics)
- [ ] Analytics script doesn't block page load (async loading)
- [ ] No PII in analytics events (no emails, names, addresses)
- [ ] Conversion funnel: visit → signup → list/search → pay

### 5. Error States & Fallbacks
- [ ] Every async operation handles: loading, success, error states
- [ ] Network failures show retry option (not just "error")
- [ ] Stale data is better than no data (cache where appropriate)
- [ ] Degraded mode: if a non-critical service fails, app still works
- [ ] User sees friendly message, not raw error or blank screen

## Monitoring Checklist for Launch

| What | Tool | Status |
|------|------|--------|
| Error tracking | Sentry / console.error | Required |
| Uptime monitoring | UptimeRobot / Vercel | Recommended |
| Analytics | PostHog / Plausible | Recommended |
| Log aggregation | Vercel logs / Firebase logs | Required |
| Performance | Lighthouse / Web Vitals | Recommended |

## Output

- ✅ **OBSERVABLE** — errors tracked, logs structured, health check works
- ⚠️ **PARTIAL** — some observability exists but gaps remain
- 🚫 **BLIND** — no error tracking or monitoring, must add immediately
