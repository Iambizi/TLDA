# Technical Architecture

## 1. Recommended Technical Stack
**Stack**
- Frontend: Next.js
- Language: TypeScript
- Styling: Tailwind CSS
- Backend / DB / Auth: Supabase
- Forms / validation: React Hook Form + Zod
- Hosting: Vercel
- Email: optional later via Resend or Supabase functions — can be stubbed/manual in v1

**Why this stack**
This stack is fast for AI-assisted implementation and well suited to admin dashboards, CRUD workflows, public forms, authenticated organizer-only areas, and relational data with simple dashboards.
It is also intentionally chosen for long-term continuity. Supabase is frontend-agnostic — the same database will serve future frontends, including a participant-facing web app or a React Native / native iOS app. The Next.js MVP is the first frontend, not the only one.

## 2. Auth Model
Organizer-only auth. No participant login.

## 3. Communication Assumptions
Participant confirmation on-screen only. Email automation optional/later.
