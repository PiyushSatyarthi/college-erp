# College Student Attendance & Marks Management

A full-stack college management application for tracking student attendance, marks, academic workflows, and role-based dashboards.

## Project Overview

This project contains a React/Vite frontend and an Express/TypeScript backend. It is designed for college users such as admins, HODs, faculty, students, and parents.

Main features include:

- Role-based dashboards for admin, HOD, faculty, student, and parent users
- Attendance tracking and attendance analytics
- Marks entry, marks viewing, and result-related pages
- Student timetable, hall ticket, notifications, and condonation workflows
- Faculty session management and class analytics
- Admin management screens for students, faculty, departments, courses, subjects, grading, reports, and notifications
- AI assistant related pages and Gemini API configuration support

## Repository Structure

```text
.
+-- Backend/     # Express + TypeScript backend API
`-- Frontend/    # React + Vite frontend application
```

## Tech Stack

Frontend:

- React 19
- Vite
- TypeScript
- React Router
- Zustand
- Recharts
- Lucide React
- Tailwind CSS

Backend:

- Node.js
- Express
- TypeScript
- MySQL
- Zod
- Helmet, CORS, Morgan

## Prerequisites

- Node.js
- npm
- MySQL server
- Git

## Backend Setup

```powershell
cd Backend
npm install
Copy-Item .env.example .env
npm run dev
```

Update `Backend/.env` with your local database and security settings:

```text
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=university_attendance
JWT_SECRET=change-me-before-production
```

Default backend URL:

```text
http://localhost:4000
```

Health check:

```text
GET /health
```

## Frontend Setup

```powershell
cd Frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Default frontend URL:

```text
http://localhost:3000
```

If AI features are used, configure the Gemini API key in `Frontend/.env`.

## Available Scripts

Backend:

```powershell
npm run dev
npm run build
npm run start
npm run lint
```

Frontend:

```powershell
npm run dev
npm run build
npm run preview
npm run lint
```

## Git Notes

The repository intentionally ignores local-only and generated files such as:

- `node_modules/`
- `dist/`
- `build/`
- `.env`
- log files

Use the committed `.env.example` files as templates for local configuration. Do not commit real passwords, database credentials, API keys, or production secrets.

## Deployment

Build the frontend and backend separately:

```powershell
cd Frontend
npm run build
```

```powershell
cd Backend
npm run build
```

Configure production environment variables on your hosting provider before starting the backend service.
