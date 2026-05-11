import Link from 'next/link'

export default function OrganizerGuidePage() {
  return (
    <div className="max-w-4xl pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight" style={{ color: 'var(--neutral-900)' }}>
          Organizer Guide
        </h1>
        <p className="mt-2 text-base" style={{ color: 'var(--muted)' }}>
          A quick reference manual for managing the Group Date platform lifecycle.
        </p>
      </div>

      <div className="space-y-8">
        {/* Section 1: Application Intake */}
        <section className="rounded-2xl border p-8 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold bg-neutral-100 text-neutral-800">1</span>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--neutral-900)' }}>The Application Intake</h2>
          </div>
          <div className="space-y-4" style={{ color: 'var(--neutral-700)' }}>
            <p>
              Everything starts with the <Link href="/settings/questionnaire" className="font-semibold text-neutral-900 hover:underline decoration-brand-500 underline-offset-4">Questionnaire Builder</Link>. Before you announce a new event or start driving traffic to the website, ensure your application form is ready.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>Navigate to <Link href="/settings/questionnaire" className="font-semibold text-neutral-900 hover:underline decoration-brand-500 underline-offset-4">Questionnaire</Link> to manage your application schemas.</li>
              <li>You can create multiple <strong>Drafts</strong> for future events without breaking the live site.</li>
              <li>When you are ready to accept new applicants, select your desired draft and click <strong>"Set as Live"</strong>. This instantly updates the public <code>/apply</code> page.</li>
            </ul>
            <p className="text-sm mt-4 italic" style={{ color: 'var(--muted)' }}>
              Note: Once an applicant submits a form, they will appear in your <Link href="/participants" className="font-semibold text-neutral-900 hover:underline decoration-brand-500 underline-offset-4">Participants</Link> tab.
            </p>
          </div>
        </section>

        {/* Section 2: Creating Events */}
        <section className="rounded-2xl border p-8 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold bg-neutral-100 text-neutral-800">2</span>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--neutral-900)' }}>Event Setup & Logistics</h2>
          </div>
          <div className="space-y-4" style={{ color: 'var(--neutral-700)' }}>
            <p>
              Once you have a pool of interested applicants, you can set up a new Event to group them together.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>Navigate to <Link href="/events" className="font-semibold text-neutral-900 hover:underline decoration-brand-500 underline-offset-4">Events</Link> and click <strong>Create Event</strong>.</li>
              <li>Assign a date, time, and location.</li>
              <li>Under the <strong>Event Roster</strong> section of your new event, select the specific participants from your database that you want to invite to this event.</li>
            </ul>
            <div className="mt-4 p-4 rounded-xl border border-blue-100 bg-blue-50 text-blue-800 text-sm">
              <strong>Tip:</strong> Participant profiles will show an "Attendance" status for each event they are assigned to, allowing you to track RSVPs directly within the event dashboard.
            </div>
          </div>
        </section>

        {/* Section 3: Logging Matches */}
        <section className="rounded-2xl border p-8 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold bg-neutral-100 text-neutral-800">3</span>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--neutral-900)' }}>Match Tracking (CRM)</h2>
          </div>
          <div className="space-y-4" style={{ color: 'var(--neutral-700)' }}>
            <p>
              The core goal of the platform is tracking long-term successful matches. Matches are <em>event-specific</em>.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>Go to an event's page and click <strong>Manage Matches</strong>.</li>
              <li>Select <em>Participant A</em> and <em>Participant B</em> from the event's roster.</li>
              <li>Assign a relationship status (e.g., <span className="px-2 py-0.5 rounded bg-neutral-200 text-xs font-semibold">Exchanged Contacts</span> or <span className="px-2 py-0.5 rounded bg-neutral-200 text-xs font-semibold">Dating</span>).</li>
              <li>You can set a <strong>Follow-up Date</strong> to remind yourself to check in with them via email/SMS later.</li>
            </ul>
            <p className="text-sm mt-4">
              You can view a global overview of <em>all</em> historical matches across all events by clicking the <Link href="/matches" className="font-semibold text-neutral-900 hover:underline decoration-brand-500 underline-offset-4">Matches</Link> tab in the main sidebar.
            </p>
          </div>
        </section>

        {/* Section 4: Finances */}
        <section className="rounded-2xl border p-8 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold bg-neutral-100 text-neutral-800">4</span>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--neutral-900)' }}>Operations & Finances</h2>
          </div>
          <div className="space-y-4" style={{ color: 'var(--neutral-700)' }}>
            <p>
              Keep track of your event profitability directly within the platform.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>Every event page has a dedicated <strong>Operations</strong> panel.</li>
              <li>You can log ad-hoc <strong>Expenses</strong> (e.g., "Venue Rental", "Catering").</li>
              <li>You can log <strong>Participant Payments</strong> (e.g., ticket fees) for anyone assigned to the roster.</li>
              <li>You can log generic <strong>Other Income</strong> (e.g., "Sponsorship", "Bar Split") that isn't tied to a specific attendee.</li>
              <li>The global <Link href="/operations" className="font-semibold text-neutral-900 hover:underline decoration-brand-500 underline-offset-4">Operations</Link> tab in the sidebar aggregates all expenses and revenues across all events to show you your total Net Profit over time.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
