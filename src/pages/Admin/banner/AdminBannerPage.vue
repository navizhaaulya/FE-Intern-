<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search } from 'lucide-vue-next'

import { api } from '@/services/api'
import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import DataTable from '@/components/UI/DataTable.vue'

const router = useRouter()

const bannerList = ref([])
const loading = ref(false)
const error = ref(null)
const search = ref('')

const currentPage = ref(1)
const itemsPerPage = 10

// Kolom untuk reusable table
const columns = [
  {
    key: 'img_cover',
    label: 'Gambar',
    type: 'image',
  },
  {
    key: 'url',
    label: 'URL CTA',
  },
  {
    key: 'status_code',
    label: 'Status',
    type: 'status',
  },
]

const getBanners = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await api.list('banner')

    console.log('Response API Banner:', response)

    bannerList.value = response?.data || []
  } catch (err) {
    console.error('Error mengambil banner:', err)

    error.value =
      err.response?.data?.message ||
      err.message ||
      'Gagal mengambil data banner'
  } finally {
    loading.value = false
  }
}

const filteredBanners = computed(() => {
  const keyword = search.value.toLowerCase().trim()

  if (!keyword) return bannerList.value

  return bannerList.value.filter((banner) =>
    banner.title?.toLowerCase().includes(keyword) ||
    banner.url?.toLowerCase().includes(keyword)
  )
})

const totalPages = computed(() =>
  Math.ceil(filteredBanners.value.length / itemsPerPage)
)

const paginatedBanners = computed(() => {
  const start =
    (currentPage.value - 1) * itemsPerPage

  return filteredBanners.value.slice(
    start,
    start + itemsPerPage
  )
})

const goToCreate = () => {
  router.push('/admin/banners/create')
}

const goToDetail = (id) => {
  router.push(`/admin/banners/${id}`)
}

const goToEdit = (id) => {
  router.push(`/admin/banners/${id}/edit`)
}

const deleteBanner = async (id) => {
  const confirmed = confirm(
    'Yakin ingin menghapus banner ini?'
  )

  if (!confirmed) return

  try {
    await api.delete('banners', id)

    await getBanners()
  } catch (err) {
    console.error('Error menghapus banner:', err)

    alert(
      err.response?.data?.message ||
      'Gagal menghapus banner'
    )
  }
}

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return

  currentPage.value = page
}

onMounted(() => {
  getBanners()
})
</script>

<template>
  <div class="min-h-screen bg-[#f8f7f6]">

    <Navbar />

    <div class="flex">

      <AdminSidebar />

      <main class="min-w-0 flex-1 px-6 py-8 lg:px-10">

        <!-- HEADER -->
        <div
          class="mb-4 flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-sm"
        >
          <button
            @click="router.back()"
            class="text-gray-700 transition hover:text-orange-500"
          >
            ‹
          </button>

          <h1 class="font-semibold text-gray-800">
            Kelola Banner
          </h1>
        </div>

        <!-- TITLE -->
        <section
          class="mb-4 flex items-center justify-between bg-white px-6 py-4 shadow-sm"
        >
          <div>
            <h2 class="text-xl font-bold text-gray-800">
              Daftar Banner
            </h2>

            <p class="mt-1 text-sm text-gray-500">
              Kelola banner yang ditampilkan pada website.
            </p>
          </div>

          <button
            @click="goToCreate"
            class="flex items-center gap-2 rounded-xl bg-orange-400 px-5 py-3 font-semibold text-white transition hover:bg-orange-500"
          >
            <Plus :size="18" />
            Tambah Banner
          </button>
        </section>

        <!-- TABLE CARD -->
        <section class="rounded-xl bg-white p-6 shadow-sm">

          <!-- SEARCH -->
          <div class="relative mb-6 max-w-sm">

            <Search
              :size="18"
              class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              v-model="search"
              @input="currentPage = 1"
              type="text"
              placeholder="Cari banner..."
              class="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />

          </div>

          <!-- ERROR -->
          <div
            v-if="error"
            class="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600"
          >
            {{ error }}

            <button
              @click="getBanners"
              class="ml-3 font-semibold underline"
            >
              Coba lagi
            </button>
          </div>

          <!-- REUSABLE TABLE -->
          <DataTable
            :columns="columns"
            :items="paginatedBanners"
            :loading="loading"
            :current-page="currentPage"
            :items-per-page="itemsPerPage"
            :total-pages="totalPages"
            @detail="goToDetail"
            @edit="goToEdit"
            @delete="deleteBanner"
            @page-change="changePage"
          />

        </section>

      </main>

    </div>

  </div>
</template>