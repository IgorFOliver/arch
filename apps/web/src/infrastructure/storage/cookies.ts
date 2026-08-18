export function setCookie(
  name: string,
  value: string,
  maxAgeSeconds: number,
): void {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}`;
}
