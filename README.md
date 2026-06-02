# Lumora — Smart Teaching Library

> Premium academic platform by **AzithBuild**

## Tech Stack
- **React 18** + **Vite**
- **Tailwind CSS** with custom Lumora design tokens
- **Framer Motion** for animations
- **Supabase** — Auth + PostgreSQL database
- **Lucide React** icons

---

## 🚀 Setup Guide

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy your **Project URL** and **anon public key** from Settings → API

### 2. Run the Database Schema
1. In Supabase dashboard → **SQL Editor**
2. Open and run the file: `supabase_schema.sql`

### 3. Configure Environment
```bash
cp .env.example .env
```
Edit `.env` and fill in your credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Install & Run
```bash
npm install
npm run dev
```

### 5. Build for Production
```bash
npm run build
```
Deploy the `dist/` folder to Vercel, Netlify, etc.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── AuthForm.jsx        # Shared login/register form
│   └── LoadingScreen.jsx   # Animated loading screen
├── context/
│   └── AuthContext.jsx     # Supabase auth state
├── lib/
│   └── supabase.js         # Supabase client + schema docs
├── pages/
│   ├── HomePage.jsx         # Landing page with portal cards
│   ├── TeacherLogin.jsx
│   ├── StudentLogin.jsx
│   ├── TeacherDashboard.jsx # Full CRUD dashboard
│   └── StudentBrowse.jsx    # Browse classes → resources
└── index.css               # Tailwind + Lumora custom styles
```

---

## 🎓 User Flows

### Teacher
1. Sign up / Log in at `/teacher/login`
2. Dashboard: Create Classes → Subjects → Chapters → Upload Resources
3. Edit or delete any item from the dashboard tabs

### Student
1. Sign up / Log in at `/student/login`
2. Browse Classes (only classes with uploaded resources are shown)
3. Drill down: Class → Subject → Chapter → Resources
4. Open Google Drive links directly

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary gradient | pink-400 → purple-500 |
| Background | hero-gradient (soft pastel radial) |
| Cards | glassmorphism (white/70, backdrop-blur) |
| Font Display | Playfair Display |
| Font Body | DM Sans |
| Shadow | lumora (soft purple glow) |

---

## ⚠️ Supabase Auth Note
After signing up, Supabase sends a confirmation email by default.
You can disable this in: **Authentication → Settings → Disable email confirmations** (for development).
