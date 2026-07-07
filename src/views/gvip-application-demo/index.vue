<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AgreementPage from './components/AgreementPage.vue'
import DesktopApplicationForm from './components/DesktopApplicationForm.vue'
import MobileApplicationForm from './components/MobileApplicationForm.vue'
import PosterIntro from './components/PosterIntro.vue'
import './styles/desktop.scss'
import './styles/landing.scss'
import './styles/mobile.scss'

const currentWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const currentStage = ref('poster')

const handleResize = () => {
  currentWidth.value = window.innerWidth
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

const isDesktop = computed(() => currentWidth.value > 768)

const goToAgreement = () => {
  currentStage.value = 'agreement'
}

const goToPoster = () => {
  currentStage.value = 'poster'
}

const goToForm = () => {
  currentStage.value = 'form'
}
</script>

<template>
  <Transition name="gvip-demo-stage" mode="out-in">
    <PosterIntro
      v-if="currentStage === 'poster'"
      :is-desktop="isDesktop"
      @next="goToAgreement"
    />

    <AgreementPage
      v-else-if="currentStage === 'agreement'"
      @back="goToPoster"
      @next="goToForm"
    />

    <DesktopApplicationForm v-else-if="isDesktop" key="desktop-form" />
    <MobileApplicationForm v-else key="mobile-form" />
  </Transition>
</template>
