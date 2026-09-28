<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/services/api'
import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import DataTable from '@/components/UI/DataTable.vue'
import { Search, X } from 'lucide-vue-next'
import Swal from 'sweetalert2'

const list = ref([])
const loading = ref(true)
const error = ref(null)
const search = ref('')

const currentPage = ref(1)
const itemsPerPage = 10

const columns = [
  { key: 'sender_name', label: 'Pengirim' },
  {
    key: 'type',
    label: 'Tipe',
    type: 'badge',
    badgeMap: {
      true: { label: 'Saran', class: 'bg-sky-100 text-sky-600' },
      false: { label: 'Kritik', class: 'bg-red-100 text-red-500' },
    },
  },
  { key: 'category_name', label: 'Kategori' },
  { key: 'message', label: 'Keterangan', type: 'truncate' },
]

const getFeedbacks = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await api.list('feedbacks')
    list.value = response?.data || []
  } catch (err) {
    console.error('Gagal mengambil kritik & saran:', err)
    error.value = err.response?.data?.message || err.message || 'Gagal mengambil data'
  } finally {
    loading.value = false
  }
}

const filteredList = computed(() => {
  const keyword = search.value.toLowerCase().trim()
  if (!keyword) return list.value

  return list.value.filter(
    (item) =>
      item.sender_name?.toLowerCase().includes(keyword) ||
      item.message?.toLowerCase().includes(keyword) ||
      item.category_name?.toLowerCase().includes(keyword)
  )
})

const totalPages = computed(() => Math.ceil(filteredList.value.length / itemsPerPage))

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredList.value.slice(start, start + itemsPerPage)
})

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

// ============ DETAIL MODAL ============
const showDetail = ref(false)
const detailData = ref(null)
const detailLoading = ref(false)

const openDetail = async (id) => {
  showDetail.value = true
  detailLoading.value = true
  detailData.value = null

  try {
    const response = await api.detail('feedbacks', id)
    detailData.value = response?.data || response
  } catch (err) {
    console.error('Gagal mengambil detail:', err)
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: err.response?.data?.message || 'Gagal mengambil detail.',
    })
    showDetail.value = false
  } finally {
    detailLoading.value = false
  }
}

const closeDetail = () => {
  showDetail.value = false
  detailData.value = null
}

const typeLabel = (type) => (type ? 'Saran' : 'Kritik')
const typeClass = (type) => (type ? 'bg-sky-100 text-sky-600' : 'bg-red-100 text-red-500')

// ============ DELETE ============
const deleteFeedback = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus kritik/saran ini?',
    text: 'Data yang dihapus tidak dapat dikembalikan.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#f97316',
    cancelButtonColor: '#6b7280',
    reverseButtons: true,
  })

  if (!result.isConfirmed) return

  try {
    await api.delete('feedbacks', id)
    await getFeedbacks()

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Data berhasil dihapus.',
      timer: 1500,
      showConfirmButton: false,
      timerProgressBar: true,
    })
  } catch (err) {
    console.error('Gagal menghapus:', err)
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: err.response?.data?.message || 'Gagal menghapus data.',
      confirmButtonColor: '#f97316',
    })
  }
}

onMounted(() => {
  getFeedbacks()
})
</script>

<template>
  <div class="min-h-screen bg-[#f8f7f6]">
    <Navbar />

    <div class="flex">
      <AdminSidebar />

      <main class="min-w-0 flex-1 px-6 py-8 lg:px-10">
        <div class="mb-4 flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-sm">
          <h1 class="font-semibold text-gray-800">Kelola Kritik & Saran</h1>
        </div>

        <section class="rounded-xl bg-white p-6 shadow-sm">
          <div class="mb-6 flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-800">Kritik & Saran</h2>

            <div class="relative max-w-sm flex-1 ml-4">
              <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                v-model="search"
                @input="currentPage = 1"
                type="text"
                placeholder="Cari kritik & saran disini.."
                class="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <div
            v-if="error"
            class="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600"
          >
            {{ error }}
            <button @click="getFeedbacks" class="ml-3 font-semibold underline">Coba lagi</button>
          </div>

          <!-- REUSABLE TABLE, actions cuma detail & delete -->
          <DataTable
            :columns="columns"
            :items="paginatedList"
            :loading="loading"
            :current-page="currentPage"
            :items-per-page="itemsPerPage"
            :total-pages="totalPages"
            :actions="['detail', 'delete']"
            @detail="openDetail"
            @delete="deleteFeedback"
            @page-change="changePage"
          />
        </section>

        <!-- MODAL DETAIL -->
        <div
          v-if="showDetail"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        >
          <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-800">Detail Kritik & Saran</h3>
              <button @click="closeDetail" class="text-gray-400 hover:text-gray-600">
                <X :size="20" />
              </button>
            </div>

            <div v-if="detailLoading" class="py-10 text-center text-gray-500">Memuat...</div>

            <div v-else-if="detailData" class="space-y-4">
              <div>
                <p class="text-xs font-medium text-gray-500">Pengirim</p>
                <p class="text-sm text-gray-800">{{ detailData.sender_name || '-' }}</p>
              </div>

              <div>
                <p class="text-xs font-medium text-gray-500">Tipe</p>
                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold"
                  :class="typeClass(detailData.type)"
                >
                  {{ typeLabel(detailData.type) }}
                </span>
              </div>

              <div>
                <p class="text-xs font-medium text-gray-500">Kategori</p>
                <p class="text-sm text-gray-800">
                  {{ detailData.rel_category || detailData.category_name || '-' }}
                </p>
              </div>

              <div>
                <p class="text-xs font-medium text-gray-500">Keterangan</p>
                <p class="whitespace-pre-line text-sm text-gray-800">{{ detailData.message }}</p>
              </div>

              <div>
                <p class="text-xs font-medium text-gray-500">Tanggal Kirim</p>
                <p class="text-sm text-gray-800">{{ detailData.created_at || '-' }}</p>
              </div>
            </div>

            <div class="mt-6 flex justify-end">
              <button
                @click="closeDetail"
                class="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
