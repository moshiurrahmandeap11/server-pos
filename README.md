# Apex Retail POS & Inventory Backend Engine

Enterprise-grade, high-throughput retail backend engine engineered for offline-first resilience, modular domain architectures, and fast counter operations.

---

## 🛠️ Tech Stack & Architecture

- **Runtime & Framework:** Node.js, Express.js (v5)
- **Language:** TypeScript
- **Database & ORM:** PostgreSQL with Prisma ORM (v7) & `@prisma/adapter-pg`
- **In-Memory Cache:** Redis (`ioredis`)
- **Validation:** Zod
- **Authentication & Security:** JWT (Access & Refresh tokens), bcryptjs, HTTP-Only cookies, Role-Based Access Control (RBAC)
- **Architecture:** Modular Pattern (`src/app/module/[domain]/`)

---

## 📁 Modular Directory Structure

```text
src/
├── app.ts                  # Express app setup, CORS, body parsers, global middlewares
├── server.ts               # Server bootstrap, terminal logging, graceful shutdowns
└── app/
    ├── config/             # Environment variables loader and validation
    ├── errorHelpers/       # AppError, handleZodError, handlePrismaErrors
    ├── interfaces/         # Global error and shared TypeScript types
    ├── lib/                # Database and cache clients (prisma.ts, redis.ts)
    ├── middleware/         # checkAuth, validateRequest, globalErrorHandler, notFound
    ├── module/             # Core business domains
    │   └── auth/           # Authentication domain
    │       ├── auth.controller.ts
    │       ├── auth.interface.ts
    │       ├── auth.route.ts
    │       ├── auth.service.ts
    │       └── auth.validation.ts
    ├── routes/             # Centralized route index mounting all modules
    ├── shared/             # catchAsync.ts, sendResponse.ts
    └── utils/              # Token, JWT, bcrypt helpers
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 20.x
- PostgreSQL database
- Redis instance (optional for dev)

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/pos_db?schema=public"
ACCESS_TOKEN_SECRET="your_access_token_secret"
REFRESH_TOKEN_SECRET="your_refresh_token_secret"
ACCESS_TOKEN_EXPIRES_IN="1d"
REFRESH_TOKEN_EXPIRES_IN="30d"
REDIS_URL="redis://localhost:6379"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Prisma Setup
```bash
npx prisma generate
npx prisma db push
```

### 5. Run in Development
```bash
npm run dev
```

---

## 📡 Core API Endpoints

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register operator/cashier | Public |
| `POST` | `/api/v1/auth/login` | Operator sign-in | Public |
| `POST` | `/api/v1/auth/verify-pin` | Supervisor override verification | Authenticated |
| `GET` | `/api/v1/auth/me` | Current user profile | Authenticated |
