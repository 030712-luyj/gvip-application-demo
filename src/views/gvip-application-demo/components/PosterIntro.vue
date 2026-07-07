<script setup>
import { computed } from 'vue'
import iphoneBanner from '../assets/iphone_banner.png'
import rightIcon from '../assets/right_icon.svg'

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
    : `url("${iphoneBanner}")`,
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

    <div class="gvip-demo-poster__actions gvip-demo-poster-start-wrap">
      <button
        type="button"
        class="gvip-demo-poster__button gvip-demo-poster-start"
        @click="$emit('next')"
      >
        <span>开始申请</span>
        <img :src="rightIcon" alt="" aria-hidden="true" class="gvip-demo-poster-start-icon" />
      </button>
    </div>
  </section>
</template>
