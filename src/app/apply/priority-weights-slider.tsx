'use client'

import { useState } from 'react'
import type { PriorityWeights } from '@/types'

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
    <div className="flex flex-col gap-4">
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
        </div>
      ))}
      <p className="text-xs text-right tabular-nums" style={{ color: 'var(--muted)' }}>
        Total: {Object.values(value).reduce((s, v) => s + v, 0)}%
      </p>
    </div>
  )
}
