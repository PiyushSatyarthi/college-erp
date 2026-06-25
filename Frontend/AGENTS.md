# AGENT.md

Build the backend for the existing React/Vite college Attendance & Marks Management frontend.

## Context
The frontend is a role-based app for Admin, HOD, Faculty, Student, Parent, and Public users. It currently uses mock/local React state for most data and has no real authentication or API integration.

## Backend Goal
Create a production-ready backend API that supports:
- role-based authentication and authorization
- student, faculty, department, course, subject, and parent management
- timetable and class session management
- attendance marking, summaries, and low-attendance tracking
- marks entry, draft/publish workflow, and student/parent results
- condonation applications and approvals
- notifications, reports, audit logs, and dashboard analytics

## Preferred Stack
Use Node.js, Express, TypeScript, and a relational database with a clear schema. Keep the API modular, validated, secure, and easy for the existing frontend to consume.

## Implementation Style
Follow the frontend domain model and routes already present in `src/pages`. Replace mock frontend data with REST API endpoints gradually, starting with auth, students, faculty, courses, subjects, attendance sessions, and marks.

## Quality Bar
Include environment config, database migrations/seed data, request validation, centralized errors, auth middleware, role permissions, and basic API tests. Avoid unnecessary rewrites of the frontend unless required for API integration.
