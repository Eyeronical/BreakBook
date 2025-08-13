# 📅 BreakBook — Leave Management System

A **full-stack Leave Management System** built with:
- **Backend**: Node.js, Express, Prisma ORM, SQLite/PostgreSQL
- **Frontend**: React, Vite, Bootstrap
- **Deployment**: Backend on Render, Frontend on Vercel

It allows **HR/Admin** to:
- Add, edit, and delete **employees**.
- Apply, approve, and reject **leave requests**.
- Track **leave balances** per employee with accrual rules.

---

## 🚀 Features

### Employee Management
- Add new employees with name, email, department, joining date.
- Edit/update existing employee details.
- Delete employees.

### Leave Management
- Apply for leave with date range and reason.
- Approve or reject requests.
- Prevent overlapping or invalid leave dates.
- Check real-time leave balances.

### Balance & Validation
- Monthly prorated leave accrual (annual quota = 18 days).
- Prevents applying before joining date.
- Excludes weekends from leave days.
- Shows accrued, approved, pending, and available balances.

---

## 🛠 Tech Stack

**Backend**
- Node.js + Express
- Prisma ORM
- SQLite (local) / PostgreSQL (production)
- CORS + dotenv

**Frontend**
- React 18
- Vite
- Axios
- Bootstrap 5
- React Router DOM

**Deployment**
- Backend → Render
- Frontend → Vercel

---

## 📂 Folder Structure

