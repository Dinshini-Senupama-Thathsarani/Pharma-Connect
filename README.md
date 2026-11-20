# 💊 PharmaConnect

Pharmaceutical Distribution & Medical Representative Management System. A pharmaceutical company (admin) manages its medicine catalog, assigns Medical Representatives (MRs) to pharmacies, and approves/delivers orders placed by pharmacies or MRs.

**Final coursework: ITS2020 Rapid Application Development (MERN + TypeScript)**

## Live URLs
- Frontend: _add Vercel URL_
- Backend API: _add Render URL_

## Tech stack
| Layer | Tools |
|---|---|
| Frontend | React 19, TypeScript, Redux Toolkit, React Router, TailwindCSS, Axios, Recharts |
| Backend | Node.js, Express, TypeScript, Mongoose, Zod validation |
| Security | JWT access + refresh tokens (rotation), bcryptjs, role-based authorization, .env secrets |
| Database | MongoDB Atlas |
| Advanced feature | Analytics dashboard (aggregation pipelines) + Monthly Sales **PDF report** (pdfkit) |

## Roles
| Role | Can do |
|---|---|
| Admin | CRUD medicines & pharmacies, assign MRs, approve/reject/deliver orders, dashboard, PDF report |
| MR | Register pharmacies under themselves, place orders for their pharmacies, see own stats |
| Pharmacy | Create own pharmacy profile, place orders, track status |

## Main features
- Register / login, JWT access token (15 min) + refresh token rotation, automatic silent refresh on the client
- Medicine catalog with search, stock, batch no. and expiry tracking (low stock / expiring highlighted)
- Pharmacy management, scoped by role
- Orders: place, approve (atomic stock deduction), reject, deliver; status state machine
- Dashboard: totals, monthly sales chart, top medicines, low-stock / near-expiry counts (admin)
- Monthly Sales PDF report (admin)

## Data model
`User` ←(owner / assignedMR)— `Pharmacy` ←— `Order` —(items)→ `Medicine`

## API summary
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register, /login, /refresh | public |
| POST | /api/auth/logout · GET /api/auth/me | logged in |
| GET | /api/users?role=mr | admin |
| GET/POST/PUT/DELETE | /api/medicines | read: all, write: admin |
| GET/POST/PUT/DELETE | /api/pharmacies | scoped by role, delete: admin |
| GET/POST | /api/orders | scoped; POST: mr, pharmacy |
| PATCH | /api/orders/:id/status | admin |
| GET | /api/dashboard/stats | logged in |
| GET | /api/reports/monthly-sales?month=YYYY-MM | admin |

All responses use `{ success, message?, data? }` with proper HTTP status codes.

## Setup

### 1. Backend
```bash
cd server
npm install
cp .env.example .env      # fill MONGO_URI and two long random secrets
npm run seed              # idempotently adds demo users, medicines, pharmacies, and orders
npm run dev               # http://localhost:5000
```
Newly created demo users share the password `Demo@123`; change it after signing in. The seed does not overwrite existing records or passwords. If the admin account was created by an older version of the seed, its original password remains `Admin@123` because rerunning the seed does not reset existing passwords.

### 2. Frontend
```bash
cd client
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm run dev               # http://localhost:5173
```

## Deployment
1. **MongoDB Atlas**: create free cluster, add DB user, allow network access (0.0.0.0/0 for Render), copy connection string.
2. **Backend on Render**: Web Service, root dir `server`, build `npm install && npm run build`, start `npm start`. Env vars: `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL` (your Vercel URL). Then run the seed once (Render shell, or locally with the Atlas URI).
3. **Frontend on Vercel**: root dir `client`, framework Vite, env var `VITE_API_URL=https://<your-render-app>.onrender.com/api`.

## Screenshots
_Add screenshots: login, dashboard, medicines, orders, PDF report_

## Folder structure
```
server/src  config/ models/ controllers/ routes/ middleware/ utils/ app.ts server.ts seed.ts
client/src  app/ features/(auth|medicines|pharmacies|orders) components/ pages/ services/ types/
```
