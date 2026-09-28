<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'

const props = defineProps({
  news: {
    type: Object,
    required: true,
  },
})

const formattedDate = computed(() => {
  if (!props.news.created_at) return ''
  return new Date(props.news.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const plainContent = (html) => {
  if (!html) return ''
  const text = html.replace(/<[^>]*>/g, '')
  return text.length > 100 ? text.substring(0, 100) + '...' : text
}
</script>

<template>
  <RouterLink :to="`/news/${news.slug}`" class="group block">
    <div
      class="flex h-[400px] flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-orange-200 hover:shadow-xl"
    >
      <!-- Image -->
      <div class="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          :src="news.img_cover"
          :alt="news.title"
          class="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />

        <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0" />

        <span
          class="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-orange-600 backdrop-blur"
        >
          {{ formattedDate }}
        </span>
      </div>

      <!-- Content -->
      <div class="flex flex-1 flex-col p-6">
        <span class="text-xs font-medium uppercase tracking-wide text-orange-500">
          {{ news.author ?? 'Admin' }}
        </span>

        <h3
          class="mt-2 line-clamp-2 text-[17px] font-bold leading-7 text-slate-900 transition group-hover:text-orange-600"
        >
          {{ news.title }}
        </h3>

        <p class="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {{ plainContent(news.content) }}
        </p>

        <div
          class="mt-auto flex items-center gap-1.5 pt-4 text-sm font-semibold text-orange-500 transition group-hover:gap-2.5"
        >
          Baca selengkapnya
          <ArrowRight :size="15" />
        </div>
      </div>
    </div>
  </RouterLink>
</template>
