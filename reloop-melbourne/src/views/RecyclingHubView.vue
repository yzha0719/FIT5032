<script setup>
import { ref, computed } from 'vue'
import { recyclingGuide, recyclingCategories } from '../data/recyclingGuide'
import { useLocalStorageState } from '../composables/useLocalStorageState'

const searchTerm = ref('')
const selectedCategory = ref('All')

// Saved item ids persist in localStorage so residents can come back later
// and find the items they bookmarked (BR B.2 hint).
const savedItemIds = useLocalStorageState('reloop:saved-recycling-items', [])

function isSaved(id) {
  return savedItemIds.value.includes(id)
}

function toggleSaved(id) {
  if (isSaved(id)) {
    savedItemIds.value = savedItemIds.value.filter((savedId) => savedId !== id)
  } else {
    savedItemIds.value = [...savedItemIds.value, id]
  }
}

const filteredGuide = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return recyclingGuide.filter((entry) => {
    const matchesCategory =
      selectedCategory.value === 'All' || entry.category === selectedCategory.value
    const matchesSearch = term === '' || entry.item.toLowerCase().includes(term)
    return matchesCategory && matchesSearch
  })
})
</script>

<template>
  <section class="section page-intro bg-ink">
    <div class="container-app">
      <p class="eyebrow">Recycling &amp; waste hub</p>
      <h1>What goes where?</h1>
      <p class="page-intro__lede">
        Search the A-Z guide below for plain-language advice on any household item.
      </p>
    </div>
  </section>

  <section class="section">
    <div class="container-app">
      <div class="filter-bar">
        <div class="field filter-bar__search">
          <label for="guide-search">Search an item</label>
          <input
            id="guide-search"
            v-model="searchTerm"
            type="search"
            placeholder="e.g. batteries, glass, clothing"
          />
        </div>
        <div class="field filter-bar__category">
          <label for="guide-category">Category</label>
          <select id="guide-category" v-model="selectedCategory">
            <option v-for="category in recyclingCategories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        <p class="filter-bar__count">
          {{ filteredGuide.length }} of {{ recyclingGuide.length }} items
          <span v-if="savedItemIds.length"> &middot; {{ savedItemIds.length }} saved</span>
        </p>
      </div>

      <div v-if="filteredGuide.length" class="guide-grid">
        <article v-for="entry in filteredGuide" :key="entry.id" class="crate-card guide-card">
          <div class="guide-card__head">
            <span class="crate-card__tag">{{ entry.category.toUpperCase() }}</span>
            <button
              type="button"
              class="guide-card__save"
              :class="{ 'is-saved': isSaved(entry.id) }"
              :aria-pressed="isSaved(entry.id)"
              :aria-label="
                isSaved(entry.id) ? `Remove ${entry.item} from saved items` : `Save ${entry.item}`
              "
              @click="toggleSaved(entry.id)"
            >
              {{ isSaved(entry.id) ? '★ Saved' : '☆ Save' }}
            </button>
          </div>
          <h3 class="guide-card__item">{{ entry.item }}</h3>
          <p class="guide-card__action">{{ entry.action }}</p>
          <p class="guide-card__notes">{{ entry.notes }}</p>
        </article>
      </div>
      <p v-else class="guide-empty">
        No items match "{{ searchTerm }}". Try a different search term or category.
      </p>
    </div>
  </section>
</template>

<style scoped>
.page-intro {
  padding: 3.5rem 0;
}

.page-intro__lede {
  max-width: 60ch;
  color: var(--kraft);
  font-size: 1.05rem;
}

.filter-bar {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  align-items: end;
  margin-bottom: 2rem;
}

.filter-bar .field {
  margin-bottom: 0;
}

.filter-bar__count {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--chalk);
  margin: 0;
}

.guide-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

.guide-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.guide-card__save {
  background: transparent;
  border: none;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--chalk);
  cursor: pointer;
  padding: 0.25rem 0;
}

.guide-card__save.is-saved {
  color: var(--reclaim);
  font-weight: 700;
}

.guide-card__item {
  font-size: 1.05rem;
  margin: 0.75rem 0 0.35rem;
}

.guide-card__action {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  text-transform: uppercase;
  color: var(--loop);
  margin-bottom: 0.5rem;
}

.guide-card__notes {
  font-size: 0.9rem;
  color: var(--ink-soft);
  margin: 0;
}

.guide-empty {
  color: var(--chalk);
}

@media (min-width: 576px) {
  .filter-bar {
    grid-template-columns: 2fr 1fr auto;
  }

  .guide-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 992px) {
  .guide-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
