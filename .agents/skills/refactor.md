---
name: refactor
description: Structural refactoring workflow — enforces modularity, removes duplication, improves readability
---

# Refactor Skill

Run this skill when restructuring code for clarity, maintainability, or performance.

## Steps

### 1. Module Boundary Check
- [ ] Each file has a single, clear responsibility
- [ ] No circular dependencies between modules
- [ ] Shared logic lives in `src/utils/`, not duplicated across components
- [ ] API routes are thin — business logic lives in shared functions

### 2. Duplication Removal
- [ ] Identify repeated code blocks (> 5 lines identical)
- [ ] Extract shared logic into utility functions
- [ ] Consolidate similar component patterns
- [ ] Reuse validation logic across endpoints

### 3. Readability Improvements
- [ ] Functions are < 50 lines where possible
- [ ] Variable names are descriptive (no single-letter outside loops)
- [ ] Complex logic has inline comments explaining WHY
- [ ] Nested callbacks are flattened (use async/await)

### 4. Safety Check
- [ ] Refactoring does NOT change external behavior
- [ ] All existing functionality still works after changes
- [ ] No financial logic was accidentally modified
- [ ] Tests (if any) still pass

## Rules

1. **Never refactor financial logic without running payment-audit skill**
2. **Never rename API routes** — external clients may depend on them
3. **Keep changes atomic** — one refactor per commit
4. **Document WHY** in commit message, not just WHAT
