# PrimeNest Luxury E-Commerce 🏛️✨

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI%20Stylist-8E75C4?style=for-the-badge&logo=google)](https://aistudio.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

An ultra-luxury e-commerce web application featuring bespoke apparel, footwear, accessories, and haute perfumerie, powered by an integrated **Administrative SaaS Suite** and **Google Gemini AI Stylist**.

---

## 🚀 Quick Setup on Localhost

To get this project running on your local machine, check out the comprehensive **[REQUIREMENTS.md](REQUIREMENTS.md)** guide.

### In Short (5 Steps):

```bash
# 1. Clone repository
git clone https://github.com/rohandevtech23/Primenest-E-Commerce.git
cd Primenest-E-Commerce

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your local PostgreSQL password

# 4. Initialize database, schema & rich catalog seed
npm run db:init

# 5. Start dev server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## ✨ Key Features

- **🏛️ Haute Luxury Storefront**: Obsidian dark modes, refined typography, smooth animations, and curated editorial carousels.
- **👠 Category & Subcategory Catalog**: 340+ seeded products with isolated gender taxonomies (Men, Women, Footwear, Perfume, Accessories).
- **🤖 PrimeNest Stylist (Gemini AI)**: An intelligent AI concierge that recommends outfits, answers fashion inquiries, and pairs catalog items in real-time.
- **📊 Admin SaaS Dashboard** (`/admin`): Live catalog management, weekly revenue curves, orders table, customer insights, and dynamic pagination.
- **📦 Excel & CSV Product Import**: Bulk import catalog items with instant live validation.
- **🛒 Cart & Checkout Suite**: Instant quick-add, slide-over cart drawer, and guest/member checkout.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Lucide Icons
- **Styling**: Curated Vanilla CSS & Glassmorphism design system
- **Backend / API**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL with native `pg` connection pooling
- **AI**: Google Generative AI (Gemini Flash)
- **Security**: JWT session tokens via `jose`, `bcryptjs` password hashing

---

## 📖 Complete Documentation

For detailed prerequisite checks, environment keys, and troubleshooting, read **[REQUIREMENTS.md](REQUIREMENTS.md)**.

## 👤 Author

Developed by **[rohandevtech23](https://github.com/rohandevtech23)**.
