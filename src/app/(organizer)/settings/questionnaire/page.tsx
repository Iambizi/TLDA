import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Questionnaire Builder' }

const sections = [
  {
    title: 'Basic Info',
    description: 'Permanent required identity and contact fields.',
    required: 'All fields required',
    questions: ['Full name', 'Best way to reach you', 'Gender', 'Birthday', 'Age', 'Work'],
  },
  {
    title: 'About You',
    description: 'Optional prompts Liela can tune between events.',
    required: 'All fields optional',
    questions: ['Dream city', 'Ask-out preference', 'Life in 5 years', 'Dream date', 'Dealbreaker', 'Values & Worldview'],
  },
  {
    title: 'Ideal Partner',
    description: 'Partner preference prompts, with Venn weights kept required.',
    required: 'Priority weights required',
    questions: ['Priority weights', 'Ready for love', 'Preferred partner age range', 'Lifestyle preferences'],
  },
]

export default function QuestionnaireBuilderPage() {
  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--neutral-900)' }}>
            Questionnaire Builder
          </h1>
          <span
            title="The three-section structure is permanent. The v3 database migration will make individual questions editable."
            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold"
            style={{ background: 'var(--neutral-200)', color: 'var(--neutral-600)' }}
          >
            i
          </span>
        </div>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          Review the questionnaire currently live on `/apply`, then manage future question sets after the v3 schema migration.
        </p>
      </div>

      <section className="mb-8 rounded-2xl border p-6 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider" style={{ background: '#ecfdf5', color: '#047857' }}>
                Live on /apply
              </span>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                Current hardcoded v3 intake
              </span>
            </div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--neutral-900)' }}>
              Current Live Questionnaire
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
              This is the exact section order applicants and organizers see in the intake flow today.
            </p>
          </div>
          <Link
            href="/apply"
            className="rounded-xl px-4 py-2 text-sm font-medium text-white"
            style={{ background: 'var(--neutral-900)' }}
          >
            Preview /apply
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {sections.map((section, index) => (
            <div key={section.title} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--neutral-50)' }}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold" style={{ background: 'var(--accent)', color: 'white' }}>
                    {index + 1}
                  </span>
                  <h3 className="font-semibold" style={{ color: 'var(--neutral-900)' }}>{section.title}</h3>
                </div>
              </div>
              <p className="mb-3 text-xs font-medium" style={{ color: 'var(--accent)' }}>{section.required}</p>
              <ul className="space-y-1.5">
                {section.questions.map((question) => (
                  <li key={question} className="text-sm" style={{ color: 'var(--neutral-700)' }}>
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--neutral-900)' }}>
            Future Editable Builder
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
            These controls are disabled until questionnaire persistence exists.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {sections.map((section) => (
          <section key={section.title} className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--neutral-900)' }}>{section.title}</h2>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{section.description}</p>
              </div>
              <button
                type="button"
                disabled
                className="rounded-xl border px-4 py-2 text-sm font-medium opacity-60"
                style={{ borderColor: 'var(--border)', color: 'var(--neutral-600)' }}
              >
                Add Question
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {section.questions.map((question, index) => (
                <div key={question} className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: 'var(--border)', background: 'var(--neutral-50)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs tabular-nums" style={{ color: 'var(--muted)' }}>{index + 1}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--neutral-800)' }}>{question}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" disabled className="text-xs opacity-50" style={{ color: 'var(--neutral-600)' }}>Edit</button>
                    <button type="button" disabled className="text-xs opacity-50" style={{ color: 'var(--neutral-600)' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-6 rounded-xl border p-4 text-sm" style={{ borderColor: 'var(--border)', background: 'var(--neutral-50)', color: 'var(--muted)' }}>
        This page establishes the v3 workflow and permanent section grouping. Database-backed drag/drop editing will be wired to `questionnaires` and `participants.dynamic_answers` after the v3 schema migration lands.
      </div>
    </div>
  )
}
