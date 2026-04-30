# Drone based Nutrient and Water stress mapping using multispectral imaging

A production-ready precision agriculture platform for monitoring crop health using multispectral data. The system stores field records in PostgreSQL, computes water and nutrient stress through backend APIs, and presents responsive visual analytics through a React dashboard.

## Tech stack
- Frontend: React + Vite + Tailwind CSS + Recharts
- Backend: Node.js + Express
- Database: Supabase PostgreSQL
- ORM: Prisma

## Features
- Responsive dashboard
- Real cloud database
- Upload field records
- Stress detection engine
- Analytics summary
- Record management
- Seed data support

## Setup

### 1) Create Supabase database
Create a Supabase project and copy the PostgreSQL connection string into `server/.env` as `DATABASE_URL`.

### 2) Start backend
```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

### 3) Start frontend
```bash
cd client
npm install
npm run dev
```

## Production deployment
- Frontend: Vercel / Netlify
- Backend: Render / Railway
- Database: Supabase PostgreSQL

## Default local ports
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
