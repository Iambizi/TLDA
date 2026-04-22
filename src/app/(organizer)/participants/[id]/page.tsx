import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ReviewForm } from './review-form'
import { InterviewLogger } from './interview-logger'
import { DeleteParticipantCard } from './delete-participant-card'
import { LIFESTYLE_ATTRIBUTES, LIFESTYLE_PREFERENCE_LABELS, READINESS_LABELS, INTERVIEW_OUTCOME_LABELS } from '@/lib/constants'

export const metadata: Metadata = { title: 'Participant Detail' }

interface ParticipantPageProps {
  params: Promise<{ id: string }>
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h3 className="text-lg font-semibold mb-4 pb-2 border-b mt-8 first:mt-0" style={{ color: 'var(--neutral-900)', borderColor: 'var(--border)' }}>
      {title}
    </h3>
  )
}

function FieldDisplay({ label, value, isSensitive = false }: { label: string, value: string | number | boolean | null | undefined, isSensitive?: boolean }) {
  if (value === null || value === undefined || value === '') return null
  
  let displayValue = String(value)
  if (typeof value === 'boolean') {
    displayValue = value ? 'Yes' : 'No'
  }

  return (
    <div className="mb-4">
      <p className="text-sm font-medium mb-1" style={{ color: 'var(--neutral-600)' }}>
        {label}
      </p>
      {isSensitive ? (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-900 whitespace-pre-wrap">{displayValue}</p>
        </div>
      ) : (
        <p className="text-base whitespace-pre-wrap" style={{ color: 'var(--neutral-900)' }}>
          {displayValue}
        </p>
      )}
    </div>
  )
}

