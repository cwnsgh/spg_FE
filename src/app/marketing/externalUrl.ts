export function normalizeExternalUrl(url?: string | null) {
  const trimmedUrl = url?.trim() ?? "";

  if (!trimmedUrl) {
    return "";
  }

  if (/^(https?:)?\/\//i.test(trimmedUrl) || /^(mailto|tel):/i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
}
