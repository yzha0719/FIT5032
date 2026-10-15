<script setup>
import { computed, reactive, ref, useId, watch } from 'vue'
import { useExport } from '../composables/useExport'

// Reusable table with sortable columns, a search box per column, pagination
// and CSV/PDF export (BR D.3, E.4). Pages pass their own column definitions
// and may override any cell with a slot named `cell-<key>`.
//
// A column looks like:
//   { key, label, sortable, searchable, nowrap,
//     value: (row) => shown text,        // defaults to row[key]
//     sortValue: (row) => sort key }     // defaults to value()
const props = defineProps({
  rows: { type: Array, required: true },
  columns: { type: Array, required: true },
  caption: { type: String, required: true },
  rowKey: { type: String, default: 'id' },
  rowNoun: { type: String, default: 'rows' },
  pageSize: { type: Number, default: 10 },
  emptyText: { type: String, default: 'No rows match your search.' },
  // Which column the table is sorted by before anyone clicks a header.
  defaultSortKey: { type: String, default: null },
  defaultSortDirection: { type: String, default: 'asc' },
  // Base name for downloaded files. No name, no export buttons.
  exportName: { type: String, default: '' },
})

const { exportCsv, exportPdf } = useExport()

// Unique ids for the search inputs, so two tables on one page don't clash.
const idBase = useId()

const sortKey = ref(
  props.defaultSortKey ?? props.columns.find((column) => column.sortable)?.key ?? null,
)
const sortDirection = ref(props.defaultSortDirection)
const searches = reactive({})
const page = ref(1)

function cellValue(row, column) {
  return column.value ? column.value(row) : row[column.key]
}

function sortValue(row, column) {
  return column.sortValue ? column.sortValue(row) : cellValue(row, column)
}

// Every column with text typed into its search box has to match.
const filteredRows = computed(() =>
  props.rows.filter((row) =>
    props.columns.every((column) => {
      const term = (searches[column.key] ?? '').trim().toLowerCase()
      if (!term) return true
      return String(cellValue(row, column)).toLowerCase().includes(term)
    }),
  ),
)

const sortedRows = computed(() => {
  const column = props.columns.find((c) => c.key === sortKey.value)
  if (!column) return filteredRows.value

  const direction = sortDirection.value === 'asc' ? 1 : -1
  // Copy first: sort() changes the array in place, and props are not ours to change.
  return [...filteredRows.value].sort((a, b) => {
    const left = sortValue(a, column)
    const right = sortValue(b, column)
    if (typeof left === 'number' && typeof right === 'number') {
      return (left - right) * direction
    }
    return String(left).localeCompare(String(right)) * direction
  })
})

const pageCount = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / props.pageSize)))

const visibleRows = computed(() => {
  const start = (page.value - 1) * props.pageSize
  return sortedRows.value.slice(start, start + props.pageSize)
})

const summary = computed(() => {
  const total = props.rows.length
  const matching = sortedRows.value.length
  if (!matching) return `No ${props.rowNoun} match your search (${total} in total).`

  const first = (page.value - 1) * props.pageSize + 1
  const last = Math.min(page.value * props.pageSize, matching)
  const filtered = matching < total ? ` (filtered from ${total})` : ''
  return `Showing ${first}–${last} of ${matching} ${props.rowNoun}${filtered}.`
})

// Searching can leave the current page past the end of the results.
watch(pageCount, (count) => {
  if (page.value > count) page.value = count
})

watch(searches, () => {
  page.value = 1
})

function toggleSort(column) {
  if (!column.sortable) return
  if (sortKey.value === column.key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = column.key
    sortDirection.value = 'asc'
  }
  page.value = 1
}

// Screen readers announce the sort state from aria-sort on the header cell.
function ariaSort(column) {
  if (!column.sortable || sortKey.value !== column.key) return 'none'
  return sortDirection.value === 'asc' ? 'ascending' : 'descending'
}

function sortIcon(column) {
  if (sortKey.value !== column.key) return '↕'
  return sortDirection.value === 'asc' ? '▲' : '▼'
}

/* BR E.4: export what is on screen — every matching row in the current sort
   order, not just the visible page and not the unfiltered data. */

const exportHeaders = computed(() => props.columns.map((column) => column.label))

function exportRows() {
  return sortedRows.value.map((row) => props.columns.map((column) => cellValue(row, column)))
}

const canExport = computed(() => Boolean(props.exportName) && sortedRows.value.length > 0)

function downloadCsv() {
  exportCsv({ name: props.exportName, headers: exportHeaders.value, rows: exportRows() })
}

// The PDF library is loaded on demand, so this takes a moment the first time.
const isPreparingPdf = ref(false)

