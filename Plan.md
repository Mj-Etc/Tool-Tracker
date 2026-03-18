# ToolTrackR — Hardware Retail Sales and Inventory Monitoring System

> A web-based sales and inventory management system for **J&LL Hardware Store**.  
> Built with **Next.js 15**, **Prisma + PostgreSQL**, and **Better Auth**.

---

## 📋 Project Overview

ToolTrackR automates the daily sales recording and inventory tracking operations of a hardware retail store. It replaces manual logbook-based recording with a centralized, real-time web system accessible to two user roles: **Cashier** and **Store Owner / Administrator**.

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database ORM | Prisma |
| Database | PostgreSQL |
| Authentication | Better Auth |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |

---

## 👤 User Roles

### Cashier
- Logs in to record and process daily sales transactions
- Searches and selects products from the system
- Enters quantity purchased to complete a sale
- Cannot access admin features (reports, product management)

### Store Owner / Administrator
- Full access to all system features
- Manages product information (add, edit, delete)
- Monitors inventory levels and stock alerts
- Reviews and generates sales and inventory reports

---

## 🗃️ Database Schema (Prisma)

Create the following models in `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String
  role          Role      @default(CASHIER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  transactions  Transaction[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Product {
  id            String             @id @default(cuid())
  name          String
  description   String?
  price         Decimal            @db.Decimal(10, 2)
  quantity      Int                @default(0)
  lowStockThreshold Int            @default(10)
  category      String?
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt
  transactionItems TransactionItem[]
}

model Transaction {
  id          String            @id @default(cuid())
  cashierId   String
  totalAmount Decimal           @db.Decimal(10, 2)
  createdAt   DateTime          @default(now())
  cashier     User              @relation(fields: [cashierId], references: [id])
  items       TransactionItem[]
}

model TransactionItem {
  id            String      @id @default(cuid())
  transactionId String
  productId     String
  quantity      Int
  unitPrice     Decimal     @db.Decimal(10, 2)
  subtotal      Decimal     @db.Decimal(10, 2)
  transaction   Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  product       Product     @relation(fields: [productId], references: [id])
}

enum Role {
  CASHIER
  ADMIN
}
```

---

## 🔐 Authentication Setup (Better Auth)