export default async function ParticipantPage({ params }: ParticipantPageProps) {
  const { id } = await params
  const supabase = await createClient() as any

  const { data: participant } = await supabase
    .from('participants')
    .select(`
      *,
      applications (
        id,
        status,
        organizer_notes,
        submitted_at
      )
    `)
    .eq('id', id)
    .single()

  const { data: interviews } = await supabase
    .from('interviews')
    .select('*')
    .eq('participant_id', id)
    .order('created_at', { ascending: false })

  if (!participant) {
    notFound()
  }

  // MVP constraint: One application per participant
  const application = participant.applications?.[0]

  if (!application) {
    return (
      <div className="p-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
        Participant found, but no application record exists.
      </div>
    )
  }

  const priorityWeights = participant.priority_weights as Record<string, number> | null
  const submittedAt = new Date(application.submitted_at).toLocaleString('en-US', { 
    dateStyle: 'medium', timeStyle: 'short' 
  })

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/participants"
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--neutral-500)' }}
        >
          ← Back to participants
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Form Submission */}
        <div className="flex-1 rounded-2xl border p-8 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="mb-6">
            <h1 className="text-3xl font-semibold" style={{ color: 'var(--neutral-900)' }}>
              {participant.full_name}
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
              Applied on {submittedAt}
            </p>
          </div>

          <SectionHeading title="Section 1 — Basic Info" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <FieldDisplay label="Contact Info" value={participant.contact_info} />
            <FieldDisplay label="Gender" value={participant.gender} />
            <FieldDisplay label="Age" value={participant.age} />
            <FieldDisplay label="Birthday" value={participant.birthday} />
            <FieldDisplay label="Profession / Work" value={participant.work} />
          </div>

          <SectionHeading title="Section 2 — Ideal Partner" />
          
          {priorityWeights && (
            <div className="mb-6">
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--neutral-600)' }}>Priority Weights</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(priorityWeights).map(([key, val]) => (
                  <div key={key} className="p-3 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--neutral-50)' }}>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>{key}</p>
                    <p className="text-xl font-semibold" style={{ color: 'var(--accent)' }}>{val}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-6">
            <FieldDisplay label="Ready for Love" value={participant.ready_for_love ? READINESS_LABELS[participant.ready_for_love as keyof typeof READINESS_LABELS] : null} />
            <FieldDisplay label="Grand Amour" value={participant.grand_amour} />
            <FieldDisplay label="Preferred Age Range" value={`${participant.preferred_partner_age_min} - ${participant.preferred_partner_age_max} ${participant.okay_with_some_deviation ? '(Flexible)' : '(Strict)'}`} />
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--neutral-600)' }}>Lifestyle Attributes</p>
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
              <table className="w-full text-sm text-left">
                <thead className="bg-neutral-50/50 border-b" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                  <tr>
                    <th className="px-4 py-3 font-medium">Attribute</th>
                    <th className="px-4 py-3 font-medium">Applicant</th>
                    <th className="px-4 py-3 font-medium">Prefers Partner</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {LIFESTYLE_ATTRIBUTES.map((attr) => {
                    const selfVal = participant[attr.self as keyof typeof participant] as string
                    const partnerVal = participant[attr.partner as keyof typeof participant] as string
                    
                    if (!selfVal && !partnerVal) return null
                    
                    return (
                      <tr key={attr.self} className="hover:bg-neutral-50/50">
                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--neutral-800)' }}>{attr.label}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--neutral-600)' }}>{selfVal ? LIFESTYLE_PREFERENCE_LABELS[selfVal as keyof typeof LIFESTYLE_PREFERENCE_LABELS] : '—'}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--neutral-600)' }}>{partnerVal ? LIFESTYLE_PREFERENCE_LABELS[partnerVal as keyof typeof LIFESTYLE_PREFERENCE_LABELS] : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <SectionHeading title="Section 3 — About You" />
          <FieldDisplay label="Dream City" value={participant.dream_city} />
          <FieldDisplay label="Ask Out Preference" value={participant.ask_out_preference} />
          <FieldDisplay label="Comfortable with man asking woman?" value={participant.comfortable_with_man_asking_woman} />
          <FieldDisplay label="Comfortable with alcohol meet-cute?" value={participant.comfortable_with_alcohol_meetcute} />
          <FieldDisplay label="Life in 5 years" value={participant.life_in_5_years} />
          <FieldDisplay label="Last thing that made you laugh" value={participant.last_thing_that_made_you_laugh} />
          <FieldDisplay label="Dream Date" value={participant.dream_date} />
          <FieldDisplay label="Family Notes" value={participant.family_notes} />
          <FieldDisplay label="Vice or Red Flag" value={participant.vice_or_red_flag} />
          <FieldDisplay label="Dealbreaker" value={participant.dealbreaker} />
          <FieldDisplay label="Random Curiosities" value={participant.random_curiosities} />
          <FieldDisplay label="How did you hear about us?" value={participant.referral_notes} />
          <FieldDisplay label="Values & Worldview (SENSITIVE)" value={participant.values_or_worldview} isSensitive />

        </div>

        {/* Right Column: Sidebar */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          <div className="rounded-2xl border p-6 shadow-sm bg-white" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--neutral-900)' }}>
              Review Actions
            </h3>
            
            <ReviewForm 
              applicationId={application.id}
              initialStatus={application.status}
              initialNotes={application.organizer_notes}
            />
          </div>

          <div className="rounded-2xl border p-6 shadow-sm bg-white" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--neutral-900)' }}>
              Interviews
            </h3>
            
            {(interviews || []).map((iv: any) => (
              <div key={iv.id} className="mb-4 pb-4 border-b last:border-0 last:mb-0 last:pb-0" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--accent)' }}>
                  {INTERVIEW_OUTCOME_LABELS[iv.outcome as keyof typeof INTERVIEW_OUTCOME_LABELS] || iv.outcome}
                </p>
                {iv.scheduled_at && (
                  <p className="text-sm mb-1" style={{ color: 'var(--neutral-600)' }}>
                    {new Date(iv.scheduled_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                )}
                {iv.notes && (
                  <p className="text-sm mt-2 p-3 bg-neutral-50 rounded-lg whitespace-pre-wrap" style={{ color: 'var(--neutral-800)' }}>
                    {iv.notes}
                  </p>
                )}
              </div>
            ))}

            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--muted)' }}>Log New Interview</p>
              <InterviewLogger participantId={participant.id} applicationId={application.id} />
            </div>
          </div>

          <DeleteParticipantCard
            participantId={participant.id}
            participantName={participant.full_name}
          />
        </div>

      </div>
    </div>
  )
}
