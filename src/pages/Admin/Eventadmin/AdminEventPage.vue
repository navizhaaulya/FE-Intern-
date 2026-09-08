<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Plus } from 'lucide-vue-next'
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

const currentPage = ref(1)
const itemsPerPage = 10

// =====================================================
// TABLE COLUMNS
// =====================================================

const columns = [
  {
    key: 'img_cover',
    label: 'Cover',
    type: 'image',
  },
  {
    key: 'title',
    label: 'Event',
  },
  {
    key: 'location',
    label: 'Lokasi',
  },
  {
    key: 'start_date',
    label: 'Tanggal Mulai',
    type: 'date',
  },
  {
    key: 'end_date',
    label: 'Tanggal Selesai',
    type: 'date',
  },
  {
    key: 'status',
    label: 'Status',
    type: 'status',
  },
]

// =====================================================
// GET EVENTS
// =====================================================

const getEvents = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await api.list('events')

    eventList.value = response?.data || []
  } catch (err) {
    console.error('Error mengambil event:', err)

    error.value = 'Gagal mengambil data event.'
  } finally {
    loading.value = false
  }
}

// =====================================================
// SEARCH
// =====================================================

const filteredEvents = computed(() => {
  const keyword = search.value.toLowerCase().trim()

  if (!keyword) {
    return eventList.value
  }

  return eventList.value.filter((event) =>
    event.title?.toLowerCase().includes(keyword) ||
    event.location?.toLowerCase().includes(keyword) ||
    event.status?.toLowerCase().includes(keyword)
  )
})

// =====================================================
// PAGINATION
// =====================================================

const totalPages = computed(() => {
  return Math.ceil(
    filteredEvents.value.length / itemsPerPage
  )
})

const paginatedEvents = computed(() => {
  const start =
    (currentPage.value - 1) * itemsPerPage

  return filteredEvents.value.slice(
    start,
    start + itemsPerPage
  )
})

const changePage = (page) => {
  if (
    page < 1 ||
    page > totalPages.value
  ) {
    return
  }

  currentPage.value = page
}

// =====================================================
// NAVIGATION
// =====================================================

const goCreate = () => {
  router.push('/admin/events/create')
}

const goDetail = (id) => {
  router.push(`/admin/events/${id}`)
}

const goEdit = (id) => {
  router.push(`/admin/events/${id}/edit`)
}

// =====================================================
// DELETE
// =====================================================

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

  if (!result.isConfirmed) {
    return
  }

  try {
    await api.delete('events', id)

    await getEvents()

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
      text:
        err.response?.data?.message ||
        'Gagal menghapus event.',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#f97316',
    })
  }
}

// =====================================================
// MOUNT
// =====================================================

onMounted(() => {
  getEvents()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">

    <Navbar />

    <div class="flex">

      <AdminSidebar />

      <main
        class="min-w-0 flex-1 px-6 py-8 lg:px-10"
      >

        <!-- HEADER -->
        <div
          class="mb-4 flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-sm"
        >

          <button
            type="button"
            @click="router.back()"
            class="text-2xl text-gray-700 transition hover:text-orange-500"
          >
            ‹
          </button>

          <div>
            <h1
              class="font-semibold text-gray-800"
            >
              Kelola Event
            </h1>
          </div>

        </div>


        <!-- TITLE + ADD -->
        <section
          class="mb-4 flex items-center justify-between rounded-xl bg-white px-6 py-4 shadow-sm"
        >

          <div>

            <h2
              class="text-xl font-bold text-gray-800"
            >
              Daftar Event
            </h2>

            <p
              class="mt-1 text-sm text-gray-500"
            >
              Kelola event yang ditampilkan
              pada website.
            </p>

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


        <!-- SEARCH -->
        <div
          class="mb-5 rounded-xl border border-gray-200 bg-white p-4"
        >

          <div class="relative max-w-md">

            <Search
              :size="18"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              v-model="search"
              @input="currentPage = 1"
              type="text"
              placeholder="Cari event..."
              class="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            />

          </div>

        </div>


        <!-- ERROR -->
        <div
          v-if="error"
          class="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600"
        >
          {{ error }}
        </div>


        <!-- REUSABLE TABLE -->
        <DataTable
          :columns="columns"
          :items="paginatedEvents"
          :loading="loading"
          :current-page="currentPage"
          :items-per-page="itemsPerPage"
          :total-pages="totalPages"
          @detail="goDetail"
          @edit="goEdit"
          @delete="deleteEvent"
          @page-change="changePage"
        />

      </main>

    </div>

  </div>
</template>