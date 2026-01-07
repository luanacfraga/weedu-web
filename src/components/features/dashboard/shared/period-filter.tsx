'use client'

import { Button } from '@/components/ui/button'
import type { DatePreset } from '@/lib/utils/date-presets'

interface PeriodFilterProps {
  selected: DatePreset
  onChange: (preset: DatePreset) => void
}

const presetOptions: Array<{ value: DatePreset; label: string }> = [
  { value: 'esta-semana', label: 'Esta Semana' },
  { value: 'ultimas-2-semanas', label: 'Últimas 2 Semanas' },
  { value: 'este-mes', label: 'Este Mês' },
  { value: 'ultimos-30-dias', label: 'Últimos 30 Dias' },
]

export function PeriodFilter({ selected, onChange }: PeriodFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {presetOptions.map((option) => (
        <Button
          key={option.value}
          variant={selected === option.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
