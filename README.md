# INTRA AI — Full-Stack AI Chatbot Platform

Build, train, and deploy intelligent AI chatbots for your business in minutes.

**Stack:** Next.js 14 · Node.js/Express · PostgreSQL · Google Gemini AI · Razorpay · Nodemailer

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Google Gemini API key (free at https://aistudio.google.com)
- Razorpay account (free at https://razorpay.com)
- Resend for email sending

---

### 1. PostgreSQL — Create Database

```bash
psql -U postgres
CREATE DATABASE intra_ai;
\q

# Run schema (creates tables + seeds plans + creates admin user)
psql -U postgres -d intra_ai -f backend/schema.sql
```

**Default admin credentials:**
- Email: `admin@intra-ai.com`
- Password: `Admin@123`
- ⚠️ Change this immediately after first login!

---

### 2. Backend Setup

```bash
cd backend

# Copy and fill environment variables
cp .env.example .env
# Edit .env with your values (see section below)

# Install dependencies
npm install

# Start development server
npm run dev
# Server runs on http://localhost:5000
```

**Backend `.env` values to fill:**

| Variable | Where to get it |
|---|---|
| `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Your PostgreSQL credentials |
| `JWT_SECRET` | Any random 32+ char string |
| `GEMINI_API_KEY` | https://aistudio.google.com/app/apikey |
| `RESEND_API_KEY`|
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | https://dashboard.razorpay.com/app/keys |

---

### 3. Frontend Setup

```bash
cd frontend

# Copy and fill environment variables
cp .env.example .env.local
# Edit .env.local

# Install dependencies
npm install

# Start development server
npm run dev
# App runs on http://localhost:3000
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=INTRA AI
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

---

### 4. Run Both Together

Open two terminals:
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend  
cd frontend && npm run dev
```

Visit: **http://localhost:3000**

---

## 🔑 Key Features

### For Users (Dashboard)
- **Create bots** — Choose from templates or build from scratch
- **Train bots** — Upload PDFs, scrape URLs, connect PostgreSQL/MySQL, add manual text
- **Customize** — Colors, fonts, avatar, welcome message, bubble style, position
- **Configure AI** — System prompt, temperature, response length, language
- **Get embed code** — Script tag or iframe for any website
- **Analytics** — Conversations, messages, daily charts
- **Billing** — Upgrade plans via Razorpay

### For Admins (/admin)
- **User management** — View, enable/disable, change plans, delete users
- **Plan management** — Create/edit/delete plans with full feature toggles
- **All bots** — View every bot across all users
- **Revenue analytics** — Monthly revenue charts

### Chatbot Features
- Powered by Google Gemini 1.5 Flash
- Full conversation history
- Knowledge base from PDF/URL/DB/text
- Optional email collection gate
- Rate limiting
- Mobile responsive embed
- Typing indicator animation
- Branding toggle


## 🔒 Security Notes

1. Change the default admin password immediately
2. Use a strong random `JWT_SECRET` (32+ chars)
3. Enable `DB_SSL=true` in production
4. Use a read-only database user for bot knowledge connections
5. The uploaded PDFs are stored in `backend/uploads/` — ensure this is not publicly accessible
6. Rate limiting is enabled on all routes by default

---

## 💳 Payment Setup (Razorpay)

1. Sign up at https://razorpay.com (free)
2. Go to Settings → API Keys → Generate Test Key
3. Copy Key ID and Key Secret to both backend and frontend `.env`
4. For live payments, switch to Live mode and update keys


## 🧩 Tech Stack Details

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (standard — no ORM) |
| AI | Google Gemini 1.5 Flash |
| Auth | JWT + bcrypt |
| Email | Nodemailer (SMTP) |
| Payments | Razorpay |
| Charts | Recharts |
| File parsing | pdf-parse |
| Web scraping | Cheerio + Axios |


Built with ❤️ — INTRA AI
