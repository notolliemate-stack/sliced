const avatarColors = ['#c65d3b', '#647b58', '#557b91', '#886b87', '#956c35', '#e74008'];

export function createDefaultAvatar(): string {
  const color = avatarColors[Math.floor(Math.random() * avatarColors.length)];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="${color}"/><g fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="40" cy="29" r="11"/><path d="M20 65v-4a20 20 0 0 1 40 0v4"/></g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
