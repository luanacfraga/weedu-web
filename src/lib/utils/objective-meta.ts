export type ObjectiveMeta = {
  objective?: string
  objectiveDue?: string // YYYY-MM-DD
}

const START = '[[tooldo-meta]]'
const END = '[[/tooldo-meta]]'

function normalizeLineValue(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

function normalizeObjective(value?: string): string | undefined {
  const v = value?.trim()
  if (!v) return undefined
  return normalizeLineValue(v)
}

function normalizeObjectiveDue(value?: string): string | undefined {
  const v = value?.trim()
  if (!v) return undefined
  // Accept YYYY-MM-DD (input[type=date])
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return undefined
  return v
}

export function parseObjectiveMeta(description: string): {
  cleanDescription: string
  meta: ObjectiveMeta
} {
  const raw = description ?? ''
  const startIdx = raw.indexOf(START)
  const endIdx = raw.indexOf(END)
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    return { cleanDescription: raw, meta: {} }
  }

  const before = raw.slice(0, startIdx).trimEnd()
  const inside = raw.slice(startIdx + START.length, endIdx).trim()

  let objective: string | undefined
  let objectiveDue: string | undefined

  inside.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed) return
    const [k, ...rest] = trimmed.split(':')
    const key = k?.trim().toLowerCase()
    const value = rest.join(':').trim()
    if (!key || !value) return
    if (key === 'objective') objective = normalizeObjective(value)
    if (key === 'objectivedue') objectiveDue = normalizeObjectiveDue(value)
  })

  return {
    cleanDescription: before,
    meta: {
      ...(objective ? { objective } : {}),
      ...(objectiveDue ? { objectiveDue } : {}),
    },
  }
}

export function mergeObjectiveMeta(
  cleanDescription: string,
  meta: ObjectiveMeta
): string {
  const objective = normalizeObjective(meta.objective)
  const objectiveDue = normalizeObjectiveDue(meta.objectiveDue)

  const base = (cleanDescription ?? '').trimEnd()
  if (!objective && !objectiveDue) return base

  const lines: string[] = []
  lines.push(START)
  if (objective) lines.push(`objective: ${objective}`)
  if (objectiveDue) lines.push(`objectiveDue: ${objectiveDue}`)
  lines.push(END)

  return `${base}${base ? '\n\n' : ''}${lines.join('\n')}`
}


