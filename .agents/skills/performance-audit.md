---
name: performance-audit
description: Performance audit skill — Lighthouse, bundle size, lazy loading, image optimization, caching
---

# Performance Audit Skill

Run this skill before release or when investigating slow page loads / poor UX.

## Principle

> **Don't ignore performance.** Users leave apps that feel slow. Measure early, optimize continuously.

## Steps

### 1. Lighthouse / Core Web Vitals
- [ ] Run Lighthouse audit on key pages (landing, dashboard, payment)
- [ ] Target scores: Performance > 80, Accessibility > 90, Best Practices > 90
- [ ] Check Core Web Vitals:
  - **LCP** (Largest Contentful Paint) < 2.5s
  - **FID** (First Input Delay) < 100ms
  - **CLS** (Cumulative Layout Shift) < 0.1

### 2. Bundle & Load Performance
- [ ] JavaScript bundle is code-split (not one massive file)
- [ ] Components are lazy-loaded where possible (`import()`)
- [ ] CSS is not duplicated across components
- [ ] Third-party scripts load async (`async` / `defer`)
- [ ] No unused JavaScript shipped to production
- [ ] Firebase SDK imports are tree-shaken (import only what's needed)

### 3. Image Optimization
- [ ] Images use modern formats (WebP preferred over PNG/JPEG)
- [ ] Images are properly sized (not 4000px served in a 400px container)
- [ ] Images have `width` and `height` attributes (prevents CLS)
- [ ] Lazy loading on off-screen images (`loading="lazy"`)
- [ ] Consider a CDN or image service (Cloudinary, Firebase Storage + CDN)

### 4. Network Performance
- [ ] API responses are reasonably fast (< 500ms for reads)
- [ ] Firestore queries use proper indexes (no full collection scans)
- [ ] Data is paginated (not loading all records at once)
- [ ] Static assets have cache headers
- [ ] No N+1 query patterns (batch reads instead of sequential)

### 5. Rendering Performance
- [ ] No layout thrashing (reading then writing DOM in loops)
- [ ] CSS animations use `transform` / `opacity` (GPU-accelerated)
- [ ] Long lists are virtualized or paginated (not 1000 DOM nodes)
- [ ] No blocking synchronous operations on the main thread
- [ ] Smooth scrolling and transitions (60fps target)

### 6. Caching Strategy
- [ ] Firestore data cached client-side via persistence (if enabled)
- [ ] Static assets cached by service worker or CDN
- [ ] API responses cached where appropriate (GET requests)
- [ ] Cache invalidation strategy exists (stale data is handled)

## Quick Wins Checklist

| Action | Impact | Effort |
|--------|--------|--------|
| Add `loading="lazy"` to images | High | Low |
| Tree-shake Firebase imports | High | Low |
| Add Firestore indexes | High | Medium |
| Paginate listings | High | Medium |
| Code-split routes | Medium | Medium |
| Compress images to WebP | Medium | Low |

## Output

- ✅ **FAST** — meets Core Web Vitals, optimized loading
- ⚠️ **SLUGGISH** — functional but slow, optimization needed
- 🚫 **SLOW** — poor user experience, must optimize before release
