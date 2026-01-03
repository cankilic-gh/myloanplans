# 💰 My Loan Plans

**Turn financial chaos into a clear plan.** Track all your loans, optimize payments, and see exactly when you'll be debt-free.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-2.89-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

## ✨ Features

### 🏦 Loan Management
- **Real-time Amortization Calculations** - See your payment schedule instantly
- **Multiple Loan Plans** - Track multiple loans simultaneously
- **One-time Payments** - Simulate extra payments and see their impact
- **Payment Progress Tracking** - Visual progress bars showing debt reduction
- **Recurring Extra Payments** - Set up automatic additional payments

### 💵 Budget Management
- **Account Tracking** - Manage multiple bank accounts
- **Transaction History** - Track income and expenses
- **Category Management** - Organize expenses by categories
- **Recurring Expenses** - Automate monthly bills and subscriptions
- **Financial Summary** - Dashboard with income, expenses, and balance overview
- **Interactive Charts** - Visualize spending patterns with Recharts

### 🔐 Authentication & Data Persistence
- **Email-based Authentication** - Secure login with email verification
- **Hybrid Data Storage** - Supabase (PostgreSQL) for authenticated users, localStorage for guests
- **Guest Mode** - Try the app without signing up
- **Data Migration** - Seamless transition from guest to authenticated user

### 🎨 User Experience
- **Modern UI/UX** - Beautiful, responsive design with Framer Motion animations
- **Dark Mode Ready** - Tailwind CSS with dark mode support
- **Mobile Responsive** - Works perfectly on all devices
- **Real-time Updates** - Auto-save functionality with debouncing

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL Database** (via Supabase or local)
- **Supabase Account** (for production) or SQLite (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/myloanplans.git
   cd myloanplans
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/myloanplans"
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   
   # Email (Resend)
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
myloanplans/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Dashboard routes
│   │   ├── budget/              # Budget management
│   │   ├── loans/               # Loan calculator
│   │   └── settings/            # User settings
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── budget/              # Budget API endpoints
│   │   └── loan-plans/          # Loan plans API endpoints
│   ├── calculator/              # Calculator page
│   ├── dashboard/               # Main dashboard
│   └── page.tsx                 # Landing page
├── components/                  # React components
│   ├── budget/                  # Budget components
│   ├── landing/                 # Landing page components
│   └── ui/                      # Reusable UI components
├── lib/                         # Utilities and helpers
│   ├── api/                     # API client functions
│   ├── prisma.ts                # Prisma client
│   ├── storage.ts               # localStorage utilities
│   └── supabase.ts              # Supabase client
├── prisma/                      # Database schema and migrations
│   ├── schema.prisma            # Prisma schema
│   └── migrations/              # Database migrations
├── utils/                       # Utility functions
│   └── mortgageMath.ts          # Loan calculation logic
└── stores/                      # Zustand state management
    └── useUIStore.ts            # UI state store
```

---

## 🛠 Tech Stack

### Frontend
- **Next.js 16.1** - React framework with App Router
- **React 19.2** - UI library
- **TypeScript 5.0** - Type safety
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Recharts** - Chart library for data visualization
- **Lucide React** - Icon library
- **Zustand** - Lightweight state management

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma 6.19** - Type-safe ORM
- **Supabase** - PostgreSQL database and auth
- **NextAuth.js 5.0** - Authentication
- **Resend** - Email service

### Database
- **PostgreSQL** (via Supabase) - Production database
- **SQLite** (via Prisma) - Development database

---

## 📖 Usage

### Creating a Loan Plan

1. Navigate to the **Loans** section
2. Click **"Add New Plan"**
3. Enter loan details:
   - Principal amount
   - Annual interest rate
   - Loan term (months)
   - Optional: Down payment, recurring extra payments
4. View your amortization schedule and payment breakdown

### Managing Budget

1. Go to the **Budget** section
2. Add accounts (checking, savings, etc.)
3. Create categories for expenses
4. Add transactions (income/expenses)
5. Set up recurring expenses
6. View financial summary and charts

### Guest Mode vs. Authenticated

- **Guest Mode**: Data stored in localStorage, works offline
- **Authenticated**: Data synced to Supabase, accessible across devices
- **Migration**: Guest data automatically migrates when you sign up

---

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

### Database Management

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (development only)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio

# Generate Prisma Client
npx prisma generate
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform:
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `RESEND_API_KEY`

---

## 📝 License

This project is private and proprietary.

---

## 👤 Author

**Can Kilic**

- Portfolio: [cankilic.com](https://cankilic.com)
- GitHub: [@yourusername](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Database powered by [Supabase](https://supabase.com)
- Icons by [Lucide](https://lucide.dev)
- Animations by [Framer Motion](https://www.framer.com/motion/)
