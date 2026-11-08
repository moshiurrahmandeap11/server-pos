# Apex Retail POS & Inventory Backend Architecture

> **Status:** Phase 1 (Core Engine & Dynamic RBAC) Complete  
> **Last Updated:** November 8, 2026  
> **Repository:** `d:\pos\server-pos`  
> **Primary Technology Stack:** Node.js, Express.js 5.x, TypeScript, Prisma ORM 7.x, PostgreSQL 16, Redis

---

## 1. System Overview & Engineering Principles

The **Apex Retail POS Backend Engine** is an enterprise-grade, high-concurrency retail transaction server. It is engineered to satisfy the demanding requirements of fast-paced retail and supermarket environments:

- **Sub-50ms Transaction Latency:** Lightweight Express 5 pipeline with asynchronous connection pooling via `@prisma/adapter-pg`.
- **Dynamic Role-Based Access Control (RBAC):** Zero hardcoded permission limitations. A persistent `SUPER_ADMIN` root role can dynamically create, customize, and deprecate roles (e.g., Store Manager, Cashier, Inventory Auditor) with granular feature-level permissions.
- **Fast Supervisor Pin Overrides:** Counter staff can execute restricted operations (order voiding, price overrides, excessive discounts) via in-place 4-6 digit supervisor PIN validation without terminal re-login. Every override logs an immutable audit trail.
- **Strict Security & Cookie Isolation:** Authentication leverages dual JWTs (Access & Refresh tokens). Access tokens are stored inside `httpOnly`, `SameSite: Lax` secure cookies (with seamless Bearer header fallback for external API consumers).
- **Type-Safe Domain Isolation:** Strict TypeScript compilation with zero `any` leaks, validated input schemas powered by Zod, and centralized error classification.

---

## 2. Directory Structure & Modular Design

The backend uses a modular domain-driven layout under `src/app/module/`:

```text
d:/pos/server-pos/
├── prisma/
│   ├── auth.prisma                # Authentication, Dynamic Roles, and Audit schemas
├── src/
│   ├── app.ts                     # Express application bootstrap & global middleware
│   ├── server.ts                  # Server entrypoint, port binding & graceful shutdown
│   └── app/
│       ├── config/
│       │   └── env.ts             # Validated environment configuration
│       ├── errorHelpers/
│       │   ├── AppError.ts        # Extended operational error class
│       │   ├── handlePrismaErrors.ts
│       │   └── handleZodError.ts
│       ├── interfaces/
│       │   └── error.interface.ts # Standard error response types
│       ├── lib/
│       │   ├── prisma.ts          # Singleton PrismaClient with PG connection pool
│       │   └── redis.ts           # Redis cache client via ioredis
│       ├── middleware/
│       │   ├── checkAuth.ts       # Authentication middleware (Cookie/Bearer token verification)
│       │   ├── checkPermission.ts # Granular permission enforcement with SUPER_ADMIN bypass
│       │   ├── globalErrorHandler.ts # Formatted error responses
│       │   ├── notFound.ts        # 404 Route handler
│       │   └── validateRequest.ts # Zod request body/query validator
│       ├── module/
│       │   ├── auth/              # Authentication & staff login module
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.interface.ts
│       │   │   ├── auth.route.ts
│       │   │   ├── auth.service.ts
│       │   │   └── auth.validation.ts
│       │   └── role/              # Dynamic RBAC & Permission management module
│       │       ├── role.controller.ts
│       │       ├── role.route.ts
│       │       ├── role.service.ts
│       │       └── role.validation.ts
│       ├── routes/
│       │   └── index.ts           # Central route aggregator (/api/v1)
│       ├── shared/
│       │   ├── catchAsync.ts      # Async wrapper eliminating try-catch boilerplate
│       │   └── sendResponse.ts    # Uniform JSON response envelope
│       └── utils/
│           ├── bcrypt.ts          # bcrypt hashing utilities (salt rounds 12)
│           └── jwt.ts             # JWT sign and verify helpers
├── BACKEND_ARCHITECTURE.md        # This master architecture specification
├── package.json
├── prisma.config.ts               # Prisma 7 multi-schema configurator
├── README.md                      # Quickstart guide
└── tsconfig.json
```

