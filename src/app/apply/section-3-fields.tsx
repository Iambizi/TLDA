'use client'

import { useFormContext } from 'react-hook-form'
import type { ApplicationFormValues } from '@/lib/schemas'
import { FieldWrapper } from '@/app/apply/field-wrapper'

// NOTE: values_or_worldview is a sensitive field.
// It is presented to the participant as "Values & Worldview" — a neutral, open-ended prompt.
// The field key is never exposed as a visible label in any UI.

export function Section3Fields({ sectionNumber = 3 }: { sectionNumber?: number }) {
  const { register, formState: { errors } } = useFormContext<ApplicationFormValues>()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--neutral-900)' }}>
          Section {sectionNumber} — About You
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          The fun part. Answer as much or as little as you like.
        </p>
      </div>

      <FieldWrapper label="Dream city to live in" error={errors.dream_city?.message}>
        <input
          id="field-dream-city"
          type="text"
          placeholder="e.g. Paris, New York, Tokyo…"
          className="form-input"
          {...register('dream_city')}
        />
      </FieldWrapper>

      <FieldWrapper
        label="How do you prefer to ask someone out — or be asked?"
        error={errors.ask_out_preference?.message}
      >
        <textarea
          id="field-ask-out-preference"
          rows={2}
          placeholder="Spontaneous coffee invite? A proper date plan? A text?"
          className="form-input resize-none"
          {...register('ask_out_preference')}
        />
      </FieldWrapper>

      <div className="flex flex-col gap-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            id="field-comfortable-man-asking"
            type="checkbox"
            className="rounded mt-0.5"
            {...register('comfortable_with_man_asking_woman')}
          />
          <span className="text-sm" style={{ color: 'var(--neutral-700)' }}>
            I&apos;m comfortable with a man asking a woman out first
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            id="field-comfortable-alcohol"
            type="checkbox"
            className="rounded mt-0.5"
            {...register('comfortable_with_alcohol_meetcute')}
          />
          <span className="text-sm" style={{ color: 'var(--neutral-700)' }}>
            I&apos;m comfortable with a meet-cute that involves alcohol
          </span>
        </label>
      </div>

      <FieldWrapper label="Where do you see your life in 5 years?" error={errors.life_in_5_years?.message}>
        <textarea
          id="field-life-5-years"
          rows={3}
          placeholder="Career, family, location, lifestyle…"
          className="form-input resize-none"
          {...register('life_in_5_years')}
        />
      </FieldWrapper>

      <FieldWrapper label="Last thing that made you genuinely laugh" error={errors.last_thing_that_made_you_laugh?.message}>
        <textarea
          id="field-laugh"
          rows={2}
          placeholder="A meme, a moment, a story…"
          className="form-input resize-none"
          {...register('last_thing_that_made_you_laugh')}
        />
      </FieldWrapper>

      <FieldWrapper label="Describe your dream date" error={errors.dream_date?.message}>
        <textarea
          id="field-dream-date"
          rows={3}
          placeholder="Set the scene…"
          className="form-input resize-none"
          {...register('dream_date')}
        />
      </FieldWrapper>

      <FieldWrapper
        label="Family — anything you want us to know?"
        hint="Kids, family dynamics, cultural background — whatever feels relevant."
        error={errors.family_notes?.message}
      >
        <textarea
          id="field-family-notes"
          rows={2}
          className="form-input resize-none"
          placeholder="Optional"
          {...register('family_notes')}
        />
      </FieldWrapper>

      <FieldWrapper
        label="Your vice or loveable red flag"
        hint="Be honest — we all have one."
        error={errors.vice_or_red_flag?.message}
      >
        <input
          id="field-vice"
          type="text"
          placeholder="e.g. Chronically late, too many plants, serial re-watcher of The Office…"
          className="form-input"
          {...register('vice_or_red_flag')}
        />
      </FieldWrapper>

      <FieldWrapper label="Your dealbreaker" error={errors.dealbreaker?.message}>
        <input
          id="field-dealbreaker"
          type="text"
          placeholder="The one thing that's a hard no for you"
          className="form-input"
          {...register('dealbreaker')}
        />
      </FieldWrapper>

      <FieldWrapper
        label="Something random we should know about you"
        hint="A quirk, a skill, an obsession — go weird."
        error={errors.random_curiosities?.message}
      >
        <textarea
          id="field-random"
          rows={2}
          className="form-input resize-none"
          placeholder="Optional but encouraged"
          {...register('random_curiosities')}
        />
      </FieldWrapper>

      <FieldWrapper label="How did you hear about us?" error={errors.referral_notes?.message}>
        <input
          id="field-referral"
          type="text"
          placeholder="A friend, Instagram, word of mouth…"
          className="form-input"
          {...register('referral_notes')}
        />
      </FieldWrapper>

      {/* Sensitive field — presented neutrally, key never displayed */}
      <FieldWrapper
        label="Values & Worldview"
        hint="An open space to share anything about your values, beliefs, or how you see the world. Optional, and entirely in your own words."
        error={errors.values_or_worldview?.message}
      >
        <textarea
          id="field-worldview"
          rows={3}
          className="form-input resize-none"
          placeholder="Optional — share as much or as little as you like."
          {...register('values_or_worldview')}
        />
      </FieldWrapper>
    </div>
  )
}
