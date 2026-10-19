<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import {
  Users,
  Vote,
  Newspaper,
  MessageSquare,
  Plus,
  CalendarDays,
  ChevronRight,
} from 'lucide-vue-next'

import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import { publicApi } from '@/services/publicApi'
import { api } from '@/services/api'
import http from '@/services/http'

const router = useRouter()

const footer = ref(null)
const majors = ref([])

const totalUsers = ref(null) // null = belum diketahui/gagal, ditampilkan '-'
const votingList = ref([]) // dari /admin/votings, lengkap semua status
const newsList = ref([]) // dari api.list('news'), lengkap semua status
const feedbacks = ref([])
const feedbackCategories = ref([])

const loading = ref(true)

/*
|--------------------------------------------------------------------------
| LOAD DATA
|--------------------------------------------------------------------------
*/

const loadDashboard = async () => {
  loading.value = true

  const results = await Promise.allSettled([
    publicApi.getFooter(),
    publicApi.getMajors(),
    http.get('/admin/votings'),
    api.list('news'),
    api.list('feedback_categories'),
    http.get('/feedbacks'),
    api.list('user'),
  ])

  const [
    footerResult,
    majorsResult,
    votingResult,
    newsResult,
    categoriesResult,
    feedbackResult,
    userResult,
  ] = results

  // Footer & Majors (dipakai juga oleh Footer component)
  if (footerResult.status === 'fulfilled') {
    const res = footerResult.value
    footer.value = Array.isArray(res) ? res : res?.data || res
  }

  if (majorsResult.status === 'fulfilled') {
    const res = majorsResult.value
    majors.value = Array.isArray(res) ? res : res?.data || []
  }

  // Voting — ambil dari endpoint admin biar dapat semua status, bukan cuma yang aktif
  if (votingResult.status === 'fulfilled') {
    votingList.value = votingResult.value.data?.data || []
  } else {
    console.error('Gagal mengambil data voting:', votingResult.reason)
  }

  // Berita — ambil dari CRUD admin biar dapat semua status (draft/publish/archive)
  if (newsResult.status === 'fulfilled') {
    newsList.value = newsResult.value?.data || []
  } else {
    console.error('Gagal mengambil data berita:', newsResult.reason)
  }

  // Kategori Kritik & Saran
  if (categoriesResult.status === 'fulfilled') {
    feedbackCategories.value = categoriesResult.value?.data || []
  } else {
    console.error('Gagal mengambil kategori kritik & saran:', categoriesResult.reason)
  }

  // Daftar Kritik & Saran
  if (feedbackResult.status === 'fulfilled') {
    const res = feedbackResult.value
    feedbacks.value = Array.isArray(res.data) ? res.data : res.data?.data || []
  } else {
    console.error('Gagal mengambil data kritik & saran:', feedbackResult.reason)
  }

  // Total Pengguna (opsional, tidak merusak dashboard kalau gagal)
  if (userResult.status === 'fulfilled') {
    totalUsers.value = (userResult.value?.data || []).length
  } else {
    console.error('Gagal mengambil total pengguna (cek nama model User):', userResult.reason)
    totalUsers.value = null
  }

  loading.value = false
}

/*
|--------------------------------------------------------------------------
| STATISTIK UTAMA
|--------------------------------------------------------------------------
*/

const totalVotingActive = computed(() => votingList.value.filter((v) => v.status_code).length)

const totalNews = computed(() => newsList.value.length)

const isSaranType = (item) => item.type === true || item.type === 1 || item.type === '1'
const isKritikType = (item) => item.type === false || item.type === 0 || item.type === '0'

const totalSaran = computed(() => feedbacks.value.filter(isSaranType).length)
const totalKritik = computed(() => feedbacks.value.filter(isKritikType).length)

/*
|--------------------------------------------------------------------------
| STATISTIK KRITIK & SARAN PER KATEGORI (DINAMIS, BUKAN HARDCODE)
|--------------------------------------------------------------------------
*/

const categoryChartData = computed(() => {
  return feedbackCategories.value.map((cat) => {
    const inCategory = feedbacks.value.filter((f) => String(f.category_id) === String(cat.id))
    return {
      id: cat.id,
      name: cat.category_name,
      kritik: inCategory.filter(isKritikType).length,
      saran: inCategory.filter(isSaranType).length,
    }
  })
})

const maxKritik = computed(() => Math.max(1, ...categoryChartData.value.map((c) => c.kritik)))

