'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, FormProvider, type FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApplicationFormSchema } from '@/lib/schemas'
import { DEFAULT_PRIORITY_WEIGHTS, LIFESTYLE_ATTRIBUTES } from '@/lib/constants'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Section1Fields } from '@/app/apply/section-1-fields'
import { Section2Fields } from '@/app/apply/section-2-fields'
import { Section3Fields } from '@/app/apply/section-3-fields'

const SECTIONS = [
  { number: 1, label: 'Basic Info' },
  { number: 2, label: 'About You' },
  { number: 3, label: 'Ideal Partner' },
]

const SECTION_1_KEYS = ['full_name', 'contact_info', 'gender', 'age', 'birthday', 'work']

interface ApplicationFormClientProps {
  submitLabel?: string
  pendingLabel?: string
  footerNote?: string
  onSuccess?: () => void
}

export function ApplicationFormClient({
  submitLabel = 'Submit Application',
  pendingLabel = 'Submitting…',
  footerNote = 'Your information is private and will only be seen by the organizer.',
  onSuccess,
}: ApplicationFormClientProps) {
  const router = useRouter()
  const submitApplication = useMutation(api.applications.submitApplication)
  const [step, setStep] = useState(1)
  const [draftSaved, setDraftSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

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
    const valid = step === 1 ? await trigger(SECTION_1_KEYS) : true
    if (valid) setStep((s) => s + 1)
  }

  function goBack() {
    setStep((s) => s - 1)
  }

  const onSubmitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void handleSubmit(async (data: FieldValues) => {
      setPending(true)
      setError(null)
      try {
        await submitApplication(data as any)
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/apply/success')
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setPending(false)
      }
    })(e)
  }

  function saveDraft() {
    const values = methods.getValues()
    window.localStorage.setItem('group-date-application-draft', JSON.stringify(values))
    setDraftSaved(true)
  }

  return (
    <FormProvider {...methods}>
      {/* Step indicator */}
      <div className="flex items-center justify-center mb-8 max-w-2xl mx-auto w-full">
        {SECTIONS.map((s, i) => (
          <div key={s.number} className={`flex items-center gap-4 ${i < SECTIONS.length - 1 ? 'flex-1' : ''}`}>
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
        <form onSubmit={onSubmitHandler} id="application-form">
          {step === 1 && <Section1Fields />}
          {step === 2 && <Section3Fields sectionNumber={2} />}
          {step === 3 && <Section2Fields sectionNumber={3} />}

          {/* Global submit error */}
          {error && (
            <div
              className="mt-4 rounded-lg px-4 py-3 text-sm"
              style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
              role="alert"
            >
              {error}
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
              <div className="flex items-center gap-3">
                <button
                  key="draft-button"
                  type="button"
                  onClick={saveDraft}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer"
                  style={{ borderColor: 'var(--border)', color: 'var(--neutral-600)' }}
                  id="form-save-draft"
                >
                  Save Draft
                </button>
                <button
                  key="next-button"
                  type="button"
                  onClick={goNext}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all cursor-pointer"
                  style={{ background: 'var(--accent)' }}
                  id="form-next"
                >
                  Next →
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  key="draft-button-final"
                  type="button"
                  onClick={saveDraft}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer"
                  style={{ borderColor: 'var(--border)', color: 'var(--neutral-600)' }}
                  id="form-save-draft"
                >
                  Save Draft
                </button>
                <button
                  key="submit-button"
                  type="submit"
                  disabled={pending}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                  style={{ background: pending ? 'var(--neutral-400)' : 'var(--accent)' }}
                  id="form-submit"
                >
                  {pending ? pendingLabel : submitLabel}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      {draftSaved && (
        <p className="text-center text-xs mt-4" style={{ color: 'var(--accent)' }}>
          Draft saved in this browser. Database-backed draft profiles will be enabled after the v3 schema migration.
        </p>
      )}

      <p className="text-center text-xs mt-4" style={{ color: 'var(--muted)' }}>
        {footerNote}
      </p>
    </FormProvider>
  )
}
