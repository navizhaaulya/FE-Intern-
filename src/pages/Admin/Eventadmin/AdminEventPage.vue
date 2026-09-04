<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Plus, Eye, Trash2 } from 'lucide-vue-next'
import Swal from 'sweetalert2'

import { api } from '@/services/api'
import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import StatusBadge from '@/components/UI/StatusBadge.vue'

const router = useRouter()

const eventList = ref([])
const loading = ref(false)
const error = ref('')
const search = ref('')

const currentPage = ref(1)
const itemsPerPage = 10

const getEvents = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await api.list('events')
    eventList.value = response?.data || []
  } catch (err) {
    console.error(err)
    error.value = 'Gagal mengambil data event.'
  } finally {
    loading.value = false
  }
}

const filteredEvents = computed(() => {
  const keyword = search.value.toLowerCase().trim()

  if (!keyword) return eventList.value

  return eventList.value.filter((event) =>
    event.title?.toLowerCase().includes(keyword) ||
    event.location?.toLowerCase().includes(keyword) ||
    event.status?.toLowerCase().includes(keyword)
  )
})

const totalPages = computed(() =>
  Math.ceil(filteredEvents.value.length / itemsPerPage)
)

const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage

  return filteredEvents.value.slice(
    start,
    start + itemsPerPage
  )
})

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

const goCreate = () => {
  router.push('/admin/events/create')
}

const goDetail = (id) => {
  router.push(`/admin/events/${id}`)
}

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
    console.error(err)

    Swal.fire({
      title: 'Gagal!',
      text: err.response?.data?.message || 'Gagal menghapus event.',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#f97316',
    })
  }
}

const formatDate = (date) => {
  if (!date) return '-'

  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

onMounted(() => {
  getEvents()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="flex">
      <AdminSidebar />

      <main class="flex-1 p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              Event
            </h1>

            <p class="text-sm text-gray-500 mt-1">
              Kelola event yang tersedia di website.
            </p>
          </div>

          <button
            @click="goCreate"
            class="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            <Plus :size="18" />
            Tambah Event
          </button>
        </div>

        <!-- Search -->
        <div class="bg-white rounded-xl border border-gray-200 p-4 mb-5">
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
              class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            />
          </div>
        </div>

        <!-- Error -->
        <div
          v-if="error"
          class="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-5"
        >
          {{ error }}
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                    No
                  </th>

                  <th class="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                    Cover
                  </th>

                  <th class="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                    Event
                  </th>

                  <th class="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                    Lokasi
                  </th>

                  <th class="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                    Tanggal
                  </th>

                  <th class="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                    Status
                  </th>

                  <th class="px-5 py-4 text-center text-sm font-semibold text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                <!-- Loading -->
                <tr v-if="loading">
                  <td
                    colspan="7"
                    class="px-5 py-10 text-center text-gray-500"
                  >
                    Memuat data event...
                  </td>
                </tr>

                <!-- Empty -->
                <tr v-else-if="paginatedEvents.length === 0">
                  <td
                    colspan="7"
                    class="px-5 py-10 text-center text-gray-500"
                  >
                    Tidak ada event.
                  </td>
                </tr>

                <!-- Data -->
                <tr
                  v-for="(event, index) in paginatedEvents"
                  :key="event.id"
                  class="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td class="px-5 py-4 text-sm text-gray-600">
                    {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                  </td>

                  <td class="px-5 py-4">
                    <img
                      v-if="event.img_cover"
                      :src="event.img_cover"
                      :alt="event.title"
                      class="w-16 h-10 object-cover rounded-lg"
                    />

                    <div
                      v-else
                      class="w-16 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400"
                    >
                      No Image
                    </div>
                  </td>

                  <td class="px-5 py-4">
                    <div class="font-medium text-gray-900">
                      {{ event.title }}
                    </div>

                    <div class="text-xs text-gray-400 mt-1">
                      {{ event.slug }}
                    </div>
                  </td>

                  <td class="px-5 py-4 text-sm text-gray-600">
                    {{ event.location || '-' }}
                  </td>

                  <td class="px-5 py-4 text-sm text-gray-600">
                    {{ formatDate(event.start_date) }}
                    -
                    {{ formatDate(event.end_date) }}
                  </td>

                  <td class="px-5 py-4">
                    <StatusBadge :status="event.status" />
                  </td>

                  <td class="px-5 py-4">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        @click="goDetail(event.id)"
                        class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        title="Detail"
                      >
                        <Eye :size="18" />
                      </button>

                      <button
                        @click="deleteEvent(event.id)"
                        class="p-2 rounded-lg text-red-500 hover:bg-red-50"
                        title="Hapus"
                      >
                        <Trash2 :size="18" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div
            v-if="totalPages > 1"
            class="flex items-center justify-between px-5 py-4 border-t border-gray-200"
          >
            <p class="text-sm text-gray-500">
              Halaman {{ currentPage }} dari {{ totalPages }}
            </p>

            <div class="flex items-center gap-2">
              <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-2 text-sm border rounded-lg disabled:opacity-40"
              >
                Sebelumnya
              </button>

              <button
                v-for="page in totalPages"
                :key="page"
                @click="changePage(page)"
                class="w-9 h-9 rounded-lg text-sm"
                :class="
                  currentPage === page
                    ? 'bg-orange-500 text-white'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                "
              >
                {{ page }}
              </button>

              <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 text-sm border rounded-lg disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>