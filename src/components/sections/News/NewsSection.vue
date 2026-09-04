<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import BaseContainer from '@/components/UI/BaseContainer.vue'
import BaseButton from '@/components/UI/BaseButton.vue'
import SectionTitle from '@/components/UI/SectionTitle.vue'
import NewsCard from './NewsCard.vue'

const props = defineProps({
  news: {
    type: Array,
    default: () => []
  }
})

const latestNews = computed(() => {
  return [...(props.news ?? [])]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8)
})
</script>

<template>
  <section class="bg-white py-28">

    <BaseContainer>

      <SectionTitle
        title="Berita Terkini"
        subtitle="Dapatkan informasi dan kabar terbaru seputar kegiatan, prestasi, dan perkembangan di SMKN 7 Semarang."
        align="left"
      />

      <div
        class="no-scrollbar mt-14 flex gap-6 overflow-x-auto pb-4"
      >
        <NewsCard
          v-for="item in latestNews"
          :key="item.id"
          :news="item"
          class="w-[360px] shrink-0"
        />
      </div>

      <div class="mt-14 flex justify-center">
        <RouterLink to="/news">
          <BaseButton size="lg">
            Selengkapnya
          </BaseButton>
        </RouterLink>
      </div>

    </BaseContainer>

  </section>
</template>