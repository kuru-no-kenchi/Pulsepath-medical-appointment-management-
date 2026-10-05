export function capitalizeName(value: string | null | undefined): string {
  if (!value) return "";

  const trimmed = value.trim();
  if (trimmed.length === 0) return "";

  return trimmed[0].toUpperCase() + trimmed.slice(1).toLowerCase();
}

export function formatFullName(firstName: string | null | undefined, lastName: string | null | undefined): string {
  const first = capitalizeName(firstName);
  const last = capitalizeName(lastName);

  if (first && last) {
    return `${first} ${last}`;
  }

  return first || last || "";
}
