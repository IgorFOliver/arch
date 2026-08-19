export const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME ?? 'arch_session';

const TTL_DAYS = Number(process.env.SESSION_TTL_DAYS ?? 7);
export const SESSION_TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;
