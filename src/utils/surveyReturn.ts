const RETURN_TO_PARAM = 'returnTo';

export function buildSurveyStartPath(returnTo: string): string {
  return `/survey/information?${RETURN_TO_PARAM}=${encodeURIComponent(returnTo)}`;
}

export function readSurveyReturnTo(fallback = '/app'): string {
  if (typeof window === 'undefined') return fallback;
  const value = new URLSearchParams(window.location.search).get(RETURN_TO_PARAM);
  return value && value.startsWith('/') ? value : fallback;
}

export function withSurveyReturnTo(path: string): string {
  if (typeof window === 'undefined') return path;
  const value = new URLSearchParams(window.location.search).get(RETURN_TO_PARAM);
  if (!value) return path;
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}${RETURN_TO_PARAM}=${encodeURIComponent(value)}`;
}
