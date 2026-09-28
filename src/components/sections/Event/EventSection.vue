<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { CalendarDays, MapPin, ArrowRight } from 'lucide-vue-next'

import BaseContainer from '@/components/UI/BaseContainer.vue'
import BaseButton from '@/components/UI/BaseButton.vue'
import SectionTitle from '@/components/UI/SectionTitle.vue'

const props = defineProps({
  events: {
    type: Array,
    default: () => [],
  },
})

const now = new Date()

const plainContent = (html, max = 140) => {
  if (!html) return ''
  const text = html.replace(/<[^>]*>/g, '')
  return text.length > max ? text.substring(0, max) + '...' : text
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const sortedEvents = computed(() => {
  return [...(props.events ?? [])].sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
})

const featuredEvent = computed(() => {
  const list = sortedEvents.value
  if (!list.length) return null

  const upcoming = list.find((e) => {
    const end = e.end_date ? new Date(e.end_date) : new Date(e.start_date)
    return end >= now
  })

  return upcoming || list[list.length - 1]
})

const isOngoing = computed(() => {
  if (!featuredEvent.value) return false
  const start = new Date(featuredEvent.value.start_date)
  const end = featuredEvent.value.end_date ? new Date(featuredEvent.value.end_date) : start
  return now >= start && now <= end
})

const otherEvents = computed(() => {
  if (!featuredEvent.value) return sortedEvents.value.slice(0, 3)
  return sortedEvents.value.filter((e) => e.id !== featuredEvent.value.id).slice(0, 6)
})
</script>

<template>
  <section id="events" class="relative overflow-hidden bg-slate-50 py-28">
    <div
      class="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-orange-100/40 blur-3xl"
    />

    <BaseContainer class="relative">
      <SectionTitle
        title="Kegiatan & Event"
        subtitle="Ikuti berbagai kegiatan, acara, lomba, dan informasi terbaru yang diselenggarakan oleh SMKN 7 Semarang."
        align="left"
      />

      <template v-if="featuredEvent">
        <!-- FEATURED EVENT (full width, di atas) -->
        <RouterLink
          :to="`/events/${featuredEvent.slug}`"
          class="group relative mt-14 flex flex-col overflow-hidden rounded-[28px] bg-slate-900 text-white shadow-xl lg:flex-row"
        >
          <div class="relative h-[280px] overflow-hidden sm:h-[360px] lg:h-auto lg:w-[55%]">
            <img
              :src="featuredEvent.img_cover"
              :alt="featuredEvent.title"
              class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-slate-900/10"
            />

            <span
              class="absolute left-6 top-6 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
              :class="isOngoing ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'"
            >
              <span
                class="h-1.5 w-1.5 rounded-full bg-white"
                :class="isOngoing && 'animate-pulse'"
              />
              {{ isOngoing ? 'Sedang Berlangsung' : 'Akan Datang' }}
            </span>
          </div>

          <div class="flex flex-1 flex-col justify-center p-8 sm:p-10">
            <h3 class="text-2xl font-bold leading-snug sm:text-3xl">
              {{ featuredEvent.title }}
            </h3>

            <p class="mt-4 line-clamp-3 text-sm leading-6 text-white/70 sm:text-base">
              {{ plainContent(featuredEvent.content, 180) }}
            </p>

            <div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
              <span class="flex items-center gap-2">
                <CalendarDays :size="16" class="text-orange-400" />
                {{ formatDate(featuredEvent.start_date) }}
              </span>
              <span v-if="featuredEvent.location" class="flex items-center gap-2">
                <MapPin :size="16" class="text-orange-400" />
                {{ featuredEvent.location }}
              </span>
            </div>

            <div
              class="mt-8 flex items-center gap-1.5 text-sm font-semibold text-orange-400 transition group-hover:gap-2.5"
            >
              Lihat detail
              <ArrowRight :size="16" />
            </div>
          </div>
        </RouterLink>

        <!-- OTHER EVENTS (grid di bawah) -->
        <!-- OTHER EVENTS (scroll horizontal) -->
        <div v-if="otherEvents.length" class="no-scrollbar mt-8 flex gap-6 overflow-x-auto pb-4">
          <RouterLink
            v-for="event in otherEvents"
            :key="event.id"
            :to="`/events/${event.slug}`"
            class="group flex w-[300px] shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"
          >
            <div class="aspect-[16/10] overflow-hidden bg-slate-100">
              <img
                :src="event.img_cover"
                :alt="event.title"
                class="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />
            </div>

            <div class="flex flex-1 flex-col p-4">
              <span class="flex items-center gap-1.5 text-xs font-medium text-orange-500">
                <CalendarDays :size="12" />
                {{ formatDate(event.start_date) }}
              </span>

              <h4
                class="mt-1.5 line-clamp-2 text-sm font-bold leading-5 text-slate-900 transition group-hover:text-orange-600"
              >
                {{ event.title }}
              </h4>

              <span
                v-if="event.location"
                class="mt-1.5 flex items-center gap-1.5 truncate text-xs text-slate-400"
              >
                <MapPin :size="11" />
                {{ event.location }}
              </span>
            </div>
          </RouterLink>
        </div>
      </template>

      <!-- Empty state -->
      <div
        v-else
        class="mt-14 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60 py-20 text-center"
      >
        <CalendarDays :size="40" class="mb-3 text-slate-300" />
        <p class="text-slate-400">Belum ada event untuk ditampilkan.</p>
      </div>

      <div class="mt-14 flex justify-center">
        <RouterLink to="/events">
          <BaseButton size="lg"> Lihat Semua Event </BaseButton>
        </RouterLink>
      </div>
    </BaseContainer>
  </section>
</template>
