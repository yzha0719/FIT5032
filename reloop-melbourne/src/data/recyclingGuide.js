export const recyclingGuide = [
  {
    id: 'batteries',
    item: 'Batteries (household)',
    category: 'E-waste',
    action: 'Drop-off point',
    notes: 'Never place in kerbside bins — fire risk. Take to a battery collection point.',
  },
  {
    id: 'cardboard',
    item: 'Cardboard boxes',
    category: 'Recycling bin',
    action: 'Yellow-lid bin',
    notes: 'Flatten first. Remove packing tape and foam inserts.',
  },
  {
    id: 'clothing',
    item: 'Clothing & textiles',
    category: 'Reuse',
    action: 'Swap meet / op shop',
    notes: 'Still wearable items are best donated or swapped, not binned.',
  },
  {
    id: 'coffee-cups',
    item: 'Disposable coffee cups',
    category: 'General waste',
    action: 'Red-lid bin',
    notes: 'Most cups have a plastic lining and cannot go in the recycling bin.',
  },
  {
    id: 'ewaste',
    item: 'Old phones & chargers',
    category: 'E-waste',
    action: 'Drop-off point',
    notes: 'Contains recoverable metals. Never place in kerbside bins.',
  },
  {
    id: 'furniture',
    item: 'Small furniture',
    category: 'Repair or reuse',
    action: 'Repair café / hard waste',
    notes: 'Bring to a repair café first — many fixes take under 20 minutes.',
  },
  {
    id: 'glass',
    item: 'Glass jars & bottles',
    category: 'Recycling bin',
    action: 'Yellow-lid bin',
    notes: 'Rinse before placing in the bin. Lids can be left on or off.',
  },
  {
    id: 'softplastics',
    item: 'Soft plastics (bags, wrap)',
    category: 'Special collection',
    action: 'Collection point',
    notes: 'Cannot go in the yellow-lid bin — it jams sorting machinery.',
  },
]

export const recyclingCategories = [
  'All',
  ...new Set(recyclingGuide.map((entry) => entry.category)),
]