Use [Better Auth](https://better-auth.com) for session-based authentication.

### Installation
```bash
npm install better-auth
```

### Configuration (`lib/auth.ts`)
```ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
});
```

### Auth Route (`app/api/auth/[...all]/route.ts`)
```ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### Middleware for Role Protection (`middleware.ts`)
- Protect `/dashboard/*` — require authenticated session
- Protect `/admin/*` — require `ADMIN` role
- Redirect unauthenticated users to `/login`

---

## 📁 Project Structure

```
tooltrackr/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Protected layout with sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Overview/home dashboard
│   │   ├── sales/
│   │   │   ├── page.tsx          # Sales transaction form (Cashier + Admin)
│   │   │   └── history/
│   │   │       └── page.tsx      # Transaction history
│   │   ├── inventory/
│   │   │   └── page.tsx          # Inventory overview with stock status
│   │   ├── products/
│   │   │   ├── page.tsx          # Product list (Admin only)
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Add new product
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Edit product
│   │   └── reports/
│   │       └── page.tsx          # Reports page (Admin only)
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...all]/
│   │   │       └── route.ts      # Better Auth handler
│   │   ├── products/
│   │   │   └── route.ts          # GET all, POST new product
│   │   ├── products/[id]/
│   │   │   └── route.ts          # GET, PUT, DELETE product
│   │   ├── transactions/
│   │   │   └── route.ts          # GET history, POST new transaction
│   │   └── reports/
│   │       └── route.ts          # GET report data
│   └── layout.tsx
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── sales/
│   │   ├── ProductSearch.tsx
│   │   ├── CartItem.tsx
│   │   └── SalesForm.tsx
│   ├── products/
│   │   ├── ProductTable.tsx
│   │   └── ProductForm.tsx
│   ├── inventory/
│   │   └── StockStatusBadge.tsx
│   └── reports/
│       ├── SalesChart.tsx
│       └── ReportTable.tsx
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth.ts                   # Better Auth config
│   └── auth-client.ts            # Better Auth client
├── prisma/
│   └── schema.prisma
├── middleware.ts
└── .env
```

---

## ⚙️ Environment Variables (`.env`)

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/tooltrackr"
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
```

---

## 🚀 System Features & Implementation Guide

### 1. Sales Recording Module
**Page:** `/sales`  
**Accessible by:** Cashier, Admin

- Display a product search input (search by name)
- Allow adding multiple products to a cart with quantities
- Calculate subtotal per item and grand total
- On "Complete Sale":
  - Create a `Transaction` record
  - Create `TransactionItem` records for each product
  - Decrement `Product.quantity` for each item sold using Prisma transactions (`prisma.$transaction([...])`) to ensure atomicity
  - Show a success confirmation

**Key logic — atomic stock update:**
```ts
await prisma.$transaction([
  prisma.transaction.create({ data: { cashierId, totalAmount, items: { create: items } } }),
  ...items.map(item =>
    prisma.product.update({
      where: { id: item.productId },
      data: { quantity: { decrement: item.quantity } },
    })
  ),
]);
```

---

### 2. Inventory Monitoring Module
**Page:** `/inventory`  
**Accessible by:** Admin

- Display all products with current stock levels
- Color-coded stock status badges:
  - 🔴 **Out of Stock** — quantity = 0
  - 🟡 **Low Stock** — quantity ≤ `lowStockThreshold`
  - 🟢 **In Stock** — quantity > `lowStockThreshold`
- Filter/sort by stock status
- Highlight low-stock and out-of-stock items prominently

---

### 3. Product Information Management
**Page:** `/products`  
**Accessible by:** Admin only

- Table of all products with: Name, Category, Price, Quantity, Stock Status, Actions
- Add new product (name, description, price, quantity, category, low stock threshold)
- Edit existing product details
- Delete product (soft delete or restrict if linked to transactions)

---

### 4. Stock Identification Feature
**Location:** Dashboard + Inventory page

- Dashboard widget showing:
  - Total products count
  - Low stock count
  - Out of stock count
  - Top 5 fast-moving items (products with most `TransactionItem` records in the past 30 days)
- Fast-moving items query:
```ts
const fastMoving = await prisma.transactionItem.groupBy({
  by: ["productId"],
  _sum: { quantity: true },
  orderBy: { _sum: { quantity: "desc" } },
  take: 5,
  where: {
    transaction: {
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
  },
});
```

---

### 5. Report Generation Module
**Page:** `/reports`  
**Accessible by:** Admin only

- **Sales Report** — Filter by date range, show total sales, number of transactions, breakdown per product
- **Inventory Report** — Current stock levels, low stock alerts, stock valuation (quantity × price)
- Display data in tables and simple charts (use `recharts` or `chart.js`)
- Export to PDF or CSV (optional enhancement)

---

## 🔒 Route Authorization Rules

| Route | Cashier | Admin |
|---|---|---|
| `/login` | ✅ | ✅ |
| `/dashboard` | ✅ | ✅ |
| `/sales` | ✅ | ✅ |
| `/sales/history` | ✅ | ✅ |
| `/inventory` | ❌ | ✅ |
| `/products` | ❌ | ✅ |
| `/reports` | ❌ | ✅ |

Enforce this in `middleware.ts` by checking the user's `role` from the session.

---

## 🌱 Database Seeding (`prisma/seed.ts`)

Seed an initial admin account and sample products:

```ts
await prisma.user.create({
  data: {
    name: "Store Owner",
    email: "admin@tooltrackr.com",
    password: await hashPassword("admin123"), // hash with bcrypt
    role: "ADMIN",
  },
});
```

Run with:
```bash
npx prisma db seed
```

---

## 🛠️ Setup Instructions

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Fill in DATABASE_URL and BETTER_AUTH_SECRET

# 3. Push schema to database
npx prisma migrate dev --name init

# 4. Seed the database
npx prisma db seed

# 5. Run the development server
npm run dev
```

---

## 📌 Functional Requirements Summary

| # | Feature | Priority |
|---|---|---|
| F1 | User login with role-based access | High |
| F2 | Product search and sales cart | High |
| F3 | Automatic stock decrement on sale | High |
| F4 | Product CRUD management | High |
| F5 | Low-stock and out-of-stock alerts | High |
| F6 | Sales transaction history | Medium |
| F7 | Fast-moving items identification | Medium |
| F8 | Sales and inventory report generation | Medium |
| F9 | Dashboard with summary statistics | Medium |

---

## 🚫 Out of Scope

The following features are explicitly **not included** in this system:

- Supplier management
- Accounting or billing modules
- Integration with external payment systems
- Mobile application
- Multi-branch management
- Barcode scanner integration
- Advanced financial analysis

---

## 📍 Client Information

**Store:** J&LL Hardware Store  
**Location:** Purok 14, Barangay Poblacion, Tupi, South Cotabato  
**System Name:** ToolTrackR  








# Implementation Plan - Stock Movement Log System

Implementing a tracking system for all inventory changes (sales, restocks, manual adjustments) to provide a "Daily Inventory Movement" report.

## 1. Database Schema Update

### `prisma/schema.prisma`
Add the `StockLog` model to track every change in item quantity.

```prisma
model StockLog {
  id        String   @id @default(cuid())
  itemId    String
  item      Item     @relation(fields: [itemId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  change    Int      // Positive for restock/creation, negative for sales
  reason    String   // "SALE", "RESTOCK", "MANUAL_ADJUSTMENT", "CREATION"
  oldStock  Int
  newStock  Int
  createdAt DateTime @default(now())

  @@map("stockLog")
}
```

Update `Item` and `User` models to include the relation.

## 2. API Updates (Logging)

### `app/api/item/create-item/route.ts`
Log the initial quantity as "CREATION".

### `app/api/item/update-item/route.ts`
1. Fetch the current item to get `oldStock`.
2. Calculate `change = newStock - oldStock`.
3. Log the change as "RESTOCK" if positive, or "MANUAL_ADJUSTMENT" if negative (or different context).

### `app/api/transactions/route.ts`
Inside the transaction loop:
1. Log the decrement as "SALE" for each item.

## 3. New API Endpoint

### `app/api/reports/stock-movement/route.ts`
Create a GET endpoint that:
- Accepts `startDate` and `endDate` (or `date`).
- Returns a list of `StockLog` entries with joined `Item` and `User` data.

## 4. UI Components

### `components/reports/stock-movement-table.tsx`
A table to display:
- Timestamp
- Item Name
- Action (Type)
- User (who did it)
- Change (+/-)
- Resulting Stock

### `app/admin/dashboard/reports/page.tsx`
Integrate the `StockMovementTable` into the "Inventory" tab.

## 5. Verification Plan

### Automated Tests
- Test that creating an item creates a `StockLog`.
- Test that updating an item's quantity creates a `StockLog` with the correct `change`.
- Test that a transaction creates a `StockLog` with a negative `change`.

### Manual Verification
- Create a new item -> check Stock Movement report.
- Edit an item's quantity -> check Stock Movement report.
- Perform a sale -> check Stock Movement report.
