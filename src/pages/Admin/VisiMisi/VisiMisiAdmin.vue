<script setup>
import { ref, reactive, onMounted } from 'vue'
import { api } from '@/services/api'
import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import { Plus, Pencil, Trash2, Eye, X } from 'lucide-vue-next'
import Swal from 'sweetalert2'

const CONFIG_ID = 2

const loading = ref(true)
const savingVision = ref(false)
const error = ref(null)

const form = ref({})

const getConfig = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await api.detail('global_config', CONFIG_ID)
    const data = response?.data || response

    form.value = { ...data }

    if (!Array.isArray(form.value.missions)) {
      form.value.missions = []
    }
  } catch (err) {
    console.error('Gagal mengambil global config:', err)
    error.value =
      err.response?.data?.message || err.message || 'Gagal mengambil data config'
  } finally {
    loading.value = false
  }
}

// buang field yang gak boleh/gak perlu dikirim manual ke PUT
// (id sudah di URL, updated_by di-set otomatis backend dari user login,
// created_by/created_at/updated_at gak pernah diedit dari FE)
const buildPayload = () => {
  const {
    id,
    created_by,
    updated_by,
    created_at,
    updated_at,
    img_profile_1,
    img_profile_2,
    video_profile,
    rel_created_by,
    rel_updated_by,
    model,
    class_model,
    ...rest
  } = form.value
  return rest
}

// ============ VISI ============
const saveVision = async () => {
  try {
    savingVision.value = true

    await api.update('global_config', CONFIG_ID, buildPayload())

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Visi berhasil diperbarui.',
      timer: 1500,
      showConfirmButton: false,
      timerProgressBar: true,
    })
  } catch (err) {
    console.error('Gagal menyimpan visi:', err)
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: err.response?.data?.message || 'Gagal menyimpan visi.',
      confirmButtonColor: '#f97316',
    })
  } finally {
    savingVision.value = false
  }
}

// ============ MISI ============
const saveMissions = async () => {
  try {
    await api.update('global_config', CONFIG_ID, buildPayload())
  } catch (err) {
    console.error('Gagal menyimpan misi:', err)
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: err.response?.data?.message || 'Gagal menyimpan misi.',
      confirmButtonColor: '#f97316',
    })
    throw err
  }
}

const modalMode = ref(null) // 'add' | 'edit' | 'view' | null
const modalIndex = ref(null)
const modalForm = reactive({ content: '', order: null })

const openAdd = () => {
  modalMode.value = 'add'
  modalIndex.value = null
  modalForm.content = ''
  modalForm.order = form.value.missions.length + 1
}

const openEdit = (index) => {
  const item = form.value.missions[index]
  modalMode.value = 'edit'
  modalIndex.value = index
  modalForm.content = item.content
  modalForm.order = item.order
}

const openView = (index) => {
  const item = form.value.missions[index]
  modalMode.value = 'view'
  modalIndex.value = index
  modalForm.content = item.content
  modalForm.order = item.order
}

const closeModal = () => {
  modalMode.value = null
  modalIndex.value = null
}

const submitModal = async () => {
  if (!modalForm.content.trim()) {
    Swal.fire({ icon: 'warning', title: 'Isi misi tidak boleh kosong' })
    return
  }

  const payloadItem = {
    content: modalForm.content.trim(),
    order: modalForm.order,
  }

  if (modalMode.value === 'add') {
    form.value.missions.push(payloadItem)
  } else if (modalMode.value === 'edit') {
    form.value.missions[modalIndex.value] = payloadItem
  }

  try {
    await saveMissions()
    closeModal()
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      timer: 1200,
      showConfirmButton: false,
      timerProgressBar: true,
    })
  } catch {
    // error sudah ditampilkan di saveMissions
  }
}

const deleteMission = async (index) => {
  const result = await Swal.fire({
    title: 'Hapus misi ini?',
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

  const backup = [...form.value.missions]
  form.value.missions.splice(index, 1)

  try {
    await saveMissions()
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Misi berhasil dihapus.',
      timer: 1500,
      showConfirmButton: false,
      timerProgressBar: true,
    })
  } catch {
    form.value.missions = backup
  }
}

