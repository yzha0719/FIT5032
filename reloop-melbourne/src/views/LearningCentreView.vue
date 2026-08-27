<script setup>
import { ref, computed } from 'vue'
import { blogPosts } from '../data/blogPosts'
import BlogCard from '../components/BlogCard.vue'

const selectedCategory = ref('All')
const categories = ['All', ...new Set(blogPosts.map((post) => post.category))]

const filteredPosts = computed(() => {
  if (selectedCategory.value === 'All') return blogPosts
  return blogPosts.filter((post) => post.category === selectedCategory.value)
})
</script>

<template>
  <section class="section page-intro bg-ink">
    <div class="container-app">
      <p class="eyebrow">Learning centre</p>
      <h1>Stories, guides &amp; school programs.</h1>
      <p class="page-intro__lede">
        Long-form content on recycling literacy and climate action, written for residents,
        volunteers and classrooms across Melbourne.
      </p>
    </div>
  </section>

  <section class="section">
    <div class="container-app">
      <div class="category-tabs">
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          class="category-tabs__btn"
          :class="{ 'is-active': selectedCategory === category }"
          @click="selectedCategory = category"
        >
          {{ category }}
        </button>
      </div>

      <div class="card-grid">
        <BlogCard v-for="post in filteredPosts" :key="post.id" :post="post" />
      </div>
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

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 2rem;
}

.category-tabs__btn {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.5em 1em;
  border-radius: 999px;
  border: 2px solid var(--ink);
  background-color: transparent;
  color: var(--ink);
  cursor: pointer;
}

.category-tabs__btn.is-active {
  background-color: var(--ink);
  color: var(--paper);
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 576px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 992px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
