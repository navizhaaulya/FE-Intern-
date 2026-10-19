<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '@/services/api'
import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import DataTable from '@/components/UI/DataTable.vue'
import { Search, X, SlidersHorizontal, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'
import Swal from 'sweetalert2'

const list = ref([])
const categories = ref([])
const loading = ref(true)
const error = ref(null)
const search = ref('')

const typeFilter = ref('semua') // 'semua' | 'kritik' | 'saran'
const categoryFilter = ref('semua')
const filterOpen = ref(false)
const filterPanel = ref(null)

const currentPage = ref(1)
const itemsPerPage = ref(10)
const perPageOptions = [10, 25, 50, 100]

const dataTableRef = ref(null)

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

const activeFilterCount = computed(() => {
  let count = 0
  if (typeFilter.value !== 'semua') count++
  if (categoryFilter.value !== 'semua') count++
  return count
})

const resetFilters = () => {
  typeFilter.value = 'semua'
  categoryFilter.value = 'semua'
}

const closeFilterOnOutsideClick = (event) => {
  if (filterPanel.value && !filterPanel.value.contains(event.target)) {
    filterOpen.value = false
  }
}

// =========================
// GET DATA
// =========================

const getCategories = async () => {
  try {
    const response = await api.list('feedback_categories')
    categories.value = response?.data || []
  } catch (err) {
    console.error('Gagal mengambil kategori kritik & saran:', err)
  }
}

// Samakan tipe ke boolean asli, apa pun format mentahnya (true/false, 1/0, "1"/"0")
const normalizeType = (value) => value === true || value === 1 || value === '1'

const getFeedbacks = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await api.list('feedbacks')
    const data = response?.data || []

    list.value = data.map((item) => {
      const matchedCategory = categories.value.find(
        (c) => String(c.id) === String(item.category_id)
      )

      return {
        ...item,
        type: normalizeType(item.type),
        category_name:
          matchedCategory?.category_name ||
          item.rel_category_id?.split(' - ')[1] ||
          item.rel_category ||
          '-',
      }
    })
  } catch (err) {
    console.error('Gagal mengambil kritik & saran:', err)
    error.value = err.response?.data?.message || err.message || 'Gagal mengambil data'
  } finally {
    loading.value = false
  }
}

// =========================
// FILTER + SEARCH
// =========================

const filteredList = computed(() => {
  let items = list.value

  const keyword = search.value.toLowerCase().trim()
  if (keyword) {
    items = items.filter(
      (item) =>
        item.sender_name?.toLowerCase().includes(keyword) ||
        item.message?.toLowerCase().includes(keyword) ||
        item.category_name?.toLowerCase().includes(keyword)
    )
  }

  if (typeFilter.value !== 'semua') {
    const wantSaran = typeFilter.value === 'saran'
    items = items.filter((item) => item.type === wantSaran)
  }

  if (categoryFilter.value !== 'semua') {
    items = items.filter((item) => String(item.category_id) === String(categoryFilter.value))
  }

  return items
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredList.value.length / itemsPerPage.value))
)

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredList.value.slice(start, start + itemsPerPage.value)
})

const changePage = (page) => {
  const target = Number(page)
  if (target < 1 || target > totalPages.value) return
  currentPage.value = target
}

watch([search, typeFilter, categoryFilter, itemsPerPage], () => {
  currentPage.value = 1
})

watch(totalPages, (newTotal) => {
  if (currentPage.value > newTotal) currentPage.value = newTotal || 1
})

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
    const data = response?.data || response

    const matchedCategory = categories.value.find((c) => String(c.id) === String(data.category_id))

    detailData.value = {
      ...data,
      type: normalizeType(data.type),
      category_name:
        matchedCategory?.category_name ||
        data.rel_category_id?.split(' - ')[1] ||
        data.rel_category ||
        '-',
    }
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