onMounted(() => {
  getConfig()
})
</script>

<template>
  <div class="min-h-screen bg-[#f8f7f6]">
    <Navbar />

    <div class="flex">
      <AdminSidebar />

      <main class="min-w-0 flex-1 px-6 py-8 lg:px-10">
        <div v-if="error" class="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {{ error }}
          <button @click="getConfig" class="ml-3 font-semibold underline">Coba lagi</button>
        </div>

        <div v-if="loading" class="rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">
          Memuat data...
        </div>

        <template v-else>
          <!-- VISI -->
          <section class="mb-6 rounded-2xl bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-lg font-bold text-gray-800">Visi Sekolah</h2>

            <textarea
              v-model="form.vision"
              rows="2"
              placeholder="Tuliskan visi sekolah..."
              class="mb-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
            ></textarea>

            <button
              @click="saveVision"
              :disabled="savingVision"
              class="rounded-xl bg-orange-400 px-6 py-3 font-semibold text-white transition hover:bg-orange-500 disabled:opacity-50"
            >
              {{ savingVision ? 'Menyimpan...' : 'Perbarui' }}
            </button>
          </section>

          <!-- MISI -->
          <section class="rounded-2xl bg-white p-6 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-lg font-bold text-gray-800">Misi Sekolah</h2>

              <button
                @click="openAdd"
                class="flex items-center gap-2 rounded-xl bg-orange-400 px-5 py-3 font-semibold text-white transition hover:bg-orange-500"
              >
                <Plus :size="18" /> Tambah Baru
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="border-b border-gray-200">
                  <tr class="text-left text-sm font-semibold text-gray-600">
                    <th class="px-3 py-3">No</th>
                    <th class="px-3 py-3">Aksi</th>
                    <th class="px-3 py-3">Isi Misi</th>
                    <th class="px-3 py-3">Urutan</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-if="!form.missions || form.missions.length === 0">
                    <td colspan="4" class="px-3 py-10 text-center text-gray-400">
                      Belum ada misi.
                    </td>
                  </tr>

                  <tr
                    v-for="(mission, index) in (form.missions || [])"
                    :key="index"
                    class="border-b border-gray-100 text-sm text-gray-700"
                  >
                    <td class="px-3 py-4">{{ index + 1 }}.</td>
                    <td class="px-3 py-4">
                      <div class="flex items-center gap-2">
                        <button @click="openView(index)" class="rounded-lg p-1.5 text-sky-500 hover:bg-sky-50" title="Detail">
                          <Eye :size="16" />
                        </button>
                        <button @click="openEdit(index)" class="rounded-lg p-1.5 text-orange-500 hover:bg-orange-50" title="Edit">
                          <Pencil :size="16" />
                        </button>
                        <button @click="deleteMission(index)" class="rounded-lg p-1.5 text-red-500 hover:bg-red-50" title="Hapus">
                          <Trash2 :size="16" />
                        </button>
                      </div>
                    </td>
                    <td class="px-3 py-4 max-w-md">{{ mission.content }}</td>
                    <td class="px-3 py-4">{{ mission.order ?? '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </template>

        <!-- MODAL ADD/EDIT/VIEW -->
        <div
          v-if="modalMode"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        >
          <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-800">
                {{ modalMode === 'add' ? 'Tambah Misi' : modalMode === 'edit' ? 'Edit Misi' : 'Detail Misi' }}
              </h3>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
                <X :size="20" />
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-600">Isi Misi</label>
                <textarea
                  v-model="modalForm.content"
                  :disabled="modalMode === 'view'"
                  rows="3"
                  class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 disabled:bg-gray-50"
                ></textarea>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-600">Urutan</label>
                <input
                  v-model.number="modalForm.order"
                  :disabled="modalMode === 'view'"
                  type="number"
                  class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 disabled:bg-gray-50"
                />
              </div>
            </div>

            <div class="mt-6 flex justify-end gap-2">
              <button @click="closeModal" class="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                {{ modalMode === 'view' ? 'Tutup' : 'Batal' }}
              </button>
              <button
                v-if="modalMode !== 'view'"
                @click="submitModal"
                class="rounded-xl bg-orange-400 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-500"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>