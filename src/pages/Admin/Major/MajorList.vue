<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-vue-next'
import Swal from 'sweetalert2'

import { api } from '@/services/api'
import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'

const router = useRouter()

const list = ref([])
const loading = ref(true)
const error = ref(null)
const search = ref('')

const currentPage = ref(1)
const itemsPerPage = 10

const getMajors = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await api.list('major')
    const data = response?.data || []

    list.value = data.map((item) => ({
      ...item,
      img_logo: item.img_logo
        ? `${import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')}/api/file/major/img_logo/${item.id}/${Date.now()}`
        : null,
    }))
  } catch (err) {
    console.error('Gagal mengambil jurusan:', err)
    error.value = err.response?.data?.message || err.message || 'Gagal mengambil data jurusan'
  } finally {
    loading.value = false
  }
}

const filteredList = computed(() => {
  const keyword = search.value.toLowerCase().trim()
  if (!keyword) return list.value
  return list.value.filter(
    (m) =>
      m.major_name?.toLowerCase().includes(keyword) ||
      m.code?.toLowerCase().includes(keyword)
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredList.value.length / itemsPerPage)))

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredList.value.slice(start, start + itemsPerPage)
})

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

const goToCreate = () => router.push('/admin/major/create')
const goToDetail = (id) => router.push(`/admin/major/${id}`)
const goToEdit = (id) => router.push(`/admin/major/${id}/edit`)

const deleteMajor = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus jurusan ini?',
    text: 'Jurusan beserta kompetensi dan galerinya akan dihapus permanen.',
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
    await api.delete('major', id)
    await getMajors()
    Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Jurusan berhasil dihapus.', timer: 1500, showConfirmButton: false, timerProgressBar: true })
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Gagal!', text: err.response?.data?.message || 'Gagal menghapus jurusan.', confirmButtonColor: '#f97316' })
  }
}

onMounted(getMajors)
</script>

<template>
  <div class="min-h-screen bg-[#f8f7f6]">
    <Navbar />

    <div class="flex">
      <AdminSidebar />

      <main class="min-w-0 flex-1 px-6 py-8 lg:px-10">
        <div class="mb-4 flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-sm">
          <button @click="router.back()" class="text-gray-700 transition hover:text-orange-500">‹</button>
          <h1 class="font-semibold text-gray-800">Kelola Jurusan</h1>
        </div>

        <section class="mb-4 flex items-center justify-between bg-white px-6 py-4 shadow-sm">
          <div>
            <h2 class="text-xl font-bold text-gray-800">Daftar Jurusan</h2>
            <p class="mt-1 text-sm text-gray-500">Kelola kompetensi keahlian yang ditampilkan pada website.</p>
          </div>

          <button
            @click="goToCreate"
            class="flex items-center gap-2 rounded-xl bg-orange-400 px-5 py-3 font-semibold text-white transition hover:bg-orange-500"
          >
            <Plus :size="18" />
            Tambah Jurusan
          </button>
        </section>

        <section class="rounded-xl bg-white p-6 shadow-sm">
          <div class="relative mb-6 max-w-sm">
            <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              v-model="search"
              @input="currentPage = 1"
              type="text"
              placeholder="Cari jurusan..."
              class="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div v-if="error" class="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            {{ error }}
            <button @click="getMajors" class="ml-3 font-semibold underline">Coba lagi</button>
          </div>

          <div v-if="loading" class="py-10 text-center text-gray-500">Memuat data...</div>

          <div v-else-if="paginatedList.length === 0" class="py-10 text-center text-gray-400">
            Belum ada jurusan.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="border-b border-gray-200">
                <tr class="text-left text-sm font-semibold text-gray-600">
                  <th class="px-3 py-3">No</th>
                  <th class="px-3 py-3">Aksi</th>
                  <th class="px-3 py-3">Logo</th>
                  <th class="px-3 py-3">Kode</th>
                  <th class="px-3 py-3">Nama Jurusan</th>
                  <th class="px-3 py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="(item, index) in paginatedList"
                  :key="item.id"
                  class="border-b border-gray-100 text-sm text-gray-700"
                >
                  <td class="px-3 py-4">{{ (currentPage - 1) * itemsPerPage + index + 1 }}.</td>

                  <td class="px-3 py-4">
                    <div class="flex items-center gap-2">
                      <button @click="goToDetail(item.id)" class="rounded-lg p-1.5 text-blue-500 hover:bg-blue-50" title="Detail">
                        <Eye :size="18" />
                      </button>
                      <button @click="goToEdit(item.id)" class="rounded-lg p-1.5 text-orange-500 hover:bg-orange-50" title="Edit">
                        <Pencil :size="16" />
                      </button>
                      <button @click="deleteMajor(item.id)" class="rounded-lg p-1.5 text-red-500 hover:bg-red-50" title="Hapus">
                        <Trash2 :size="16" />
                      </button>
                    </div>
                  </td>

                  <td class="px-3 py-4">
                    <img
                      v-if="item.img_logo"
                      :src="item.img_logo"
                      class="h-10 w-10 rounded-lg object-contain"
                      alt="Logo"
                    />
                    <div v-else class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">-</div>
                  </td>

                  <td class="px-3 py-4 font-semibold">{{ item.code }}</td>
                  <td class="px-3 py-4">{{ item.major_name }}</td>

                  <td class="px-3 py-4">
                    <span
                      class="rounded-full px-3 py-1 text-xs font-semibold"
                      :class="item.status_code ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'"
                    >
                      {{ item.status_code ? 'Aktif' : 'Non Aktif' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="totalPages > 1" class="mt-6 flex items-center justify-center gap-2">
            <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40">‹</button>
            <button
              v-for="page in totalPages"
              :key="page"
              @click="changePage(page)"
              class="rounded-lg px-3 py-2 text-sm"
              :class="currentPage === page ? 'bg-orange-400 text-white' : 'border border-gray-200 text-gray-600'"
            >
              {{ page }}
            </button>
            <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40">›</button>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>