---

## 3. Database Schema Architecture

The database is hosted on a remote PostgreSQL 16 VPS (`103.71.47.73:5432/pos_db`). The schema is defined in `prisma/auth.prisma`:

### Relational Entity Model (ERD)

```text
┌─────────────────┐       ┌──────────────────────┐       ┌────────────────────┐
│    tbl_roles    │       │ tbl_role_permissions │       │  tbl_permissions   │
├─────────────────┤       ├──────────────────────┤       ├────────────────────┤
│ id (PK, UUID)   │───┐   │ id (PK, UUID)        │   ┌───│ id (PK, UUID)      │
│ name (UNIQUE)   │   └──<│ roleId (FK)          │   │   │ code (UNIQUE)      │
│ displayName     │       │ permissionId (FK)    │>──┘   │ displayName        │
│ description     │       └──────────────────────┘       │ module             │
│ isSystem (BOOL) │                                      │ description        │
│ createdAt       │                                      │ createdAt          │
│ updatedAt       │                                      └────────────────────┘
└─────────────────┘
         │ 1
         │
         │ has many
         ▼ *
┌─────────────────┐       ┌──────────────────────┐
│    tbl_users    │       │    tbl_audit_logs    │
├─────────────────┤       ├──────────────────────┤
│ id (PK, UUID)   │───┐   │ id (PK, UUID)        │
│ email (UNIQUE)  │   └──<│ userId (FK)          │
│ name            │       │ actionType           │
│ password (HASH) │       │ reasonNote           │
│ pin (HASH, OPT) │       │ createdAt            │
│ phone (OPT)     │       └──────────────────────┘
│ roleId (FK)     │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
```

### Table Definitions

1. **`tbl_roles`**
   - `id`: UUID (Primary Key, auto-generated v4).
   - `name`: VarChar (Unique slug in uppercase, e.g., `SUPER_ADMIN`, `STORE_MANAGER`, `CASHIER`).
   - `displayName`: VarChar human-readable title (e.g., "Super Administrator", "Store Manager").
   - `description`: Text (Optional note outlining duties).
   - `isSystem`: Boolean (Default `false`). When `true`, prevents deletion or slug modification to protect critical system roles.
   - `createdAt`, `updatedAt`: Timestamps with timezone.

2. **`tbl_permissions`**
   - `id`: UUID (Primary Key).
   - `code`: VarChar (Unique dotted permission string, e.g., `pos.order.create`, `inventory.product.edit`).
   - `displayName`: Human-readable label (e.g., "Create POS Orders").
   - `module`: Grouping enum/string (`POS`, `INVENTORY`, `REPORTS`, `USERS`, `ROLES`, `AUDIT`).
   - `description`: Detailed description of rights granted.
   - `createdAt`: Timestamp.

3. **`tbl_role_permissions`**
   - Junction table linking `tbl_roles` and `tbl_permissions`.
   - Composite unique index: `@@unique([roleId, permissionId])`.
   - Cascading deletes on role deletion.

4. **`tbl_users`**
   - `id`: UUID (Primary Key).
   - `name`: Operator or staff member's full name.
   - `email`: Unique email address used for terminal login.
   - `password`: Bcrypt hashed password (12 salt rounds).
   - `pin`: Bcrypt hashed 4-6 digit numeric supervisor override PIN (optional, required for staff authorized to perform managerial counter overrides).
   - `phone`: Optional contact number.
   - `roleId`: Foreign key reference to `tbl_roles(id)`.
   - `createdAt`, `updatedAt`: Timestamps with timezone.

5. **`tbl_audit_logs`**
   - `id`: UUID (Primary Key).
   - `userId`: Staff ID who authorized or performed the critical action.
   - `actionType`: Event identifier (e.g., `SUPERVISOR_OVERRIDE_VOID`, `SUPERVISOR_OVERRIDE_REFUND`).
   - `reasonNote`: Context string including authorizer name and role.
   - `createdAt`: Immutable timestamp.

---

## 4. Dynamic RBAC & Permission Catalog

The system ships with **19 granular permissions** seeded across 6 operational modules:

