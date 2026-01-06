export type DatePreset = 'esta-semana' | 'ultimas-2-semanas' | 'este-mes' | 'ultimos-30-dias'

export interface DateRange {
  dateFrom: string // ISO string
  dateTo: string // ISO string
}

export interface DatePresetOption {
  id: DatePreset
  label: string
  getRange: () => DateRange
}

/**
 * Get Monday of current week at 00:00:00
 */
function getMonday(): Date {
  const today = new Date()
  const day = today.getDay()
  const diff = day === 0 ? 6 : day - 1 // Sunday is 0, Monday is 1
  const monday = new Date(today)
  monday.setDate(today.getDate() - diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

/**
 * Get Sunday of current week at 23:59:59
 */
function getSunday(): Date {
  const monday = getMonday()
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return sunday
}

/**
 * Esta Semana: Segunda-feira até Domingo da semana atual
 */
export function getThisWeekRange(): DateRange {
  return {
    dateFrom: getMonday().toISOString(),
    dateTo: getSunday().toISOString(),
  }
}

/**
 * Últimas 2 Semanas: 14 dias atrás até hoje
 */
export function getLastTwoWeeksRange(): DateRange {
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const twoWeeksAgo = new Date(today)
  twoWeeksAgo.setDate(today.getDate() - 14)
  twoWeeksAgo.setHours(0, 0, 0, 0)

  return {
    dateFrom: twoWeeksAgo.toISOString(),
    dateTo: today.toISOString(),
  }
}

/**
 * Este Mês: Dia 1 até último dia do mês atual
 */
export function getThisMonthRange(): DateRange {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  firstDay.setHours(0, 0, 0, 0)

  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  lastDay.setHours(23, 59, 59, 999)

  return {
    dateFrom: firstDay.toISOString(),
    dateTo: lastDay.toISOString(),
  }
}

/**
 * Últimos 30 Dias: 30 dias atrás até hoje
 */
export function getLastThirtyDaysRange(): DateRange {
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)
  thirtyDaysAgo.setHours(0, 0, 0, 0)

  return {
    dateFrom: thirtyDaysAgo.toISOString(),
    dateTo: today.toISOString(),
  }
}

/**
 * All available date presets
 */
export const datePresets: DatePresetOption[] = [
  {
    id: 'esta-semana',
    label: 'Esta Semana',
    getRange: getThisWeekRange,
  },
  {
    id: 'ultimas-2-semanas',
    label: 'Últimas 2 Semanas',
    getRange: getLastTwoWeeksRange,
  },
  {
    id: 'este-mes',
    label: 'Este Mês',
    getRange: getThisMonthRange,
  },
  {
    id: 'ultimos-30-dias',
    label: 'Últimos 30 Dias',
    getRange: getLastThirtyDaysRange,
  },
]

/**
 * Get preset by ID
 */
export function getPresetById(id: DatePreset): DatePresetOption | undefined {
  return datePresets.find(p => p.id === id)
}
