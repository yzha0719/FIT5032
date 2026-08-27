<script setup>
defineProps({
  label: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="ticket-divider">
    <span class="ticket-divider__dot"></span>
    <span v-if="label" class="eyebrow">{{ label }}</span>
    <span class="ticket-divider__dot"></span>
  </div>
</template>
