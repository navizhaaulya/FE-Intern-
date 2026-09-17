<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http from '@/services/http'
import { api } from '@/services/api'
import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import ImageUpload from '@/components/UI/ImageUpload.vue'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const votingId = route.params.id

const loading = ref(true)
const voting = ref(null)

const activeTab = ref('opsi') // 'opsi' | 'voters'
const view = ref('list') // 'list' | 'form' (khusus tab opsi)

// ============ VOTING DETAIL ============
const getVoting = async () => {
  try {
    const response = await http.get(`/admin/votings/${votingId}`)
    voting.value = response.data?.data
  } catch (err) {
    console.error('Gagal mengambil detail voting:', err)
    Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Gagal mengambil detail voting.' })
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

// ============ KANDIDAT (OPSI VOTING) ============
const candidates = ref([])
const candidatesLoading = ref(true)

const getCandidates = async () => {
  try {
    candidatesLoading.value = true
    const response = await api.list('voting_candidates', { voting_id: votingId })
    candidates.value = (response?.data || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } catch (err) {
    console.error('Gagal mengambil kandidat:', err)
  } finally {
    candidatesLoading.value = false
  }
}

const getImageUrl = (imgObj) => {
  if (!imgObj) return ''
  if (typeof imgObj === 'string') return imgObj
  const rawUrl = imgObj.url || imgObj.field_value || ''
  if (!rawUrl) return ''
  if (rawUrl.startsWith('http')) return rawUrl
  return `${import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')}/${rawUrl}`
}

// form kandidat
const candidateForm = ref({
  id: null,
  img_cover: '',
  title: '',
  description: '',
  order: '',
  status_code: true,
})

const savingCandidate = ref(false)

const resetCandidateForm = () => {
  candidateForm.value = {
    id: null,
    img_cover: '',
    title: '',
    description: '',
    order: candidates.value.length + 1,
    status_code: true,
  }
}

const openAddCandidate = () => {
  resetCandidateForm()
  view.value = 'form'
}

const openEditCandidate = (item) => {
  candidateForm.value = {
    id: item.id,
    img_cover: (typeof item.img_cover === 'object' ? item.img_cover.field_value : item.img_cover) || '',
    title: item.title,
    description: item.description,
    order: item.order,
    status_code: item.status_code,
  }
  view.value = 'form'
}

const cancelCandidateForm = () => {
  view.value = 'list'
}

const saveCandidate = async () => {
  if (!candidateForm.value.title.trim()) {
    Swal.fire({ icon: 'warning', title: 'Judul kandidat tidak boleh kosong' })
    return
  }

  try {
    savingCandidate.value = true

    const payload = {
      voting_id: votingId,
      img_cover: candidateForm.value.img_cover,
      title: candidateForm.value.title,
      description: candidateForm.value.description,
      order: candidateForm.value.order,
      status_code: candidateForm.value.status_code,
    }

    if (candidateForm.value.id) {
      await api.update('voting_candidate', candidateForm.value.id, payload)
    } else {
      await api.create('voting_candidate', payload)
    }

    await getCandidates()
    view.value = 'list'

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: `Kandidat berhasil ${candidateForm.value.id ? 'diperbarui' : 'ditambahkan'}.`,
      timer: 1500,
      showConfirmButton: false,
      timerProgressBar: true,
    })
  } catch (err) {
    console.error('Gagal menyimpan kandidat:', err)
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: err.response?.data?.message || 'Gagal menyimpan kandidat.',
      confirmButtonColor: '#f97316',
    })
  } finally {
    savingCandidate.value = false
  }
}

const deleteCandidate = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus kandidat ini?',
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
    await api.delete('voting_candidate', id)
    await getCandidates()
    Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Kandidat berhasil dihapus.', timer: 1500, showConfirmButton: false, timerProgressBar: true })
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Gagal!', text: err.response?.data?.message || 'Gagal menghapus kandidat.', confirmButtonColor: '#f97316' })
  }
}

// ============ VOTING USER ============
const voters = ref([])
const votersLoading = ref(false)
const votersLoaded = ref(false)

const getVoters = async () => {
  try {
    votersLoading.value = true
    const response = await http.get(`/admin/votings/${votingId}/voters`)
    voters.value = response.data?.data || []
    votersLoaded.value = true
  } catch (err) {
    console.error('Gagal mengambil daftar voter:', err)
  } finally {
    votersLoading.value = false
  }
}

