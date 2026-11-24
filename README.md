# DARKVENCE — Full-Stack Digital Agency Platform & CMS

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-green.svg)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

**DARKVENCE** is an elite digital agency platform and content management system engineered for ambitious digital brands. The application features a high-performance reactive frontend (React 19, Tailwind CSS v4, Motion), a modular backend (Node.js, Express, Zod validation, JWT authentication), resilient persistent JSON/MongoDB data stores, and an integrated Admin CMS Dashboard.

---

## Table of Contents

- [Developer Quickstart](#developer-quickstart)
- [Prerequisites](#prerequisites)
- [Step-by-Step Developer Setup Guide](#step-by-step-developer-setup-guide)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Node.js Version Check](#2-nodejs-version-check)
  - [3. Install Dependencies](#3-install-dependencies)
  - [4. Environment Configuration](#4-environment-configuration)
  - [5. Database Architecture & Setup](#5-database-architecture--setup)
  - [6. Admin Account Creation (`npm run create:admin`)](#6-admin-account-creation)
  - [7. Start the Development Server](#7-start-the-development-server)
  - [8. Access Local Application & Admin Portal](#8-access-local-application--admin-portal)
- [Project Architecture](#project-architecture)
- [Available npm Scripts](#available-npm-scripts)
- [API Reference (`/api/v1`)](#api-reference-apiv1)
- [Troubleshooting Common Issues](#troubleshooting-common-issues)
- [GitHub Security & Best Practices](#github-security--best-practices)

---

## Prerequisites

- **Node.js**: `v20.x` or `v22.x` (LTS recommended, minimum `v18.18+`)
- **npm**: `v9.x` or `v10.x` (or `pnpm` / `yarn`)
- **Git**: Installed and configured on your operating system

---

## Step-by-Step Developer Setup Guide

### 1. Clone Repository

Clone the project to your local workspace using Git:

```bash
git clone https://github.com/your-username/darkvence.git
cd darkvence
```

### 2. Node.js Version Check

Verify your installed Node.js and npm versions:

```bash
node -v   # Should output v20.x.x or v22.x.x
npm -v    # Should output v9.x.x or v10.x.x
```

### 3. Install Dependencies

Install all project dependencies:

```bash
npm install
```

### 4. Environment Configuration

Copy the documented `.env.example` template to `.env`:

```bash
cp .env.example .env
```

Review and adjust variables in `.env` as required:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | Port for the full-stack server and Vite dev middleware. |
| `NODE_ENV` | `development` | Runtime environment (`development` or `production`). |
| `JWT_SECRET` | *(Random string)* | Key used to sign administrative JWT tokens. |
| `JWT_EXPIRES_IN` | `7d` | Administrative session lifetime. |
| `ADMIN_EMAIL` | `admin@darkvence.com` | Default fallback admin username. |
| `ADMIN_PASSWORD` | `darkvence2026!` | Default fallback admin password. |
| `DATABASE_URL` / `MONGODB_URI` | *(Empty)* | Optional MongoDB Atlas URI. If empty, local disk JSON store is active. |
| `CLOUDINARY_CLOUD_NAME` | *(Empty)* | Optional Cloudinary cloud name for media hosting. |
| `CLOUDINARY_API_KEY` | *(Empty)* | Optional Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | *(Empty)* | Optional Cloudinary API secret. |

> **Note on Security**: Never commit your `.env` file to version control. It is ignored by `.gitignore`.

### 5. Database Architecture & Setup (MongoDB Atlas & Mongoose)

DARKVENCE uses **MongoDB Atlas** via **Mongoose** for resilient, production-grade cloud persistence with an automated local fallback engine for instant development:

- **MongoDB Atlas Integration**:
  Add your MongoDB Atlas cluster connection string to `.env`:
  ```env
  MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/darkvence?retryWrites=true&w=majority
  ```
  The connection module (`src/server/db/connection.ts`) validates credentials, masks passwords in logs, supports connection retries with timeouts, and ensures the Express server only accepts requests once the database is healthy.

- **Zero-Data-Loss Migration Suite**:
  DARKVENCE includes an automated 4-step migration pipeline to migrate and verify existing records without data loss:

  1. **Backup JSON Stores**:
     ```bash
     npm run db:backup
     ```
     Creates an immutable timestamped backup archive of all 11 collections under `src/server/db/backups/`.

  2. **Run Zero-Data-Loss Migration**:
     ```bash
     npm run db:migrate
     ```
     Idempotently upserts all records (preserving original IDs, timestamps, relationships, and bcrypt password hashes) to MongoDB Atlas. Never deletes or alters existing JSON stores.

  3. **Verify Database Integrity**:
     ```bash
     npm run db:verify
     ```
     Performs a cryptographic and count comparison between source backups and live MongoDB collections, asserting 100% record match and checking sample records.

  4. **Rollback (Emergency Restore)**:
     ```bash
     npm run db:rollback
     ```
     Restores JSON collections from the latest verified backup manifest if needed.

- **Zero Prerequisite Local Development**:
  If `MONGODB_URI` is omitted or unconfigured during local development, DARKVENCE initializes an embedded WiredTiger engine (`mongodb-memory-server`) with persistent storage at `.mongo_data/`. You get 100% genuine MongoDB query semantics out-of-the-box.

### 6. Admin Account Creation

Create your personalized Administrator account using the dedicated CLI wizard:

```bash
npm run create:admin
```

The interactive wizard will guide you through:
1. **Admin Full Name**: (e.g. `Jane Doe`)
2. **Admin Email Address**: (e.g. `jane@darkvence.com`)
3. **Admin Password**: (Securely masked with asterisks, minimum 6 characters)
4. **Role**: Automatically assigned as `superadmin`.

The CLI hashes the password using `bcryptjs` (10 salt rounds), validates email uniqueness to prevent duplicates, writes to MongoDB Atlas, and synchronizes the account.

*(Non-interactive mode for CI/CD automation)*:
```bash
npm run create:admin -- --name "Jane Doe" --email "jane@darkvence.com" --password "secretpass123" --role superadmin
```

### 7. Start the Development Server

DARKVENCE runs a unified full-stack architecture where Express powers `/api/v1/*` routes and mounts the Vite dev server directly in a single process on Port 3000:

```bash
npm run dev
```

### 8. Access Local Application & Admin Portal

Once the server reports ready:

- **Public Website URL**: [http://localhost:3000](http://localhost:3000)
  - Features: Home, Services, About, Portfolio, Blog, and Contact with interactive Google Maps and WhatsApp integration.
- **Admin Login Portal URL**: [http://localhost:3000](http://localhost:3000) (Click **"Admin CMS Portal"** in the footer or top navigation).
  - Use the credentials you generated with `npm run create:admin` (or the default `admin@darkvence.com` / `darkvence2026!`).
- **Health Check Endpoint**: [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health) (Reports MongoDB connectivity status and returns HTTP 503 if disconnected).

---

## Project Architecture

```
darkvence/
├── public/
│   ├── assets/                 # Brand assets, logos, and favicons
│   └── uploads/                # Local disk fallback directory for uploaded media
├── scripts/
│   ├── createAdmin.ts          # Interactive Admin Account creation CLI
│   └── audit_suite.mjs         # Automated end-to-end regression test suite
├── src/
│   ├── components/
│   │   ├── layout/             # Navbar, Footer, MobileBottomNav
│   │   └── ui/                 # BrandLogo, ScrollProgressBar, WhatsAppFloatingButton, LoadingScreen
│   ├── context/
│   │   ├── AuthContext.tsx      # Admin authentication session provider
│   │   └── ThemeContext.tsx     # Dark / light theme toggle with localStorage sync
│   ├── pages/
│   │   ├── public/             # HomePage, ServicesPage, AboutPage, PortfolioPage, BlogPage, ContactPage
│   │   └── admin/              # AdminDashboard, AdminAboutPage, AdminServices, AdminProjects, AdminInquiries, etc.
│   ├── server/
│   │   ├── app.ts              # Express application setup, security headers, middleware
│   │   ├── config/             # Runtime environment configuration parser
│   │   ├── db/
│   │   │   ├── store.ts        # Data Access Layer (DAL) & in-memory/disk accessors
│   │   │   ├── data_about.json # Persisted About CMS configuration
│   │   │   └── data_users.json # Persisted Administrator credentials
│   │   ├── middlewares/        # requireAuth, validateRequest, rateLimiter, errorHandler
│   │   ├── modules/            # Domain controllers (auth, services, projects, blog, inquiries, about, uploads)
│   │   └── routes/             # REST API Router (/api/v1/*)
│   ├── services/
│   │   └── api.ts              # Strongly-typed client API caller
│   ├── types/
│   │   └── index.ts            # Shared TypeScript domain contracts
│   ├── App.tsx                 # Main application view coordinator and routing
│   └── main.tsx                # Client React entry point
├── server.ts                   # Full-stack Node.js server entry point (Express + Vite)
├── .env.example                # Documented environment variable template
├── .gitignore                  # Git ignore rules (protects credentials and builds)
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript compiler configuration
└── vite.config.ts              # Vite bundler configuration
```

---

## Available npm Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the unified full-stack development server with HMR on port 3000. |
| `npm run create:admin` | Runs the interactive CLI wizard to create a new Administrator account. |
| `npm run db:backup` | Backs up all 11 JSON collections to timestamped archive in `src/server/db/backups/`. |
| `npm run db:migrate` | Runs idempotent zero-data-loss migration into MongoDB Atlas. |
| `npm run db:verify` | Audits MongoDB collections against backup manifest for 100% record match. |
| `npm run db:rollback` | Restores JSON stores from latest verified backup archive. |
| `npm run build` | Compiles the production frontend bundle into `dist/`. |
| `npm start` | Runs the production Node.js server. |
| `npm run lint` | Runs `tsc --noEmit` to verify type safety across the entire codebase. |
| `npm run clean` | Cleans `dist/` and build artifacts. |

---

## API Reference (`/api/v1`)

### Public Endpoints
- `GET /api/v1/health` — System status, uptime, and diagnostics.
- `GET /api/v1/services` — List of published digital agency services.
- `GET /api/v1/services/:slug` — Single service details with process and deliverables.
- `GET /api/v1/projects` — Filterable portfolio projects.
- `GET /api/v1/blog` — Filterable blog dispatches.
- `GET /api/v1/settings` — Public brand settings, testimonials, and office information.
- `GET /api/v1/about` — Dynamic About page content managed via CMS.
- `POST /api/v1/inquiries` — Inbound lead inquiry submission (rate limited; protected by honeypot field `website_source_hp`).

### Protected Administrative Endpoints (Requires `Authorization: Bearer <token>`)
- `POST /api/v1/auth/login` — Authenticate admin credentials and receive JWT.
- `POST /api/v1/auth/logout` — Revoke administrative session.
- `GET /api/v1/auth/me` — Return current admin profile.
- `GET /api/v1/admin/about` & `PUT /api/v1/admin/about` — Manage About Page Hero, Values, Team Members, and Stats.
- `GET /api/v1/admin/services` / `POST` / `PUT` / `DELETE` — Manage Services offerings.
- `GET /api/v1/admin/projects` / `POST` / `PUT` / `DELETE` — Manage Portfolio case studies.
- `GET /api/v1/admin/blog` / `POST` / `PUT` / `DELETE` — Manage Blog posts.
- `GET /api/v1/admin/inquiries` / `PATCH` / `DELETE` — CRM lead status management.
- `POST /api/v1/admin/uploads` — Upload media image (enforces 5MB max limit, JPEG/PNG/WebP/SVG).

---

## Troubleshooting Common Issues

### 1. Port 3000 Is Already in Use
If another process is using port 3000, specify a different port in `.env`:
```env
PORT=3001
```
Or kill the conflicting process on Linux/macOS:
```bash
lsof -ti :3000 | xargs kill -9
```

### 2. "Invalid administrative email or password" on Login
- Ensure you created an admin account using `npm run create:admin`.
- Verify the email and password match what was entered during creation.
- Check that `data_users.json` exists in `src/server/db/`.
- Alternatively, use the default credentials: `admin@darkvence.com` / `darkvence2026!`.

### 3. Media Upload Errors
- Uploaded images must be under **5MB**.
- Supported formats: JPEG, PNG, WebP, SVG.
- If Cloudinary is not configured in `.env`, images are automatically written to `public/uploads/` on your local filesystem and served via `/uploads/*`.

### 4. TypeScript Errors on First Run
Run a clean type-check:
```bash
npm run lint
```
If node modules are missing or outdated, reinstall cleanly:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## GitHub Security & Best Practices

- **Never Commit Secrets**: Keep `.env` out of version control. Only commit changes to `.env.example`.
- **Uploaded Media**: Local developer media files in `public/uploads/` are excluded by `.gitignore` (with `.gitkeep` maintaining directory structure).
- **Passwords**: All administrative passwords in the database are hashed with `bcryptjs` salt rounds; plain text passwords are never stored or logged.
