export function buildApiUrl(apiBaseUrl: string, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (apiBaseUrl.startsWith('/')) {
    return `${apiBaseUrl.replace(/\/$/, '')}${normalizedPath}`;
  }
  return new URL(normalizedPath, apiBaseUrl).toString();
}