const switchTab = (tab) => {
  activeTab.value = tab
  view.value = 'list'
  if (tab === 'voters' && !votersLoaded.value) {
    getVoters()
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([getVoting(), getCandidates()])
  loading.value = false
})
</script>

<template>
  <div class="min-h-screen bg-[#f8f7f6]">
    <Navbar />

    <div class="flex">
      <AdminSidebar />

      <main class="min-w-0 flex-1 px-6 py-8 lg:px-10">
        <div class="mb-4 flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-sm">
          <button @click="router.push('/admin/votings')" class="flex items-center gap-2 text-gray-700 transition hover:text-orange-500">
            ⏮ Kembali
          </button>
        </div>

        <div v-if="loading" class="rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">Memuat data...</div>

        <template v-else>
          <!-- DETAIL VOTING -->
          <section class="mb-4 rounded-xl bg-white p-6 shadow-sm">
            <div class="space-y-3 text-sm">
              <div class="flex"><span class="w-40 shrink-0 text-gray-500">Judul Voting</span><span class="text-gray-800">: {{ voting?.title }}</span></div>
              <div class="flex"><span class="w-40 shrink-0 text-gray-500">Deskripsi</span><span class="text-gray-800">: {{ voting?.description }}</span></div>
              <div class="flex"><span class="w-40 shrink-0 text-gray-500">Cover Voting</span><span class="text-gray-800">: {{ getImageUrl(voting?.img_cover) || '-' }}</span></div>
              <div class="flex"><span class="w-40 shrink-0 text-gray-500">Tanggal Mulai</span><span class="text-gray-800">: {{ formatDate(voting?.start_date) }}</span></div>
              <div class="flex"><span class="w-40 shrink-0 text-gray-500">Tanggal Selesai</span><span class="text-gray-800">: {{ formatDate(voting?.end_date) }}</span></div>
              <div class="flex">
                <span class="w-40 shrink-0 text-gray-500">Status</span>
                <span class="font-semibold" :class="voting?.status_code ? 'text-green-600' : 'text-red-500'">
                  : {{ voting?.status_code ? 'Aktif' : 'Non Aktif' }}
                </span>
              </div>
            </div>
          </section>

          <!-- TABS -->
          <div class="mb-2 flex gap-6 px-2 text-sm font-semibold">
            <button @click="switchTab('opsi')" :class="activeTab === 'opsi' ? 'text-gray-900' : 'text-gray-400'">Opsi Voting</button>
            <button @click="switchTab('voters')" :class="activeTab === 'voters' ? 'text-gray-900' : 'text-gray-400'">Voting User</button>
          </div>

          <!-- TAB: OPSI VOTING -->
          <section v-if="activeTab === 'opsi'" class="rounded-xl bg-white p-6 shadow-sm">
            <!-- LIST VIEW -->
            <template v-if="view === 'list'">
              <div class="mb-4 flex items-center justify-end">
                <button @click="openAddCandidate" class="flex items-center gap-2 rounded-xl bg-orange-400 px-5 py-3 font-semibold text-white transition hover:bg-orange-500">
                  <Plus :size="18" /> Tambah Baru
                </button>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="border-b border-gray-200">
                    <tr class="text-left text-sm font-semibold text-gray-600">
                      <th class="px-3 py-3">No</th>
                      <th class="px-3 py-3">Aksi</th>
                      <th class="px-3 py-3">Cover</th>
                      <th class="px-3 py-3">Judul</th>
                      <th class="px-3 py-3">Urutan</th>
                      <th class="px-3 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="candidatesLoading">
                      <td colspan="6" class="px-3 py-10 text-center text-gray-500">Memuat data...</td>
                    </tr>
                    <tr v-else-if="candidates.length === 0">
                      <td colspan="6" class="px-3 py-10 text-center text-gray-400">Belum ada kandidat.</td>
                    </tr>
                    <tr v-for="(item, index) in candidates" v-else :key="item.id" class="border-b border-gray-100 text-sm text-gray-700">
                      <td class="px-3 py-4">{{ index + 1 }}.</td>
                      <td class="px-3 py-4">
                        <div class="flex items-center gap-2">
                          <button @click="openEditCandidate(item)" class="rounded-lg p-1.5 text-orange-500 hover:bg-orange-50" title="Edit">
                            <Pencil :size="16" />
                          </button>
                          <button @click="deleteCandidate(item.id)" class="rounded-lg p-1.5 text-red-500 hover:bg-red-50" title="Hapus">
                            <Trash2 :size="16" />
                          </button>
                        </div>
                      </td>
                      <td class="px-3 py-4">
                        <img v-if="getImageUrl(item.img_cover)" :src="getImageUrl(item.img_cover)" class="h-10 w-16 rounded-lg object-cover" />
                        <div v-else class="flex h-10 w-16 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">No Image</div>
                      </td>
                      <td class="px-3 py-4 max-w-xs">{{ item.title }}</td>
                      <td class="px-3 py-4">{{ item.order ?? '-' }}</td>
                      <td class="px-3 py-4">
                        <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="item.status_code ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'">
                          {{ item.status_code ? 'Aktif' : 'Non Aktif' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>

            <!-- FORM VIEW -->
            <template v-else>
              <h3 class="mb-4 font-semibold text-gray-800">
                {{ candidateForm.id ? 'Edit opsi voting' : 'Tambah baru opsi voting' }}
              </h3>

              <div class="max-w-xl space-y-4">
                <div>
                  <label class="mb-2 block text-sm font-medium text-gray-600">Cover</label>
                  <ImageUpload v-model="candidateForm.img_cover" />
                </div>

                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-600">Judul</label>
                  <input v-model="candidateForm.title" type="text" placeholder="Masukan Judul..." class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                </div>

                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-600">Keterangan (opsional)</label>
                  <input v-model="candidateForm.description" type="text" placeholder="Masukan keterangan..." class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                </div>

                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-600">Urutan</label>
                  <input v-model.number="candidateForm.order" type="number" placeholder="Urutan kandidat..." class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                </div>

                <div>
                  <label class="mb-2 block text-sm font-medium text-gray-600">Status</label>
                  <div class="flex gap-6">
                    <label class="flex items-center gap-2 text-sm text-gray-700">
                      <input v-model="candidateForm.status_code" :value="true" type="radio" /> Aktif
                    </label>
                    <label class="flex items-center gap-2 text-sm text-gray-700">
                      <input v-model="candidateForm.status_code" :value="false" type="radio" /> Non-aktif
                    </label>
                  </div>
                </div>

                <div class="flex gap-3">
                  <button @click="saveCandidate" :disabled="savingCandidate" class="rounded-xl bg-orange-400 px-6 py-3 font-semibold text-white transition hover:bg-orange-500 disabled:opacity-50">
                    {{ savingCandidate ? 'Menyimpan...' : 'Simpan' }}
                  </button>
                  <button @click="cancelCandidateForm" class="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-600 hover:bg-gray-50">
                    Batal
                  </button>
                </div>
              </div>
            </template>
          </section>

          <!-- TAB: VOTING USER -->
          <section v-else class="rounded-xl bg-white p-6 shadow-sm">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="border-b border-gray-200">
                  <tr class="text-left text-sm font-semibold text-gray-600">
                    <th class="px-3 py-3">No</th>
                    <th class="px-3 py-3">Nama Pengguna</th>
                    <th class="px-3 py-3">Kandidat Dipilih</th>
                    <th class="px-3 py-3">Waktu Vote</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="votersLoading">
                    <td colspan="4" class="px-3 py-10 text-center text-gray-500">Memuat data...</td>
                  </tr>
                  <tr v-else-if="voters.length === 0">
                    <td colspan="4" class="px-3 py-10 text-center text-gray-400">Belum ada yang vote.</td>
                  </tr>
                  <tr v-for="(v, index) in voters" v-else :key="v.id" class="border-b border-gray-100 text-sm text-gray-700">
                    <td class="px-3 py-4">{{ index + 1 }}.</td>
                    <td class="px-3 py-4">{{ v.user_name || '-' }}</td>
                    <td class="px-3 py-4">{{ v.candidate_title || '-' }}</td>
                    <td class="px-3 py-4">{{ formatDate(v.voted_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </template>
      </main>
    </div>
  </div>
</template>