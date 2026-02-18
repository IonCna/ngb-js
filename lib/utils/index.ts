export function kebabCase(str: string) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function camelCase(str: string) {
  return str
    .toLowerCase()
    .split('-')
    .filter(Boolean)
    .map((p, i) => i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}
