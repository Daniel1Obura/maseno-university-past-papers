export const API_ORIGIN =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ??
  'https://maseno-university-past-papers-production.up.railway.app';

export const API_BASE_URL = `${API_ORIGIN}/api`;