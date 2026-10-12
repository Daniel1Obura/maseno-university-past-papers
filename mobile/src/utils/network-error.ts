export const NO_CONNECTION_TITLE = 'No Internet Connection';
export const NO_CONNECTION_MESSAGE =
  "We couldn't reach the server. Please check your internet connection and try again.";

// Fragments of the error text Android and iOS produce when a request
// can't reach the server (offline, dropped signal, DNS failure, timeout).
const NETWORK_ERROR_PATTERNS = [
  'network request failed',
  'failed to fetch',
  'unknownhostexception',
  'unable to resolve host',
  'socketexception',
  'sockettimeoutexception',
  'connectexception',
  'connection reset',
  'connection refused',
  'connection abort',
  'no route to host',
  'network is unreachable',
  'timed out',
  'timeout',
  'econnreset',
  'econnrefused',
  'enotfound',
  'etimedout',
  'could not connect to the server',
  'internet connection appears to be offline',
  'network connection was lost',
];

export function isNetworkError(error: unknown): boolean {
  const message = (
    error instanceof Error ? error.message : String(error)
  ).toLowerCase();

  return NETWORK_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}