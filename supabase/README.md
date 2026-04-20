# Supabase Migration

## How to apply `001_initial_schema.sql`

### Option A — Supabase Dashboard (recommended for MVP)
1. Go to your [Supabase project](https://app.supabase.com)
2. Open **SQL Editor** in the left sidebar
3. Paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run**

### Option B — Supabase CLI
```bash
# Install CLI if needed
brew install supabase/tap/supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migration
supabase db push
```

## Environment Setup
Copy `.env.local.example` to `.env.local` and fill in your credentials:
```bash
cp .env.local.example .env.local
```

Find your values in the Supabase dashboard under **Settings → API**:
- `NEXT_PUBLIC_SUPABASE_URL` → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon / public key

## What the migration creates

| Table | Purpose |
|---|---|
| `participants` | Core person record — basic info, about self, partner prefs |
| `applications` | Intake record per participant — status, notes, interview tracking |
| `events` | Event records — title, date, location, status |
| `event_participants` | Join table — who is assigned to which event, attendance status |
| `interviews` | Interview scheduling and outcome tracking |
| `match_outcomes` | Post-event organizer-recorded match signals |

### Key schema decisions
- `priority_weights` stored as **JSONB** — flexible, no migration needed to rename categories
- Lifestyle attributes stored as **paired columns** (`has_X` / `partner_X`) — readable compatibility view
- `values_or_worldview` marked as **sensitive** — organizer-only field, never expose to participants
- Public RLS policies allow anonymous `INSERT` on `participants` + `applications` (the apply form)
- All other operations require authenticated organizer session
