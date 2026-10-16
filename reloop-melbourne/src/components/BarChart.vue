<script setup>
import { BarController, BarElement, CategoryScale, Chart, LinearScale, Tooltip } from 'chart.js'
import { onBeforeUnmount, onMounted, shallowRef, ref, watch } from 'vue'

// A single-series bar chart (BR F.1). Only the pieces we use are registered,
// so Chart.js tree-shakes down instead of shipping every chart type.
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

const props = defineProps({
  labels: { type: Array, required: true },
  values: { type: Array, required: true },
  // Shown in the tooltip, e.g. "ratings"
  unit: { type: String, required: true },
  color: { type: String, default: '#2f9484' },
  horizontal: { type: Boolean, default: false },
  // Plain-text equivalent of the chart for screen readers.
  summary: { type: String, required: true },
})

const canvas = ref(null)
// shallowRef: Chart is a large external object that shouldn't be made reactive.
const chart = shallowRef(null)

// Read the design tokens rather than hard-coding greys in two places.
function token(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

function buildChart() {
  const ink = token('--ink-soft', '#34433a')

  chart.value = new Chart(canvas.value, {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets: [
        {
          data: props.values,
          backgroundColor: props.color,
          // Rounded data-end only; the baseline end stays square.
          borderRadius: 4,
          borderSkipped: props.horizontal ? 'left' : 'bottom',
          // Thin marks, with a gap between neighbouring bars.
          barPercentage: 0.65,
          categoryPercentage: 0.8,
        },
      ],
    },
    options: {
      indexAxis: props.horizontal ? 'y' : 'x',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      plugins: {
        legend: { display: false }, // one series: the heading names it
        tooltip: {
          backgroundColor: token('--ink', '#16241c'),
          padding: 10,
          displayColors: false,
          callbacks: {
            label: (item) => `${item.raw} ${props.unit}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: props.horizontal, color: 'rgba(22, 36, 28, 0.08)' },
          border: { display: false },
          ticks: { color: ink, font: { family: 'Inter, sans-serif', size: 12 } },
        },
        y: {
          beginAtZero: true,
          grid: { display: !props.horizontal, color: 'rgba(22, 36, 28, 0.08)' },
          border: { display: false },
          ticks: {
            color: ink,
            font: { family: 'Inter, sans-serif', size: 12 },
            precision: 0,
          },
        },
      },
    },
  })
}

onMounted(buildChart)

watch(
  () => [props.labels, props.values],
  () => {
    if (!chart.value) return
    chart.value.data.labels = props.labels
    chart.value.data.datasets[0].data = props.values
    chart.value.update()
  },
  { deep: true },
)

onBeforeUnmount(() => chart.value?.destroy())
</script>

<template>
  <figure class="chart">
    <!-- role="img" plus the summary is what a screen reader reads instead of
         the canvas, which is otherwise invisible to it. -->
    <canvas ref="canvas" role="img" :aria-label="summary"></canvas>
    <figcaption class="visually-hidden">
      {{ summary }}
      <ul>
        <li v-for="(label, index) in labels" :key="label">
          {{ label }}: {{ values[index] }} {{ unit }}
        </li>
      </ul>
    </figcaption>
  </figure>
</template>

<style scoped>
.chart {
  position: relative;
  height: 260px;
  margin: 0;
}
</style>
