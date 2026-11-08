# Apex Retail POS & Inventory Backend Engine

Enterprise-grade, high-throughput retail backend engine engineered for offline-first resilience, dynamic RBAC access control, and fast counter operations.

> 📖 **Full System Architecture & API Catalog:**  
> Detailed database ERDs, dynamic permission specifications, and endpoint documentation are available in [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md).

---

## 🛠️ Tech Stack & Architecture

- **Runtime & Framework:** Node.js 20+, Express.js (v5)
- **Language:** TypeScript (Strict mode, zero `any`)
- **Database & ORM:** PostgreSQL 16 (Remote VPS) with Prisma ORM (v7) & `@prisma/adapter-pg`
- **In-Memory Cache:** Redis (`ioredis`)
- **Validation:** Zod
- **Access Control:** Dynamic RBAC (`SUPER_ADMIN` root role + customizable dynamic roles + 19 permission codes across 6 modules)
- **Authentication & Security:** Dual JWT (Access & Refresh tokens) via secure `httpOnly` cookies, bcryptjs (salt rounds 12), Supervisor PIN counter overrides, and Audit Trail logging
- **Architecture:** Modular Pattern (`src/app/module/[domain]/`)

---

## 📁 Project Structure

```text
src/
├── app.ts                  # Express app setup, CORS, body parsers, global middlewares
├── server.ts               # Server bootstrap, terminal logging, graceful shutdowns
└── app/
    ├── config/             # Environment variables loader and validation
    ├── errorHelpers/       # AppError, handleZodError, handlePrismaErrors
    ├── interfaces/         # Global error and shared TypeScript types
    ├── lib/                # Database and cache clients (prisma.ts, redis.ts)
    ├── middleware/         # checkAuth, checkPermission, validateRequest, globalErrorHandler, notFound
    ├── module/             # Core business domains
    │   ├── auth/           # Authentication domain (Login, Register, PIN Override, Refresh)
    │   └── role/           # Dynamic RBAC domain (Roles CRUD, Permissions Catalog)
    ├── routes/             # Centralized route index mounting all modules
    ├── shared/             # catchAsync.ts, sendResponse.ts
    └── utils/              # Token, JWT, bcrypt helpers
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 20.x
- PostgreSQL 16 database
- Redis instance (optional for local dev)

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://pos_user:pos_password_2026_x7@103.71.47.73:5432/pos_db?schema=public"
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

### 4. Prisma Client Generation
```bash
npx prisma generate
```

### 5. Run in Development
```bash
npm run dev
```

### 6. Build for Production
```bash
npm run build
npm start
```

---

## 📡 Core API Summary

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Operator sign-in & JWT cookie issue | Public |
| `POST` | `/api/v1/auth/register` | Register new staff member | `users.manage` or `SUPER_ADMIN` |
| `POST` | `/api/v1/auth/refresh-token` | Rotate access token via refresh cookie | Public |
| `POST` | `/api/v1/auth/verify-pin` | Supervisor PIN override for restricted actions | Authenticated |
| `GET` | `/api/v1/auth/me` | Current operator profile & permissions | Authenticated |

### Dynamic Roles & Permissions (`/api/v1/roles`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/roles/permissions/catalog` | List all 19 system permissions by module | `roles.manage` or `SUPER_ADMIN` |
| `GET` | `/api/v1/roles` | List all dynamic roles with user counts | `roles.manage` or `SUPER_ADMIN` |
| `GET` | `/api/v1/roles/:id` | Get specific role details & permissions | `roles.manage` or `SUPER_ADMIN` |
| `POST` | `/api/v1/roles` | Create dynamic custom role | `roles.manage` or `SUPER_ADMIN` |
| `PATCH` | `/api/v1/roles/:id` | Update custom role & assign permissions | `roles.manage` or `SUPER_ADMIN` |
| `DELETE` | `/api/v1/roles/:id` | Safely remove unassigned custom role | `roles.manage` or `SUPER_ADMIN` |

For detailed payloads, error codes, and permission definitions, refer to [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md).
