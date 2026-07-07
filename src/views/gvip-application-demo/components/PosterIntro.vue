<script setup>
import { computed } from 'vue'

const props = defineProps({
  isDesktop: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['next'])

const posterStyle = computed(() => ({
  backgroundImage: props.isDesktop
    ? 'url("/posters/poster-desktop.jpg")'
    : 'url("/posters/poster-mobile.png")',
}))
</script>

<template>
  <section
    class="gvip-demo-poster"
    :class="{
      'gvip-demo-poster--desktop': isDesktop,
      'gvip-demo-poster--mobile': !isDesktop,
    }"
    :style="posterStyle"
  >
    <div class="gvip-demo-poster__overlay"></div>

    <div class="gvip-demo-poster__actions">
      <button type="button" class="gvip-demo-poster__button" @click="$emit('next')">
        <span>开始申请</span>
        <span class="gvip-demo-poster__arrow" aria-hidden="true">→</span>
      </button>
    </div>
  </section>
</template>
