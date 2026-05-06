'use client'

import { notFound, useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../../../convex/_generated/api'
import type { Id } from '../../../../../../convex/_generated/dataModel'
import { LIFESTYLE_ATTRIBUTES, READINESS_LABELS } from '@/lib/constants'
import type { LifestylePreference, ReadinessForLove } from '@/types'
import { useState, type FormEvent } from 'react'

const lifestyleOptions: LifestylePreference[] = ['want', 'dont_want', 'flexible']

function TextField({ name, label, defaultValue, required = false, type = 'text' }: {
  name: string; label: string; defaultValue?: string | number | null; required?: boolean; type?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>
        {label}{required && ' *'}
      </label>
      <input id={name} name={name} type={type} defaultValue={defaultValue ?? ''} required={required} className="form-input" />
    </div>
  )
}

function TextAreaField({ name, label, defaultValue }: {
  name: string; label: string; defaultValue?: string | null
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>{label}</label>
      <textarea id={name} name={name} rows={2} defaultValue={defaultValue ?? ''} className="form-input resize-none" />
    </div>
  )
}

export default function EditParticipantPage() {
  const params = useParams<{ id: Id<'participants'> }>()
  const id = params?.id
  const router = useRouter()

  const participant = useQuery(api.participants.getById, id ? { id } : 'skip')
  const updateParticipant = useMutation(api.participants.updateProfile)

  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (participant === undefined) {
    return <div className="p-8 text-sm" style={{ color: 'var(--muted)' }}>Loading...</div>
  }

  if (participant === null) {
    notFound()
  }

  const priorityWeights = (participant.priority_weights || {}) as Record<string, number>

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    setError(null)
    const formData = new FormData(e.currentTarget)

    try {
      await updateParticipant({
        id: participant._id,
        full_name: formData.get('full_name') as string,
        contact_info: formData.get('contact_info') as string,
        gender: formData.get('gender') as string,
        birthday: (formData.get('birthday') as string) || undefined,
        age: parseInt(formData.get('age') as string) || undefined,
        work: (formData.get('work') as string) || undefined,
        dream_city: (formData.get('dream_city') as string) || undefined,
        ask_out_preference: (formData.get('ask_out_preference') as string) || undefined,
        life_in_5_years: (formData.get('life_in_5_years') as string) || undefined,
        last_thing_that_made_you_laugh: (formData.get('last_thing_that_made_you_laugh') as string) || undefined,
        dream_date: (formData.get('dream_date') as string) || undefined,
        family_notes: (formData.get('family_notes') as string) || undefined,
        vice_or_red_flag: (formData.get('vice_or_red_flag') as string) || undefined,
        dealbreaker: (formData.get('dealbreaker') as string) || undefined,
        random_curiosities: (formData.get('random_curiosities') as string) || undefined,
        referral_notes: (formData.get('referral_notes') as string) || undefined,
        values_or_worldview: (formData.get('values_or_worldview') as string) || undefined,
        comfortable_with_man_asking_woman: formData.get('comfortable_with_man_asking_woman') === 'on',
        comfortable_with_alcohol_meetcute: formData.get('comfortable_with_alcohol_meetcute') === 'on',
        ready_for_love: (formData.get('ready_for_love') as ReadinessForLove) || undefined,
        grand_amour: (formData.get('grand_amour') as string) || undefined,
        preferred_partner_age_min: parseInt(formData.get('preferred_partner_age_min') as string) || undefined,
        preferred_partner_age_max: parseInt(formData.get('preferred_partner_age_max') as string) || undefined,
        okay_with_some_deviation: formData.get('okay_with_some_deviation') === 'on',
        priority_weights: {
          pedigree: parseInt(formData.get('priority_pedigree') as string) || 34,
          looks: parseInt(formData.get('priority_looks') as string) || 33,
          personality: parseInt(formData.get('priority_personality') as string) || 33,
        },
      })
      router.push(`/participants/${id}`)
    } catch (err: any) {
      setError(err.message)
      setPending(false)
    }
  }

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

      <form onSubmit={handleSubmit} className="rounded-2xl border p-8 shadow-sm flex flex-col gap-8" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        {error && (
          <div className="rounded-lg px-4 py-3 text-sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <section>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--neutral-900)' }}>Basic Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextField name="full_name" label="Full name" defaultValue={participant.full_name} required />
            <TextField name="contact_info" label="Contact info" defaultValue={participant.contact_info} required />
            <TextField name="gender" label="Gender" defaultValue={participant.gender} />
            <TextField name="birthday" label="Birthday" type="date" defaultValue={participant.birthday} />
            <TextField name="age" label="Age" type="number" defaultValue={participant.age} />
            <TextField name="work" label="Work" defaultValue={participant.work} />
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
            <TextField name="priority_pedigree" label="Background %" type="number" defaultValue={priorityWeights.pedigree ?? 34} />
            <TextField name="priority_looks" label="Looks %" type="number" defaultValue={priorityWeights.looks ?? 33} />
            <TextField name="priority_personality" label="Personality %" type="number" defaultValue={priorityWeights.personality ?? 33} />
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
            <TextField name="preferred_partner_age_min" label="Preferred min age" type="number" defaultValue={participant.preferred_partner_age_min} />
            <TextField name="preferred_partner_age_max" label="Preferred max age" type="number" defaultValue={participant.preferred_partner_age_max} />
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
                <select name={field.name} defaultValue={(participant as any)[field.name] ?? 'flexible'} className="form-input">
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
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            style={{ background: pending ? 'var(--neutral-400)' : 'var(--accent)' }}
          >
            {pending ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