async function downloadPdf() {
  isPreparingPdf.value = true
  try {
    await exportPdf({
      name: props.exportName,
      title: props.caption,
      subtitle: summary.value.replace('Showing', 'Includes').replace(/\.$/, ''),
      headers: exportHeaders.value,
      rows: exportRows(),
    })
  } finally {
    isPreparingPdf.value = false
  }
}
</script>

<template>
  <div class="data-table">
    <div class="data-table__toolbar">
      <p class="data-table__summary" role="status">{{ summary }}</p>
      <div v-if="exportName" class="data-table__exports">
        <button
          type="button"
          class="btn-reloop btn-reloop--outline btn-reloop--sm"
          :disabled="!canExport"
          @click="downloadCsv"
        >
          Export CSV
        </button>
        <button
          type="button"
          class="btn-reloop btn-reloop--outline btn-reloop--sm"
          :disabled="!canExport || isPreparingPdf"
          @click="downloadPdf"
        >
          {{ isPreparingPdf ? 'Preparing…' : 'Export PDF' }}
        </button>
      </div>
    </div>

    <!-- Focusable so keyboard users can scroll the table sideways on a phone -->
    <div class="table-wrap" tabindex="0" role="region" :aria-label="caption">
      <table>
        <caption class="visually-hidden">{{ caption }}</caption>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key" scope="col" :aria-sort="ariaSort(column)">
              <button
                v-if="column.sortable"
                type="button"
                class="data-table__sort"
                :aria-label="`Sort by ${column.label}`"
                @click="toggleSort(column)"
              >
                {{ column.label }}
                <span class="data-table__icon" aria-hidden="true">{{ sortIcon(column) }}</span>
              </button>
              <span v-else>{{ column.label }}</span>
            </th>
          </tr>
          <tr class="data-table__search-row">
            <td v-for="column in columns" :key="column.key">
              <template v-if="column.searchable">
                <label :for="`${idBase}-${column.key}`" class="visually-hidden">
                  Search by {{ column.label }}
                </label>
                <input
                  :id="`${idBase}-${column.key}`"
                  v-model="searches[column.key]"
                  type="search"
                  :placeholder="`Search ${column.label.toLowerCase()}`"
                />
              </template>
            </td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in visibleRows" :key="row[rowKey]">
            <td v-for="column in columns" :key="column.key" :class="{ 'is-nowrap': column.nowrap }">
              <slot :name="`cell-${column.key}`" :row="row">{{ cellValue(row, column) }}</slot>
            </td>
          </tr>
          <tr v-if="!visibleRows.length">
            <td :colspan="columns.length" class="data-table__empty">{{ emptyText }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="data-table__pager">
      <button
        type="button"
        class="btn-reloop btn-reloop--outline btn-reloop--sm"
        :disabled="page === 1"
        @click="page -= 1"
      >
        ← Previous
      </button>
      <span class="data-table__page-count">Page {{ page }} of {{ pageCount }}</span>
      <button
        type="button"
        class="btn-reloop btn-reloop--outline btn-reloop--sm"
        :disabled="page === pageCount"
        @click="page += 1"
      >
        Next →
      </button>
    </div>
  </div>
</template>

<style scoped>
.data-table__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  margin-bottom: 0.5rem;
}

.data-table__summary {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--ink-soft);
}

.data-table__exports {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.table-wrap {
  overflow-x: auto;
  background-color: var(--paper);
  border: 1px solid var(--kraft-dark);
  border-radius: var(--radius);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}

th {
  padding: 0;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--paper);
  background-color: var(--ink);
}

th > span {
  display: block;
  padding: 0.7rem 0.9rem;
}

.data-table__sort {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  width: 100%;
  min-height: 44px;
  padding: 0.7rem 0.9rem;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  color: inherit;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.data-table__sort:hover {
  background-color: var(--ink-soft);
}

.data-table__icon {
  color: var(--reclaim-on-dark);
}

.data-table__search-row td {
  padding: 0.5rem 0.6rem;
  background-color: var(--paper-dim);
  border-bottom: 1px solid var(--kraft-dark);
}

.data-table__search-row input {
  width: 100%;
  min-width: 7rem;
  padding: 0.4em 0.6em;
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--ink);
  background-color: var(--paper);
  border: 2px solid var(--ink);
  border-radius: var(--radius);
}

.data-table__search-row input:focus {
  outline: none;
  border-color: var(--loop);
}

td {
  padding: 0.7rem 0.9rem;
  vertical-align: middle;
  border-top: 1px solid var(--kraft-dark);
}

tbody tr:nth-child(even) {
  background-color: var(--paper-dim);
}

.is-nowrap {
  white-space: nowrap;
}

.data-table__empty {
  padding: 1.5rem 0.9rem;
  text-align: center;
  color: var(--ink-soft);
}

.data-table__pager {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.85rem;
}

.data-table__page-count {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--ink-soft);
}
</style>
