export function greeting(name = 'world') {
  const trimmed = String(name).trim();
  return `Hello, ${trimmed || 'world'}!`;
}
