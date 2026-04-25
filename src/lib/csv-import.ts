import Papa from 'papaparse'
import { DEFAULT_PRIORITY_WEIGHTS, LIFESTYLE_ATTRIBUTES } from '@/lib/constants'
import type { ApplicationFormValues } from '@/lib/schemas'

export type CsvImportField =
  | keyof ApplicationFormValues
  | 'priority_pedigree'
  | 'priority_looks'
  | 'priority_personality'

export type CsvImportMapping = Record<string, CsvImportField | ''>

export interface CsvImportInput {
  csvText: string
  mapping: CsvImportMapping
}

export interface CsvPreviewRow {
  rowNumber: number
  status: 'valid' | 'duplicate' | 'error'
  summary: string
  errors: string[]
  duplicateReasons: string[]
}

export interface CsvPreviewResult {
  headers: string[]
  rowCount: number
  validCount: number
  duplicateCount: number
  errorCount: number
  rows: CsvPreviewRow[]
  errorReport: string
}

export interface CsvImportExecutionResult {
  insertedCount: number
  skippedDuplicates: number
  validationErrors: number
  totalRows: number
  errorReport: string
}

const PRIORITY_TARGETS = ['priority_pedigree', 'priority_looks', 'priority_personality'] as const

export const CSV_IMPORT_FIELD_OPTIONS: Array<{ value: CsvImportField | ''; label: string }> = [
  { value: '', label: 'Ignore this column' },
  { value: 'full_name', label: 'Full Name' },
  { value: 'contact_info', label: 'Contact Info' },
  { value: 'gender', label: 'Gender' },
  { value: 'age', label: 'Age' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'work', label: 'Work' },
  { value: 'priority_pedigree', label: 'Priority Weight: Pedigree' },
  { value: 'priority_looks', label: 'Priority Weight: Looks' },
  { value: 'priority_personality', label: 'Priority Weight: Personality' },
  { value: 'ready_for_love', label: 'Ready For Love' },
  { value: 'grand_amour', label: 'Grand Amour' },
  { value: 'preferred_partner_age_min', label: 'Preferred Partner Age Min' },
  { value: 'preferred_partner_age_max', label: 'Preferred Partner Age Max' },
  { value: 'okay_with_some_deviation', label: 'Okay With Some Deviation' },
  { value: 'has_kids', label: 'Has Kids' },
  { value: 'partner_has_kids', label: 'Partner Has Kids' },
  { value: 'travels_world', label: 'Travels the World' },
  { value: 'partner_travels_world', label: 'Partner Travels the World' },
  { value: 'is_divorced', label: 'Is Divorced' },
  { value: 'partner_is_divorced', label: 'Partner Is Divorced' },
  { value: 'smokes_drug_friendly', label: 'Smoke / Drug Friendly' },
  { value: 'partner_smokes_drug_friendly', label: 'Partner Smoke / Drug Friendly' },
  { value: 'has_tattoos', label: 'Has Tattoos' },
  { value: 'partner_has_tattoos', label: 'Partner Has Tattoos' },
  { value: 'fitness_level', label: 'Fitness Level' },
  { value: 'partner_fitness', label: 'Partner Fitness' },
  { value: 'close_with_family', label: 'Close With Family' },
  { value: 'partner_close_with_family', label: 'Partner Close With Family' },
  { value: 'dream_city', label: 'Dream City' },
  { value: 'ask_out_preference', label: 'Ask Out Preference' },
  { value: 'comfortable_with_man_asking_woman', label: 'Comfortable With Man Asking Woman' },
  { value: 'comfortable_with_alcohol_meetcute', label: 'Comfortable With Alcohol Meet-Cute' },
  { value: 'life_in_5_years', label: 'Life In 5 Years' },
  { value: 'last_thing_that_made_you_laugh', label: 'Last Thing That Made You Laugh' },
  { value: 'dream_date', label: 'Dream Date' },
  { value: 'family_notes', label: 'Family Notes' },
  { value: 'vice_or_red_flag', label: 'Vice Or Red Flag' },
  { value: 'dealbreaker', label: 'Dealbreaker' },
  { value: 'random_curiosities', label: 'Random Curiosities' },
  { value: 'referral_notes', label: 'Referral Notes' },
  { value: 'values_or_worldview', label: 'Values Or Worldview' },
]