const maxSaran = computed(() => Math.max(1, ...categoryChartData.value.map((c) => c.saran)))

const barHeight = (value, max) => {
  if (value === 0) return '4%'
  return `${Math.max(8, Math.round((value / max) * 100))}%`
}

/*
|--------------------------------------------------------------------------
| TABEL DAFTAR VOTING
|--------------------------------------------------------------------------
*/

const recentVotings = computed(() => {
  return [...votingList.value]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)
})

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/*
|--------------------------------------------------------------------------
| QUICK ACCESS
|--------------------------------------------------------------------------
*/

const goTo = (path) => {
  router.push(path)
}

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <!-- NAVBAR WEBSITE -->
  <Navbar />

  <!-- ADMIN LAYOUT -->
  <div class="flex min-h-screen bg-[#F7F7F7]">
    <!-- SIDEBAR -->
    <AdminSidebar />

    <!-- CONTENT -->
    <main class="flex-1 px-5 py-8 sm:px-8 lg:px-12">
      <div class="mx-auto max-w-[1180px]">
        <!-- HEADER -->
        <div class="mb-7">
          <p class="text-sm font-semibold text-[#FF7A00]">Admin Panel</p>

          <h1 class="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Selamat datang, Admin!
          </h1>

          <p class="mt-1 text-sm text-slate-500">
            Kelola dan pantau aktivitas website SMKN 7 Semarang.
          </p>
        </div>

        <!-- ================================================= -->
        <!-- STATISTIK -->
        <!-- ================================================= -->

        <div v-if="loading" class="flex min-h-[300px] items-center justify-center">
          <p class="text-sm text-slate-500">Memuat dashboard...</p>
        </div>

        <template v-else>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <!-- TOTAL PENGGUNA -->

            <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs text-slate-500">Total Pengguna</p>

                  <p class="mt-2 text-2xl font-bold text-slate-900">
                    {{ totalUsers ?? '-' }}
                  </p>
                </div>

                <div class="rounded-xl bg-orange-50 p-3 text-[#FF7A00]">
                  <Users :size="21" />
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs text-slate-500">Voting Aktif</p>

                  <p class="mt-2 text-2xl font-bold text-slate-900">
                    {{ totalVotingActive }}
                  </p>
                </div>

                <div class="rounded-xl bg-orange-50 p-3 text-[#FF7A00]">
                  <Vote :size="21" />
                </div>
              </div>
            </div>

            <!-- BERITA -->

            <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs text-slate-500">Berita Terunggah</p>

                  <p class="mt-2 text-2xl font-bold text-slate-900">
                    {{ totalNews }}
                  </p>
                </div>

                <div class="rounded-xl bg-orange-50 p-3 text-[#FF7A00]">
                  <Newspaper :size="21" />
                </div>
              </div>
            </div>

            <!-- SARAN -->

            <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs text-slate-500">Total Saran</p>

                  <p class="mt-2 text-2xl font-bold text-slate-900">
                    {{ totalSaran }}
                  </p>
                </div>

                <div class="rounded-xl bg-orange-50 p-3 text-[#FF7A00]">
                  <MessageSquare :size="21" />
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs text-slate-500">Total Kritik</p>

                  <p class="mt-2 text-2xl font-bold text-slate-900">
                    {{ totalKritik }}
                  </p>
                </div>

                <div class="rounded-xl bg-orange-50 p-3 text-[#FF7A00]">
                  <MessageSquare :size="21" />
                </div>
              </div>
            </div>
          </div>

          <!-- ================================================= -->
          <!-- QUICK ACCESS -->
          <!-- ================================================= -->

          <section class="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 class="text-sm font-bold text-slate-900">QUICK ACCESS</h2>

                <p class="mt-1 text-sm text-slate-500">Akses cepat ke fitur utama</p>
              </div>

              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  @click="goTo('/admin/news')"
                  class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#FF7A00] hover:text-[#FF7A00]"
                >
                  <Plus :size="15" />
                  Tambah Berita
                </button>

                <button
                  type="button"
                  @click="goTo('/admin/events')"
                  class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#FF7A00] hover:text-[#FF7A00]"
                >
                  <CalendarDays :size="15" />
                  Tambah Event
                </button>

                <button
                  type="button"
                  @click="goTo('/admin/voting')"
                  class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#FF7A00] hover:text-[#FF7A00]"
                >
                  <Vote :size="15" />
                  Tambah Vote
                </button>

                <button
                  type="button"
                  @click="goTo('/admin/feedback')"
                  class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#FF7A00] hover:text-[#FF7A00]"
                >
                  <MessageSquare :size="15" />
                  Kritik & Saran
                </button>
              </div>
            </div>
          </section>

          <!-- ================================================= -->
          <!-- STATISTIK KRITIK & SARAN (DINAMIS SESUAI DATA ASLI) -->
          <!-- ================================================= -->

          <section class="mt-6 grid gap-6 lg:grid-cols-2">
            <!-- KRITIK -->

            <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 class="font-bold text-slate-900">Statistik Kritik</h2>

              <div
                v-if="categoryChartData.length === 0"
                class="mt-6 py-10 text-center text-sm text-slate-400"
              >
                Belum ada kategori kritik & saran.
              </div>

              <div v-else class="mt-6">
                <div class="flex h-52 items-end justify-around gap-5">
                  <div
                    v-for="cat in categoryChartData"
                    :key="cat.id"
                    class="flex h-full flex-1 flex-col justify-end"
                  >
                    <p class="mb-1 text-center text-xs font-semibold text-slate-600">
                      {{ cat.kritik }}
                    </p>
                    <div
                      class="rounded-t-xl bg-[#FF9343] transition-all"
                      :style="{ height: barHeight(cat.kritik, maxKritik) }"
                    ></div>

                    <p class="mt-2 truncate text-center text-xs text-slate-500" :title="cat.name">
                      {{ cat.name }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- SARAN -->

            <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 class="font-bold text-slate-900">Statistik Saran</h2>

              <div
                v-if="categoryChartData.length === 0"
                class="mt-6 py-10 text-center text-sm text-slate-400"
              >
                Belum ada kategori kritik & saran.
              </div>

              <div v-else class="mt-6">
                <div class="flex h-52 items-end justify-around gap-5">
                  <div
                    v-for="cat in categoryChartData"
                    :key="cat.id"
                    class="flex h-full flex-1 flex-col justify-end"
                  >
                    <p class="mb-1 text-center text-xs font-semibold text-slate-600">
                      {{ cat.saran }}
                    </p>
                    <div
                      class="rounded-t-xl bg-[#FF9343] transition-all"
                      :style="{ height: barHeight(cat.saran, maxSaran) }"
                    ></div>

                    <p class="mt-2 truncate text-center text-xs text-slate-500" :title="cat.name">
                      {{ cat.name }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ================================================= -->
          <!-- DAFTAR VOTING -->
          <!-- ================================================= -->

          <section class="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="font-bold text-slate-900">Daftar Voting</h2>

                <p class="mt-1 text-xs text-slate-500">Voting yang tersedia di website.</p>
              </div>

              <button
                type="button"
                @click="goTo('/admin/voting')"
                class="inline-flex items-center gap-1 text-xs font-semibold text-[#FF7A00] hover:underline"
              >
                Lihat semua
                <ChevronRight :size="15" />
              </button>
            </div>

            <div class="mt-5 overflow-x-auto">
              <table class="w-full min-w-[600px]">
                <thead>
                  <tr class="border-b border-slate-100 text-left text-xs text-slate-500">
                    <th class="px-4 py-3">Judul Voting</th>

                    <th class="px-4 py-3">Periode</th>

                    <th class="px-4 py-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="voting in recentVotings"
                    :key="voting.id"
                    class="border-b border-slate-50 last:border-0"
                  >
                    <td class="px-4 py-4 text-sm font-semibold text-slate-800">
                      {{ voting.title }}
                    </td>

                    <td class="px-4 py-4 text-sm text-slate-500">
                      {{ formatDate(voting.start_date) }} -
                      {{ formatDate(voting.end_date) }}
                    </td>

                    <td class="px-4 py-4">
                      <span
                        class="rounded-full px-3 py-1 text-xs font-semibold"
                        :class="
                          voting.status_code
                            ? 'bg-green-50 text-green-600'
                            : 'bg-red-50 text-red-500'
                        "
                      >
                        {{ voting.status_code ? 'Aktif' : 'Nonaktif' }}
                      </span>
                    </td>
                  </tr>

                  <tr v-if="!recentVotings.length">
                    <td colspan="3" class="px-4 py-8 text-center text-sm text-slate-400">
                      Belum ada data voting.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </template>
      </div>
    </main>

    <div class="h-16 bg-[#F7F7F7] sm:h-20"></div>
  </div>

  <Footer v-if="footer" :footer="footer" :majors="majors" />
</template>
