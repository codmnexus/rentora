---
name: validation-patterns
description: Input validation skill — schema validation, form validation, API request validation, type safety
---

# Validation Patterns Skill

Run this skill when adding or reviewing any user input handling — forms, API requests, query parameters.

## Principle

> **Never trust input.** Validate on the client for UX, validate on the server for security. Both layers are mandatory.

## Steps

### 1. API Request Validation
- [ ] Every endpoint checks for required fields before processing
- [ ] Field types are validated (string, number, boolean, array)
- [ ] Numeric fields have min/max bounds (e.g., amount > 0, amount < MAX)
- [ ] String fields have max length limits
- [ ] Email fields are format-validated
- [ ] Enum fields only accept known values
- [ ] Unexpected fields are ignored (don't pass raw body to DB)
- [ ] Missing/invalid fields return 400 with a clear error message

### 2. Form Validation (Client-Side)
- [ ] Required fields show inline validation before submit
- [ ] Error messages are user-friendly (not raw error codes)
- [ ] Validation runs on blur AND on submit
- [ ] Disabled submit button while form is invalid or submitting
- [ ] Shows loading state during async validation (e.g., email uniqueness)

### 3. Data Shape Validation
- [ ] Data read from Firestore is checked for expected shape before use
- [ ] Missing fields have defaults (don't crash on `undefined.property`)
- [ ] Arrays are checked for emptiness before `.map()` / `.forEach()`
- [ ] Dates are parsed and validated (not raw strings)

### 4. File Upload Validation
- [ ] File type is checked (MIME type, not just extension)
- [ ] File size has a max limit (e.g., 5MB for images)
- [ ] Filenames are sanitized (no path traversal characters)
- [ ] Use a file upload service (Cloudinary, UploadThing, Firebase Storage) — never store raw files on the server filesystem

### 5. URL / Query Parameter Validation
- [ ] Query params used in Firestore queries are sanitized
- [ ] Pagination params (limit, offset) are bounds-checked
- [ ] Sort fields only accept known column names
- [ ] IDs are validated format (not arbitrary strings)

## Anti-Patterns to Block

| ❌ Don't | ✅ Do Instead |
|----------|--------------|
| `req.body.amount` without checking | Validate type + bounds first |
| `innerHTML = userInput` | Use `textContent` or sanitize |
| Trust file extension alone | Check MIME type |
| `parseInt(input)` without `isNaN` check | Validate, then parse |
| Pass raw query params to DB | Whitelist allowed params |

## Output

- ✅ **VALID** — all inputs properly validated
- ⚠️ **WEAK** — validation exists but incomplete
- 🚫 **UNSAFE** — missing validation on user input, must fix
