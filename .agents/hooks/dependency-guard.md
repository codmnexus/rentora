---
name: dependency-guard
description: Dependency guard hook — blocks missing error boundaries, unhandled promises, missing loading/empty states, unvalidated inputs
---

# Dependency Guard Hook

This hook enforces code quality and resilience patterns. It triggers after changes to components or API routes.

## Trigger Conditions

This hook activates when ANY of these are modified:
- `src/components/**` — UI components
- `api/**` — serverless functions
- `src/utils/**` — utility modules
- `functions/**` — cloud functions

## Checks

### 1. Error Boundaries
**Action: BLOCK if missing on critical paths**

Every component that renders async data must have error handling:
- [ ] `try-catch` around Firestore reads/writes
- [ ] Fallback UI when data fetch fails (not blank screen)
- [ ] User-friendly error message (not raw error object)
- [ ] API calls wrapped in try-catch with proper error responses

```
BLOCKED PATTERNS:
- Async function without try-catch in components
- API handler without try-catch wrapper
- .then() chain without .catch()
- Firestore query without error handling
```

### 2. Loading & Empty States
**Action: WARN if missing**

Every data-driven UI must handle all states:
- [ ] **Loading state**: spinner or skeleton while fetching
- [ ] **Empty state**: helpful message when no data exists (not blank)
- [ ] **Error state**: retry button or helpful message on failure
- [ ] **Success state**: actual content renders correctly

```
WARN PATTERNS:
- Component fetches data but has no loading indicator
- List component with no "no results" message
- Form submit with no loading/disabled state
```

### 3. Unvalidated Inputs
**Action: BLOCK if found in API routes**

- [ ] Every `req.body` field is validated before use
- [ ] Every `req.query` param is validated before use
- [ ] No raw user input passed to Firestore queries
- [ ] No raw user input used in string concatenation for paths/URLs

### 4. Unhandled Async
**Action: WARN**

- [ ] All `async` functions have error handling
- [ ] No floating promises (async calls without `await` or `.catch()`)
- [ ] Promise.all failures are handled (not just first rejection)

### 5. Missing Dependencies
**Action: WARN**

- [ ] No imports of modules that don't exist
- [ ] No references to environment variables without fallback
- [ ] No calls to API endpoints that don't exist

## Enforcement

| Check | Level | Action |
|-------|-------|--------|
| Missing error boundary on API route | BLOCK | Must add try-catch |
| Missing error boundary on component | WARN | Should add fallback |
| Missing loading state | WARN | Should add spinner |
| Missing empty state | WARN | Should add "no data" message |
| Unvalidated API input | BLOCK | Must validate |
| Floating promise | WARN | Should await or catch |
