# Runbook: Deployment

## Platform
Rentora deploys on **Vercel** (frontend + API routes) and **Firebase** (Firestore, Auth, Cloud Functions).

## Deployment Flow

```
Feature Branch → Preview Deploy (auto) → Review → Merge to main → Production Deploy (auto)
```

### Vercel Workflow

| Action | Trigger | URL |
|--------|---------|-----|
| Preview deploy | Push to any branch / PR | `https://<branch>-rentoral.vercel.app` |
| Production deploy | Push to `main` | `https://rentoral.vercel.app` |
| Rollback | Vercel dashboard → Deployments → Promote previous | Same production URL |

### Firebase Deployment
```bash
# Deploy Firestore rules + indexes
firebase deploy --only firestore

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy everything
firebase deploy
```

## Pre-Deploy Checklist

- [ ] Run release skill (`.agents/skills/release.md`)
- [ ] All environment variables set in Vercel dashboard
- [ ] All environment variables set in Firebase (for Cloud Functions)
- [ ] Firestore rules deployed (`firebase deploy --only firestore`)
- [ ] Firestore indexes deployed
- [ ] Health check responds: `GET /api/health`

## Environment Variables

See `.env.example` for the full list. Ensure ALL variables are set in:
- **Vercel**: Dashboard → Project → Settings → Environment Variables
- **Firebase Functions**: `functions/.env` or `firebase functions:config`
- **Local**: `.env` file (never committed)

## Preview Deployments (Branch Deploys)

Every branch pushed to GitHub gets an automatic Vercel preview URL. Use these for:
- QA testing before merge
- Stakeholder review
- Mobile testing
- Payment flow testing (with test keys)

## Rollback Process

1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click "Promote to Production"
4. If Firebase rules/functions also need rollback:
   - Check git history for previous rules version
   - Deploy the previous version: `firebase deploy --only firestore`
5. Monitor for 15 minutes after rollback
