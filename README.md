# NxtBiz

NxtBiz is a spec-driven business operations automation platform. It combines CRM workflows, email intelligence, AI-style agent orchestration, invoices, reports, workflows, memory, realtime notifications, and role-aware internal dashboards.

## Structure

- `client/` - Vite 6, React 18, Tailwind, React Query, Zustand, Socket.IO client
- `server/` - Express 4, MongoDB/Mongoose, JWT auth, Socket.IO, PDFKit

## Phase 1 Scope

This phase establishes the full-stack foundation from `spec.md`:

- Server config, Mongo connection, security middleware, health route
- JWT access tokens, HTTP-only cookie auth, refresh token rotation
- Role-aware user management
- Spec-backed Mongoose models
- Customer, email, CRM, meeting, invoice, ticket, report, workflow, memory, notification, and agent routes
- Email intelligence and synchronous agent orchestration
- Invoice/report PDF generation under `server/storage/pdfs`
- Seed script for an Admin account, sample customer, workflow, and agents
- React protected console layout with core routes and realtime cache invalidation

## Run Locally

Server:

```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```

Client:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Seeded local admin:

- Email: `admin@nxtbiz.local`
- Password: `Admin12345`

## Verification

After MongoDB is running and dependencies are installed:

```bash
cd server
npm run build
npm run seed
npm run dev
```

```bash
cd client
npm run build
npm run dev
```

Then verify `GET http://localhost:5000/health` returns `{ "ok": true }` and log in from `http://localhost:5173`.
