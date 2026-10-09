---
name: edgestone-spec
description: EdgeStone AeroTalk Project Rules
---

# EdgeStone AeroTalk Project Rules

## Architecture & Code Quality
- Maintain a clean monorepo with `/backend` (Node.js + Express) and `/frontend` (React + Vite + Tailwind CSS).
- Separate backend code into `routes/`, `controllers/`, `services/`, and `middlewares/`.
- Separate frontend UI components (`components/`) from API/socket services (`services/`, `context/`).
- Never hard-code configuration values; always use environment variables (`process.env` / `import.meta.env`) and keep `.env.example` updated.
- Return consistent JSON responses across all endpoints: `{ success: boolean, data?: any, error?: string }`.

## Database Schema (PostgreSQL + Prisma)
1. Customer: `id` (UUID), `name` (String, required), `email` (String, required, unique), `createdAt` (DateTime)
2. Ticket: `id` (UUID/custom readable ID), `customerId` (FK), `title` (String, required), `description` (String, required), `priority` (Enum: LOW, MEDIUM, HIGH), `status` (Enum: OPEN, IN_PROGRESS, RESOLVED, CLOSED), `createdAt` (DateTime), `updatedAt` (DateTime)
3. Message: `id` (UUID), `ticketId` (FK), `senderType` (Enum: CUSTOMER, AGENT), `message` (String, required), `createdAt` (DateTime)

## Required REST Endpoints
- POST `/api/customers` - Create/find customer by email
- POST `/api/tickets` - Create ticket (with optional initial messages)
- GET `/api/tickets` - List all tickets (support query filters: `status`, `customerId`)
- GET `/api/tickets/:id` - Get single ticket details with customer info
- PATCH `/api/tickets/:id/status` - Update ticket status
- GET `/api/tickets/:id/messages` - Get all messages for a ticket ordered by `createdAt` ASC
- POST `/api/tickets/:id/messages` - Store a new message and broadcast via Socket.IO
