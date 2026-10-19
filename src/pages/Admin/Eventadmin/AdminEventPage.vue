<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Plus, SlidersHorizontal, X } from 'lucide-vue-next'
import Swal from 'sweetalert2'

import { api } from '@/services/api'
import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import DataTable from '@/components/UI/DataTable.vue'

const router = useRouter()

const eventList = ref([])
const loading = ref(false)
const error = ref('')
const search = ref('')

const statusFilter = ref('semua')
const sortOrder = ref('asc')
const filterOpen = ref(false)
const filterPanel = ref(null)

const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const totalPages = ref(1)

const columns = [
  { key: 'img_cover', label: 'Cover', type: 'image' },
  { key: 'title', label: 'Event' },
  { key: 'location', label: 'Lokasi' },
  { key: 'start_date', label: 'Tanggal Mulai', type: 'date' },
  { key: 'end_date', label: 'Tanggal Selesai', type: 'date' },
  { key: 'status', label: 'Status', type: 'status' },
]

const statusOptions = computed(() => {
  const set = new Set()
  eventList.value.forEach((e) => {
    if (e.status) set.add(e.status)
  })
  return Array.from(set)
})

const activeFilterCount = computed(() => (statusFilter.value !== 'semua' ? 1 : 0))

const resetFilters = () => {
  statusFilter.value = 'semua'
  sortOrder.value = 'asc'
}

const closeFilterOnOutsideClick = (event) => {
  if (filterPanel.value && !filterPanel.value.contains(event.target)) {
    filterOpen.value = false
  }
}

// =====================================================
// GET EVENTS (per halaman dari backend)
// =====================================================

const getEvents = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await api.list('events', {
      page: currentPage.value,
      limit: itemsPerPage.value,
    })
    const data = response?.data || []

    eventList.value = data.map((item) => ({
      ...item,
      img_cover: item.img_cover
        ? `${import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')}/api/file/events/img_cover/${item.id}/${Date.now()}`
        : null,
    }))

    totalItems.value = response?.total ?? data.length
    totalPages.value = response?.totalPage ?? 1
  } catch (err) {
    console.error('Error mengambil event:', err)
    error.value = 'Gagal mengambil data event.'
  } finally {
    loading.value = false
  }
}

// =====================================================
// SEARCH + FILTER (hanya pada data di halaman yang sedang tampil)
// =====================================================

const filteredEvents = computed(() => {
  let list = eventList.value

  const keyword = search.value.toLowerCase().trim()
  if (keyword) {
    list = list.filter(
      (event) =>
        event.title?.toLowerCase().includes(keyword) ||
        event.location?.toLowerCase().includes(keyword)
    )
  }

  if (statusFilter.value !== 'semua') {
    list = list.filter((event) => event.status === statusFilter.value)
  }

  return [...list].sort((a, b) => {
    const dateA = new Date(a.start_date)
    const dateB = new Date(b.start_date)
    return sortOrder.value === 'asc' ? dateA - dateB : dateB - dateA
  })
})

const changePage = (page) => {
  const target = Number(page)
  if (target < 1 || target > totalPages.value) return
  currentPage.value = target
}

watch(currentPage, () => {
  getEvents()
})

// =====================================================
// NAVIGATION
// =====================================================

const goCreate = () => router.push('/admin/events/create')
const goDetail = (id) => router.push(`/admin/events/${id}`)
const goEdit = (id) => router.push(`/admin/events/${id}/edit`)

const deleteEvent = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus event?',
    text: 'Event yang dihapus tidak dapat dikembalikan.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, hapus',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    confirmButtonColor: '#f97316',
    cancelButtonColor: '#9ca3af',
  })

  if (!result.isConfirmed) return

  try {
    await api.delete('events', id)

    // kalau yang dihapus satu-satunya data di halaman ini, mundur satu halaman
    if (eventList.value.length === 1 && currentPage.value > 1) {
      currentPage.value -= 1 // watcher akan memanggil getEvents()
    } else {
      await getEvents()
    }

    Swal.fire({
      title: 'Berhasil!',
      text: 'Event berhasil dihapus.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#f97316',
      timer: 2000,
      timerProgressBar: true,
    })
  } catch (err) {
    console.error('Error menghapus event:', err)
    Swal.fire({
      title: 'Gagal!',
      text: err.response?.data?.message || 'Gagal menghapus event.',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#f97316',
    })
  }
}

