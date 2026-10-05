export function exportToCsv<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
) {
  if (!rows.length) {
    return;
  }

  const headers = Object.keys(rows[0]);
  const escapeCsvValue = (value: unknown) => {
    if (value === null || value === undefined) {
      return "";
    }

    const stringValue = String(value);
    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  };

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => escapeCsvValue(row[header]))
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([`\ufeff${csv}`], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}