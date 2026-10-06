# PrimeNest E-Commerce — Local Setup & Requirements Guide 🏛️✨

Welcome to **PrimeNest E-Commerce**, a modern luxury e-commerce platform and administrative SaaS dashboard built with **Next.js 16**, **React 19**, **PostgreSQL**, and **Google Gemini AI**.

Follow this guide to get the project running locally on your machine in under 5 minutes.

---

## 📋 System Prerequisites

Ensure you have the following installed on your system before proceeding:

| Requirement | Minimum Version | Recommended Version | Verification Command | Download / Install |
| :--- | :--- | :--- | :--- | :--- |
| **Node.js** | `v18.17.0` | `v20.x` or `v22.x` (LTS) | `node -v` | [nodejs.org](https://nodejs.org/) |
| **npm** | `v9.0.0` | `v10.x` | `npm -v` | Included with Node.js |
| **PostgreSQL** | `v14.0` | `v15.x` or `v16.x` | `psql -V` | [postgresql.org](https://www.postgresql.org/download/) |
| **Git** | `v2.30.0` | Latest | `git --version` | [git-scm.com](https://git-scm.com/) |

> [!NOTE]
> Make sure your local **PostgreSQL service is running** on default port `5432` before starting database setup.

---

## ⚡ Quick-Start (5 Steps)

```bash
# 1. Clone the repository
git clone https://github.com/rohandevtech23/Primenest-E-Commerce.git
cd Primenest-E-Commerce

# 2. Install all dependencies
npm install

# 3. Create your environment configuration
cp .env.example .env

# 4. Set up database, apply schema & seed catalog in one command
npm run db:init

# 5. Start the development server
npm run dev
```

Visit **`http://localhost:3001`** in your browser!

---

## 🛠️ Step-by-Step Local Setup

### Step 1: Clone Repository & Install Dependencies

```bash
git clone https://github.com/rohandevtech23/Primenest-E-Commerce.git
cd Primenest-E-Commerce
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the project root by copying `.env.example`:

```bash
# On Linux / macOS / Git Bash:
cp .env.example .env

# On Windows PowerShell:
Copy-Item .env.example .env
```

Open `.env` and fill in your PostgreSQL password:

```env
# ==========================================
# PrimeNest E-Commerce - Environment Config
# ==========================================

# PostgreSQL Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=primenest_db
DB_PASSWORD=your_actual_postgres_password

# Admin Panel Authentication & Session Security
ADMIN_SESSION_SECRET=primenest_super_secret_jwt_key_minimum_32_characters_long_12345
ADMIN_EMAIL=admin@primenest.com
ADMIN_PASSWORD=admin123

# Optional AI Features (Google Gemini - Stylist & AI Search)
# Get a free key: https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Replicate API Token (for Virtual Try-On)
REPLICATE_API_TOKEN=your_replicate_token_here
```

### Step 3: Initialize & Seed PostgreSQL Database

You can set up the entire database in a single command:

```bash
npm run db:init
```

What `npm run db:init` does automatically:
1. Connects to PostgreSQL and creates the database `primenest_db` if it doesn't already exist.
2. Applies the complete database tables, indexes, triggers, and relations from [schema.sql](file:///r:/E-commerece/PrimeNest-E-Commerce/schema.sql).
3. Seeds the luxury catalog across **Men, Women, Footwear, Perfume, and Accessories** (`340+` products).
4. Seeds initial customer orders, order items, buyer accounts, and revenue metrics for the admin analytics dashboard.

*(Alternative individual commands if needed):*
- `npm run db:setup` — Creates `primenest_db` and applies `schema.sql`.
- `npm run db:seed` — Seeds products catalog only.

### Step 4: Run the Development Server

```bash
npm run dev
```

The Next.js development server will start on port `3001`:

- 🛍️ **Luxury Storefront**: [http://localhost:3001](http://localhost:3001)
- 📊 **Admin Dashboard**: [http://localhost:3001/admin](http://localhost:3001/admin)
- 🛒 **Cart & Checkout**: [http://localhost:3001/cart](http://localhost:3001/cart)
- 🔍 **AI Search & Concierge**: [http://localhost:3001/search](http://localhost:3001/search)

---

## 🔑 Default Credentials & Access

### Admin Dashboard Access
- **URL**: `http://localhost:3001/admin`
- **Default Email**: `admin@primenest.com`
- **Default Password**: `admin123`
*(Configurable via `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`)*

---

## 📜 Available NPM Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `next dev -p 3001` | Starts development server on port 3001 with hot reloading |
| `npm run build` | `next build` | Creates an optimized production build |
| `npm run start` | `next start` | Runs the production server |
| `npm run db:init` | `setup-db + seed-rich-catalog + seed-analytics` | **All-in-one** DB setup, schema creation, and demo data seeding |
| `npm run db:setup` | `node scripts/setup-db.mjs` | Creates database and runs `schema.sql` schema migration |
| `npm run db:seed` | `node scripts/seed-rich-catalog.mjs` | Seeds products catalog |
| `npm run lint` | `eslint` | Runs ESLint checks |

---

## 🏗️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions, API routes)
- **UI Library**: [React 19](https://react.dev/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) via native `pg` connection pooling
- **Styling**: Curated Vanilla CSS with glassmorphism, responsive grids, and micro-animations
- **AI Integration**: [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) (Google Gemini 1.5 / 2.0 Flash) for PrimeNest Stylist & semantic recommendations
- **Icons**: [lucide-react](https://lucide.dev/)
- **Authentication**: JWT & encrypted cookies via `jose` and `bcryptjs`
- **Notifications**: [sonner](https://sonner.emilkowal.ski/) toast system
- **Excel/Catalog Import**: [xlsx](https://www.npmjs.com/package/xlsx)

---

## ❓ Troubleshooting & Common Issues

### 1. `[Error 28P01] Password authentication failed for user "postgres"`
- **Cause**: The password specified in `DB_PASSWORD` does not match your local PostgreSQL `postgres` user password.
- **Fix**: Open `.env` and set `DB_PASSWORD` to the password you chose when installing PostgreSQL.

### 2. `[Connection Refused] connect ECONNREFUSED 127.0.0.1:5432`
- **Cause**: PostgreSQL service is not started on your machine.
- **Fix**:
  - **Windows**: Open Services (`services.msc`), find `postgresql-x64-<version>`, and click **Start**.
  - **macOS (Homebrew)**: Run `brew services start postgresql`.
  - **Linux (Ubuntu/Debian)**: Run `sudo systemctl start postgresql`.

### 3. `Port 3001 is already in use`
- **Fix**: Either stop the existing process running on 3001 or start on a different port:
  ```bash
  npm run dev -- -p 3002
  ```

### 4. Gemini AI Stylist / Search shows fallback answers
- **Cause**: `GEMINI_API_KEY` is not provided in `.env`.
- **Fix**: Get a free API key at [Google AI Studio](https://aistudio.google.com/) and paste it into `.env`. The rest of the store (catalog, checkout, cart, admin) works 100% fine without it.

---

## 🤝 Contributing & Author

- **Author**: [rohandevtech23](https://github.com/rohandevtech23)
- **Repository**: [https://github.com/rohandevtech23/Primenest-E-Commerce](https://github.com/rohandevtech23/Primenest-E-Commerce)