const HEADER_ALIASES: Record<string, CsvImportField> = {
  name: 'full_name',
  fullname: 'full_name',
  full_name: 'full_name',
  contacts: 'contact_info',
  contact: 'contact_info',
  contactinfo: 'contact_info',
  contactinformation: 'contact_info',
  email: 'contact_info',
  phone: 'contact_info',
  instagram: 'contact_info',
  ig: 'contact_info',
  gender: 'gender',
  age: 'age',
  birthday: 'birthday',
  birthdate: 'birthday',
  dob: 'birthday',
  work: 'work',
  profession: 'work',
  job: 'work',
  pedigree: 'priority_pedigree',
  prioritypedigree: 'priority_pedigree',
  looks: 'priority_looks',
  prioritylooks: 'priority_looks',
  personality: 'priority_personality',
  prioritypersonality: 'priority_personality',
  readyforlove: 'ready_for_love',
  wouldyousayyouarereadyforlove: 'ready_for_love',
  grandamour: 'grand_amour',
  whatsyourdreamrelationship: 'grand_amour',
  preferredpartneragemin: 'preferred_partner_age_min',
  minimumage: 'preferred_partner_age_min',
  minage: 'preferred_partner_age_min',
  preferredpartneragemax: 'preferred_partner_age_max',
  maximumage: 'preferred_partner_age_max',
  maxage: 'preferred_partner_age_max',
  okaywithsomedeviation: 'okay_with_some_deviation',
  flexibilityonagerange: 'okay_with_some_deviation',
  dreamcity: 'dream_city',
  askoutpreference: 'ask_out_preference',
  comfortablewithmanaskingwoman: 'comfortable_with_man_asking_woman',
  comfortablewithalcoholmeetcute: 'comfortable_with_alcohol_meetcute',
  lifein5years: 'life_in_5_years',
  lastthingthatmadeyoulaugh: 'last_thing_that_made_you_laugh',
  dreamdate: 'dream_date',
  familynotes: 'family_notes',
  family: 'family_notes',
  viceorredflag: 'vice_or_red_flag',
  dealbreaker: 'dealbreaker',
  randomcuriosities: 'random_curiosities',
  random: 'random_curiosities',
  referralnotes: 'referral_notes',
  howdidyouhearaboutus: 'referral_notes',
  valuesorworldview: 'values_or_worldview',
}

for (const attr of LIFESTYLE_ATTRIBUTES) {
  HEADER_ALIASES[normalizeHeader(attr.self)] = attr.self
  HEADER_ALIASES[normalizeHeader(attr.partner)] = attr.partner
  HEADER_ALIASES[normalizeHeader(attr.label)] = attr.self
  HEADER_ALIASES[normalizeHeader(`${attr.label} partner`)] = attr.partner
  HEADER_ALIASES[normalizeHeader(`${attr.label} in a partner`)] = attr.partner
  HEADER_ALIASES[normalizeHeader(`partner ${attr.label}`)] = attr.partner
  HEADER_ALIASES[normalizeHeader(`about you ${attr.label}`)] = attr.self
}

export function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
}

export function parseCsvHeaders(csvText: string): string[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    preview: 1,
    skipEmptyLines: true,
  })

  return (parsed.meta.fields ?? []).map((field) => field.trim())
}

export function autoMapHeaders(headers: string[]): CsvImportMapping {
  const mapping: CsvImportMapping = {}

  for (const header of headers) {
    mapping[header] = HEADER_ALIASES[normalizeHeader(header)] ?? ''
  }

  return mapping
}

export function parseCsvRows(csvText: string): Array<Record<string, string>> {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim(),
  })

  if (parsed.errors.length > 0) {
    const firstError = parsed.errors[0]
    throw new Error(firstError?.message ?? 'Unable to parse CSV.')
  }

  return parsed.data
}

export function buildRawApplicationFromRow(
  row: Record<string, string>,
  mapping: CsvImportMapping
): Record<string, unknown> {
  const rawData: Record<string, unknown> = {}
  const priorityWeights = { ...DEFAULT_PRIORITY_WEIGHTS }

  for (const [header, rawValue] of Object.entries(row)) {
    const target = mapping[header]
    if (!target) continue

    const value = normalizeEmpty(rawValue)

    if (target === 'priority_pedigree') {
      priorityWeights.pedigree = parseNumericValue(value) ?? priorityWeights.pedigree
      continue
    }

    if (target === 'priority_looks') {
      priorityWeights.looks = parseNumericValue(value) ?? priorityWeights.looks
      continue
    }

    if (target === 'priority_personality') {
      priorityWeights.personality = parseNumericValue(value) ?? priorityWeights.personality
      continue
    }

    rawData[target] = value
  }

  rawData.priority_weights = priorityWeights

  return normalizeRawApplication(rawData)
}

export function normalizeRawApplication(rawData: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = { ...rawData }

  const numericFields: Array<keyof ApplicationFormValues> = [
    'age',
    'preferred_partner_age_min',
    'preferred_partner_age_max',
  ]

  for (const field of numericFields) {
    if (field in normalized) {
      normalized[field] = parseNumericValue(normalized[field])
    }
  }

  const booleanFields: Array<keyof ApplicationFormValues> = [
    'okay_with_some_deviation',
    'comfortable_with_man_asking_woman',
    'comfortable_with_alcohol_meetcute',
  ]

  for (const field of booleanFields) {
    if (field in normalized) {
      normalized[field] = parseBooleanValue(normalized[field])
    }
  }

  if ('ready_for_love' in normalized) {
    normalized.ready_for_love = parseReadinessValue(normalized.ready_for_love)
  }

  const lifestyleFields = [
    ...LIFESTYLE_ATTRIBUTES.flatMap((attr) => [attr.self, attr.partner]),
  ] as Array<keyof ApplicationFormValues>

  for (const field of lifestyleFields) {
    if (field in normalized) {
      normalized[field] = parseLifestyleValue(normalized[field], field.startsWith('partner_'))
    }
  }

  if ('gender' in normalized) {
    normalized.gender = parseGenderValue(normalized.gender)
  }

  if ('birthday' in normalized) {
    normalized.birthday = parseDateValue(normalized.birthday)
  }

  if ('priority_weights' in normalized) {
    normalized.priority_weights = normalizePriorityWeights(normalized.priority_weights)
  }

  return normalized
}

