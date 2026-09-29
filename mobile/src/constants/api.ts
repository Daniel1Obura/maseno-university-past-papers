export const API_ORIGIN =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ??
  'http://10.0.125.146:3000';

export const API_BASE_URL = `${API_ORIGIN}/api`;