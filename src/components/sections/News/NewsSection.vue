<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-vue-next'

import BaseContainer from '@/components/UI/BaseContainer.vue'
import BaseButton from '@/components/UI/BaseButton.vue'
import SectionTitle from '@/components/UI/SectionTitle.vue'
import NewsCard from './NewsCard.vue'

const props = defineProps({
  news: {
    type: Array,
    default: () => [],
  },
})

const latestNews = computed(() => {
  return [...(props.news ?? [])]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8)
})

const scrollRef = ref(null)

const scroll = (dir) => {
  if (!scrollRef.value) return
  scrollRef.value.scrollBy({ left: dir * 380, behavior: 'smooth' })
}
</script>

<template>
  <section
    class="relative overflow-hidden bg-gradient-to-b from-orange-50/40 via-white to-white py-28"
  >
    <!-- Decorative blob -->
    <div
      class="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange-100/60 blur-3xl"
    />
    <div
      class="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-orange-50 blur-3xl"
    />

    <BaseContainer class="relative">
      <div class="flex flex-wrap items-end justify-between gap-6">
        <SectionTitle
          badge="Update Terbaru"
          title="Berita Terkini"
          subtitle="Dapatkan informasi dan kabar terbaru seputar kegiatan, prestasi, dan perkembangan di SMKN 7 Semarang."
          align="left"
        />

        <!-- Nav arrows (desktop) -->
        <div class="hidden gap-3 md:flex">
          <button
            @click="scroll(-1)"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-orange-400 hover:text-orange-500"
          >
            <ChevronLeft :size="20" />
          </button>
          <button
            @click="scroll(1)"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-orange-400 hover:text-orange-500"
          >
            <ChevronRight :size="20" />
          </button>
        </div>
      </div>

      <div
        v-if="latestNews.length === 0"
        class="mt-16 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60 py-20 text-center"
      >
        <Newspaper :size="40" class="mb-3 text-slate-300" />
        <p class="text-slate-400">Belum ada berita untuk ditampilkan.</p>
      </div>

      <div
        v-else
        ref="scrollRef"
        class="no-scrollbar mt-14 flex gap-6 overflow-x-auto scroll-smooth pb-4"
      >
        <NewsCard
          v-for="item in latestNews"
          :key="item.id"
          :news="item"
          class="w-[340px] shrink-0 sm:w-[360px]"
        />
      </div>

      <div class="mt-14 flex justify-center">
        <RouterLink to="/news">
          <BaseButton size="lg"> Lihat Semua Berita </BaseButton>
        </RouterLink>
      </div>
    </BaseContainer>
  </section>
</template>
