// Builds an .ics calendar file from booked volunteer shifts (BR F.1), so a
// shift can be added to Google Calendar, Apple Calendar or Outlook instead of
// being copied by hand.
//
// Format: RFC 5545. The parts that matter are escaping, CRLF line endings and
// folding long lines — calendar apps reject a file that gets these wrong.

// Commas, semicolons and backslashes are field separators in iCalendar.
function escapeText(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

// Lines must be 75 octets or fewer; continuations start with a space.
function foldLine(line) {
  if (line.length <= 75) return line

  const parts = [line.slice(0, 75)]
  let rest = line.slice(75)
  while (rest.length > 74) {
    parts.push(` ${rest.slice(0, 74)}`)
    rest = rest.slice(74)
  }
  if (rest.length) parts.push(` ${rest}`)
  return parts.join('\r\n')
}

// 2026-10-17 + 09:30 -> 20261017T093000. No timezone suffix, so calendar apps
// read it as local time — which is what a Melbourne volunteer expects, and
// avoids shipping a VTIMEZONE block for a single city.
function toLocalStamp(date, time) {
  return `${date.replace(/-/g, '')}T${time.replace(':', '')}00`
}

function toUtcStamp(date = new Date()) {
  return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
}

export function buildIcs(shifts, { domain = 'reloop-melbourne.web.app' } = {}) {
  const now = toUtcStamp()

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ReLoop Melbourne//Volunteer shifts//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  for (const shift of shifts) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${shift.id}@${domain}`,
      `DTSTAMP:${now}`,
      `DTSTART:${toLocalStamp(shift.date, shift.start)}`,
      `DTEND:${toLocalStamp(shift.date, shift.end)}`,
      `SUMMARY:${escapeText(`${shift.task} — ${shift.event}`)}`,
      `LOCATION:${escapeText(shift.suburb)}`,
      `DESCRIPTION:${escapeText('Volunteer shift booked through ReLoop Melbourne.')}`,
      'END:VEVENT',
    )
  }

  lines.push('END:VCALENDAR')
  // CRLF between lines is required by the spec, not a Windows habit.
  return lines.map(foldLine).join('\r\n')
}

function downloadIcs(shifts, filename = 'reloop-volunteer-shifts.ics') {
  const blob = new Blob([buildIcs(shifts)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function useCalendar() {
  return { buildIcs, downloadIcs }
}
