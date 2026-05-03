import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { updateParticipantProfile } from '@/app/actions/participants'
import { LIFESTYLE_ATTRIBUTES, READINESS_LABELS } from '@/lib/constants'
import type { LifestylePreference, ReadinessForLove } from '@/types'

export const metadata: Metadata = { title: 'Edit Participant' }

interface EditParticipantPageProps {
  params: Promise<{ id: string }>
}

const lifestyleOptions: LifestylePreference[] = ['want', 'dont_want', 'flexible']

function TextField({
  name,
  label,
  defaultValue,
  required = false,
  type = 'text',
}: {
  name: string
  label: string
  defaultValue?: string | number | null
  required?: boolean
  type?: string
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>
        {label}{required && <span style={{ color: 'var(--accent)' }}> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ''}
        className="form-input"
      />
    </label>
  )
}

function TextAreaField({
  name,
  label,
  defaultValue,
  rows = 3,
}: {
  name: string
  label: string
  defaultValue?: string | null
  rows?: number
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ''}
        className="form-input resize-y"
      />
    </label>
  )
}

export default async function EditParticipantPage({ params }: EditParticipantPageProps) {
  const { id } = await params
  const supabase = await createClient() as any

  const { data: participant } = await supabase
    .from('participants')
    .select('*')
    .eq('id', id)
    .single()

  if (!participant) {
    notFound()
  }

  const action = updateParticipantProfile.bind(null, id)
  const priorityWeights = (participant.priority_weights || {}) as Record<string, number>

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href={`/participants/${id}`} className="text-sm font-medium hover:underline" style={{ color: 'var(--neutral-500)' }}>
          ← Back to profile
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold" style={{ color: 'var(--neutral-900)' }}>
          Edit Participant Profile
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          Update basic info and questionnaire answers after intake.
        </p>
      </div>

      <form action={action} className="rounded-2xl border p-8 shadow-sm flex flex-col gap-8" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <section>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--neutral-900)' }}>Basic Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextField name="full_name" label="Full name" defaultValue={participant.full_name} required />
            <TextField name="contact_info" label="Contact info" defaultValue={participant.contact_info} required />
            <TextField name="gender" label="Gender" defaultValue={participant.gender} required />
            <TextField name="birthday" label="Birthday" type="date" defaultValue={participant.birthday} required />
            <TextField name="age" label="Age" type="number" defaultValue={participant.age} required />
            <TextField name="work" label="Work" defaultValue={participant.work} required />
          </div>
          <div className="mt-5 rounded-xl border p-4 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'var(--neutral-50)' }}>
            Photo upload is reserved for the v3 storage migration. A participant photo field is shown in intake and on the profile so the workflow is ready.
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--neutral-900)' }}>About You</h2>
          <div className="grid grid-cols-1 gap-5">
            <TextField name="dream_city" label="Dream city" defaultValue={participant.dream_city} />
            <TextAreaField name="ask_out_preference" label="Ask out preference" defaultValue={participant.ask_out_preference} />
            <TextAreaField name="life_in_5_years" label="Life in 5 years" defaultValue={participant.life_in_5_years} />
            <TextAreaField name="last_thing_that_made_you_laugh" label="Last thing that made you laugh" defaultValue={participant.last_thing_that_made_you_laugh} />
            <TextAreaField name="dream_date" label="Dream date" defaultValue={participant.dream_date} />
            <TextAreaField name="family_notes" label="Family notes" defaultValue={participant.family_notes} />
            <TextField name="vice_or_red_flag" label="Vice or loveable red flag" defaultValue={participant.vice_or_red_flag} />
            <TextField name="dealbreaker" label="Dealbreaker" defaultValue={participant.dealbreaker} />
            <TextAreaField name="random_curiosities" label="Random curiosities" defaultValue={participant.random_curiosities} />
            <TextField name="referral_notes" label="Referral notes" defaultValue={participant.referral_notes} />
            <TextAreaField name="values_or_worldview" label="Values & Worldview" defaultValue={participant.values_or_worldview} />
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--neutral-700)' }}>
              <input name="comfortable_with_man_asking_woman" type="checkbox" defaultChecked={participant.comfortable_with_man_asking_woman} />
              Comfortable with a man asking a woman out first
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--neutral-700)' }}>
              <input name="comfortable_with_alcohol_meetcute" type="checkbox" defaultChecked={participant.comfortable_with_alcohol_meetcute} />
              Comfortable with an alcohol meet-cute
            </label>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--neutral-900)' }}>Ideal Partner</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <TextField name="priority_pedigree" label="Background %" type="number" defaultValue={priorityWeights.pedigree ?? 40} required />
            <TextField name="priority_looks" label="Looks %" type="number" defaultValue={priorityWeights.looks ?? 30} required />
            <TextField name="priority_personality" label="Personality %" type="number" defaultValue={priorityWeights.personality ?? 30} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>Ready for love</span>
              <select name="ready_for_love" defaultValue={participant.ready_for_love ?? 'not_sure'} className="form-input">
                {(Object.keys(READINESS_LABELS) as ReadinessForLove[]).map((key) => (
                  <option key={key} value={key}>{READINESS_LABELS[key]}</option>
                ))}
              </select>
            </label>
            <TextField name="grand_amour" label="Dream relationship" defaultValue={participant.grand_amour} />
            <TextField name="preferred_partner_age_min" label="Preferred min age" type="number" defaultValue={participant.preferred_partner_age_min ?? 18} />
            <TextField name="preferred_partner_age_max" label="Preferred max age" type="number" defaultValue={participant.preferred_partner_age_max ?? 99} />
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm" style={{ color: 'var(--neutral-700)' }}>
            <input name="okay_with_some_deviation" type="checkbox" defaultChecked={participant.okay_with_some_deviation} />
            Okay with some age flexibility
          </label>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {LIFESTYLE_ATTRIBUTES.flatMap((attr) => [
              { name: attr.self, label: `${attr.label} - applicant` },
              { name: attr.partner, label: `${attr.label} - partner preference` },
            ]).map((field) => (
              <label key={field.name} className="flex flex-col gap-1.5">
                <span className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>{field.label}</span>
                <select name={field.name} defaultValue={participant[field.name] ?? 'flexible'} className="form-input">
                  {lifestyleOptions.map((option) => (
                    <option key={option} value={option}>{option.replace('_', ' ')}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </section>

        <div className="flex justify-end gap-3 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
          <Link href={`/participants/${id}`} className="rounded-xl border px-5 py-2.5 text-sm font-medium" style={{ borderColor: 'var(--border)', color: 'var(--neutral-600)' }}>
            Cancel
          </Link>
          <button type="submit" className="rounded-xl px-5 py-2.5 text-sm font-medium text-white" style={{ background: 'var(--accent)' }}>
            Save Profile
          </button>
        </div>
      </form>
    </div>
  )
}