| Module | Permission Code | Display Name | Description |
|---|---|---|---|
| **POS** | `pos.terminal.access` | Access POS Terminal | Log in to the sales counter register |
| **POS** | `pos.order.create` | Create Sales Orders | Process cart checkout and generate invoices |
| **POS** | `pos.order.void` | Void Orders / Lines | Cancel active sales or void specific line items |
| **POS** | `pos.order.refund` | Process Refunds | Issue cash or digital refunds to customers |
| **POS** | `pos.discount.apply` | Apply Custom Discounts | Apply percentage or flat counter discounts |
| **POS** | `pos.cash_drawer.open` | Manual Drawer Kick | Manually open the electronic cash drawer |
| **INVENTORY** | `inventory.product.view` | View Products | Browse product list, variants, and stock balances |
| **INVENTORY** | `inventory.product.create` | Add New Products | Create new SKU/Barcode records |
| **INVENTORY** | `inventory.product.edit` | Edit Products | Update prices, descriptions, and categories |
| **INVENTORY** | `inventory.product.delete` | Delete Products | Deactivate or remove items from the catalog |
| **INVENTORY** | `inventory.stock.adjust` | Adjust Stock | Perform stock in/out manual audit adjustments |
| **INVENTORY** | `inventory.supplier.manage` | Manage Suppliers | Add, edit, or remove inventory suppliers |
| **REPORTS** | `reports.sales.view` | View Sales Reports | Access daily, weekly, and register sales reports |
| **REPORTS** | `reports.financial.view` | View Financial Reports | View profit/loss and gross margin analytics |
| **REPORTS** | `reports.inventory.view` | View Inventory Valuation | Inspect inventory valuation and reorder levels |
| **USERS** | `users.view` | View Staff List | View employee profiles and terminal access |
| **USERS** | `users.manage` | Manage Staff Members | Create, edit, and deactivate employee accounts |
| **ROLES** | `roles.manage` | Manage Roles & Permissions | Create custom roles and configure permission sets |
| **AUDIT** | `audit_logs.view` | View Audit Logs | Review supervisor PIN overrides and system logs |

### Dynamic Role Logic & Protections

1. **Root `SUPER_ADMIN` Bypass:**
   - Any user assigned the `SUPER_ADMIN` role automatically bypasses all `checkAuth` and `checkPermission` middleware restrictions.
   - `SUPER_ADMIN` is marked with `isSystem: true` and cannot be deleted via the API.
2. **Custom Role Creation:**
   - Super Administrators (or staff with `roles.manage` permission) can create custom roles with any subset of the 19 permissions.
   - Example roles: `STORE_MANAGER`, `SENIOR_CASHIER`, `TRAINEE_CASHIER`, `STOCK_AUDITOR`.
3. **Safe Role Deletion:**
   - Roles cannot be deleted if active users are assigned to them (`usersCount > 0`). An informative `400 Bad Request` is returned prompting the administrator to reassign users first.

---

## 5. Security & Authentication Architecture

### Dual-Token Architecture

- **Access Token:**
  - Standard expiration: 1 day (`ACCESS_TOKEN_EXPIRES_IN=1d`).
  - Payload contents:
    ```json
    {
      "id": "b7d16431-83d5-4c81-be86-b2a188dc0fe3",
      "email": "supervisor@apexpos.com",
      "name": "Head Supervisor",
      "role": "SUPER_ADMIN",
      "roleId": "71b485ad-1357-4dd2-945b-4fc2318ae26d",
      "permissions": ["pos.terminal.access", "pos.order.create", "..."]
    }
    ```
  - Delivered in both:
    1. HTTP response body (`data.accessToken`).
    2. Secure, `httpOnly` cookie named `accessToken`.
- **Refresh Token:**
  - Standard expiration: 30 days (`REFRESH_TOKEN_EXPIRES_IN=30d`).
  - Delivered via secure `httpOnly` cookie named `refreshToken`.
- **Cookie Security Attributes:**
  - `httpOnly: true` (inaccessible to malicious JavaScript / XSS).
  - `secure: process.env.NODE_ENV === "production"`.
  - `sameSite: "lax"`.

### Authorization Middleware Pipeline

