// Every event, past and upcoming, in date order. Pages split them by date when
// they load, so an event moves from "upcoming" to "past" (and can be rated) on
// its own without anyone editing this file.
export const events = [
  {
    id: 'repair-cafe-coburg',
    title: 'Repair Café — small appliances',
    category: 'Repair',
    suburb: 'Coburg',
    date: '2026-08-30',
    spotsLeft: 6,
  },
  {
    id: 'kids-swap-preston',
    title: "Kids' Clothing Swap Meet",
    category: 'Swap',
    suburb: 'Preston',
    date: '2026-09-06',
    spotsLeft: 14,
  },
  {
    id: 'composting-101',
    title: 'Composting 101 Workshop',
    category: 'Workshop',
    suburb: 'Brunswick',
    date: '2026-09-09',
    spotsLeft: 2,
  },
  {
    id: 'repair-cafe-reservoir',
    title: 'Repair Café — bikes & lamps',
    category: 'Repair',
    suburb: 'Reservoir',
    date: '2026-10-11',
    spotsLeft: 8,
  },
  {
    id: 'clothes-swap-clayton',
    title: 'Campus Clothes Swap',
    category: 'Swap',
    suburb: 'Clayton',
    date: '2026-10-24',
    spotsLeft: 20,
  },
  {
    id: 'e-waste-dandenong',
    title: 'E-waste Drop-off Day',
    category: 'Drop-off',
    suburb: 'Dandenong',
    date: '2026-11-07',
    spotsLeft: 30,
  },
]

// Today as YYYY-MM-DD in local time. toISOString() would give the UTC date,
// which is still "yesterday" for most of the morning in Melbourne.
function todayKey() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

// An event is past once its day is over. Dates in YYYY-MM-DD form sort the
// same way as text, so a plain string comparison is enough.
export function isPastEvent(event) {
  return event.date < todayKey()
}
