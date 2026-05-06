# v3 Builder Brief — Frontend & Workflow Plan

This document outlines the UI, UX, and workflow changes required to implement the feedback from the 05-03-26 debrief. Database and schema changes are tracked separately.

## 1. Onboarding / Intake Form (`/apply`)

### Section Order & Requirements
- **Action:** Swap section order to: Basic Info (1) → About You (2) → Ideal Partner (3).
- **Action:** Enforce strict validation on Basic Info (all required).
- **Action:** Remove required validation from About You (all optional).
- **Action:** Remove required validation from Ideal Partner (except Venn diagram).
- **Action:** Add manual number inputs alongside the Venn diagram sliders.

### Draft Mode & Photos
- **Action:** Add a "Save as Draft" button that bypasses strict validation and saves the current state.
- **Action:** Add a photo upload component to the intake form.
- **Action:** Remove all interview scheduling logic from the onboarding flow completely.

## 2. Participant Profiles (`/participants/[id]`)
- **Action:** Implement an "Edit Profile" capability to modify basic info and answers.
- **Action:** Render the uploaded participant photo.
- **Action:** Add an editable "Organizer Notes" text area for post-event observations.

## 3. Questionnaire Builder Backend (`/settings/questionnaire`)
- **Action:** Build a drag-and-drop or list interface for the organizer to add, edit, and delete questions.
- **Action:** Group questions strictly into the permanent 3-section structure.
- **Action:** Wire this UI to dynamically feed the `/apply` route.

## 4. Matching Redesign (`/events/[id]/matches` & `/matches`)
- **Action:** Replace the current interview-heavy matching UI inside events with a "Preliminary Matching" drag-and-drop/selection interface.
- **Action:** Create a standalone global `/matches` page.
- **Action:** Implement the new status dropdown (Connected, Exchanged Contacts, Went on a Date, In a Relationship, No Follow-Up).
- **Action:** Add a follow-up date picker and Organizer Notes field to the Match card component.

## 5. Events & Operations (`/events` & `/operations`)
- **Action:** Remove UI/logic constraints blocking multi-event assignments.
- **Action:** Add an Edit Event form (modifying date, location, notes, and photo).
- **Action:** Create a new Operations tracking component inside the Event Detail page to log line-item costs and participant payments.
- **Action:** Create a standalone `/operations` global dashboard aggregating costs, revenue, and net profits across all events.

## 6. Dashboard Metrics (`/dashboard`)
- **Action:** Replace current dashboard metrics with: Total Matches Made, Contacts Exchanged, and Revenue vs. Cost (Global Net).

## 7. In-App Documentation
- **Action:** Implement lightweight contextual tooltips (e.g., info icons) next to complex workflows like Preliminary Matching and the Questionnaire Builder.

---

## Open Workflow Questions
1. **Draft Mode Minimums:** When an organizer clicks "Save as Draft", what is the absolute minimum info required (e.g., just the Full Name)?
2. **Match Statuses:** Do the new statuses ("Connected", etc.) completely replace the old interest statuses ("mutual_interest", etc.), or do they live alongside them as tracking steps?
3. **Documentation:** Are subtle info-icon tooltips sufficient, or is an interactive guided tour overlay preferred?
