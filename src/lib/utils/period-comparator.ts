import {
  type DatePreset,
  getThisWeekRange,
  getLastTwoWeeksRange,
  getThisMonthRange,
  getLastThirtyDaysRange,
} from './date-presets'

export interface DateRange {
  dateFrom: string
  dateTo: string
}

/**
 * Retorna o período anterior equivalente ao período dado
 *
 * @example
 * // Se período atual é Esta Semana (05-11 Jan)
 * // Retorna Semana Passada (29 Dez - 04 Jan)
 * getPreviousPeriod('esta-semana')
 */
export function getPreviousPeriod(preset: DatePreset): DateRange {
  const currentRange = getPresetRange(preset)

  const currentStart = new Date(currentRange.dateFrom)
  const currentEnd = new Date(currentRange.dateTo)

  // Calcula duração do período em milissegundos
  const duration = currentEnd.getTime() - currentStart.getTime()

  // Período anterior termina 1ms antes do início do atual
  const previousEnd = new Date(currentStart.getTime() - 1)

  // Período anterior começa duração antes do fim
  const previousStart = new Date(previousEnd.getTime() - duration)

  return {
    dateFrom: previousStart.toISOString(),
    dateTo: previousEnd.toISOString(),
  }
}

/**
 * Retorna o range de datas para um preset
 */
export function getPresetRange(preset: DatePreset): DateRange {
  switch (preset) {
    case 'esta-semana':
      return getThisWeekRange()
    case 'ultimas-2-semanas':
      return getLastTwoWeeksRange()
    case 'este-mes':
      return getThisMonthRange()
    case 'ultimos-30-dias':
      return getLastThirtyDaysRange()
    default:
      return getThisWeekRange()
  }
}

/**
 * Formata um range de datas para exibição
 *
 * @example
 * formatPeriodRange({ dateFrom: '2026-01-05', dateTo: '2026-01-11' })
 * // => "05 a 11 de Jan"
 */
export function formatPeriodRange(range: DateRange): string {
  const start = new Date(range.dateFrom)
  const end = new Date(range.dateTo)

  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ]

  const startDay = start.getDate()
  const endDay = end.getDate()
  const month = monthNames[end.getMonth()]

  if (start.getMonth() === end.getMonth()) {
    return `${startDay} a ${endDay} de ${month}`
  }

  const startMonth = monthNames[start.getMonth()]
  return `${startDay} de ${startMonth} a ${endDay} de ${month}`
}

/**
 * Retorna label descritivo para comparação de períodos
 *
 * @example
 * getPeriodComparisonLabel('esta-semana')
 * // => "Esta Semana vs Semana Passada"
 */
export function getPeriodComparisonLabel(preset: DatePreset): string {
  switch (preset) {
    case 'esta-semana':
      return 'Esta Semana vs Semana Passada'
    case 'ultimas-2-semanas':
      return 'Últimas 2 Semanas vs 2 Semanas Anteriores'
    case 'este-mes':
      return 'Este Mês vs Mês Passado'
    case 'ultimos-30-dias':
      return 'Últimos 30 Dias vs 30 Dias Anteriores'
    default:
      return 'Período Atual vs Período Anterior'
  }
}
