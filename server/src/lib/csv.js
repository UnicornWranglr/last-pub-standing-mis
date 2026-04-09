// Minimal CSV generator. Handles the RFC 4180 escape rules:
//   - wrap values in quotes if they contain comma, quote, newline, or carriage return
//   - double any quotes within a quoted value

function escapeCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Build a CSV string from rows.
 * @param {string[]} headers - Column labels (first row).
 * @param {Array<Array<any>>} rows - Data rows.
 * @returns {string}
 */
export function buildCsv(headers, rows) {
  const lines = [headers.map(escapeCell).join(',')];
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(','));
  }
  return lines.join('\r\n') + '\r\n';
}

/**
 * Send a CSV response with the correct headers for a download.
 */
export function sendCsv(res, filename, csv) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}
