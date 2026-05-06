'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'

type FieldType = 'text' | 'textarea' | 'select' | 'checkbox'
type SectionId = 'basic_info' | 'about_you' | 'ideal_partner'

interface FieldDef {
  id: string
  sectionId: SectionId
  label: string
  type: FieldType
  required: boolean
  options?: string[] // For select type
}

const SECTIONS: { id: SectionId; title: string; description: string; requiredLabel: string }[] = [
  {
    id: 'basic_info',
    title: 'Basic Info',
    description: 'Permanent required identity and contact fields.',
    requiredLabel: 'Usually required',
  },
  {
    id: 'about_you',
    title: 'About You',
    description: 'Optional prompts Liela can tune between events.',
    requiredLabel: 'Usually optional',
  },
  {
    id: 'ideal_partner',
    title: 'Ideal Partner',
    description: 'Partner preference prompts.',
    requiredLabel: 'Mixed requirements',
  },
]

const DEFAULT_FIELDS: FieldDef[] = [
  { id: '1', sectionId: 'basic_info', label: 'Full name', type: 'text', required: true },
  { id: '2', sectionId: 'basic_info', label: 'Best way to reach you', type: 'text', required: true },
  { id: '3', sectionId: 'basic_info', label: 'Gender', type: 'text', required: true },
  { id: '4', sectionId: 'basic_info', label: 'Birthday', type: 'text', required: true },
  { id: '5', sectionId: 'basic_info', label: 'Age', type: 'text', required: true },
  { id: '6', sectionId: 'basic_info', label: 'Work', type: 'text', required: true },
  { id: '7', sectionId: 'about_you', label: 'Dream city', type: 'text', required: false },
  { id: '8', sectionId: 'about_you', label: 'Ask-out preference', type: 'textarea', required: false },
  { id: '9', sectionId: 'about_you', label: 'Life in 5 years', type: 'textarea', required: false },
  { id: '10', sectionId: 'about_you', label: 'Dream date', type: 'textarea', required: false },
  { id: '11', sectionId: 'about_you', label: 'Dealbreaker', type: 'text', required: false },
  { id: '12', sectionId: 'about_you', label: 'Values & Worldview', type: 'textarea', required: false },
  { id: '13', sectionId: 'ideal_partner', label: 'Priority weights', type: 'text', required: true },
  { id: '14', sectionId: 'ideal_partner', label: 'Ready for love', type: 'select', required: false, options: ['yes', 'not_sure', 'no'] },
]

export default function QuestionnaireBuilderPage() {
  const activeQuestionnaire = useQuery(api.questionnaires.getActive)
  const saveQuestionnaire = useMutation(api.questionnaires.saveActive)

  const [fields, setFields] = useState<FieldDef[]>([])
  const [isEditingId, setIsEditingId] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // Load from DB or use defaults
  useEffect(() => {
    if (activeQuestionnaire) {
      setFields(activeQuestionnaire.fields as FieldDef[])
    } else if (activeQuestionnaire === null) {
      setFields(DEFAULT_FIELDS)
    }
  }, [activeQuestionnaire])

  const handleSave = async () => {
    setPending(true)
    setSuccessMsg('')
    try {
      await saveQuestionnaire({
        title: 'Main Intake Questionnaire',
        description: 'V3 Dynamic Intake',
        fields,
      })
      setSuccessMsg('Saved successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setPending(false)
    }
  }

  const handleAddField = (sectionId: SectionId) => {
    const newField: FieldDef = {
      id: crypto.randomUUID(),
      sectionId,
      label: 'New Question',
      type: 'text',
      required: false,
    }
    setFields([...fields, newField])
    setIsEditingId(newField.id)
  }

  const handleUpdateField = (id: string, updates: Partial<FieldDef>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const handleDeleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id))
    if (isEditingId === id) setIsEditingId(null)
  }

  if (activeQuestionnaire === undefined) {
    return <div className="p-8 text-sm" style={{ color: 'var(--muted)' }}>Loading builder...</div>
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--neutral-900)' }}>
            Questionnaire Builder
          </h1>
          <span
            title="The three-section structure is permanent. You can edit individual questions."
            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold"
            style={{ background: 'var(--neutral-200)', color: 'var(--neutral-600)' }}
          >
            i
          </span>
        </div>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          Manage the dynamic form fields presented to applicants on the `/apply` page.
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between rounded-2xl border p-6 shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--neutral-900)' }}>Active Schema</h2>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Changes made here will instantly reflect on the public application form once saved.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {successMsg && <span className="text-sm font-medium text-emerald-600">{successMsg}</span>}
          <button
            onClick={handleSave}
            disabled={pending}
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            style={{ background: 'var(--accent)' }}
          >
            {pending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {SECTIONS.map((section) => {
          const sectionFields = fields.filter(f => f.sectionId === section.id)

          return (
            <section key={section.id} className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--neutral-900)' }}>{section.title}</h2>
                  <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{section.description}</p>
                </div>
                <button
                  onClick={() => handleAddField(section.id)}
                  className="rounded-xl border px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-50"
                  style={{ borderColor: 'var(--border)', color: 'var(--neutral-700)' }}
                >
                  Add Question
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {sectionFields.length === 0 ? (
                  <div className="text-sm italic" style={{ color: 'var(--muted)' }}>No questions in this section.</div>
                ) : sectionFields.map((field, index) => {
                  const isEditing = isEditingId === field.id

                  return (
                    <div key={field.id} className="flex flex-col overflow-hidden rounded-xl border transition-all" style={{ borderColor: 'var(--border)', background: 'var(--neutral-50)' }}>
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--muted)' }}>{index + 1}</span>
                          <span className="text-sm font-medium" style={{ color: 'var(--neutral-800)' }}>{field.label}</span>
                          {field.required && <span className="text-[10px] uppercase tracking-wider text-red-500 font-bold">Req</span>}
                          <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-neutral-600">
                            {field.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsEditingId(isEditing ? null : field.id)}
                            className="text-xs font-medium hover:underline"
                            style={{ color: 'var(--accent)' }}
                          >
                            {isEditing ? 'Done' : 'Edit'}
                          </button>
                          <button
                            onClick={() => handleDeleteField(field.id)}
                            className="text-xs font-medium text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="border-t p-4" style={{ borderColor: 'var(--border)', background: 'white' }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Label</label>
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                                className="form-input text-sm"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Type</label>
                              <select
                                value={field.type}
                                onChange={(e) => handleUpdateField(field.id, { type: e.target.value as FieldType })}
                                className="form-input text-sm"
                              >
                                <option value="text">Short Text</option>
                                <option value="textarea">Paragraph</option>
                                <option value="select">Dropdown</option>
                                <option value="checkbox">Checkbox</option>
                              </select>
                            </div>
                            <div className="flex items-center gap-2 md:col-span-2">
                              <input
                                type="checkbox"
                                id={`req-${field.id}`}
                                checked={field.required}
                                onChange={(e) => handleUpdateField(field.id, { required: e.target.checked })}
                                className="rounded border-neutral-300"
                              />
                              <label htmlFor={`req-${field.id}`} className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>
                                Required field
                              </label>
                            </div>

                            {field.type === 'select' && (
                              <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Options (comma separated)</label>
                                <input
                                  type="text"
                                  value={field.options?.join(', ') || ''}
                                  onChange={(e) => handleUpdateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                                  className="form-input text-sm"
                                  placeholder="Option 1, Option 2, Option 3"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
