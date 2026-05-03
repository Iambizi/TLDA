'use client'

import { useFormContext } from 'react-hook-form'
import type { ApplicationFormValues } from '@/lib/schemas'
import { FieldWrapper } from '@/app/apply/field-wrapper'

const GENDER_OPTIONS = [
  { value: 'man', label: 'Man' },
  { value: 'woman', label: 'Woman' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

export function Section1Fields() {
  const { register, setValue, formState: { errors } } = useFormContext<ApplicationFormValues>()

  const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val) {
      const birthDate = new Date(val)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      setValue('age', age, { shouldValidate: true })
    }
  }

  const birthdayRegister = register('birthday')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--neutral-900)' }}>
          Section 1 — Basic Info
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Let&apos;s start with the basics.
        </p>
      </div>

      <FieldWrapper label="Full name" error={errors.full_name?.message} required>
        <input
          id="field-full-name"
          type="text"
          placeholder="Your full name"
          className="form-input"
          {...register('full_name')}
        />
      </FieldWrapper>

      <FieldWrapper
        label="Best way to reach you"
        hint="Email, phone, or Instagram — however you prefer."
        error={errors.contact_info?.message}
        required
      >
        <input
          id="field-contact-info"
          type="text"
          placeholder="e.g. hello@email.com or @yourhandle"
          className="form-input"
          {...register('contact_info')}
        />
      </FieldWrapper>

      <div className="grid grid-cols-2 gap-4">
        <FieldWrapper label="Gender" error={errors.gender?.message} required>
          <select
            id="field-gender"
            className="form-input"
            {...register('gender')}
          >
            <option value="">Select…</option>
            {GENDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </FieldWrapper>

        <FieldWrapper label="Birthday" error={errors.birthday?.message} required>
          <input
            id="field-birthday"
            type="date"
            className="form-input"
            {...birthdayRegister}
            onChange={(e) => {
              birthdayRegister.onChange(e)
              handleBirthdayChange(e)
            }}
          />
        </FieldWrapper>
      </div>

      <FieldWrapper label="Age" error={errors.age?.message} required>
        <input
          id="field-age"
          type="number"
          min={18}
          max={120}
          placeholder="Auto-calculated"
          className="form-input bg-neutral-50 opacity-70 cursor-not-allowed w-32"
          readOnly
          tabIndex={-1}
          {...register('age', { valueAsNumber: true })}
        />
      </FieldWrapper>

      <FieldWrapper label="What do you do for work?" error={errors.work?.message} required>
        <input
          id="field-work"
          type="text"
          placeholder="Your profession or industry"
          className="form-input"
          {...register('work')}
        />
      </FieldWrapper>

      <FieldWrapper
        label="Participant photo"
        hint="Optional for now. Upload storage is part of the v3 database/storage migration."
      >
        <input
          id="field-photo"
          type="file"
          accept="image/*"
          className="form-input"
          disabled
        />
      </FieldWrapper>
    </div>
  )
}
