// Every event, past and upcoming, in date order. Pages split them by date when
// they load, so an event moves from "upcoming" to "past" (and can be rated) on
// its own without anyone editing this file.
export const events = [
  { id: 'toy-library-footscray', title: 'Toy Library Swap Day', category: 'Swap', suburb: 'Footscray', date: '2026-07-18', spotsLeft: 0 },
  { id: 'bike-repair-northcote', title: 'Bike Repair Clinic', category: 'Repair', suburb: 'Northcote', date: '2026-08-08', spotsLeft: 0 },
  { id: 'worm-farm-dandenong', title: 'Worm Farming for Beginners', category: 'Workshop', suburb: 'Dandenong', date: '2026-08-22', spotsLeft: 0 },
  { id: 'repair-cafe-coburg', title: 'Repair Café — small appliances', category: 'Repair', suburb: 'Coburg', date: '2026-08-30', spotsLeft: 0 },
  { id: 'kids-swap-preston', title: "Kids' Clothing Swap Meet", category: 'Swap', suburb: 'Preston', date: '2026-09-06', spotsLeft: 0 },
  { id: 'composting-101', title: 'Composting 101 Workshop', category: 'Workshop', suburb: 'Brunswick', date: '2026-09-09', spotsLeft: 0 },
  { id: 'ewaste-box-hill', title: 'E-waste Drop-off Day', category: 'Drop-off', suburb: 'Box Hill', date: '2026-09-19', spotsLeft: 0 },
  { id: 'mending-circle-fitzroy', title: 'Mending Circle — clothes & textiles', category: 'Repair', suburb: 'Fitzroy', date: '2026-09-26', spotsLeft: 0 },
  { id: 'school-holiday-swap-sunshine', title: 'School Holiday Toy & Book Swap', category: 'Swap', suburb: 'Sunshine', date: '2026-10-03', spotsLeft: 0 },
  { id: 'repair-cafe-reservoir', title: 'Repair Café — bikes & lamps', category: 'Repair', suburb: 'Reservoir', date: '2026-10-11', spotsLeft: 0 },
  { id: 'repair-cafe-coburg-nov', title: 'Repair Café — small appliances', category: 'Repair', suburb: 'Coburg', date: '2026-10-17', spotsLeft: 9 },
  { id: 'clothes-swap-clayton', title: 'Campus Clothes Swap', category: 'Swap', suburb: 'Clayton', date: '2026-10-24', spotsLeft: 20 },
  { id: 'compost-workshop-richmond', title: 'Compost & Worm Farm Workshop', category: 'Workshop', suburb: 'Richmond', date: '2026-10-31', spotsLeft: 12 },
  { id: 'e-waste-dandenong', title: 'E-waste Drop-off Day', category: 'Drop-off', suburb: 'Dandenong', date: '2026-11-07', spotsLeft: 30 },
  { id: 'tool-library-werribee', title: 'Tool Library Launch', category: 'Workshop', suburb: 'Werribee', date: '2026-11-14', spotsLeft: 25 },
  { id: 'summer-swap-st-kilda', title: 'Summer Clothes Swap', category: 'Swap', suburb: 'St Kilda', date: '2026-11-28', spotsLeft: 18 },
  { id: 'ewaste-frankston', title: 'E-waste & Battery Drop-off', category: 'Drop-off', suburb: 'Frankston', date: '2026-12-05', spotsLeft: 30 },
  { id: 'repair-cafe-preston-dec', title: 'Repair Café — tools & toys', category: 'Repair', suburb: 'Preston', date: '2026-12-12', spotsLeft: 10 },
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
