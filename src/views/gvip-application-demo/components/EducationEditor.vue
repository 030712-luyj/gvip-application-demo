<script setup>
defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <section class="gvip-card module-card" :class="{ 'module-card--compact': compact }">
    <div class="module-heading">
      <h3>教育背景</h3>
      <span>占位模块</span>
    </div>
    <div class="timeline-placeholder">
      <div class="timeline-item timeline-item--short"></div>
      <div class="timeline-item"></div>
    </div>
  </section>
</template>
