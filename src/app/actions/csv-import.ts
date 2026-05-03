'use server'

import { revalidatePath } from 'next/cache'
import { ApplicationFormSchema, type ApplicationFormValues } from '@/lib/schemas'
import { fetchMutation, fetchQuery } from 'convex/nextjs'
import { api } from '../../../convex/_generated/api'
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

    let insertedCount = 0

    for (const row of validRows) {
      try {
        await fetchMutation(api.applications.submitApplication, row.parsedData as any)
        insertedCount += 1
      } catch (err: any) {
        console.error('CSV application insert error:', err)
        throw new Error(`Unable to create application for row ${row.rowNumber}.`)
      }
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
  const uniqueContacts = Array.from(new Set(rows.map((row) => String(row.rawData.contact_info ?? '').trim()).filter(Boolean)))
  const uniqueNames = Array.from(new Set(rows.map((row) => String(row.rawData.full_name ?? '').trim()).filter(Boolean)))

  if (uniqueContacts.length === 0 && uniqueNames.length === 0) return []

  const duplicates = await fetchQuery(api.import.getDuplicates, {
    contacts: uniqueContacts,
    names: uniqueNames,
  })

  return duplicates.map(d => ({
    id: d.id,
    contact_info: d.contact_info,
    full_name: d.full_name,
    birthday: d.birthday || null,
  }))
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
