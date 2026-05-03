'use client'

const CATEGORY_LABELS: Record<string, string> = {
  pedigree: 'Background / Pedigree',
  looks: 'Looks',
  personality: 'Personality',
}

interface PriorityWeightsSliderProps {
  value: Record<string, number>
  onChange: (value: Record<string, number>) => void
}

export function PriorityWeightsSlider({ value, onChange }: PriorityWeightsSliderProps) {
  const keys = Object.keys(value)

  function handleChange(changedKey: string, newValue: number) {
    const delta = newValue - value[changedKey]
    const otherKeys = keys.filter((k) => k !== changedKey)

    // Distribute the delta proportionally across the other sliders
    const totalOther = otherKeys.reduce((sum, k) => sum + value[k], 0)
    const newWeights: Record<string, number> = { ...value, [changedKey]: newValue }

    if (totalOther > 0) {
      let distributed = 0
      otherKeys.forEach((k, i) => {
        if (i === otherKeys.length - 1) {
          // Last key gets the remainder to ensure exact sum of 100
          newWeights[k] = Math.max(0, value[k] - (delta - distributed))
        } else {
          const share = Math.round((value[k] / totalOther) * delta)
          newWeights[k] = Math.max(0, value[k] - share)
          distributed += share
        }
      })
    }

    // Ensure total = 100 (fix rounding)
    const total = Object.values(newWeights).reduce((s, v) => s + v, 0)
    if (total !== 100) {
      const lastKey = otherKeys[otherKeys.length - 1] ?? changedKey
      newWeights[lastKey] = Math.max(0, (newWeights[lastKey] ?? 0) + (100 - total))
    }

    onChange(newWeights)
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center">
      {/* Sliders */}
      <div className="flex flex-col gap-4 flex-1 w-full">
        {keys.map((key) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm" style={{ color: 'var(--neutral-700)' }}>
                {CATEGORY_LABELS[key] ?? key}
              </span>
              <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--accent)' }}>
                {value[key]}%
              </span>
            </div>
            <input
              id={`slider-${key}`}
              type="range"
              min={0}
              max={100}
              step={1}
              value={value[key]}
              onChange={(e) => handleChange(key, Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: 'var(--accent)' }}
            />
            <input
              id={`input-${key}`}
              type="number"
              min={0}
              max={100}
              step={1}
              value={value[key]}
              onChange={(e) => handleChange(key, Number(e.target.value))}
              className="mt-2 w-24 rounded-lg border px-3 py-1.5 text-sm tabular-nums"
              style={{ borderColor: 'var(--border)', color: 'var(--neutral-900)', background: 'white' }}
              aria-label={`${CATEGORY_LABELS[key] ?? key} percentage`}
            />
          </div>
        ))}
        <p className="text-xs text-right tabular-nums mt-1" style={{ color: 'var(--muted)' }}>
          Total: {Object.values(value).reduce((s, v) => s + v, 0)}%
        </p>
      </div>

      {/* Venn Diagram Visual */}
      <div className="shrink-0 relative w-48 h-48 sm:w-56 sm:h-56 bg-neutral-50 rounded-full border border-neutral-100 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
          {/* Personality (Top) */}
          <circle 
            cx="100" 
            cy="70" 
            r={Math.max(0, Math.sqrt(((value.personality || 0) / 100) * (85 * 85)))} 
            fill="#3b82f6" 
            opacity="0.5" 
            style={{ mixBlendMode: 'multiply', transition: 'all 0.2s ease-out' }} 
          />
          {/* Looks (Bottom Left) */}
          <circle 
            cx="75" 
            cy="115" 
            r={Math.max(0, Math.sqrt(((value.looks || 0) / 100) * (85 * 85)))} 
            fill="#ec4899" 
            opacity="0.5" 
            style={{ mixBlendMode: 'multiply', transition: 'all 0.2s ease-out' }} 
          />
          {/* Pedigree (Bottom Right) */}
          <circle 
            cx="125" 
            cy="115" 
            r={Math.max(0, Math.sqrt(((value.pedigree || 0) / 100) * (85 * 85)))} 
            fill="#eab308" 
            opacity="0.5" 
            style={{ mixBlendMode: 'multiply', transition: 'all 0.2s ease-out' }} 
          />
        </svg>
      </div>
    </div>
  )
}
