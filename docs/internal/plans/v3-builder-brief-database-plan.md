# v3 Builder Brief — Database & Schema Plan

This document outlines the database-layer changes required to support the new features requested in the 05-03-26 debrief. These changes are separated from the frontend workflow updates to allow independent development.

## 1. Supabase SQL Migrations

### `supabase/migrations/002_v3_updates.sql`

#### Questionnaire Builder
- **Action:** Create a `questionnaires` table to store the dynamic form schema.
- **Action:** Add a `dynamic_answers` (JSONB) column to the `participants` table to securely store responses without hardcoded columns.

#### Draft Mode
- **Action:** Add an `is_draft` (boolean, default false) column to `participants`.

#### Photo Uploads
- **Action:** Add `photo_url` (text) to `participants`.
- **Action:** Add `photo_url` (text) to `events`.

#### Matches Redesign
- **Action:** Create a new enum type `match_connection_status` with values: `'connected', 'exchanged_contacts', 'went_on_date', 'in_relationship', 'no_follow_up'`.
- **Action:** Add `follow_up_date` (timestamptz) to the `match_outcomes` table.
- **Action:** Update `match_outcomes` to support the new connection status.

#### Operations & Financials
- **Action:** Create an `event_expenses` table (id, event_id, description, amount, created_at).
- **Action:** Add `payment_amount` (numeric) to the `event_participants` join table to track collected amounts.

### 2. Supabase Storage
- **Action:** Create public/private buckets for `participant_photos`.
- **Action:** Create public/private buckets for `event_photos`.

---

## Open Database Questions
1. **Existing Data Migration:** Will we drop/reset the database, or do we need scripts to migrate existing hardcoded participant answers into the new JSONB `dynamic_answers` column?
2. **Dynamic Structure:** Do we strictly use a JSONB blob for `dynamic_answers`, or is a dedicated `participant_answers` table with foreign keys to a `questions` table preferred?
