<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Search, ArrowLeft, Laptop, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-vue-next'

import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import MajorShowcase from '@/components/sections/Major/MajorShowcase.vue'

import { publicApi } from '@/services/publicApi'
import { useFetch } from '@/composables/UseFetch'

const { data: footer } = useFetch(publicApi.getFooter)
const { data: majors, loading } = useFetch(publicApi.getMajors)

const keyword = ref('')
const sortOrder = ref('asc') // 'asc' = A-Z, 'desc' = Z-A
const activeDuration = ref('semua')

const currentPage = ref(1)
const perPage = 4

const toggleSort = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  currentPage.value = 1
}

// Ambil daftar durasi unik dari data yang ada
const durations = computed(() => {
  const set = new Set()
  ;(majors.value ?? []).forEach((m) => {
    if (m.major_duration) set.add(m.major_duration)
  })
  return Array.from(set).sort((a, b) => a - b)
})

const setDuration = (val) => {
  activeDuration.value = val
  currentPage.value = 1
}

const filteredMajors = computed(() => {
  let list = majors.value ?? []

  const q = keyword.value.toLowerCase().trim()
  if (q) {
    list = list.filter(
      (m) => m.major_name?.toLowerCase().includes(q) || m.code?.toLowerCase().includes(q)
    )
  }

  if (activeDuration.value !== 'semua') {
    list = list.filter((m) => m.major_duration === activeDuration.value)
  }

  list = [...list].sort((a, b) => {
    const cmp = (a.major_name || '').localeCompare(b.major_name || '')
    return sortOrder.value === 'asc' ? cmp : -cmp
  })

  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredMajors.value.length / perPage)))

const paginatedMajors = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredMajors.value.slice(start, start + perPage)
})

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  window.scrollTo({
    top: document.getElementById('major-grid')?.offsetTop - 100 || 0,
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
      <RouterLink
        to="/"
        class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-orange-500"
      >
        <ArrowLeft :size="16" />
        Kembali ke Beranda
      </RouterLink>

      <div class="mx-auto mt-10 max-w-2xl text-center">
        <span
          class="inline-block rounded-full bg-orange-100 px-4 py-1.5 text-xs font-semibold text-orange-600"
        >
          Kompetensi Keahlian
        </span>

        <h1 class="mt-5 text-4xl font-extrabold text-slate-900 sm:text-5xl">Jurusan</h1>

        <p class="mt-5 text-lg leading-8 text-slate-500">
          Kompetensi keahlian yang tersedia di SMKN 7 Semarang, dirancang untuk membekali siswa
          dengan keterampilan siap kerja.
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
              placeholder="Cari jurusan..."
              class="h-12 w-full rounded-full border border-slate-200 bg-white pl-12 pr-5 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
            />
          </div>

          <button
            @click="toggleSort"
            class="flex h-12 shrink-0 items-center justify-center gap-2 rounded-full border px-6 text-sm font-medium transition"
            :class="
              sortOrder === 'asc'
                ? 'border-orange-500 bg-orange-500 text-white shadow-sm shadow-orange-200'
                : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-500'
            "
          >
            {{ sortOrder === 'asc' ? 'A - Z' : 'Z - A' }}
            <ArrowUpDown :size="14" class="opacity-60" />
          </button>
        </div>

        <!-- Filter Durasi -->
        <div v-if="durations.length" class="flex flex-wrap items-center justify-center gap-2">
          <button
            @click="setDuration('semua')"
            class="rounded-full px-4 py-2 text-xs font-semibold transition"
            :class="
              activeDuration === 'semua'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            "
          >
            Semua
          </button>

          <button
            v-for="d in durations"
            :key="d"
            @click="setDuration(d)"
            class="rounded-full px-4 py-2 text-xs font-semibold transition"
            :class="
              activeDuration === d
                ? 'bg-orange-500 text-white'
                : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
            "
          >
            {{ d }} Tahun
          </button>
        </div>
      </div>

      <div v-if="loading" class="mt-20 space-y-8">
        <div v-for="n in 3" :key="n" class="h-[360px] animate-pulse rounded-[28px] bg-slate-100" />
      </div>

      <div
        v-else-if="filteredMajors.length === 0"
        class="mt-20 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60 py-24 text-center"
      >
        <Laptop :size="42" class="mb-4 text-slate-300" />
        <p class="text-lg font-semibold text-slate-600">Jurusan tidak ditemukan</p>
        <p class="mt-1 text-sm text-slate-400">Coba ubah kata kunci atau filter pencarian.</p>
      </div>

      <div id="major-grid" v-else class="mt-10 divide-y divide-slate-100">
        <MajorShowcase
          v-for="(major, idx) in paginatedMajors"
          :key="major.id"
          :major="major"
          :reverse="idx % 2 === 1"
        />
      </div>

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
