# Full‑stack Leave Management System

## Overview
A **Full‑stack Leave Management System** for HR/Admin to manage employees, leave requests, and leave balances.

**Tech Stack**
- **Backend**: Node.js, Express, Prisma, SQLite (dev) / Postgres (prod)
- **Frontend**: React, Vite, Axios, Bootstrap
- **Deployment**: Render (API), Vercel (Frontend)

**Goals**
- Correct validations
- Simple and intuitive UX
- Accurate leave balance tracking

---

## Features

### Employee Management
- Add, edit, delete employees
- Unique email enforcement
- Safe delete with dependent leave cleanup

### Leave Management
- Apply for leave (date range + reason)
- Approve and reject requests
- Prevent invalid or overlapping requests

### Balance Management
- **Default leave days per employee**: 7 (editable)
- Tracks **accrued**, **approved**, **pending**, and **available** leave

---

## Edge Cases & Handling

- **Applying before joining date** → Reject with clear message  
- **Invalid dates** (missing, unparsable, `end < start`) → Reject  
- **Zero/non‑working ranges** (weekend-only) → Exclude weekends; reject if 0 days  
- **Exceeding available balance** → `available = initialLeaveDays - approved - pending`; reject if exceeded  
- **Overlapping requests** → Block if overlapping with any `PENDING` or `APPROVED` request  
- **Employee not found** → Respond with **404**  
- **Duplicate names** → In dropdown: `Name (Email)` or `Name — ID`  
- **Delete employees with leaves** → Transactionally delete leaves, then employee  
- **SPA refresh 404 on Vercel** → Rewrite all routes to `index.html`  
- **Multiple SQLite files** → Standardized `DATABASE_URL = file:./dev.db`, removed duplicates, and re‑migrated

---

## Data Model (High Level)

**Employee**
- id
- name
- email *(unique)*
- department?
- joiningDate
- status
- initialLeaveDays *(default: 7)*
- timestamps

**LeaveRequest**
- id
- employeeId *(FK)*
- startDate
- endDate
- daysRequested
- status: `PENDING | APPROVED | REJECTED`
- approverId?
- approverRemarks?
- reason?
- timestamps

**Balance Formula**
```
approved_sum = sum of approved leave days
pending_sum = sum of pending leave days
available = max(initialLeaveDays - approved_sum - pending_sum, 0)
```

---

## Architecture Overview
1. **Frontend** (React SPA) → **Backend** (Express REST API) → **Database** (Prisma ORM)
2. **Hosting**:
   - **Vercel**: SPA (with rewrite rule)
   - **Render**: API
   - **SQLite (dev)** / **Postgres (prod)**
3. **Additional**:
   - Centralized error handling
   - JSON API responses

---

## API Summary

### Employees
- `GET /employees`  
- `POST /employees` `{ name, email, department?, joiningDate }`  
- `PUT /employees/:id`  
- `DELETE /employees/:id`  
- `GET /employees/:id/leave-balance`  
- `PATCH /employees/:id/leave-balance` `{ balance }`

### Leaves
- `GET /leaves`  
- `POST /leaves` `{ employeeId, startDate, endDate, reason? }`  
- `POST /leaves/:id/approve` `{ approverId?, remarks? }`  
- `POST /leaves/:id/reject` `{ approverId?, remarks? }`  

**Errors**: JSON  
```
{ "message": "Error description" }
```
With appropriate HTTP status codes.

---

## Setup

### Backend
```
# .env example
DATABASE_URL="file:./dev.db"
PORT=5000
CORS_ORIGIN=http://localhost:3000

npm install
npx prisma generate
npx prisma migrate dev
npm run dev

# Production
prisma migrate deploy
npm start
```

### Frontend
```
# .env.local
VITE_API_URL=http://localhost:5000

npm install
npm run dev
```

**Vercel Deployment Notes**:
- Set project root to `frontend`
- Output build to `dist`
- Add `vercel.json` rewrite to `index.html`

---

## Quick Verification (Sample cURL)
1. **Create employee**
2. **Fetch balance**
3. **Apply leave**
4. **Approve leave**
5. **Adjust balance**

---

## Scaling Plan (50 → 500 Employees)

### Database
- Migrate to Postgres
- Add indexes (`employeeId`, `status`, `startDate`, `endDate`)
- Implement pagination/cursors
- Run migrations on deploy

### Backend
- Stateless API
- Horizontal scaling
- Rate limiting
- Input validation
- Health/readiness probes

### Performance
- Short‑TTL caching for lists
- Optional leave balance cache with invalidation
- Monitor slow queries

### Frontend
- Client‑side pagination & search
- Code splitting
- Debounced inputs

---

## Assumptions
- Single leave type
- Weekends excluded from leave day counts
- `initialLeaveDays` defaults to `7`
- Overlapping `PENDING`/`APPROVED` requests blocked
- Email is unique
- Auth & holiday calendars are **not** in MVP

---

## Potential Improvements
**Policies**: accruals (monthly/annual), carry‑forward, multiple leave types, holidays, half‑days  
**Product**: roles/permissions, approval chains, notifications, calendar view, CSV exports, analytics  
**Tech**: Redis cache, background jobs, Swagger/OpenAPI docs, comprehensive testing  
**UX**: improved empty/loading states, accessibility, keyboard navigation, search/autocomplete, pagination

---

## Suggested Repo Structure
```
frontend/
  src/pages/
    Employees.jsx
    Leaves.jsx
    Balance.jsx
  api.js
  vercel.json

backend/
  src/
    routes/
    controllers/
    services/
    utils/
  prisma/
    schema.prisma
    migrations/
  .env
```