const handleBulkDelete = async (ids) => {
  const result = await Swal.fire({
    title: `Hapus ${ids.length} data terpilih?`,
    text: 'Data yang dihapus tidak dapat dikembalikan.',
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
    await Promise.all(ids.map((id) => api.delete('feedbacks', id)))
    dataTableRef.value?.clearSelection()
    await getFeedbacks()

    Swal.fire({
      title: 'Berhasil!',
      text: `${ids.length} data berhasil dihapus.`,
      icon: 'success',
      confirmButtonColor: '#f97316',
      timer: 2000,
      timerProgressBar: true,
    })
  } catch (err) {
    console.error('Gagal menghapus beberapa data:', err)
    Swal.fire({
      title: 'Gagal!',
      text: 'Sebagian atau semua data gagal dihapus.',
      icon: 'error',
      confirmButtonColor: '#f97316',
    })
  }
}

onMounted(async () => {
  document.addEventListener('click', closeFilterOnOutsideClick)
  await getCategories()
  await getFeedbacks()
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
          </div>

          <!-- SEARCH + FILTER -->
          <div class="mb-6 flex flex-wrap items-center gap-3">
            <div class="relative max-w-sm flex-1">
              <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                v-model="search"
                type="text"
                placeholder="Cari kritik & saran disini.."
                class="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div ref="filterPanel" class="relative">
              <button
                @click="filterOpen = !filterOpen"
                class="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition"
                :class="
                  activeFilterCount > 0
                    ? 'border-orange-400 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-600 hover:border-orange-300'
                "
              >
                <SlidersHorizontal :size="16" />
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
                  <span class="text-sm font-semibold text-gray-800">Filter</span>
                  <button @click="filterOpen = false" class="text-gray-400 hover:text-gray-600">
                    <X :size="16" />
                  </button>
                </div>

                <div class="space-y-4">
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-gray-500">Tipe</label>
                    <select
                      v-model="typeFilter"
                      class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    >
                      <option value="semua">Semua Tipe</option>
                      <option value="kritik">Kritik</option>
                      <option value="saran">Saran</option>
                    </select>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-gray-500">Kategori</label>
                    <select
                      v-model="categoryFilter"
                      class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    >
                      <option value="semua">Semua Kategori</option>
                      <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                        {{ cat.category_name }}
                      </option>
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

          <div
            v-if="error"
            class="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600"
          >
            {{ error }}
            <button @click="getFeedbacks" class="ml-3 font-semibold underline">Coba lagi</button>
          </div>

          <template v-else>
            <DataTable
              ref="dataTableRef"
              :columns="columns"
              :items="paginatedList"
              :loading="loading"
              :current-page="currentPage"
              :items-per-page="itemsPerPage"
              :total-pages="totalPages"
              :actions="['detail', 'delete']"
              @detail="openDetail"
              @delete="deleteFeedback"
              @bulk-delete="handleBulkDelete"
              @page-change="changePage"
            />

            <!-- PAGINATION -->
            <div
              v-if="!loading && filteredList.length > 0"
              class="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3"
            >
              <div class="flex items-center gap-2">
                <button
                  @click="changePage(1)"
                  :disabled="currentPage === 1"
                  class="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-500 transition hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Halaman pertama"
                >
                  <ChevronsLeft :size="16" />
                </button>

                <button
                  @click="changePage(currentPage - 1)"
                  :disabled="currentPage === 1"
                  class="rounded-lg bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-500 transition hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sebelumnya
                </button>

                <input
                  type="number"
                  :value="currentPage"
                  @change="changePage(Number($event.target.value))"
                  min="1"
                  :max="totalPages"
                  class="h-9 w-14 rounded-lg border border-gray-200 text-center text-sm outline-none focus:border-orange-400"
                />

                <button
                  @click="changePage(currentPage + 1)"
                  :disabled="currentPage === totalPages"
                  class="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Selanjutnya
                </button>

                <button
                  @click="changePage(totalPages)"
                  :disabled="currentPage === totalPages"
                  class="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Halaman terakhir"
                >
                  <ChevronsRight :size="16" />
                </button>
              </div>

              <div class="flex items-center gap-3">
                <select
                  v-model.number="itemsPerPage"
                  class="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
                >
                  <option v-for="n in perPageOptions" :key="n" :value="n">{{ n }}</option>
                </select>

                <p class="whitespace-nowrap text-sm text-gray-400">
                  Menampilkan {{ itemsPerPage }} dari {{ filteredList.length }} data
                </p>
              </div>
            </div>
          </template>
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
                <p class="text-sm text-gray-800">{{ detailData.category_name }}</p>
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
