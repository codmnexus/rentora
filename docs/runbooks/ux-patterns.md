# Runbook: UX Patterns

## Principle

> **Don't assume users will figure it out.** Every screen must guide the user through loading, empty, error, and success states.

## Required States for Every Data-Driven Screen

### 1. Loading State
Show while data is being fetched. Never show a blank screen.

```javascript
// Pattern
if (loading) return renderSkeleton(); // or spinner
```

- Use skeleton screens for content-heavy pages (listings, dashboard)
- Use spinners for quick actions (submit, load more)
- Disable interactive elements during loading

### 2. Empty State
Show when data exists but collection is empty. Guide the user to take action.

| Page | Empty State Message | CTA |
|------|-------------------|-----|
| Listings | "No properties found in this area" | "Try a different search" |
| My Listings | "You haven't posted any properties yet" | "Post Your First Property" |
| Messages | "No messages yet" | "Browse listings to connect with landlords" |
| Wallet | "Your wallet is empty" | "Funds will appear here after escrow release" |
| Escrows | "No active escrows" | "Start by making a payment" |

### 3. Error State
Show when an operation fails. Provide recovery options.

```javascript
// Pattern
if (error) return renderError({
  message: 'Unable to load listings. Please try again.',
  action: { label: 'Retry', handler: () => fetchData() }
});
```

- Never show raw error objects or stack traces
- Offer a retry button for transient failures
- Provide a "Go Home" fallback for unrecoverable errors

### 4. Success State
Confirm completed actions clearly.

- Payment completed → success screen with summary
- Property posted → confirmation with link to listing
- Message sent → visual feedback (checkmark, animation)

## Onboarding Flow

### First-Time User
1. **Landing page** → explains value proposition
2. **Sign up** → minimal fields (email + password)
3. **Role selection** → tenant or landlord
4. **Dashboard** → guided tour or contextual tips
5. **First action** → prominently suggest next step

### Contextual Guidance
- Tooltips on complex features (escrow, wallet)
- Progress indicators for multi-step flows (payment, property posting)
- Inline help text for form fields

## Accessibility Basics

- [ ] All images have `alt` text
- [ ] Interactive elements are keyboard-accessible
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Focus indicators are visible
- [ ] Form fields have associated `<label>` elements
- [ ] Error messages are associated with form fields
- [ ] Page has logical heading hierarchy (h1 → h2 → h3)
