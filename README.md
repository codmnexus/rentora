# Rentora

**Student Housing Marketplace with Secure Payments**

Rentora connects students with landlords for rental housing — with built-in escrow payments, wallet management, lease takeovers, and real-time messaging.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JS, HTML, CSS (SPA) |
| Backend | Vercel Serverless Functions |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Payments | Paystack (webhook-verified) |
| Hosting | Vercel + Firebase Hosting |

## Getting Started

```bash
# Install dependencies
npm install
cd functions && npm install && cd ..

# Set environment variables
cp .env.example .env
# Fill in Firebase and Paystack credentials

# Run locally
npm run dev
```

## Project Structure

```
rentoral/
├── SYSTEM.md              # Agent memory — read this first
├── src/
│   ├── components/        # UI pages (login, dashboard, payments, etc.)
│   ├── utils/             # Firebase SDK, auth, data store, router
│   ├── data/              # Static data / seed files
│   └── main.js            # App entry point
├── api/                   # Vercel serverless functions
│   ├── initialize-payment.js
│   ├── paystack-webhook.js
│   ├── create-escrow.js
│   ├── release-escrow.js
│   └── ...
├── functions/             # Firebase cloud functions
├── docs/                  # Architecture, decisions, runbooks
├── .agents/               # AI agent skills and hooks
│   ├── skills/            # Reusable workflows
│   └── hooks/             # Automated enforcement
└── tools/                 # Scripts and prompt templates
```

## Agent Supervisor System

This repository includes a built-in **AI supervisor system** (`.agents/`):

- **SYSTEM.md** — Centralized project memory and rules
- **Skills** — Reusable agent workflows for code review, security audits, debugging, etc.
- **Hooks** — Enforcement rules that prevent unsafe changes
- **Module SYSTEM.md** — Local context files in `src/` for critical modules

See [SYSTEM.md](./SYSTEM.md) for the full system specification.

## Key Features

- 🏠 Property listings with search, filters, and categories
- 🔄 Lease takeover marketplace
- 💬 Real-time messaging
- 💳 Secure payments via Paystack with webhook verification
- 🔒 Escrow system to prevent fraud
- 💰 Landlord wallet with withdrawal requests
- 👤 Tenant and landlord dashboards
- 🛡️ Admin panel for oversight

## License

Private — All rights reserved.
