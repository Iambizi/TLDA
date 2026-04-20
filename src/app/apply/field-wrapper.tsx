'use client'

interface FieldWrapperProps {
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

export function FieldWrapper({ label, hint, error, required, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: 'var(--neutral-700)' }}>
        {label}
        {required && <span className="ml-1" style={{ color: 'var(--accent)' }}>*</span>}
      </label>
      {hint && <p className="text-xs" style={{ color: 'var(--muted)' }}>{hint}</p>}
      {children}
      {error && (
        <p className="text-xs" style={{ color: '#b91c1c' }} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
