import { ApiError } from '@/lib/api/api-client'

function isApiErrorData(data: unknown): data is { message?: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('message' in data
      ? typeof (data as { message: unknown }).message === 'string' ||
        (data as { message: unknown }).message === undefined
      : true)
  )
}

export function getApiErrorMessage(err: unknown, defaultMessage: string): string {
  if (err instanceof ApiError && isApiErrorData(err.data)) {
    return err.data.message || defaultMessage
  }
  return defaultMessage
}
