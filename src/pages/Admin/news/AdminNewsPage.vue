<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus,
  Search,
} from 'lucide-vue-next'
import Swal from 'sweetalert2'

import { api } from '@/services/api'

import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import DataTable from '@/components/UI/DataTable.vue'

const router = useRouter()

const newsList = ref([])
const loading = ref(false)
const error = ref(null)
const search = ref('')

// =========================
// PAGINATION
// =========================

const currentPage = ref(1)
const perPage = ref(10)

// =========================
// TABLE COLUMN
// =========================

const columns = [
  {
    key: 'img_cover',
    label: 'Cover',
    type: 'image',
  },

  {
    key: 'title',
    label: 'Judul Berita',
    type: 'title',
  },

  {
    key: 'status',
    label: 'Status',
    type: 'status',
  },
]

// =========================
// GET NEWS
// =========================

const getNews = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await api.list('news')

    console.log('Response API News:', response)

    newsList.value = response?.data || []

  } catch (err) {
    console.error('Error mengambil berita:', err)

    error.value =
      err.response?.data?.message ||
      err.message ||
      'Gagal mengambil data berita'

  } finally {
    loading.value = false
  }
}

// =========================
// SEARCH
// =========================

const filteredNews = computed(() => {
  if (!search.value.trim()) {
    return newsList.value
  }

  const keyword = search.value.toLowerCase()

  return newsList.value.filter((news) =>
    news.title?.toLowerCase().includes(keyword)
  )
})

// =========================
// TOTAL HALAMAN
// =========================

const totalPages = computed(() => {
  return Math.max(
    1,
    Math.ceil(
      filteredNews.value.length / perPage.value
    )
  )
})

// =========================
// DATA PER HALAMAN
// =========================

const paginatedNews = computed(() => {
  const start =
    (currentPage.value - 1) * perPage.value

  const end =
    start + perPage.value

  return filteredNews.value.slice(start, end)
})

// =========================
// NOMOR AWAL DATA
// =========================

const startItem = computed(() => {
  if (filteredNews.value.length === 0) {
    return 0
  }

  return (
    (currentPage.value - 1) *
      perPage.value +
    1
  )
})

// =========================
// NOMOR AKHIR DATA
// =========================

const endItem = computed(() => {
  return Math.min(
    currentPage.value * perPage.value,
    filteredNews.value.length
  )
})

// =========================
// PINDAH HALAMAN
// =========================

const changePage = (page) => {
  if (
    page < 1 ||
    page > totalPages.value
  ) {
    return
  }

  currentPage.value = page
}

// =========================
// SEARCH BERUBAH
// KEMBALI KE HALAMAN 1
// =========================

watch(search, () => {
  currentPage.value = 1
})

// =========================
// JIKA TOTAL HALAMAN BERUBAH
// =========================

watch(totalPages, (newTotal) => {
  if (currentPage.value > newTotal) {
    currentPage.value = newTotal
  }
})

// =========================
// NAVIGATION
// =========================

const goToCreate = () => {
  router.push('/admin/news/create')
}

const goToDetail = (id) => {
  router.push(`/admin/news/${id}`)
}

const goToEdit = (id) => {
  router.push(`/admin/news/${id}/edit`)
}

// =========================
// DELETE NEWS
// =========================

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

  if (!result.isConfirmed) {
    return
  }

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

    console.error(
      'Error menghapus berita:',
      err
    )

    Swal.fire({
      title: 'Gagal!',
      text:
        err.response?.data?.message ||
        'Gagal menghapus berita.',

      icon: 'error',

      confirmButtonText: 'OK',
      confirmButtonColor: '#f97316',
    })

  }
}

// =========================
// ON MOUNTED
// =========================

onMounted(() => {
  getNews()
})
</script>


<template>

  <div class="min-h-screen bg-[#f8f7f6]">

    <!-- NAVBAR -->

    <Navbar />

    <div class="flex">

      <!-- SIDEBAR -->

      <AdminSidebar />

      <main
        class="min-w-0 flex-1 px-6 py-8 lg:px-10"
      >

        <div
          class="mb-4 flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-sm"
        >

          <button
            @click="router.back()"
            class="text-2xl text-gray-700 transition hover:text-orange-500"
          >
            ‹
          </button>

          <h1
            class="font-semibold text-gray-800"
          >
            Kelola Berita
          </h1>

        </div>


        <!-- ========================= -->
        <!-- TITLE -->
        <!-- ========================= -->

        <section
          class="mb-4 flex items-center justify-between bg-white px-6 py-4 shadow-sm"
        >

          <div>

            <h2
              class="text-xl font-bold text-gray-800"
            >
              Daftar Berita
            </h2>

            <p
              class="mt-1 text-sm text-gray-500"
            >
              Kelola berita yang ditampilkan
              pada website.
            </p>

          </div>


          <!-- TAMBAH -->

          <button
            @click="goToCreate"
            class="flex items-center gap-2 rounded-xl bg-orange-400 px-5 py-3 font-semibold text-white transition hover:bg-orange-500"
          >

            <Plus :size="18" />

            Tambah Berita

          </button>

        </section>


        <!-- ========================= -->
        <!-- TABLE CARD -->
        <!-- ========================= -->

        <section
          class="bg-white p-6 shadow-sm"
        >

          <!-- ========================= -->
          <!-- SEARCH -->
          <!-- ========================= -->

          <div
            class="relative mb-6 max-w-sm"
          >

            <Search
              :size="18"
              class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              v-model="search"
              type="text"
              placeholder="Cari berita..."
              class="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />

          </div>


          <!-- ========================= -->
          <!-- ERROR -->
          <!-- ========================= -->

          <div
            v-if="error"
            class="py-16 text-center"
          >

            <p
              class="mb-4 text-red-500"
            >
              {{ error }}
            </p>

            <button
              @click="getNews"
              class="rounded-lg bg-orange-400 px-5 py-2 text-white transition hover:bg-orange-500"
            >
              Coba Lagi
            </button>

          </div>


          <!-- ========================= -->
          <!-- REUSABLE DATA TABLE -->
          <!-- ========================= -->

          <DataTable
            v-else
            :columns="columns"
            :items="paginatedNews"
            :loading="loading"
            :current-page="currentPage"
            :items-per-page="perPage"
            :total-pages="totalPages"
            status-type="news"

            @detail="goToDetail"
            @edit="goToEdit"
            @delete="deleteNews"
            @page-change="changePage"
          />

          <div
            v-if="
              !loading &&
              !error &&
              filteredNews.length > 0
            "
            class="mt-6 border-t border-gray-100 pt-5"
          >

            <p
              class="text-sm text-gray-500"
            >

              Menampilkan

              <span
                class="font-semibold text-gray-700"
              >
                {{ startItem }}
              </span>

              -

              <span
                class="font-semibold text-gray-700"
              >
                {{ endItem }}
              </span>

              dari

              <span
                class="font-semibold text-gray-700"
              >
                {{ filteredNews.length }}
              </span>

              berita

            </p>

          </div>

        </section>

      </main>

    </div>

  </div>

</template>