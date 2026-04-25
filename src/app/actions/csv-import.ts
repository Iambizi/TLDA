'use server'

import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'
import { ApplicationFormSchema, type ApplicationFormValues } from '@/lib/schemas'
import { createClient } from '@/lib/supabase/server'
import {
  buildErrorReport,
  buildRawApplicationFromRow,
  formatRowSummary,
  hasDuplicateMappedTargets,
  hasMappedFields,
  parseCsvHeaders,
  parseCsvRows,
  type CsvImportExecutionResult,
  type CsvImportInput,
  type CsvPreviewResult,
  type CsvPreviewRow,
} from '@/lib/csv-import'

type ActionError = { error: string }

interface PreparedImportRow {
  rowNumber: number
  rawData: Record<string, unknown>
  parsedData: ApplicationFormValues | null
  summary: string
  status: 'valid' | 'duplicate' | 'error'
  errors: string[]
  duplicateReasons: string[]
}

interface ExistingParticipantMatch {
  id: string
  contact_info: string
  full_name: string
  birthday: string | null
}

export async function previewCsvApplicantImport(
  input: CsvImportInput
): Promise<CsvPreviewResult | ActionError> {
  try {
    const analysis = await analyzeCsvApplicantImport(input)
    return buildPreviewResult(analysis.headers, analysis.preparedRows)
  } catch (error) {
    console.error('CSV preview error:', error)
    return { error: error instanceof Error ? error.message : 'Unable to preview CSV import.' }
  }
}

