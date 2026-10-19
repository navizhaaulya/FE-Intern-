<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Plus, SlidersHorizontal, X, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'
import Swal from 'sweetalert2'

import { api } from '@/services/api'
import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import DataTable from '@/components/UI/DataTable.vue'

const router = useRouter()

const newsList = ref([])
const categories = ref([])
const loading = ref(false)
const error = ref(null)
const search = ref('')

const statusFilter = ref('semua')
const categoryFilter = ref('semua')
const filterOpen = ref(false)
const filterPanel = ref(null)

const currentPage = ref(1)
const perPage = ref(10)
const perPageOptions = [10, 25, 50, 100]

const totalItems = ref(0)
const totalPages = ref(1)

const columns = [
  { key: 'img_cover', label: 'Cover', type: 'image' },
  { key: 'title', label: 'Judul Berita', type: 'title' },
  { key: 'category_name', label: 'Kategori' },
  { key: 'status', label: 'Status', type: 'status' },
]

const statusOptions = [
  { value: 'semua', label: 'Semua Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'publish', label: 'Diterbitkan' },
  { value: 'archive', label: 'Diarsipkan' },
]

const activeFilterCount = computed(() => {
  let count = 0
  if (statusFilter.value !== 'semua') count++
  if (categoryFilter.value !== 'semua') count++
  return count
})

const resetFilters = () => {
  statusFilter.value = 'semua'
  categoryFilter.value = 'semua'
}

const closeFilterOnOutsideClick = (event) => {
  if (filterPanel.value && !filterPanel.value.contains(event.target)) {
    filterOpen.value = false
  }
}

const getCategories = async () => {
  try {
    const response = await api.list('news_categories')
    categories.value = response?.data || []
  } catch (err) {
    console.error('Gagal mengambil kategori berita:', err)
  }
}

const getNews = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await api.list('news', {
      page: currentPage.value,
      limit: perPage.value,
    })

    const data = response?.data || []

    newsList.value = data.map((item) => {
      const matchedCategory = categories.value.find(
        (c) => String(c.id) === String(item.category_id)
      )

      return {
        ...item,
        img_cover: item.img_cover
          ? `${import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')}/api/file/news/img_cover/${item.id}/${Date.now()}`
          : null,
        category_name:
          matchedCategory?.category_name || item.rel_category_id?.split(' - ')[1] || '-',
      }
    })

    totalItems.value = response?.total ?? data.length
    totalPages.value = response?.totalPage ?? 1
  } catch (err) {
    console.error('Error mengambil berita:', err)
    error.value = err.response?.data?.message || err.message || 'Gagal mengambil data berita'
  } finally {
    loading.value = false
  }
}

// =========================
// FILTER + SEARCH (hanya berlaku pada data di halaman yang sedang tampil)
// =========================

const filteredNews = computed(() => {
  let list = newsList.value

  const keyword = search.value.toLowerCase().trim()
  if (keyword) {
    list = list.filter((news) => news.title?.toLowerCase().includes(keyword))
  }

  if (statusFilter.value !== 'semua') {
    list = list.filter((news) => news.status === statusFilter.value)
  }

  if (categoryFilter.value !== 'semua') {
    list = list.filter((news) => String(news.category_id) === String(categoryFilter.value))
  }

  return list
})

const startItem = computed(() => {
  if (totalItems.value === 0) return 0
  return (currentPage.value - 1) * perPage.value + 1
})

const endItem = computed(() => Math.min(currentPage.value * perPage.value, totalItems.value))

const changePage = (page) => {
  const target = Number(page)
  if (target < 1 || target > totalPages.value) return
  currentPage.value = target
}

watch([statusFilter, categoryFilter, perPage], () => {
  currentPage.value = 1
  getNews()
})

watch(currentPage, () => {
  getNews()
})

// =========================
// NAVIGATION
// =========================

const goToCreate = () => router.push('/admin/news/create')
const goToDetail = (id) => router.push(`/admin/news/${id}`)
const goToEdit = (id) => router.push(`/admin/news/${id}/edit`)

const deleteNews = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus berita?',
    text: 'Berita yang dihapus tidak dapat dikembalikan.',
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
    await api.delete('news', id)
    await getNews()

    Swal.fire({
      title: 'Berhasil!',
      text: 'Berita berhasil dihapus.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#f97316',
      timer: 2000,
      timerProgressBar: true,
    })
  } catch (err) {
    console.error('Error menghapus berita:', err)
    Swal.fire({
      title: 'Gagal!',
      text: err.response?.data?.message || 'Gagal menghapus berita.',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#f97316',
    })
  }
}

onMounted(async () => {
  document.addEventListener('click', closeFilterOnOutsideClick)
  await getCategories()
  await getNews()
})
</script>

<template>
  <div class="min-h-screen bg-[#f8f7f6]">
    <Navbar />

    <div class="flex">
      <AdminSidebar />

      <main class="min-w-0 flex-1 px-6 py-8 lg:px-10">
        <div class="mb-4 flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-sm">
          <button
            @click="router.back()"
            class="text-2xl text-gray-700 transition hover:text-orange-500"
          >
            ‹
          </button>
          <h1 class="font-semibold text-gray-800">Kelola Berita</h1>
        </div>

        <section class="mb-4 flex items-center justify-between bg-white px-6 py-4 shadow-sm">
          <div>
            <h2 class="text-xl font-bold text-gray-800">Daftar Berita</h2>
            <p class="mt-1 text-sm text-gray-500">Kelola berita yang ditampilkan pada website.</p>
          </div>

          <button
            @click="goToCreate"
            class="flex items-center gap-2 rounded-xl bg-orange-400 px-5 py-3 font-semibold text-white transition hover:bg-orange-500"
          >
            <Plus :size="18" />
            Tambah Berita
          </button>
        </section>

        <section class="bg-white p-6 shadow-sm">
          <!-- SEARCH + FILTER -->
          <div class="mb-6 flex flex-wrap items-center gap-3">
            <div class="relative max-w-sm flex-1">
              <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                v-model="search"
                type="text"
                placeholder="Cari berita..."
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
                  <span class="text-sm font-semibold text-gray-800">Filter Berita</span>
                  <button @click="filterOpen = false" class="text-gray-400 hover:text-gray-600">
                    <X :size="16" />
                  </button>
                </div>

                <div class="space-y-4">
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-gray-500">Status</label>
                    <select
                      v-model="statusFilter"
                      class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    >
                      <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
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

          <div v-if="error" class="py-16 text-center">
            <p class="mb-4 text-red-500">{{ error }}</p>
            <button
              @click="getNews"
              class="rounded-lg bg-orange-400 px-5 py-2 text-white transition hover:bg-orange-500"
            >
              Coba Lagi
            </button>
          </div>

          <DataTable
            v-else
            :columns="columns"
            :items="filteredNews"
            :loading="loading"
            :current-page="currentPage"
            :items-per-page="perPage"
            :total-pages="totalPages"
            :selectable="false"
            status-type="news"
            @detail="goToDetail"
            @edit="goToEdit"
            @delete="deleteNews"
            @page-change="changePage"
          />
        </section>
      </main>
    </div>
  </div>
</template>
