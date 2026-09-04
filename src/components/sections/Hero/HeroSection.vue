<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import BaseButton from '@/components/UI/BaseButton.vue'
import SectionTitle from '@/components/UI/SectionTitle.vue'
import BaseContainer from '@/components/UI/BaseContainer.vue'

const props = defineProps({
  banners: {
    type: Array,
    default: () => [],
  },
  about: {
    type: Object,
    default: () => ({}),
  },
})

const currentIndex = ref(0)

const currentBanner = computed(() => {
  if (!props.banners?.length) return null
  return props.banners[currentIndex.value]
})

const nextSlide = () => {
  if (!props.banners?.length) return

  currentIndex.value =
    (currentIndex.value + 1) %
    props.banners.length
}

const prevSlide = () => {
  if (!props.banners?.length) return

  currentIndex.value =
    (currentIndex.value - 1 + props.banners.length) %
    props.banners.length
}

const goToSlide = (index) => {
  currentIndex.value = index
}

let timer

const startSlide = () => {
  timer = setInterval(nextSlide, 3000)
}

const stopSlide = () => {
  clearInterval(timer)
}

onMounted(startSlide)

onUnmounted(stopSlide)
</script>

<template>
  <section
    class="relative h-screen overflow-hidden"
    @mouseenter="stopSlide"
    @mouseleave="startSlide"
  >

    <!-- Background -->

    <Transition name="fade" mode="out-in">

      <img
        v-if="currentBanner"
        :key="currentBanner.id"
        :src="currentBanner.img_cover"
        :alt="currentBanner.title"
        class="absolute inset-0 h-full w-full object-cover"
      />

    </Transition>

    <!-- Overlay -->

    <div
      class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30"
    />

    <!-- Content -->

    <BaseContainer
  class="relative z-10 flex h-full items-center"
>

  <div class="max-w-2xl pt-28">

    <SectionTitle
      :badge="about?.motto"
      :title="currentBanner?.title"
      theme="dark"
    />

    <p
      class="mb-10 max-w-xl text-lg leading-8 text-white/90 md:text-xl"
    >
      {{ about?.profile_description }}
    </p>

    <div class="mt-2 flex flex-wrap gap-5">

      <BaseButton
        as="a"
        :href="currentBanner?.url"
        target="_blank"
      >
        Selengkapnya
      </BaseButton>

      <BaseButton variant="outline">
        Kompetensi Keahlian

        <ArrowUpRight :size="18" />
      </BaseButton>
    </div>
  </div>
</BaseContainer>
    <!-- Previous -->

    <button
      @click="prevSlide"
      class="absolute left-6 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur transition hover:bg-white/40"
    >

      <ChevronLeft />

    </button>

    <!-- Next -->

    <button
      @click="nextSlide"
      class="absolute right-6 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur transition hover:bg-white/40"
    >

      <ChevronRight />

    </button>

    <!-- Indicator -->

    <div
      class="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3"
    >

      <button
        v-for="(_, index) in banners"
        :key="index"
        @click="goToSlide(index)"
        class="h-3 rounded-full transition-all duration-300"
        :class="
          index === currentIndex
            ? 'w-10 bg-orange-500'
            : 'w-3 bg-white/60'
        "
      />

    </div>

  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active{
  transition: opacity .7s ease;
}

.fade-enter-from,
.fade-leave-to{
  opacity:0;
}
</style>