export function formatRowSummary(rawData: Record<string, unknown>): string {
  const name = String(rawData.full_name ?? 'Unknown')
  const contact = rawData.contact_info ? ` (${String(rawData.contact_info)})` : ''
  return `${name}${contact}`
}

function normalizePriorityWeights(value: unknown) {
  const incoming = typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}

  return {
    pedigree: parseNumericValue(incoming.pedigree) ?? DEFAULT_PRIORITY_WEIGHTS.pedigree,
    looks: parseNumericValue(incoming.looks) ?? DEFAULT_PRIORITY_WEIGHTS.looks,
    personality: parseNumericValue(incoming.personality) ?? DEFAULT_PRIORITY_WEIGHTS.personality,
  }
}

function normalizeEmpty(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined

  const trimmed = String(value).trim()
  return trimmed === '' ? undefined : trimmed
}

function parseNumericValue(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined

  const cleaned = String(value).replace(/[%,$\s]/g, '')
  const numeric = Number(cleaned)
  return Number.isFinite(numeric) ? numeric : undefined
}

function parseBooleanValue(value: unknown): boolean | undefined {
  if (value === null || value === undefined || value === '') return undefined

  const normalized = String(value).trim().toLowerCase()
  if (['true', 'yes', 'y', '1', 'both', 'comfortable', 'ok', 'okay'].includes(normalized)) return true
  if (['false', 'no', 'n', '0', 'not comfortable'].includes(normalized)) return false
  return undefined
}

function parseReadinessValue(value: unknown): string | undefined {
  if (value === null || value === undefined || value === '') return undefined

  const normalized = normalizeHeader(String(value))
  if (['yes', 'ready', 'yesready', 'forapartneryes'].includes(normalized)) return 'yes'
  if (['notsure', 'maybe', 'somewhat', 'open', 'openbutcautious'].includes(normalized)) return 'not_sure'
  if (['no', 'notrightnow', 'notready'].includes(normalized)) return 'no'

  return String(value)
}

function parseLifestyleValue(value: unknown, isPartnerField: boolean): string | undefined {
  if (value === null || value === undefined || value === '') return undefined

  const normalized = normalizeHeader(String(value))
  if (['yes', 'want', 'have', 'has', 'true', 'bothyes'].includes(normalized)) return 'want'
  if (['no', 'dontwant', 'do not want', 'false', 'none'].includes(normalized)) return 'dont_want'
  if (['maybe', 'sometimes', 'flexible', 'open', 'depends', 'either'].includes(normalized)) return 'flexible'
  if (!isPartnerField && ['both'].includes(normalized)) return 'want'

  return String(value)
}

function parseGenderValue(value: unknown): string | undefined {
  if (value === null || value === undefined || value === '') return undefined

  const normalized = normalizeHeader(String(value))
  if (['m', 'male', 'man'].includes(normalized)) return 'man'
  if (['f', 'female', 'woman'].includes(normalized)) return 'woman'
  if (['nonbinary', 'non-binary', 'nb'].includes(normalized)) return 'non_binary'
  if (['prefernottosay', 'notsay'].includes(normalized)) return 'prefer_not_to_say'

  return String(value)
}

function parseDateValue(value: unknown): string | undefined {
  if (value === null || value === undefined || value === '') return undefined

  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return String(value)

  return date.toISOString().slice(0, 10)
}

export function buildErrorReport(rows: CsvPreviewRow[]): string {
  return rows
    .filter((row) => row.status !== 'valid')
    .map((row) => {
      const parts = [
        `Row ${row.rowNumber}: ${row.summary}`,
        ...row.duplicateReasons.map((reason) => `Duplicate: ${reason}`),
        ...row.errors.map((error) => `Error: ${error}`),
      ]
      return parts.join(' | ')
    })
    .join('\n')
}

export function hasMappedFields(mapping: CsvImportMapping): boolean {
  return Object.values(mapping).some(Boolean)
}

export function getMappedTargets(mapping: CsvImportMapping): CsvImportField[] {
  return Object.values(mapping).filter((value): value is CsvImportField => Boolean(value))
}

export function hasDuplicateMappedTargets(mapping: CsvImportMapping): boolean {
  const seen = new Set<CsvImportField>()
  for (const target of getMappedTargets(mapping)) {
    if (PRIORITY_TARGETS.includes(target as typeof PRIORITY_TARGETS[number])) continue
    if (seen.has(target)) return true
    seen.add(target)
  }
  return false
}
