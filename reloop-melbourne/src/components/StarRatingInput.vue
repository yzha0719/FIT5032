<script setup>
import { ref, useId } from 'vue'

// Five radio buttons styled as stars. Native radios give keyboard support for
// free: Tab moves into the group and the arrow keys change the rating.
defineProps({
  label: {
    type: String,
    required: true,
  },
})

const model = defineModel({ type: Number, default: null })

// Each instance needs its own radio group name, or picking a star on one card
// would clear the stars on another.
const name = useId()
const hovered = ref(null)

function isFilled(n) {
  return n <= (hovered.value ?? model.value ?? 0)
}
</script>

<template>
  <fieldset class="star-input" @mouseleave="hovered = null">
    <legend class="visually-hidden">{{ label }}</legend>
    <label
      v-for="n in 5"
      :key="n"
      class="star-input__star"
      :class="{ 'is-filled': isFilled(n) }"
      @mouseenter="hovered = n"
    >
      <input v-model="model" type="radio" class="visually-hidden" :name="name" :value="n" />
      <span aria-hidden="true">{{ isFilled(n) ? '★' : '☆' }}</span>
      <span class="visually-hidden">{{ n }} {{ n === 1 ? 'star' : 'stars' }}</span>
    </label>
  </fieldset>
</template>

<style scoped>
.star-input {
  display: inline-flex;
  gap: 0.1rem;
  margin: 0;
  padding: 0;
  border: 0;
}

/* 44px targets, so the stars are easy to hit on a phone */
.star-input__star {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  font-size: 1.7rem;
  line-height: 1;
  color: var(--ink-soft);
  border-radius: var(--radius);
  cursor: pointer;
}

.star-input__star.is-filled {
  color: var(--reclaim);
}

.star-input__star:has(input:focus-visible) {
  outline: 3px solid var(--ink);
  outline-offset: 1px;
}
</style>
