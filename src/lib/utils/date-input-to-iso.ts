export function dateInputToISO(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)).toISOString()
}
