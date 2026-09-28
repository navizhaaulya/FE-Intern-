<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Eye, Search, Pencil, Trash2 } from 'lucide-vue-next'

import { api } from '@/services/api'
import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import Swal from 'sweetalert2'

const router = useRouter()

const bannerList = ref([])
const loading = ref(false)
const error = ref(null)
const search = ref('')

const currentPage = ref(1)
const itemsPerPage = 10

const getBanners = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await api.list('banner')

    console.log('Response API Banner:', response)
    console.log('BANNER PERTAMA:', response?.data?.[0])
    console.log('IMG COVER:', response?.data?.[0]?.img_cover)

    bannerList.value = response?.data || []
  } catch (err) {
    console.error('Error mengambil banner:', err)

    error.value = err.response?.data?.message || err.message || 'Gagal mengambil data banner'
  } finally {
    loading.value = false
  }
}

// SAMA seperti yang dipakai kandidat
const getImageUrl = (item) => {
  if (!item?.img_cover) return ''

  const img = item.img_cover

  // Kalau string biasa dan udah full URL
  if (typeof img === 'string') {
    return img.startsWith('http') ? img : ''
  }

  // Kalau field_value adalah URL eksternal
  if (img.field_value?.startsWith('http')) {
    return img.field_value
  }

  // Construct manual, pakai segment 'banner' (singular, cocok sama nama class Model)
  const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
  return `${baseUrl}/api/file/banner/img_cover/${item.id}/${Date.now()}`
}

const filteredBanners = computed(() => {
  const keyword = search.value.toLowerCase().trim()

  if (!keyword) {
    return bannerList.value
  }

  return bannerList.value.filter(
    (banner) =>
      banner.title?.toLowerCase().includes(keyword) || banner.url?.toLowerCase().includes(keyword)
  )
})

const totalPages = computed(() => {
  return Math.ceil(filteredBanners.value.length / itemsPerPage)
})

const paginatedBanners = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage

  return filteredBanners.value.slice(start, start + itemsPerPage)
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
  const result = await Swal.fire({
    title: 'Hapus banner?',
    text: 'Data banner yang dihapus tidak dapat dikembalikan.',
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
    await api.delete('banner', id)

    await getBanners()

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Banner berhasil dihapus.',
      timer: 1500,
      showConfirmButton: false,
      timerProgressBar: true,
    })
  } catch (err) {
    console.error('Error menghapus banner:', err)

    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: err.response?.data?.message || 'Gagal menghapus banner.',
      confirmButtonColor: '#f97316',
    })
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
        <div class="mb-4 flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-sm">
          <button @click="router.back()" class="text-gray-700 transition hover:text-orange-500">
            ‹
          </button>

          <h1 class="font-semibold text-gray-800">Kelola Banner</h1>
        </div>

        <!-- TITLE -->
        <section class="mb-4 flex items-center justify-between bg-white px-6 py-4 shadow-sm">
          <div>
            <h2 class="text-xl font-bold text-gray-800">Daftar Banner</h2>

            <p class="mt-1 text-sm text-gray-500">Kelola banner yang ditampilkan pada website.</p>
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
            <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

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

            <button @click="getBanners" class="ml-3 font-semibold underline">Coba lagi</button>
          </div>

          <!-- LOADING -->
          <div v-if="loading" class="py-10 text-center text-gray-500">Memuat data...</div>

          <!-- EMPTY -->
          <div v-else-if="paginatedBanners.length === 0" class="py-10 text-center text-gray-400">
            Belum ada banner.
          </div>

          <!-- TABLE -->
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="border-b border-gray-200">
                <tr class="text-left text-sm font-semibold text-gray-600">
                  <th class="px-3 py-3">No</th>
                  <th class="px-3 py-3">Aksi</th>
                  <th class="px-3 py-3">Gambar</th>
                  <th class="px-3 py-3">Judul</th>
                  <th class="px-3 py-3">URL CTA</th>
                  <th class="px-3 py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="(item, index) in paginatedBanners"
                  :key="item.id"
                  class="border-b border-gray-100 text-sm text-gray-700"
                >
                  <!-- NO -->
                  <td class="px-3 py-4">{{ (currentPage - 1) * itemsPerPage + index + 1 }}.</td>

                  <!-- AKSI -->
                  <td class="px-3 py-4">
                    <div class="flex items-center gap-2">
                      <button
                        @click="goToDetail(item.id)"
                        class="rounded-lg p-1.5 text-blue-500 hover:bg-blue-50"
                        title="Detail"
                      >
                        <Eye :size="18" />
                      </button>

                      <button
                        @click="goToEdit(item.id)"
                        class="rounded-lg p-1.5 text-orange-500 hover:bg-orange-50"
                        title="Edit"
                      >
                        <Pencil :size="16" />
                      </button>

                      <button
                        @click="deleteBanner(item.id)"
                        class="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                        title="Hapus"
                      >
                        <Trash2 :size="16" />
                      </button>
                    </div>
                  </td>

                  <!-- GAMBAR -->
                  <td class="px-3 py-4">
                    <img
                      v-if="getImageUrl(item)"
                      :src="getImageUrl(item)"
                      class="h-12 w-20 rounded-lg object-cover"
                      alt="Banner"
                    />
                    <div
                      v-else
                      class="flex h-12 w-20 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400"
                    >
                      No Image
                    </div>
                  </td>

                  <!-- JUDUL -->
                  <td class="max-w-xs px-3 py-4">
                    {{ item.title || '-' }}
                  </td>

                  <!-- URL -->
                  <td class="max-w-xs px-3 py-4">
                    {{ item.url || '-' }}
                  </td>

                  <!-- STATUS -->
                  <td class="px-3 py-4">
                    <span
                      class="rounded-full px-3 py-1 text-xs font-semibold"
                      :class="
                        item.status_code ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                      "
                    >
                      {{ item.status_code ? 'Aktif' : 'Non Aktif' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- PAGINATION -->
          <div v-if="totalPages > 1" class="mt-6 flex items-center justify-center gap-2">
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              ‹
            </button>

            <button
              v-for="page in totalPages"
              :key="page"
              @click="changePage(page)"
              class="rounded-lg px-3 py-2 text-sm"
              :class="
                currentPage === page
                  ? 'bg-orange-400 text-white'
                  : 'border border-gray-200 text-gray-600'
              "
            >
              {{ page }}
            </button>

            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
