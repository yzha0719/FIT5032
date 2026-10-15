// Download helpers for table data (BR E.4). Both formats take the rows the
// user is actually looking at — filtered and sorted — not the whole dataset.
//
// jsPDF is around 400 kB, so it is imported only when someone actually asks
// for a PDF instead of being bundled into the page.

// A cell starting with = + - @ is treated as a formula by Excel and Sheets, so
// it gets a leading quote. Quotes and commas are escaped the normal CSV way.
function csvCell(value) {
  const text = String(value ?? '')
  const guarded = /^[=+\-@]/.test(text) ? `'${text}` : text
  return `"${guarded.replace(/"/g, '""')}"`
}

export function buildCsv(headers, rows) {
  const lines = [headers.map(csvCell).join(',')]
  for (const row of rows) {
    lines.push(row.map(csvCell).join(','))
  }
  // CRLF endings keep Excel on Windows happy.
  return lines.join('\r\n')
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function timestamp() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function exportCsv({ name, headers, rows }) {
  // The BOM tells Excel the file is UTF-8, so accented names survive.
  const blob = new Blob([`﻿${buildCsv(headers, rows)}`], {
    type: 'text/csv;charset=utf-8;',
  })
  downloadBlob(blob, `${name}-${timestamp()}.csv`)
}

// jsPDF's built-in fonts cover Latin-1 only, so typographic punctuation is
// swapped for plain equivalents. Accented letters (Café) are inside Latin-1
// and stay as they are; anything else left over is dropped rather than drawn
// as a blank box.
function pdfSafe(value) {
  return String(value ?? '')
    .replace(/[–—]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    .replace(/·/g, '-')
    .replace(/[^\u0000-ÿ]/g, '')
}

async function exportPdf({ name, title, subtitle, headers, rows }) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])

  // Landscape, because these tables are wider than they are tall.
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(pdfSafe(title), 40, 40)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(90)
  doc.text(pdfSafe(subtitle), 40, 58)
  doc.text(pdfSafe(`Exported ${new Date().toLocaleString('en-AU')} - ReLoop Melbourne`), 40, 72)

  autoTable(doc, {
    head: [headers.map(pdfSafe)],
    body: rows.map((row) => row.map(pdfSafe)),
    startY: 88,
    styles: { fontSize: 9, cellPadding: 6, textColor: 20 },
    headStyles: { fillColor: [22, 36, 28], textColor: [237, 238, 228] },
    alternateRowStyles: { fillColor: [242, 243, 236] },
    margin: { left: 40, right: 40 },
  })

  doc.save(`${name}-${timestamp()}.pdf`)
}

export function useExport() {
  return { exportCsv, exportPdf }
}
