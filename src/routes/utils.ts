export const hasParams = (url: string) => {
  const queryString = url.split('?')[1];
  return queryString ? new URLSearchParams(queryString).toString().length > 0 : false;
};

export function removeLastSlash(pathname: string) {
  return pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export function removeParams(url: string) {
  try {
    return removeLastSlash(new URL(url, window.location.origin).pathname);
  } catch {
    return url;
  }
}

export function isExternalLink(url: string) {
  return url.startsWith('http');
}