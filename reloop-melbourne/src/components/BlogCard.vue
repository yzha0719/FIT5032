<script setup>
const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
})

const formattedDate = new Date(props.post.date).toLocaleDateString('en-AU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
</script>

<template>
  <article class="crate-card blog-card">
    <span class="crate-card__tag">{{ post.category.toUpperCase() }}</span>
    <h3 class="blog-card__title">{{ post.title }}</h3>
    <p class="blog-card__excerpt">{{ post.excerpt }}</p>
    <p class="blog-card__meta">{{ formattedDate }} &middot; {{ post.readMinutes }} min read</p>
  </article>
</template>

<style scoped>
.blog-card {
  display: flex;
  flex-direction: column;
}

.blog-card__title {
  font-size: 1.1rem;
  margin-top: 0.75rem;
}

.blog-card__excerpt {
  font-size: 0.92rem;
  color: var(--ink-soft);
  flex: 1;
}

.blog-card__meta {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--chalk);
  margin: 0;
}
</style>
