# RentO — Trust-First Rental Marketplace

<div align="center">

![RentO Banner](https://img.shields.io/badge/RentO-Rental%20Marketplace-d4f07a?style=for-the-badge&labelColor=1a1a1a)

**Rent gear from people you can trust.**

A peer-to-peer rental marketplace for cameras, audio equipment, gaming consoles, and creator gear — built with a lifecycle-driven approach to eliminate trust and coordination problems in informal rental ecosystems.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://prisma.io)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat-square&logo=clerk)](https://clerk.com)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe)](https://stripe.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel)](https://vercel.com)

[Live Demo](https://rento-ten.vercel.app) · [Report Bug](https://github.com/BhavyyaDev/rent0/issues) · [Request Feature](https://github.com/BhavyyaDev/rent0/issues)

</div>

---

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Request Lifecycle](#request-lifecycle)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API & Server Actions](#api--server-actions)
- [UI Design System](#ui-design-system)
- [Security](#security)
- [Roadmap](#roadmap)

---

## 🧠 About The Project

RentO is not just a listing platform — it is a **lifecycle-driven rental infrastructure** built to handle trust, payments, availability, and transaction management between strangers.

The platform enforces a strict rental lifecycle with controlled state transitions, preventing invalid actions and disputes at every step:

```
Request → Accept → Pay → Handover → Return → Complete
```

Built as a submission for **ADA Naples**, RentO addresses a real gap in peer-to-peer rental ecosystems where informal coordination through WhatsApp, Telegram, and Instagram leads to double bookings, payment disputes, and zero accountability.

---

## 🎯 Problem Statement

Current rental interactions happen through informal channels and suffer from:

- ❌ No trust framework between strangers
- ❌ No booking structure or date management
- ❌ Double booking with no resolution
- ❌ No payment protection
- ❌ No lifecycle tracking
- ❌ Zero accountability during handover or return

---

## ✨ Key Features

### For Renters
- 🔍 Browse and search listings by category
- 📅 Select rental dates with availability validation
- 💳 Secure Stripe-powered payment flow
- 📊 Track booking status in real-time
- 🔄 Full rental history and lifecycle visibility

### For Lenders
- 📦 Create, edit, and manage listings with image upload
- ✅ Accept or reject incoming rental requests
- 🤝 Mark items as handed over and returned
- 💰 Track earnings and active rentals
- 📋 Inventory management dashboard

### Platform-Wide
- 🔐 Clerk authentication with role-based access
- 🚫 Overlapping booking prevention
- ⚡ Automatic request status synchronization
- 💎 Carbon & Lime glassmorphism UI design
- 📱 Fully responsive across all devices

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Authentication** | Clerk |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Prisma |
| **Payments** | Stripe |
| **Image Upload** | UploadThing |
| **Deployment** | Vercel |

---

## 🏗 System Architecture

RentO follows a **full-stack monorepo architecture** using Next.js App Router. Frontend and backend logic exist inside the same project using Server Actions — no separate API server required.

```
┌─────────────────────────────────────────────┐
│                   Vercel                    │
│  ┌─────────────────────────────────────┐   │
│  │         Next.js App Router          │   │
│  │  ┌──────────┐  ┌────────────────┐  │   │
│  │  │  Pages   │  │ Server Actions │  │   │
│  │  │ (React)  │  │  (item.ts)     │  │   │
│  │  │          │  │  (request.ts)  │  │   │
│  │  │          │  │  (user.ts)     │  │   │
│  │  └──────────┘  └───────┬────────┘  │   │
│  └──────────────────────── │ ──────────┘   │
│                            │               │
│  ┌─────────┐  ┌────────────▼────────────┐ │
│  │  Clerk  │  │        Prisma ORM       │ │
│  │  Auth   │  └────────────┬────────────┘ │
│  └─────────┘               │              │
│                            │              │
│  ┌─────────┐  ┌────────────▼────────────┐ │
│  │ Stripe  │  │   Supabase PostgreSQL   │ │
│  │Payments │  └─────────────────────────┘ │
│  └─────────┘                              │
└─────────────────────────────────────────────┘
```

---

## 🗄 Database Schema

```prisma
model User {
  id         String    @id
  email      String    @unique
  name       String?
  role       String    @default("onboarding")
  trustScore Int       @default(100)
  createdAt  DateTime  @default(now())
  items      Item[]
  requests   Request[]
}

model Item {
  id          String    @id @default(cuid())
  title       String
  description String
  category    String
  imageUrl    String
  pricePerDay Float
  ownerId     String
  owner       User      @relation(fields: [ownerId], references: [id])
  requests    Request[]
  createdAt   DateTime  @default(now())
}

model Request {
  id            String   @id @default(cuid())
  itemId        String
  renterId      String
  startDate     DateTime
  endDate       DateTime
  status        String   @default("pending")
  paymentStatus String   @default("unpaid")
  totalPrice    Float
  deposit       Float    @default(0)
  item          Item     @relation(fields: [itemId], references: [id])
  renter        User     @relation(fields: [renterId], references: [id])
  createdAt     DateTime @default(now())
}
```

---

## 🔁 Request Lifecycle

Every rental follows a strict state machine — no invalid transitions are allowed:

```
                    ┌─────────┐
                    │ PENDING │ ◄── Renter creates request
                    └────┬────┘
                         │
              ┌──────────┴──────────┐
              │                     │
         ┌────▼────┐          ┌─────▼────┐
         │ACCEPTED │          │REJECTED  │
         └────┬────┘          └──────────┘
              │
         ┌────▼────┐
         │  PAID   │ ◄── Stripe payment confirmed
         └────┬────┘
              │
         ┌────▼────┐
         │ ACTIVE  │ ◄── Owner marks as handed over
         └────┬────┘
              │
         ┌────▼─────┐
         │COMPLETED │ ◄── Owner marks as returned
         └──────────┘
```

**Business Rules Enforced:**
- Renter cannot rent their own item
- Payment only possible after acceptance
- Handover only possible after payment
- Return only possible after handover
- Overlapping dates are blocked automatically

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase account (free)
- A Clerk account (free)
- A Stripe account (free)
- An UploadThing account (free)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/BhavyyaDev/rent0.git
cd rent0
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```
Fill in all required values (see [Environment Variables](#environment-variables))

4. **Set up the database**
```bash
npx prisma db push
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
```
http://localhost:3000
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with these variables:

```env
# Database (Supabase)
DATABASE_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/onboarding"

# Stripe Payments
STRIPE_SECRET_KEY="sk_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# UploadThing (Image Upload)
UPLOADTHING_TOKEN="sk_live_..."
```

---

## 📁 Project Structure

```
rent0/
├── app/
│   ├── actions/
│   │   ├── item.ts          # Item CRUD server actions
│   │   ├── request.ts       # Rental lifecycle actions
│   │   └── user.ts          # User management actions
│   ├── api/
│   │   ├── uploadthing/     # Image upload endpoint
│   │   └── webhook/stripe/  # Stripe payment webhook
│   ├── checkout/            # Stripe checkout page
│   ├── dashboard/           # Renter + Lender dashboard
│   ├── explore/             # Browse all listings
│   ├── items/
│   │   ├── [id]/            # Item detail page
│   │   │   └── edit/        # Edit listing
│   │   └── add/             # Create new listing
│   ├── onboarding/          # Role selection page
│   ├── account/             # Account management
│   ├── sign-in/             # Clerk sign in
│   ├── sign-up/             # Clerk sign up
│   ├── globals.css          # Global styles + glass effects
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage
│
├── components/
│   ├── ui/                  # shadcn/ui base components
│   ├── booking-widget.tsx   # Date picker + booking form
│   ├── dashboard-item-card.tsx
│   ├── item-card.tsx        # Listing card component
│   ├── navbar.tsx           # Main navigation
│   ├── profile-dropdown.tsx # User account dropdown
│   ├── role-toggle.tsx      # Renter/Lender switcher
│   └── search-filters.tsx   # Explore page filters
│
├── lib/
│   ├── db.ts                # Prisma client
│   ├── stripe.ts            # Stripe client
│   ├── syncUser.ts          # Clerk → DB user sync
│   └── utils.ts             # Utility functions
│
├── prisma/
│   └── schema.prisma        # Database schema
│
└── middleware.ts             # Route protection
```

---

## ⚙️ API & Server Actions

### Item Actions (`app/actions/item.ts`)
| Action | Description | Auth Required |
|--------|-------------|---------------|
| `createItem()` | Create a new listing | Lender only |
| `updateItem()` | Edit existing listing | Owner only |
| `deleteItem()` | Remove a listing | Owner only |
| `getItems()` | Fetch all listings | Public |

### Request Actions (`app/actions/request.ts`)
| Action | Description | Auth Required |
|--------|-------------|---------------|
| `createRequest()` | Send rental request | Renter only |
| `acceptRequest()` | Approve a request | Lender/Owner only |
| `rejectRequest()` | Decline a request | Lender/Owner only |
| `confirmPayment()` | Mark as paid | Renter only |
| `markAsActive()` | Confirm handover | Lender/Owner only |
| `markAsCompleted()` | Confirm return | Lender/Owner only |

### User Actions (`app/actions/user.ts`)
| Action | Description |
|--------|-------------|
| `syncUser()` | Sync Clerk user to DB |
| `completeOnboarding()` | Save role selection |
| `updateUser()` | Update profile info |

---

## 🎨 UI Design System

RentO uses a custom **Carbon & Lime** design language:

```css
/* Color Palette */
--background: #ffffff;
--surface:    #f5f5f5;
--carbon:     #1a1a1a;   /* Primary text + navbar */
--lime:       #d4f07a;   /* Accent + CTAs + badges */
--muted:      #555555;   /* Secondary text */
--border:     #e5e5e5;   /* Card borders */

/* Apple-style Glassmorphism */
.apple-glass {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 24px;
}

/* Border Radius — Apple style everywhere */
--radius-card:    24px;   /* rounded-3xl */
--radius-input:   16px;   /* rounded-2xl */
--radius-button:  9999px; /* rounded-full */
```

---

## 🔒 Security

- **Route Protection** — Middleware enforces auth on all protected routes
- **Server-side Validation** — All mutations validated on server, never trust client
- **Role-based Access** — Only owners can accept/reject, only renters can pay
- **Stripe Webhook Verification** — Webhook signature verified before processing
- **Ownership Checks** — Users can only modify their own resources
- **Availability Enforcement** — Double booking prevented at database level

---

## 🗺 Roadmap

- [x] Core rental lifecycle (Request → Complete)
- [x] Stripe payment integration
- [x] Image upload with UploadThing
- [x] Carbon & Lime glassmorphism UI
- [x] Role-based dashboards
- [ ] QR-based handover verification
- [ ] Ratings & reviews system
- [ ] Real-time notifications
- [ ] In-app messaging between renter and lender
- [ ] Deposit escrow system
- [ ] Location-based discovery
- [ ] Mobile app (React Native)

---

## 👨‍💻 Built By

**Bhavya Patel** — ADA Naples Application Project

---

<div align="center">

Made with ❤️ and a lot of ☕

⭐ Star this repo if you found it helpful!

</div>
