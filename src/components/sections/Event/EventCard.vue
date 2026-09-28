<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { CalendarDays, MapPin, ArrowRight } from 'lucide-vue-next'
import BaseCard from '@/components/UI/BaseCard.vue'

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
})

const plainContent = (html) => {
  if (!html) return ''
  const text = html.replace(/<[^>]*>/g, '')
  return text.length > 100 ? text.substring(0, 100) + '...' : text
}

const formattedDate = computed(() => {
  if (!props.event.start_date) return ''
  return new Date(props.event.start_date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})
</script>

<template>
  <RouterLink :to="`/events/${event.slug}`" class="group block h-full">
    <BaseCard
      class="flex h-[400px] flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-orange-200 hover:shadow-xl"
    >
      <!-- Cover -->
      <div class="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          :src="event.img_cover"
          :alt="event.title"
          class="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />

        <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0" />

        <span
          v-if="formattedDate"
          class="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-orange-600 backdrop-blur"
        >
          <CalendarDays :size="13" />
          {{ formattedDate }}
        </span>
      </div>

      <!-- Content -->
      <div class="flex flex-1 flex-col p-6">
        <h3
          class="line-clamp-2 text-[17px] font-bold leading-7 text-slate-900 transition group-hover:text-orange-600"
        >
          {{ event.title }}
        </h3>

        <p class="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {{ plainContent(event.content) }}
        </p>

        <div
          v-if="event.location"
          class="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500"
        >
          <MapPin :size="13" class="text-orange-500" />
          {{ event.location }}
        </div>

        <div
          class="mt-auto flex items-center gap-1.5 pt-4 text-sm font-semibold text-orange-500 transition group-hover:gap-2.5"
        >
          Lihat detail
          <ArrowRight :size="15" />
        </div>
      </div>
    </BaseCard>
  </RouterLink>
</template>
