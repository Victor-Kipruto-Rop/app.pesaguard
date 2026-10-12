export function downloadCsv(filename: string, headers: string[], rows: string[][]): void {
  const content = [headers, ...rows]
    .map((row) => row.map((cell) => {
      const safeCell = /^[\t\r ]*[=+\-@]/.test(cell) ? `'${cell}` : cell;
      return `"${safeCell.replaceAll('"', '""')}"`;
    }).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
