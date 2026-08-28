# OmniSend PRO — Mass Email Marketing & Delivery Platform

[![Live Demo](https://img.shields.io/badge/Vercel_Deployment-Live-success?style=for-the-badge&logo=vercel)](https://email-marketing-platform-web.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-jitendrarmore%2FEmail--marketing--platform-blue?style=for-the-badge&logo=github)](https://github.com/jitendrarmore/Email-marketing-platform)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.0-black?style=for-the-badge&logo=fastify)](https://fastify.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)

**OmniSend PRO** is a multi-tenant, high-throughput Mass Email Marketing and Delivery Engine built as a modular monolith in a TypeScript monorepo. It features a pluggable email provider strategy pattern (AWS SES, Azure Communication Services, Custom SMTP), strict backend-enforced sender identity authorization, and BullMQ asynchronous queue batching.

---

## 🌟 Key Architecture Features

### 1. 🔌 Email Provider Abstraction Strategy (`IEmailProvider`)
No vendor lock-in. The platform uses the Strategy Pattern to abstract email delivery across multiple providers:
- **AWS SES v2** (`@aws-sdk/client-sesv2`) — Primary high-volume node with quota health checks
- **Azure Communication Services** (`@azure/communication-email`) — Backup strategy
- **Custom / Relayed SMTP** (`nodemailer`) — Support for local relays & dev tools like Mailpit
- **Unified Interface**: Standardized `send()`, `sendBatch()`, `healthCheck()`, and `parseWebhookEvent()` contracts

### 2. 🛡️ Backend-Enforced Sender Authorization (`UserSenderAccess`)
Security is guaranteed at the database layer. A user **can NEVER send** from a sender email address or domain unless an Admin has explicitly granted authorization to that user.
- API requests attempting to use non-authorized senders trigger `403 Forbidden` responses.
- Interactive RBAC & Sender Authorization Matrix in the Web Dashboard.

### 3. 🚀 High-Throughput Asynchronous Queue Engine
Built on **BullMQ + Redis** for robust batch execution:
- `campaign-process` — Validates audience lists and splits large batches into job chunks
- `email-send` — Dispatches emails with rate-limiting and exponential backoff
- `csv-import` — High-efficiency CSV stream parser for recipient lists up to 1,000,000 rows
- `webhook-events` — Fast-ack event ingestion for delivery, bounce, open, and click webhooks

### 4. 🔒 Enterprise Security & Compliance
- **Authentication**: JWT verification via `jose` library with HS256.
- **Refresh Token Family Rotation**: Prevents replay attacks by invalidating token families upon unauthorized reuse.
- **Password Hashing**: Secure `argon2` hashing.
- **Encrypted Credentials**: Provider API credentials encrypted at rest using **AES-256-GCM**.
- **Immutable Audit Trail**: Append-only security log table for all sensitive actions.

---

## 📂 Monorepo Structure

```
Email-marketing-platform/
├── packages/
│   └── shared/                     # Shared Types, Zod validation schemas & Permission Enums
└── apps/
    ├── api/                        # Fastify 5 REST API + BullMQ Workers + Prisma 6 ORM
    │   ├── src/
    │   │   ├── config/             # Zod validated env, database & Redis connection factories
    │   │   ├── infrastructure/     # Database (Prisma), S3 storage, Pino logger, BullMQ queues
    │   │   ├── common/             # Auth, RBAC, Rate-limit middleware & AppException handling
    │   │   └── modules/            # Auth, Users, Providers, Senders, Campaigns, Recipients, Webhooks, Audit
    └── web/                        # Next.js 14 Web Dashboard (App Router + Tailwind + Recharts)
        ├── src/app/                # Dashboard, Campaign Builder Wizard, Users/RBAC Matrix, Providers, Audit
        ├── src/components/         # Glassmorphism Navbar, Sidebar, Form Controls
        └── src/lib/                # AuthContext provider & API client helper
```

---

## 🚀 Live Demo & Screenshots

- **Live Production URL**: [https://email-marketing-platform-web.vercel.app](https://email-marketing-platform-web.vercel.app)
- **GitHub Repository**: [https://github.com/jitendrarmore/Email-marketing-platform](https://github.com/jitendrarmore/Email-marketing-platform)

### Core UI Pages
- **Executive Overview Dashboard**: Real-time throughput telemetry charts, provider health grid, active campaign monitor.
- **5-Step Campaign Builder**: Campaign Details → Sender/Provider Selection → CSV Audience Upload → HTML Content Editor (`{{firstName}}` merge tags) → Review & Submit.
- **Users & Sender Authorization Matrix**: Manage user roles & grant/revoke specific sender identity access.
- **Provider & Sender Management**: Connection health tester & DKIM domain verification status.

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js**: `>= 20.0.0`
- **Docker & Docker Compose**: For local PostgreSQL, Redis, MinIO, and Mailpit

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/jitendrarmore/Email-marketing-platform.git
cd Email-marketing-platform
npm install
```

### 2. Start Infrastructure Services (Docker)
```bash
docker-compose up -d
```
*This starts Postgres (5432), Redis (6379), MinIO S3 (9000/9001), and Mailpit Dev SMTP (1025/8025).*

### 3. Initialize Database
```bash
cp .env.example .env
npm run db:generate -w apps/api
npm run db:seed -w apps/api
```

### 4. Run Development Workspace
```bash
npm run dev
```
- **Web App**: `http://localhost:3000`
- **Fastify API**: `http://localhost:3001`
- **Mailpit Web UI (Dev Mailbox)**: `http://localhost:8025`

---

## 🛠️ Verification & Build Commands

```bash
# Typecheck all monorepo packages (@email-platform/shared, @email-platform/api, @email-platform/web)
npm run typecheck

# Build production bundles
npm run build
```

---

## ☁️ Vercel Deployment

The web dashboard and backend are configured for Vercel deployment with **Vercel Postgres (Neon)** and **Vercel KV (Upstash Redis)**.

1. Import repository in Vercel: `jitendrarmore/Email-marketing-platform` (Root Directory: `apps/web`).
2. Attach **Vercel Postgres** and **Vercel KV / Redis** in Vercel Storage settings.
3. Configure `JWT_SECRET` and `ENCRYPTION_KEY` environment variables.
4. Deploy!

---

## 📄 License
MIT License. Created by [Jitendra More](https://github.com/jitendrarmore).
