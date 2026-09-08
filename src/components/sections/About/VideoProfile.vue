<script setup>
import { computed } from 'vue'
import BaseContainer from '@/components/UI/BaseContainer.vue'

const props = defineProps({
  about: {
    type: Object,
    default: () => ({})
  }
})

const embedUrl = computed(() => {
  const url = props.about?.video_profile || ''

  if (url.includes('watch?v=')) {
    return url.replace('watch?v=', 'embed/')
  }

  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1].split('?')[0]
    return `https://www.youtube.com/embed/${id}`
  }

  if (url.includes('/embed/')) {
    return url
  }

  return ''
})
</script>

<template>
  <section
    id="video-profile"
    class="bg-white py-28"
  >
    <BaseContainer>

      <div class="mx-auto mt-14 max-w-5xl">

        <div
          class="overflow-hidden rounded-2xl shadow-xl"
        >

          <iframe
            v-if="embedUrl"
            :src="embedUrl"
            class="aspect-video w-full"
            title="Video Profil"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          />

          <div
            v-else
            class="flex aspect-video items-center justify-center bg-slate-100 text-slate-500"
          >
            Video profil belum tersedia.
          </div>

        </div>

      </div>

    </BaseContainer>
  </section>
</template>