export async function importCsvApplicants(
  input: CsvImportInput
): Promise<CsvImportExecutionResult | ActionError> {
  try {
    const analysis = await analyzeCsvApplicantImport(input)
    const validRows = analysis.preparedRows.filter(
      (row): row is PreparedImportRow & { parsedData: ApplicationFormValues } =>
        row.status === 'valid' && row.parsedData !== null
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = await createClient() as any

    let insertedCount = 0

    for (const row of validRows) {
      const participantId = randomUUID()

      const { error: participantError } = await supabase
        .from('participants')
        .insert({
          id: participantId,
          full_name: row.parsedData.full_name,
          contact_info: row.parsedData.contact_info,
          gender: row.parsedData.gender,
          age: row.parsedData.age,
          birthday: row.parsedData.birthday || null,
          work: row.parsedData.work || null,
          dream_city: row.parsedData.dream_city || null,
          ask_out_preference: row.parsedData.ask_out_preference || null,
          comfortable_with_man_asking_woman: row.parsedData.comfortable_with_man_asking_woman,
          comfortable_with_alcohol_meetcute: row.parsedData.comfortable_with_alcohol_meetcute,
          life_in_5_years: row.parsedData.life_in_5_years || null,
          last_thing_that_made_you_laugh: row.parsedData.last_thing_that_made_you_laugh || null,
          dream_date: row.parsedData.dream_date || null,
          family_notes: row.parsedData.family_notes || null,
          vice_or_red_flag: row.parsedData.vice_or_red_flag || null,
          dealbreaker: row.parsedData.dealbreaker || null,
          random_curiosities: row.parsedData.random_curiosities || null,
          referral_notes: row.parsedData.referral_notes || null,
          values_or_worldview: row.parsedData.values_or_worldview || null,
          priority_weights: row.parsedData.priority_weights,
          ready_for_love: row.parsedData.ready_for_love,
          grand_amour: row.parsedData.grand_amour || null,
          preferred_partner_age_min: row.parsedData.preferred_partner_age_min,
          preferred_partner_age_max: row.parsedData.preferred_partner_age_max,
          okay_with_some_deviation: row.parsedData.okay_with_some_deviation,
          has_kids: row.parsedData.has_kids,
          partner_has_kids: row.parsedData.partner_has_kids,
          travels_world: row.parsedData.travels_world,
          partner_travels_world: row.parsedData.partner_travels_world,
          is_divorced: row.parsedData.is_divorced,
          partner_is_divorced: row.parsedData.partner_is_divorced,
          smokes_drug_friendly: row.parsedData.smokes_drug_friendly,
          partner_smokes_drug_friendly: row.parsedData.partner_smokes_drug_friendly,
          has_tattoos: row.parsedData.has_tattoos,
          partner_has_tattoos: row.parsedData.partner_has_tattoos,
          fitness_level: row.parsedData.fitness_level,
          partner_fitness: row.parsedData.partner_fitness,
          close_with_family: row.parsedData.close_with_family,
          partner_close_with_family: row.parsedData.partner_close_with_family,
        })

      if (participantError) {
        console.error('CSV participant insert error:', participantError)
        throw new Error(`Unable to import row ${row.rowNumber}.`)
      }

      const { error: applicationError } = await supabase
        .from('applications')
        .insert({
          participant_id: participantId,
          status: 'applied',
          interview_required: false,
          interview_completed: false,
          source_event_id: null,
          organizer_notes: null,
          tags: null,
          interview_date: null,
          assigned_event_id: null,
        })

      if (applicationError) {
        console.error('CSV application insert error:', applicationError)
        await supabase.from('participants').delete().eq('id', participantId)
        throw new Error(`Unable to create application for row ${row.rowNumber}.`)
      }

      insertedCount += 1
    }

    revalidatePath('/participants')
    revalidatePath('/dashboard')

    return {
      insertedCount,
      skippedDuplicates: analysis.preparedRows.filter((row) => row.status === 'duplicate').length,
      validationErrors: analysis.preparedRows.filter((row) => row.status === 'error').length,
      totalRows: analysis.preparedRows.length,
      errorReport: buildErrorReport(analysis.preparedRows.map(toPreviewRow)),
    }
  } catch (error) {
    console.error('CSV import error:', error)
    return { error: error instanceof Error ? error.message : 'Unable to import CSV rows.' }
  }
}

async function analyzeCsvApplicantImport(input: CsvImportInput): Promise<{ headers: string[]; preparedRows: PreparedImportRow[] }> {
  if (!input.csvText.trim()) {
    throw new Error('Upload a CSV file before previewing.')
  }

  if (!hasMappedFields(input.mapping)) {
    throw new Error('Map at least one CSV column before previewing.')
  }

  if (hasDuplicateMappedTargets(input.mapping)) {
    throw new Error('Each destination field can only be mapped once.')
  }

  const headers = parseCsvHeaders(input.csvText)
  const rows = parseCsvRows(input.csvText)

  if (rows.length === 0) {
    throw new Error('The CSV did not contain any data rows.')
  }

  const preliminaryRows = rows.map((row, index) => {
    const rawData = buildRawApplicationFromRow(row, input.mapping)
    return {
      rowNumber: index + 2,
      rawData,
      summary: formatRowSummary(rawData),
      normalizedContact: normalizeText(rawData.contact_info),
      normalizedNameBirthday: buildNameBirthdayKey(rawData.full_name, rawData.birthday),
    }
  })

  const existingParticipants = await loadExistingParticipantMatches(preliminaryRows)
  const existingContacts = new Set(existingParticipants.map((participant) => normalizeText(participant.contact_info)))
  const existingNameBirthdays = new Set(
    existingParticipants
      .map((participant) => buildNameBirthdayKey(participant.full_name, participant.birthday))
      .filter((value): value is string => Boolean(value))
  )

  const seenContacts = new Set<string>()
  const seenNameBirthdays = new Set<string>()

  const preparedRows = preliminaryRows.map((row) => {
    const parsed = ApplicationFormSchema.safeParse(row.rawData)
    const duplicateReasons: string[] = []

    if (row.normalizedContact) {
      if (seenContacts.has(row.normalizedContact)) {
        duplicateReasons.push('Duplicate contact info within this CSV.')
      }
      if (existingContacts.has(row.normalizedContact)) {
        duplicateReasons.push('Contact info already exists in the database.')
      }
      seenContacts.add(row.normalizedContact)
    }

    if (row.normalizedNameBirthday) {
      if (seenNameBirthdays.has(row.normalizedNameBirthday)) {
        duplicateReasons.push('Duplicate full name + birthday within this CSV.')
      }
      if (existingNameBirthdays.has(row.normalizedNameBirthday)) {
        duplicateReasons.push('Full name + birthday already exists in the database.')
      }
      seenNameBirthdays.add(row.normalizedNameBirthday)
    }

    const errors = parsed.success
      ? []
      : parsed.error.issues.map((issue) => `${issue.path.join('.') || 'row'}: ${issue.message}`)

    return {
      rowNumber: row.rowNumber,
      rawData: row.rawData,
      parsedData: parsed.success ? parsed.data : null,
      summary: row.summary,
      status: duplicateReasons.length > 0 ? 'duplicate' : errors.length > 0 ? 'error' : 'valid',
      errors,
      duplicateReasons,
    } satisfies PreparedImportRow
  })

  return { headers, preparedRows }
}

async function loadExistingParticipantMatches(
  rows: Array<{
    normalizedContact?: string
    normalizedNameBirthday?: string
    rawData: Record<string, unknown>
  }>
): Promise<ExistingParticipantMatch[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any
  const uniqueContacts = Array.from(new Set(rows.map((row) => String(row.rawData.contact_info ?? '').trim()).filter(Boolean)))
  const uniqueNames = Array.from(new Set(rows.map((row) => String(row.rawData.full_name ?? '').trim()).filter(Boolean)))

  const queries: Array<Promise<{ data: ExistingParticipantMatch[] | null }>> = []

  if (uniqueContacts.length > 0) {
    queries.push(
      supabase
        .from('participants')
        .select('id, contact_info, full_name, birthday')
        .in('contact_info', uniqueContacts)
    )
  }

  if (uniqueNames.length > 0) {
    queries.push(
      supabase
        .from('participants')
        .select('id, contact_info, full_name, birthday')
        .in('full_name', uniqueNames)
    )
  }

  if (queries.length === 0) return []

  const results = await Promise.all(queries)
  const deduped = new Map<string, ExistingParticipantMatch>()

  for (const result of results) {
    for (const participant of result.data ?? []) {
      deduped.set(participant.id, participant)
    }
  }

  return Array.from(deduped.values())
}

function buildPreviewResult(headers: string[], preparedRows: PreparedImportRow[]): CsvPreviewResult {
  const rows = preparedRows.map(toPreviewRow)

  return {
    headers,
    rowCount: rows.length,
    validCount: rows.filter((row) => row.status === 'valid').length,
    duplicateCount: rows.filter((row) => row.status === 'duplicate').length,
    errorCount: rows.filter((row) => row.status === 'error').length,
    rows,
    errorReport: buildErrorReport(rows),
  }
}

function toPreviewRow(row: PreparedImportRow): CsvPreviewRow {
  return {
    rowNumber: row.rowNumber,
    status: row.status,
    summary: row.summary,
    errors: row.errors,
    duplicateReasons: row.duplicateReasons,
  }
}

function normalizeText(value: unknown): string | undefined {
  if (!value) return undefined
  const normalized = String(value).trim().toLowerCase()
  return normalized === '' ? undefined : normalized
}

function buildNameBirthdayKey(name: unknown, birthday: unknown): string | undefined {
  const normalizedName = normalizeText(name)
  const normalizedBirthday = typeof birthday === 'string' && birthday.trim() ? birthday.trim() : undefined

  if (!normalizedName || !normalizedBirthday) return undefined
  return `${normalizedName}::${normalizedBirthday}`
}
