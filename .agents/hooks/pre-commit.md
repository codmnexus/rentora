---
name: pre-commit
description: Pre-commit enforcement hook — scans for secrets, blocks unsafe code, enforces formatting
---

# Pre-Commit Hook

This hook defines checks that must pass BEFORE any code is committed. The agent must run these checks when finalizing changes.

## Checks

### 1. Secret Scanning
**Action: BLOCK commit if any match found**

Scan all staged files for:
- API keys: patterns like `sk_live_`, `pk_live_`, `PAYSTACK_SECRET`
- Firebase credentials: `firebase-adminsdk`, private keys
- Generic secrets: `password`, `secret`, `token` assigned to string literals
- `.env` file content accidentally included in source files

```
Patterns to flag:
- /sk_(live|test)_[a-zA-Z0-9]+/
- /-----BEGIN (RSA |EC )?PRIVATE KEY-----/
- /(password|secret|token|api_key)\s*[:=]\s*['"][^'"]+['"]/i
```

### 2. Unsafe Code Blocking
**Action: BLOCK commit if any match found**

- `eval()` with dynamic input
- `innerHTML` with user-supplied content
- Direct Firestore writes to financial collections from client code
- `wallet`, `escrow`, `transaction` modifications in `src/components/`
- `process.env` references in client-side code

### 3. Formatting
**Action: WARN (do not block)**

- Consistent indentation (2 spaces)
- No trailing whitespace
- No files over 500 lines (suggest splitting)
- No deeply nested callbacks (> 3 levels)

## Enforcement

If a BLOCK check fails:
1. **STOP** the commit
2. **Report** the exact file, line, and violation
3. **Suggest** the fix
4. **Do NOT proceed** until fixed
