<script setup>
import { computed } from 'vue'

// Read-only view of an aggregated rating: stars, average and number of ratings.
const props = defineProps({
  average: {
    type: Number,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
})

// The filled layer is clipped to this width, so an average of 4.6 shows
// four and a bit stars filled.
const fillWidth = computed(() => `${(props.average / 5) * 100}%`)
const countLabel = computed(() => `${props.count} ${props.count === 1 ? 'rating' : 'ratings'}`)
</script>

<template>
  <p class="rating-summary">
    <template v-if="count">
      <span class="rating-summary__stars" aria-hidden="true"
        >★★★★★<span class="rating-summary__fill" :style="{ width: fillWidth }">★★★★★</span></span
      >
      <span aria-hidden="true">
        <strong>{{ average.toFixed(1) }}</strong>
        <span class="rating-summary__count">({{ countLabel }})</span>
      </span>
      <span class="visually-hidden">
        Average rating {{ average.toFixed(1) }} out of 5, from {{ countLabel }}.
      </span>
    </template>
    <span v-else class="rating-summary__count">No ratings yet</span>
  </p>
</template>

<style scoped>
.rating-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.2rem 0.5rem;
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
}

.rating-summary__stars {
  position: relative;
  display: inline-block;
  font-size: 1.15rem;
  line-height: 1;
  white-space: nowrap;
  color: var(--chalk);
}

.rating-summary__fill {
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  white-space: nowrap;
  color: var(--reclaim);
}

.rating-summary__count {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--ink-soft);
}

/* Vue drops the line break between these two tags, so add the gap here */
.rating-summary strong + .rating-summary__count {
  margin-left: 0.3rem;
}
</style>
