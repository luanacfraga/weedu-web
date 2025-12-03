export { env, validateEnv } from './env'

export const config = {
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
  },

  dateFormats: {
    short: 'dd/MM/yyyy',
    long: 'dd/MM/yyyy HH:mm',
    full: "dd 'de' MMMM 'de' yyyy",
  },

  cookies: {
    tokenName: 'weedu_token',
    maxAge: 7,
  },

  api: {
    timeout: 30000,
    retries: 3,
  },

  table: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
} as const
