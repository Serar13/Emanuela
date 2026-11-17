export function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("/images/")) {
    return `https://laborator-emanuela.web.app${url}`;
  }
  return url;
}