```text
Incoming Request
       │
       ▼
[checkAuth] ───────────────────────────────────────────────┐
  - Reads cookie: accessToken (or header: Bearer <token>)  │
  - Verifies JWT with ACCESS_TOKEN_SECRET                  │
  - Sets req.user = { id, email, role, permissions }       │
  - If role === "SUPER_ADMIN" -> Next()                    │
       │                                                   ▼
       ▼                                         [Unauthenticated: 401]
[checkPermission("pos.order.void")] ──────────────┐
  - If req.user.role === "SUPER_ADMIN" -> Next()  │
  - If req.user.permissions.includes(code) -> Next│
       │                                          ▼
       ▼                                [Forbidden: 403]
[Controller Execution]
```

### Supervisor PIN Override Flow

When an unprivileged operator (e.g. Cashier) attempts a restricted counter action:
1. The frontend modal prompts for a 4-6 digit supervisor PIN.
2. The client calls `POST /api/v1/auth/verify-pin` passing `{ pin, actionType }`.
3. The server locates all staff members possessing the `pos.order.void` permission or the `SUPER_ADMIN` role who have a registered PIN.
4. It compares the hashed PIN using `bcrypt.compare`.
5. Upon successful match, an entry is written into `tbl_audit_logs`, and authorization is returned without invalidating or switching the cashier's active session.

---

## 6. API Endpoint Specification

All endpoints are prefixed with `/api/v1`.

### 6.1 Authentication Endpoints (`/api/v1/auth`)

#### 1. Operator Login
- **URL:** `POST /api/v1/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "supervisor@apexpos.com",
    "password": "password123"
  }
  ```
- **Response (200 OK):** Sets `accessToken` and `refreshToken` httpOnly cookies.
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Operator signed in successfully",
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "user": {
        "id": "b7d16431-83d5-4c81-be86-b2a188dc0fe3",
        "name": "Head Supervisor",
        "email": "supervisor@apexpos.com",
        "phone": "+8801700000000",
        "roleId": "71b485ad-1357-4dd2-945b-4fc2318ae26d",
        "role": "SUPER_ADMIN",
        "permissions": [
          "pos.terminal.access",
          "pos.order.create",
          "pos.order.void",
          "pos.order.refund",
          "pos.discount.apply",
          "pos.cash_drawer.open",
          "inventory.product.view",
          "inventory.product.create",
          "inventory.product.edit",
          "inventory.product.delete",
          "inventory.stock.adjust",
          "inventory.supplier.manage",
          "reports.sales.view",
          "reports.financial.view",
          "reports.inventory.view",
          "users.view",
          "users.manage",
          "roles.manage",
          "audit_logs.view"
        ]
      }
    }
  }
  ```

#### 2. Staff Registration
- **URL:** `POST /api/v1/auth/register`
- **Access:** Requires `users.manage` permission or `SUPER_ADMIN`
- **Request Body:**
  ```json
  {
    "name": "Rahim Ahmed",
    "email": "rahim@apexpos.com",
    "password": "Password123!",
    "phone": "+8801811112233",
    "roleId": "a1b2c3d4-...",
    "pin": "1234"
  }
  ```

#### 3. Refresh Access Token
- **URL:** `POST /api/v1/auth/refresh-token`
- **Access:** Public (Reads `refreshToken` cookie)
- **Response (200 OK):** Rotates `accessToken` and updates the cookie.

#### 4. Supervisor Override PIN Verification
- **URL:** `POST /api/v1/auth/verify-pin`
- **Access:** Authenticated
- **Request Body:**
  ```json
  {
    "pin": "9999",
    "actionType": "void_item"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Supervisor override authorized",
    "data": {
      "authorized": true,
      "supervisorId": "b7d16431-83d5-4c81-be86-b2a188dc0fe3",
      "supervisorName": "Head Supervisor",
      "role": "SUPER_ADMIN",
      "roleDisplayName": "Super Administrator"
    }
  }
  ```

#### 5. Current User Profile
- **URL:** `GET /api/v1/auth/me`
- **Access:** Authenticated

---

### 6.2 Dynamic Role Management Endpoints (`/api/v1/roles`)

#### 1. Fetch Complete Permissions Catalog
- **URL:** `GET /api/v1/roles/permissions/catalog`
- **Access:** Authenticated (Requires `roles.manage` or `SUPER_ADMIN`)
- **Response (200 OK):** Returns all 19 system permissions grouped by functional module (`POS`, `INVENTORY`, `REPORTS`, `USERS`, `ROLES`, `AUDIT`).

#### 2. List All Dynamic Roles
- **URL:** `GET /api/v1/roles`
- **Access:** Authenticated (Requires `roles.manage` or `SUPER_ADMIN`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Roles retrieved successfully",
    "data": [
      {
        "id": "71b485ad-1357-4dd2-945b-4fc2318ae26d",
        "name": "SUPER_ADMIN",
        "displayName": "Super Administrator",
        "description": "Full uninhibited system access across all stores and modules",
        "isSystem": true,
        "usersCount": 1,
        "permissions": [
          { "code": "pos.terminal.access", "displayName": "Access POS Terminal", "module": "POS" }
        ],
        "createdAt": "2026-11-08T09:40:00.000Z"
      }
    ]
  }
  ```