onMounted(() => {
  document.addEventListener('click', closeFilterOnOutsideClick)
  getEvents()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeFilterOnOutsideClick)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="flex">
      <AdminSidebar />

      <main class="min-w-0 flex-1 px-6 py-8 lg:px-10">
        <div class="mb-4 flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-sm">
          <button
            type="button"
            @click="router.back()"
            class="text-2xl text-gray-700 transition hover:text-orange-500"
          >
            ‹
          </button>
          <div>
            <h1 class="font-semibold text-gray-800">Kelola Event</h1>
          </div>
        </div>

        <section
          class="mb-4 flex items-center justify-between rounded-xl bg-white px-6 py-4 shadow-sm"
        >
          <div>
            <h2 class="text-xl font-bold text-gray-800">Daftar Event</h2>
            <p class="mt-1 text-sm text-gray-500">Kelola event yang ditampilkan pada website.</p>
          </div>

          <button
            type="button"
            @click="goCreate"
            class="flex items-center gap-2 rounded-xl bg-orange-400 px-5 py-3 font-semibold text-white transition hover:bg-orange-500"
          >
            <Plus :size="18" />
            Tambah Event
          </button>
        </section>

        <div class="mb-5 rounded-xl border border-gray-200 bg-white p-4">
          <div class="flex flex-wrap items-center gap-3">
            <div class="relative max-w-md flex-1">
              <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                v-model="search"
                type="text"
                placeholder="Cari event..."
                class="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div ref="filterPanel" class="relative">
              <button
                @click="filterOpen = !filterOpen"
                class="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition"
                :class="
                  activeFilterCount > 0
                    ? 'border-orange-400 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-600 hover:border-orange-300'
                "
              >
                <SlidersHorizontal :size="15" />
                Filter
                <span
                  v-if="activeFilterCount > 0"
                  class="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white"
                >
                  {{ activeFilterCount }}
                </span>
              </button>

              <div
                v-if="filterOpen"
                class="absolute left-0 top-full z-20 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-lg"
              >
                <div class="mb-4 flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-800">Filter Event</span>
                  <button @click="filterOpen = false" class="text-gray-400 hover:text-gray-600">
                    <X :size="16" />
                  </button>
                </div>

                <div class="space-y-4">
                  <div v-if="statusOptions.length">
                    <label class="mb-1.5 block text-xs font-medium text-gray-500">Status</label>
                    <select
                      v-model="statusFilter"
                      class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    >
                      <option value="semua">Semua Status</option>
                      <option v-for="status in statusOptions" :key="status" :value="status">
                        {{ status }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-gray-500"
                      >Urutkan Tanggal</label
                    >
                    <select
                      v-model="sortOrder"
                      class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    >
                      <option value="asc">Terdekat</option>
                      <option value="desc">Terjauh</option>
                    </select>
                  </div>
                </div>

                <button
                  v-if="activeFilterCount > 0"
                  @click="resetFilters"
                  class="mt-4 w-full rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="error" class="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {{ error }}
          <button @click="getEvents" class="ml-3 font-semibold underline">Coba lagi</button>
        </div>

        <DataTable
          v-else
          :columns="columns"
          :items="filteredEvents"
          :loading="loading"
          :current-page="currentPage"
          :items-per-page="itemsPerPage"
          :total-pages="totalPages"
          :selectable="false"
          @detail="goDetail"
          @edit="goEdit"
          @delete="deleteEvent"
          @page-change="changePage"
        />
      </main>
    </div>
  </div>
</template>
