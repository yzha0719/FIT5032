// Mock "live" impact data — in a later version this will come from Firestore.
// Kept as a plain JS data structure to satisfy BR (B.2): dynamic data
// fetched from an underlying JS structure rather than hard-coded markup.
export const impactStats = [
  { id: 'kg', label: 'KG diverted from landfill', value: 12406, suffix: '' },
  { id: 'partners', label: 'Partner sites', value: 38, suffix: '' },
  { id: 'members', label: 'Community members', value: 1900, suffix: '+' },
  { id: 'workshops', label: 'Workshops run', value: 215, suffix: '' },
]
