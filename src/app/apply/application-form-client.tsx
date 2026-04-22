'use client'

import { useState } from 'react'
import { useForm, FormProvider, type FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useActionState } from 'react'
import { ApplicationFormSchema } from '@/lib/schemas'
import { DEFAULT_PRIORITY_WEIGHTS, LIFESTYLE_ATTRIBUTES } from '@/lib/constants'
import { submitApplication } from '@/app/actions/application'
import { Section1Fields } from '@/app/apply/section-1-fields'
import { Section2Fields } from '@/app/apply/section-2-fields'
import { Section3Fields } from '@/app/apply/section-3-fields'

const SECTIONS = [
  { number: 1, label: 'Basic Info' },
  { number: 2, label: 'Ideal Partner' },
  { number: 3, label: 'About You' },
]

const SECTION_1_KEYS = ['full_name', 'contact_info', 'gender', 'age', 'birthday', 'work']
const SECTION_2_KEYS = [
  'priority_weights', 'ready_for_love', 'preferred_partner_age_min',
  'preferred_partner_age_max', 'okay_with_some_deviation',
  ...LIFESTYLE_ATTRIBUTES.flatMap((a) => [a.self, a.partner]),
]

export function ApplicationFormClient() {
  const [step, setStep] = useState(1)
  const [submitState, submitAction, pending] = useActionState(submitApplication, undefined)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const methods = useForm<any>({
    resolver: zodResolver(ApplicationFormSchema),
    defaultValues: {
      full_name: '',
      contact_info: '',
      gender: '',
      work: '',
      grand_amour: '',
      okay_with_some_deviation: false,
      comfortable_with_man_asking_woman: false,
      comfortable_with_alcohol_meetcute: false,
      priority_weights: DEFAULT_PRIORITY_WEIGHTS,
      dream_city: '',
      ask_out_preference: '',
      life_in_5_years: '',
      last_thing_that_made_you_laugh: '',
      dream_date: '',
      family_notes: '',
      vice_or_red_flag: '',
      dealbreaker: '',
      random_curiosities: '',
      referral_notes: '',
      values_or_worldview: '',
    },
    mode: 'onTouched',
  })

  const { handleSubmit, trigger } = methods

  async function goNext() {
    const keys = step === 1 ? SECTION_1_KEYS : SECTION_2_KEYS
    const valid = await trigger(keys)
    if (valid) setStep((s) => s + 1)
  }

  function goBack() {
    setStep((s) => s - 1)
  }

  function onSubmit(data: FieldValues) {
    const fd = new FormData()
    for (const [key, value] of Object.entries(data)) {
      if (key === 'priority_weights') {
        fd.append(key, JSON.stringify(value))
      } else if (value !== undefined && value !== null) {
        fd.append(key, String(value))
      }
    }
    submitAction(fd)
  }

  return (
    <FormProvider {...methods}>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {SECTIONS.map((s, i) => (
          <div key={s.number} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 shrink-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
                style={{
                  background: step >= s.number ? 'var(--accent)' : 'var(--neutral-200)',
                  color: step >= s.number ? 'white' : 'var(--neutral-500)',
                }}
              >
                {s.number}
              </div>
              <span
                className="text-sm font-medium hidden sm:block"
                style={{ color: step === s.number ? 'var(--neutral-900)' : 'var(--muted)' }}
              >
                {s.label}
              </span>
            </div>
            {i < SECTIONS.length - 1 && (
              <div
                className="h-px flex-1 transition-all"
                style={{ background: step > s.number ? 'var(--accent)' : 'var(--neutral-200)' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form card */}
      <div
        className="rounded-2xl border p-8 shadow-sm"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <form onSubmit={handleSubmit(onSubmit)} id="application-form">
          {step === 1 && <Section1Fields />}
          {step === 2 && <Section2Fields />}
          {step === 3 && <Section3Fields />}

          {/* Global submit error */}
          {submitState && 'error' in submitState && (
            <div
              className="mt-4 rounded-lg px-4 py-3 text-sm"
              style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
              role="alert"
            >
              {submitState.error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer"
                style={{ borderColor: 'var(--border)', color: 'var(--neutral-600)' }}
                id="form-back"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={goNext}
                className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all cursor-pointer"
                style={{ background: 'var(--accent)' }}
                id="form-next"
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={pending}
                className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                style={{ background: pending ? 'var(--neutral-400)' : 'var(--accent)' }}
                id="form-submit"
              >
                {pending ? 'Submitting…' : 'Submit Application'}
              </button>
            )}
          </div>
        </form>
      </div>

      <p className="text-center text-xs mt-4" style={{ color: 'var(--muted)' }}>
        Your information is private and will only be seen by the organizer.
      </p>
    </FormProvider>
  )
}
