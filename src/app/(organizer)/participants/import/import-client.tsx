'use client'

import { startTransition, useMemo, useState, useTransition } from 'react'
import {
  autoMapHeaders,
  CSV_IMPORT_FIELD_OPTIONS,
  parseCsvHeaders,
  type CsvImportExecutionResult,
  type CsvImportMapping,
  type CsvPreviewResult,
} from '@/lib/csv-import'
import { importCsvApplicants, previewCsvApplicantImport } from '@/app/actions/csv-import'

export function ImportClient() {
  const [fileName, setFileName] = useState('')
  const [csvText, setCsvText] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<CsvImportMapping>({})
  const [previewResult, setPreviewResult] = useState<CsvPreviewResult | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<CsvImportExecutionResult | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [isPreviewPending, startPreviewTransition] = useTransition()
  const [isImportPending, startImportTransition] = useTransition()

  const mappedCount = useMemo(
    () => Object.values(mapping).filter(Boolean).length,
    [mapping]
  )

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const nextCsvText = await file.text()
      const nextHeaders = parseCsvHeaders(nextCsvText)
      const nextMapping = autoMapHeaders(nextHeaders)

      setFileName(file.name)
      setCsvText(nextCsvText)
      setHeaders(nextHeaders)
      setMapping(nextMapping)
      setPreviewResult(null)
      setPreviewError(null)
      setImportResult(null)
      setImportError(null)
    } catch (error) {
      setPreviewResult(null)
      setImportResult(null)
      setHeaders([])
      setMapping({})
      setCsvText('')
      setFileName(file.name)
      setPreviewError(error instanceof Error ? error.message : 'Unable to read this CSV file.')
    }
  }

  function updateMapping(header: string, value: string) {
    setMapping((current) => ({
      ...current,
      [header]: value as CsvImportMapping[string],
    }))
    setPreviewResult(null)
    setImportResult(null)
    setPreviewError(null)
    setImportError(null)
  }

  function handlePreview() {
    setImportResult(null)
    setImportError(null)
    startPreviewTransition(async () => {
      const result = await previewCsvApplicantImport({ csvText, mapping })
      if ('error' in result) {
        setPreviewError(result.error)
        setPreviewResult(null)
        return
      }
      setPreviewError(null)
      setPreviewResult(result)
    })
  }

  function handleImport() {
    setImportError(null)
    startImportTransition(async () => {
      const result = await importCsvApplicants({ csvText, mapping })
      if ('error' in result) {
        setImportError(result.error)
        return
      }
      setImportResult(result)
      startTransition(() => {
        setPreviewResult((current) =>
          current
            ? {
                ...current,
                validCount: 0,
              }
            : current
        )
      })
    })
  }

  async function copyErrorReport(text: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      setImportError('Could not copy the error report to the clipboard.')
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div
        className="rounded-2xl border p-6 shadow-sm"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--neutral-900)' }}>
          Upload CSV
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
          Upload the organizer&apos;s existing spreadsheet export. We&apos;ll auto-map headers, validate each row against the current intake schema, and only import clean applicants.
        </p>

        <div className="flex flex-col gap-3">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="form-input"
          />
          {fileName && (
            <p className="text-sm" style={{ color: 'var(--neutral-600)' }}>
              Loaded <span className="font-medium">{fileName}</span> with {headers.length} columns.
            </p>
          )}
        </div>
      </div>

      {headers.length > 0 && (
        <div
          className="rounded-2xl border p-6 shadow-sm"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between mb-4 gap-4">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--neutral-900)' }}>
                Confirm Column Mapping
              </h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {mappedCount} of {headers.length} columns mapped.
              </p>
            </div>
            <button
              type="button"
              onClick={handlePreview}
              disabled={!csvText || isPreviewPending}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
              style={{ background: isPreviewPending ? 'var(--neutral-400)' : 'var(--accent)' }}
            >
              {isPreviewPending ? 'Previewing...' : 'Preview Import'}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50/50 border-b" style={{ borderColor: 'var(--border)' }}>
                <tr>
                  <th className="px-4 py-3 font-medium">CSV Header</th>
                  <th className="px-4 py-3 font-medium">Import As</th>
                </tr>
              </thead>
              <tbody>
                {headers.map((header, index) => (
                  <tr
                    key={header}
                    style={index === 0 ? undefined : { boxShadow: 'inset 0 1px 0 rgba(148, 163, 184, 0.14)' }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--neutral-800)' }}>
                      {header}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={mapping[header] ?? ''}
                        onChange={(event) => updateMapping(header, event.target.value)}
                        className="form-input"
                      >
                        {CSV_IMPORT_FIELD_OPTIONS.map((option) => (
                          <option key={option.value || 'ignore'} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(previewError || importError) && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{ background: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' }}
        >
          {previewError || importError}
        </div>
      )}

      {previewResult && (
        <div className="flex flex-col gap-6">
          <div
            className="rounded-2xl border p-6 shadow-sm"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--neutral-900)' }}>
                  Preview Results
                </h2>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {previewResult.rowCount} rows scanned. {previewResult.validCount} valid, {previewResult.duplicateCount} duplicates, {previewResult.errorCount} with validation errors.
                </p>
              </div>
              <button
                type="button"
                onClick={handleImport}
                disabled={previewResult.validCount === 0 || isImportPending}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                style={{ background: isImportPending ? 'var(--neutral-400)' : 'var(--neutral-900)' }}
              >
                {isImportPending ? 'Importing...' : 'Import Valid Rows'}
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                ['Total Rows', previewResult.rowCount],
                ['Valid Rows', previewResult.validCount],
                ['Duplicates', previewResult.duplicateCount],
                ['Errors', previewResult.errorCount],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border px-4 py-3"
                  style={{ borderColor: 'var(--border)', background: 'var(--neutral-50)' }}
                >
                  <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    {label}
                  </p>
                  <p className="text-2xl font-semibold" style={{ color: 'var(--neutral-900)' }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
              <table className="w-full text-sm text-left">
                <thead className="bg-neutral-50/50 border-b" style={{ borderColor: 'var(--border)' }}>
                  <tr>
                    <th className="px-4 py-3 font-medium">Row</th>
                    <th className="px-4 py-3 font-medium">Summary</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {previewResult.rows.map((row, index) => (
                    <tr
                      key={row.rowNumber}
                      style={index === 0 ? undefined : { boxShadow: 'inset 0 1px 0 rgba(148, 163, 184, 0.14)' }}
                    >
                      <td className="px-4 py-3 tabular-nums" style={{ color: 'var(--neutral-600)' }}>
                        {row.rowNumber}
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--neutral-800)' }}>
                        {row.summary}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
                          style={{
                            background:
                              row.status === 'valid'
                                ? '#dcfce7'
                                : row.status === 'duplicate'
                                  ? '#fef3c7'
                                  : '#fee2e2',
                            color:
                              row.status === 'valid'
                                ? '#166534'
                                : row.status === 'duplicate'
                                  ? '#92400e'
                                  : '#b91c1c',
                          }}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--neutral-600)' }}>
                        {[...row.duplicateReasons, ...row.errors].join(' | ') || 'Ready to import'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {previewResult.errorReport && (
            <div
              className="rounded-2xl border p-6 shadow-sm"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between gap-4 mb-3">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--neutral-900)' }}>
                    Error Report
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    Copy this report to clean up rejected or duplicate rows in the source spreadsheet.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyErrorReport(previewResult.errorReport)}
                  className="rounded-xl border px-4 py-2 text-sm font-medium"
                  style={{ borderColor: 'var(--border)', color: 'var(--neutral-700)' }}
                >
                  Copy Report
                </button>
              </div>
              <textarea
                readOnly
                value={previewResult.errorReport}
                rows={Math.min(12, Math.max(4, previewResult.errorReport.split('\n').length))}
                className="form-input font-mono text-xs"
              />
            </div>
          )}
        </div>
      )}

      {importResult && (
        <div
          className="rounded-2xl border p-6 shadow-sm"
          style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}
        >
          <h2 className="text-lg font-semibold mb-2" style={{ color: '#047857' }}>
            Import Complete
          </h2>
          <p className="text-sm" style={{ color: '#065f46' }}>
            Inserted {importResult.insertedCount} applicants from {importResult.totalRows} CSV rows. Skipped {importResult.skippedDuplicates} duplicates and {importResult.validationErrors} validation failures.
          </p>
        </div>
      )}
    </div>
  )
}
