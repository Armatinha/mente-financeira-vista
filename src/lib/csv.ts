export function exportToCSV<T extends Record<string, any>>(data: T[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      // Escape quotes and wrap in quotes if there's a comma
      const escaped = ('' + (val ?? '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = "\uFEFF" + csvRows.join('\n'); // Add BOM for Excel UTF-8 support
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== "");
  if (lines.length < 2) return [];

  // Simple CSV parser supporting quotes
  const parseLine = (line: string) => {
    const result = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        inQuotes = !inQuotes;
      } else if (line[i] === ',' && !inQuotes) {
        result.push(cur);
        cur = "";
      } else {
        cur += line[i];
      }
    }
    result.push(cur);
    return result.map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
  };

  const headers = parseLine(lines[0]);
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = values[index];
    });
    data.push(obj);
  }
  return data;
}
