'use client'

import { useFormContext, Controller } from 'react-hook-form'
import type { ApplicationFormValues } from '@/lib/schemas'
import { LIFESTYLE_ATTRIBUTES, LIFESTYLE_PREFERENCE_LABELS, SELF_LIFESTYLE_LABELS, READINESS_LABELS } from '@/lib/constants'
import { FieldWrapper } from '@/app/apply/field-wrapper'
import { PriorityWeightsSlider } from '@/app/apply/priority-weights-slider'
import type { LifestylePreference, ReadinessForLove } from '@/types'

const LIFESTYLE_OPTIONS: LifestylePreference[] = ['want', 'dont_want', 'flexible']

export function Section2Fields() {
  const { register, control, formState: { errors } } = useFormContext<ApplicationFormValues>()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--neutral-900)' }}>
          Section 2 — Ideal Partner
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Help us understand what you&apos;re looking for.
        </p>
      </div>

      {/* Priority Weights */}
      <div>
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--neutral-700)' }}>
          What matters most to you in a partner?
        </p>
        <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
          Drag the sliders — they&apos;ll auto-balance to 100%.
        </p>
        <Controller
          name="priority_weights"
          control={control}
          render={({ field }) => (
            <PriorityWeightsSlider value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.priority_weights && (
          <p className="text-xs mt-1" style={{ color: '#b91c1c' }}>
            {(errors.priority_weights as { message?: string })?.message ?? 'Invalid priority weights'}
          </p>
        )}
      </div>

      {/* Readiness */}
      <FieldWrapper label="Are you ready for a relationship?" error={errors.ready_for_love?.message} required>
        <select
          id="field-ready-for-love"
          className="form-input"
          {...register('ready_for_love')}
        >
          <option value="">Select…</option>
          {(Object.keys(READINESS_LABELS) as ReadinessForLove[]).map((key) => (
            <option key={key} value={key}>{READINESS_LABELS[key]}</option>
          ))}
        </select>
      </FieldWrapper>

      <FieldWrapper label="Tell us about your dream relationship" hint="Optional — be as brief or detailed as you like." error={errors.grand_amour?.message}>
        <textarea
          id="field-grand-amour"
          rows={3}
          placeholder="What does your ideal relationship look like?"
          className="form-input resize-none"
          {...register('grand_amour')}
        />
      </FieldWrapper>

      {/* Age range */}
      <div>
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--neutral-700)' }}>
          Preferred partner age range
        </p>
        <div className="grid grid-cols-2 gap-4">
          <FieldWrapper label="Minimum age" error={errors.preferred_partner_age_min?.message} required>
            <input
              id="field-age-min"
              type="number"
              min={18}
              max={99}
              placeholder="e.g. 28"
              className="form-input"
              {...register('preferred_partner_age_min', { valueAsNumber: true })}
            />
          </FieldWrapper>
          <FieldWrapper label="Maximum age" error={errors.preferred_partner_age_max?.message} required>
            <input
              id="field-age-max"
              type="number"
              min={18}
              max={99}
              placeholder="e.g. 42"
              className="form-input"
              {...register('preferred_partner_age_max', { valueAsNumber: true })}
            />
          </FieldWrapper>
        </div>
        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <input
            id="field-age-deviation"
            type="checkbox"
            className="rounded"
            {...register('okay_with_some_deviation')}
          />
          <span className="text-sm" style={{ color: 'var(--neutral-600)' }}>
            I&apos;m okay with some flexibility on this
          </span>
        </label>
      </div>

      {/* Lifestyle attribute pairs */}
      <div>
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--neutral-700)' }}>
          Lifestyle preferences
        </p>
        <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
          For each attribute — select what applies to you, and what you&apos;d prefer in a partner.
        </p>

        <div className="flex flex-col gap-5">
          {LIFESTYLE_ATTRIBUTES.map((attr) => (
            <div
              key={attr.self}
              className="rounded-xl border p-4"
              style={{ borderColor: 'var(--border)', background: 'var(--neutral-50)' }}
            >
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--neutral-800)' }}>
                {attr.label}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {/* Self */}
                <div>
                  <p className="text-xs mb-2 font-medium" style={{ color: 'var(--muted)' }}>About you</p>
                  <div className="flex gap-2 flex-wrap">
                    {LIFESTYLE_OPTIONS.map((opt) => (
                      <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          value={opt}
                          id={`field-${attr.self}-${opt}`}
                          {...register(attr.self as keyof ApplicationFormValues)}
                        />
                        <span className="text-xs" style={{ color: 'var(--neutral-700)' }}>
                          {SELF_LIFESTYLE_LABELS[opt]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Partner */}
                <div>
                  <p className="text-xs mb-2 font-medium" style={{ color: 'var(--muted)' }}>In a partner</p>
                  <div className="flex gap-2 flex-wrap">
                    {LIFESTYLE_OPTIONS.map((opt) => (
                      <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          value={opt}
                          id={`field-${attr.partner}-${opt}`}
                          {...register(attr.partner as keyof ApplicationFormValues)}
                        />
                        <span className="text-xs" style={{ color: 'var(--neutral-700)' }}>
                          {LIFESTYLE_PREFERENCE_LABELS[opt]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
