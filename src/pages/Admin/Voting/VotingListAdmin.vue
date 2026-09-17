<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import http from '@/services/http'
import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import DataTable from '@/components/UI/DataTable.vue'
import { Plus, Search } from 'lucide-vue-next'
import Swal from 'sweetalert2'

const router = useRouter()

const list = ref([])
const loading = ref(true)
const error = ref(null)
const search = ref('')

const currentPage = ref(1)
const itemsPerPage = 10

const columns = [
  { key: 'img_cover', label: 'Cover', type: 'image' },
  { key: 'title', label: 'Judul' },
  { key: 'description', label: 'Deskripsi', type: 'truncate' },
  { key: 'start_date', label: 'Mulai', type: 'date' },
  { key: 'end_date', label: 'Selesai', type: 'date' },
  {
    key: 'status_code',
    label: 'Status',
    type: 'badge',
    badgeMap: {
      true: { label: 'Aktif', class: 'bg-green-100 text-green-600' },
      false: { label: 'Non Aktif', class: 'bg-red-100 text-red-500' },
    },
  },
]

const getVotings = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await http.get('/admin/votings')
    list.value = response.data?.data || []
  } catch (err) {
    console.error('Gagal mengambil voting:', err)
    error.value = err.response?.data?.message || err.message || 'Gagal mengambil data voting'
  } finally {
    loading.value = false
  }
}

const filteredList = computed(() => {
  const keyword = search.value.toLowerCase().trim()
  if (!keyword) return list.value
  return list.value.filter((v) => v.title?.toLowerCase().includes(keyword))
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

const goToCreate = () => router.push('/admin/voting/create')
const goToDetail = (id) => router.push(`/admin/voting/${id}`)
const goToEdit = (id) => router.push(`/admin/voting/${id}/edit`)

const deleteVoting = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus voting ini?',
    text: 'Voting akan dinonaktifkan dan tidak tampil lagi di landing page.',
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
    await http.delete(`/admin/votings/${id}`)
    await getVotings()
    Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Voting berhasil dihapus.', timer: 1500, showConfirmButton: false, timerProgressBar: true })
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Gagal!', text: err.response?.data?.message || 'Gagal menghapus voting.', confirmButtonColor: '#f97316' })
  }
}

const toggleHighlight = async (id) => {
  try {
    await http.put('/votings/highlight', { id })
    await getVotings()
    Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Voting dijadikan highlight.', timer: 1500, showConfirmButton: false, timerProgressBar: true })
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Gagal!', text: err.response?.data?.message || 'Gagal mengubah highlight.', confirmButtonColor: '#f97316' })
  }
}

onMounted(() => {
  getVotings()
})
</script>

<template>
  <div class="min-h-screen bg-[#f8f7f6]">
    <Navbar />
    <div class="flex">
      <AdminSidebar />
      <main class="min-w-0 flex-1 px-6 py-8 lg:px-10">
        <div class="mb-4 flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-sm">
          <button @click="router.back()" class="text-gray-700 transition hover:text-orange-500">‹</button>
          <h1 class="font-semibold text-gray-800">Kelola Voting</h1>
        </div>

        <section class="mb-4 rounded-xl bg-white p-6 shadow-sm">
          <div class="mb-6 flex items-center justify-between">
            <div class="relative max-w-sm flex-1">
              <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input v-model="search" @input="currentPage = 1" type="text" placeholder="Cari Voting Disini.." class="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </div>

            <button @click="goToCreate" class="flex items-center gap-2 rounded-xl bg-orange-400 px-5 py-3 font-semibold text-white transition hover:bg-orange-500">
              <Plus :size="18" /> Tambah
            </button>
          </div>

          <div v-if="error" class="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            {{ error }}
            <button @click="getVotings" class="ml-3 font-semibold underline">Coba lagi</button>
          </div>

          <DataTable
            :columns="columns"
            :items="paginatedList"
            :loading="loading"
            :current-page="currentPage"
            :items-per-page="itemsPerPage"
            :total-pages="totalPages"
            :actions="['detail', 'edit', 'delete', 'highlight']"
            highlight-key="is_highlight"
            @detail="goToDetail"
            @edit="goToEdit"
            @delete="deleteVoting"
            @highlight="toggleHighlight"
            @page-change="changePage"
          />
        </section>
      </main>
    </div>
  </div>
</template>