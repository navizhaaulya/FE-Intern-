<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { CalendarDays, MapPin } from 'lucide-vue-next'
import BaseCard from '@/components/UI/BaseCard.vue'

const props = defineProps({
  event: {
    type: Object,
    required: true
  }
})
const plainContent = (html) => {
  const text = html.replace(/<[^>]*>/g, '')

  return text.length > 100
    ? text.substring(0, 100) + '...'
    : text
}
const formattedDate = computed(() => {
  if (!props.event.start_date) return ''

  return new Date(props.event.start_date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})
</script>
<template>
  <RouterLink
  :to="`/events/${event.slug}`"
  class="block"
>
   <BaseCard
  class="group flex h-full flex-col overflow-hidden rounded-[24px] border border-transparent bg-white transition-all duration-300 hover:-translate-y-1 hover:border-orange-400 hover:shadow-xl"
>
      <!-- Cover -->
      <div class="h-[240px] overflow-hidden">
        <img
          :src="event.img_cover"
          :alt="event.title"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        >
      </div>
      <!-- Content -->
<div class="flex flex-1 flex-col p-6">

  <h3 class="line-clamp-2 text-center text-2xl font-bold text-slate-900">
    {{ event.title }}
  </h3>

  <p class="mt-3 line-clamp-3 text-center text-sm leading-7 text-slate-500">
    {{ plainContent(event.content) }}
  </p>

  <div class="mt-auto pt-6 space-y-2">

    <div class="flex items-center justify-center gap-2 text-sm text-slate-600">
      <MapPin :size="15" class="text-orange-500"/>
      {{ event.location }}
    </div>

    <div class="flex items-center justify-center gap-2 text-sm text-slate-600">
      <CalendarDays :size="15" class="text-orange-500"/>
      {{ formattedDate }}
    </div>

  </div>

</div>
    </BaseCard>
  </RouterLink>
</template>