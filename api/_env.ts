function read(name: string): string | null {
  const value = process.env[name];
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function getEnv(...names: string[]): string | null {
  for (const name of names) {
    const value = read(name);
    if (value) return value;
  }
  return null;
}

export function requireEnv(label: string, ...names: string[]): string {
  const value = getEnv(...names);
  if (value) return value;
  throw new Error(`Missing env var: ${label} (checked: ${names.join(", ")})`);
}