#### 3. Create Custom Role
- **URL:** `POST /api/v1/roles`
- **Access:** Authenticated (Requires `roles.manage` or `SUPER_ADMIN`)
- **Request Body:**
  ```json
  {
    "name": "STORE_MANAGER",
    "displayName": "Store Manager",
    "description": "Manages daily counter shifts, inventory receiving, and sales audits",
    "permissionIds": [
      "290807c0-a7d1-4be3-b0b9-8e411b4020a6",
      "3395b452-f418-4e8c-8517-5eeae57dffc4"
    ]
  }
  ```

#### 4. Update Custom Role
- **URL:** `PATCH /api/v1/roles/:id`
- **Access:** Authenticated (Requires `roles.manage` or `SUPER_ADMIN`)
- **Request Body:** Partial object updating `displayName`, `description`, or `permissionIds`. (System role slug cannot be modified).

#### 5. Delete Custom Role
- **URL:** `DELETE /api/v1/roles/:id`
- **Access:** Authenticated (Requires `roles.manage` or `SUPER_ADMIN`)
- **Constraints:** Protected against deleting `isSystem: true` roles or roles that currently have assigned users.

---

## 7. Current Project State & Next Milestones

### Completed Milestones
- [x] Node.js 20+ / Express 5 backend initialized with strict TypeScript configuration.
- [x] Remote PostgreSQL 16 database connected on VPS `103.71.47.73:5432` with zero schema regression.
- [x] Prisma 7 configured with `@prisma/adapter-pg` driver adapter.
- [x] Dynamic Role-Based Access Control (RBAC) implemented:
  - Root `SUPER_ADMIN` with automatic master bypass.
  - 19 granular permissions seeded across 6 operational modules.
  - Role management CRUD APIs (`/api/v1/roles`).
- [x] Dual-token authentication with secure httpOnly cookies.
- [x] Supervisor counter PIN override verification with persistent audit logs.
- [x] Next.js 16 frontend terminal interface configured with `next-intl` (English / Bengali), Li Ador Noirrit font, theme switcher, and clean padding.

### Next Implementation Milestones (Phase 2 & 3)
1. **Catalog & Inventory Domain (`/api/v1/products`, `/api/v1/categories`):**
   - Category tree hierarchy (Parent/Child).
   - Product SKU and multi-barcode scanning support.
   - Pricing tiers (Cost price, retail price, wholesale price, VAT/Tax rate).
   - Multi-unit conversions (Piece, Box, Kg).
2. **Register & Shift Management (`/api/v1/registers`, `/api/v1/shifts`):**
   - Shift opening with initial drawer float cash.
   - Cash-in / cash-out mid-shift logs.
   - Shift closing with cash drawer reconciliation and discrepancy reporting.
3. **Sales Checkout & Transaction Engine (`/api/v1/orders`):**
   - Fast cart operations with customer assignment.
   - Split payments (Cash + bKash / Nagad + Card).
   - Real-time stock reservation and deduction.
   - Invoice PDF generation and thermal printer raw ESC/POS formatting.
4. **Offline Resilience & Data Sync:**
   - Client-side IndexedDB caching for offline carting.
   - Background sync queue reconciling offline invoices when connection restores.
