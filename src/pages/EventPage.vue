<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Search,
  Clock3,
  ArrowLeft,
  ArrowUpDown,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'

import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import EventCard from '@/components/sections/Event/EventCard.vue'

import { publicApi } from '@/services/publicApi'
import { useFetch } from '@/composables/UseFetch'

const { data: footer } = useFetch(publicApi.getFooter)
const { data: majors } = useFetch(publicApi.getMajors)

const events = ref([])
const loading = ref(true)

const keyword = ref('')
const sort = ref('desc')
const activeCategory = ref('semua')

const currentPage = ref(1)
const perPage = 6

const loadEvents = async () => {
  try {
    loading.value = true
    events.value = await publicApi.getEvents({
      search: keyword.value,
      sort_by: 'created_at',
      sort: sort.value,
    })
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(loadEvents)

watch(keyword, () => {
  currentPage.value = 1
  loadEvents()
})

const toggleSort = async () => {
  sort.value = sort.value === 'desc' ? 'asc' : 'desc'
  currentPage.value = 1
  await loadEvents()
}

// Ambil daftar kategori unik dari data yang ada (fallback aman kalau field kategori belum ada)
const categories = computed(() => {
  const set = new Set()
  events.value.forEach((item) => {
    const cat = item.category_name || item.category
    if (cat) set.add(cat)
  })
  return Array.from(set)
})

const filteredEvents = computed(() => {
  if (activeCategory.value === 'semua') return events.value
  return events.value.filter(
    (item) => (item.category_name || item.category) === activeCategory.value
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredEvents.value.length / perPage)))

const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredEvents.value.slice(start, start + perPage)
})

watch(activeCategory, () => {
  currentPage.value = 1
})

const setCategory = (cat) => {
  activeCategory.value = cat
}

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  window.scrollTo({
    top: document.getElementById('event-grid')?.offsetTop - 100 || 0,
    behavior: 'smooth',
  })
}

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages = []
  const range = 1

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - range && i <= current + range)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }
  return pages
})
</script>

<template>
  <Navbar />

  <section
    class="relative overflow-hidden bg-gradient-to-b from-orange-50/50 via-white to-white pb-24 pt-16"
  >
    <div
      class="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-orange-100/50 blur-3xl"
    />
    <div
      class="pointer-events-none absolute -left-32 top-96 h-72 w-72 rounded-full bg-orange-50 blur-3xl"
    />

    <div class="relative mx-auto max-w-7xl px-6">
      <!-- Back -->
      <RouterLink
        to="/"
        class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-orange-500"
      >
        <ArrowLeft :size="16" />
        Kembali ke Beranda
      </RouterLink>

      <!-- Title -->
      <div class="mx-auto mt-10 max-w-2xl text-center">
        <span
          class="inline-block rounded-full bg-orange-100 px-4 py-1.5 text-xs font-semibold text-orange-600"
        >
          Event dan Kegiatan
        </span>

        <h1 class="mt-5 text-4xl font-extrabold text-slate-900 sm:text-5xl">Event</h1>

        <p class="mt-5 text-lg leading-8 text-slate-500">
          Ikuti berbagai kegiatan, seminar, workshop, dan agenda terbaru di SMKN 7 Semarang.
        </p>
      </div>

      <!-- Filter Bar -->
      <div class="mx-auto mt-12 max-w-4xl space-y-5">
        <div class="flex flex-col gap-3 sm:flex-row">
          <div class="relative flex-1">
            <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              v-model="keyword"
              type="text"
              placeholder="Cari event..."
              class="h-12 w-full rounded-full border border-slate-200 bg-white pl-12 pr-5 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
            />
          </div>

          <button
            @click="toggleSort"
            class="flex h-12 shrink-0 items-center justify-center gap-2 rounded-full border px-6 text-sm font-medium transition"
            :class="
              sort === 'desc'
                ? 'border-orange-500 bg-orange-500 text-white shadow-sm shadow-orange-200'
                : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-500'
            "
          >
            <Clock3 :size="16" />
            {{ sort === 'desc' ? 'Terbaru' : 'Terlama' }}
            <ArrowUpDown :size="14" class="opacity-60" />
          </button>
        </div>

        <!-- Category chips -->
        <div v-if="categories.length" class="flex flex-wrap items-center justify-center gap-2">
          <button
            @click="setCategory('semua')"
            class="rounded-full px-4 py-2 text-xs font-semibold transition"
            :class="
              activeCategory === 'semua'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            "
          >
            Semua
          </button>

          <button
            v-for="cat in categories"
            :key="cat"
            @click="setCategory(cat)"
            class="rounded-full px-4 py-2 text-xs font-semibold transition"
            :class="
              activeCategory === cat
                ? 'bg-orange-500 text-white'
                : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
            "
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        <div v-for="n in 6" :key="n" class="h-[400px] animate-pulse rounded-[22px] bg-slate-100" />
      </div>

      <!-- Empty -->
      <div
        v-else-if="filteredEvents.length === 0"
        class="mt-20 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60 py-24 text-center"
      >
        <CalendarDays :size="42" class="mb-4 text-slate-300" />
        <p class="text-lg font-semibold text-slate-600">Belum ada event ditemukan</p>
        <p class="mt-1 text-sm text-slate-400">Coba ubah kata kunci atau kategori pencarian.</p>
      </div>

      <!-- Grid -->
      <div id="event-grid" v-else class="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        <EventCard v-for="event in paginatedEvents" :key="event.id" :event="event" />
      </div>

      <!-- Pagination -->
      <div v-if="!loading && totalPages > 1" class="mt-16 flex items-center justify-center gap-2">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-orange-300 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft :size="18" />
        </button>

        <template v-for="(page, idx) in visiblePages" :key="idx">
          <span v-if="page === '...'" class="px-2 text-slate-400">…</span>
          <button
            v-else
            @click="goToPage(page)"
            class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition"
            :class="
              currentPage === page
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                : 'text-slate-600 hover:bg-orange-50 hover:text-orange-500'
            "
          >
            {{ page }}
          </button>
        </template>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-orange-300 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight :size="18" />
        </button>
      </div>
    </div>
  </section>

  <Footer v-if="footer" :footer="footer" :majors="majors" />
</template>
