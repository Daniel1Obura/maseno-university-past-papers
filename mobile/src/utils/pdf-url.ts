import { API_ORIGIN } from '../constants/api';

export function resolvePdfUrl(pdfUrl: string | null | undefined): string {
  if (!pdfUrl) {
    return '';
  }

  // Already a full URL (R2, or any other absolute URL)
  if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
    return pdfUrl;
  }

  // Legacy relative path from before the R2 migration.
  return `${API_ORIGIN}${pdfUrl}`;
}