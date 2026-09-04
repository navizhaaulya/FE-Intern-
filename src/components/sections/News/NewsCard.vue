<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  news: {
    type: Object,
    required: true
  }
})

const formattedDate = computed(() => {
  if (!props.news.created_at) return ''

  return new Date(props.news.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

const plainContent = (html) => {
  const text = html.replace(/<[^>]*>/g, '')
  return text.length > 120
    ? text.substring(0, 120) + '...'
    : text
}
</script>

<template>
  <RouterLink
  :to="`/news/${news.slug}`"
  class="block"
>

   <div
  class="flex h-[390px] flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
>

      <!-- Header -->

      <div
        class="flex items-center justify-between px-5 py-4 text-sm text-slate-500"
      >

        <span class="font-medium">
          {{ news.author ?? 'Admin' }}
        </span>

        <span>
          {{ formattedDate }}
        </span>

      </div>

      <!-- Image -->

      <div class="overflow-hidden">

        <img
          :src="news.img_cover"
          :alt="news.title"
          class="h-[220px] w-full object-cover transition duration-500 hover:scale-105"
        >

      </div>

      <!-- Content -->

      <div class="flex flex-1 flex-col p-6">

  <h3 class="line-clamp-2 text-[18px] font-bold leading-8 text-slate-900">
    {{ news.title }}
  </h3>

  <p
  class="mt-3 text-sm leading-7 text-slate-500"
>
  {{ plainContent(news.content) }}
</p>
</div>

    </div>

  </RouterLink>
</template>