# Someday

Visual wishlist app for cafés, places, and products.

Built with **Next.js + TypeScript + Tailwind + Supabase**.

---

## Quick start (5 minutes)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase (free)

1. Go to https://supabase.com → Sign in → **New project**
2. Choose a name, password, region (closest to you), free plan
3. Wait ~2 minutes for setup
4. Go to **SQL Editor** → click **New query**
5. Open `supabase/schema.sql` from this project, paste contents, click **Run**
6. Go to **Project Settings → API**, copy two values:
   - **Project URL**
   - **anon public key**

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
```

### 4. Run locally

```bash
npm run dev
```

Open http://localhost:3000

---

## Features

- ☕ **3 categories** — Cafés, Places, Products
- 🔐 **Email/password login** (Supabase Auth)
- 🖼️ **Visual grid** — image-first cards
- ✓ **Mark as done** — with star rating
- 🔍 **Filter** — All / To do / Done
- 🗑️ **Delete** items
- 💰 **Price field** for Products
- 🔗 **External link** for each item (Google Maps, store, etc.)

---

## Deploy to Vercel (free)

1. Push project to GitHub
2. Go to https://vercel.com → **New Project**
3. Import your GitHub repo
4. Add environment variables (same as `.env.local`)
5. Click **Deploy**

Done. You'll get a URL like `https://someday-app.vercel.app`.

---

## Project structure

```
src/
├─ app/
│  ├─ cafe/page.tsx        — Cafés tab
│  ├─ place/page.tsx       — Places tab
│  ├─ product/page.tsx     — Products tab
│  ├─ login/page.tsx       — Sign in
│  ├─ signup/page.tsx      — Create account
│  └─ page.tsx             — Auto-redirect to /cafe or /login
├─ components/
│  ├─ CategoryView.tsx     — Main grid view (shared)
│  ├─ TabNav.tsx           — Bottom-style tab switcher
│  ├─ ItemCard.tsx         — Visual card with image
│  ├─ ItemDetail.tsx       — Full-screen detail view
│  └─ AddItemModal.tsx     — Add new item form
└─ lib/
   ├─ supabase-client.ts   — Browser Supabase client
   ├─ supabase-server.ts   — Server-side Supabase client
   └─ types.ts             — TypeScript types
supabase/
└─ schema.sql              — Database schema + RLS policies
```

---

## Next features to add (later)

- 📍 **Map view** for Cafés & Places (Mapbox)
- 🔗 **Auto-fill from URL** — paste Google Maps → name+address filled
- 💸 **Price tracking** for Products — daily check + email alert
- 📸 **Photo upload** to Supabase Storage
- 🏷️ **Tags** & search
- 👥 **Share list** with friends
