# AeroTalk Support System

AeroTalk is a full-stack, real-time customer support platform designed to provide a seamless ticketing and live chat experience for both customers and support agents.

## 🚀 Tech Stack
- **Frontend**: React, Vite, Tailwind CSS v4, React Router, Socket.IO Client, Axios
- **Backend**: Node.js, Express, TypeScript, Socket.IO (WebSockets)
- **Database**: PostgreSQL
- **ORM**: Prisma

## 🏗 Architecture
AeroTalk follows a clean monorepo structure:
- `/frontend`: Contains the React SPA with a Customer Portal and an Agent Dashboard. State and logic are decoupled from UI components. It uses Axios for REST API communication and Socket.IO for real-time WebSocket events.
- `/backend`: Adheres to a strict layered architecture (`routes/` -> `controllers/` -> `services/`). Error handling is centralized via custom middleware. Prisma provides type-safe database queries.

## 🗄 Database Schema

```mermaid
erDiagram
    Customer ||--o{ Ticket : "creates"
    Ticket ||--o{ Message : "contains"
    
    Customer {
        String id PK "UUID"
        String name
        String email "Unique"
        DateTime createdAt
    }
    
    Ticket {
        String id PK "UUID"
        String title
        String description
        Enum priority "LOW, MEDIUM, HIGH"
        Enum status "OPEN, IN_PROGRESS, RESOLVED, CLOSED"
        DateTime createdAt
        DateTime updatedAt
        String customerId FK
    }
    
    Message {
        String id PK "UUID"
        Enum senderType "CUSTOMER, AGENT"
        String message
        DateTime createdAt
        String ticketId FK
    }
```

## 🛠 Local Setup & Execution

### Prerequisites
- Node.js (v18+)
- PostgreSQL running locally or remotely.

### 1. Backend Setup
```bash
cd backend
npm install
```

**Configure environment variables**:
Create a `.env` file in `/backend` using `.env.example` as a template:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/aerotalk?schema=public"
FRONTEND_URL="http://localhost:5173"
```

**Apply database migrations and start the server**:
```bash
npx prisma db push
npx prisma generate
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

**Configure environment variables**:
Create a `.env` file in `/frontend`:
```env
VITE_API_URL="http://localhost:5000/api"
VITE_SOCKET_URL="http://localhost:5000"
```

**Start the Vite development server**:
```bash
npm run dev
```

## 📚 API Documentation

| Method | Endpoint | Description | Payload |
|--------|----------|-------------|---------|
| `POST` | `/api/customers` | Create or fetch a customer by email. | `{ name: string, email: string }` |
| `POST` | `/api/tickets` | Create a new ticket (with optional initial chat msgs). | `{ customerId, title, description, priority, initialMessages?: string[] }` |
| `GET` | `/api/tickets` | List all tickets (supports `?status=` and `?customerId=`). | - |
| `GET` | `/api/tickets/:id` | Get ticket details and customer metadata. | - |
| `PATCH`| `/api/tickets/:id/status`| Update ticket status. | `{ status: "OPEN" \| "IN_PROGRESS" \| "RESOLVED" \| "CLOSED" }` |
| `GET` | `/api/tickets/:id/messages`| Fetch chat history for a specific ticket. | - |
| `POST` | `/api/tickets/:id/messages`| Add a new chat message to a ticket. | `{ senderType: "CUSTOMER" \| "AGENT", message: string }` |

> A fully configured **Postman Collection** is available in `docs/postman_collection.json`.

## ☁️ Deployment Readiness
- **Frontend**: Prepared for Vercel/Netlify deployment. A `vercel.json` is included to handle SPA routing (`/*` to `index.html`).
- **Backend**: Configured for Node.js hosts (e.g., Railway, Render). `package.json` includes `npm run build` (compiles TS and generates Prisma Client) and `npm run start` (runs `dist/server.js`).
