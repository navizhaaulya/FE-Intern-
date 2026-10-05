<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, Pencil, Trash2, Eye } from 'lucide-vue-next'
import Swal from 'sweetalert2'

import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import ImageUpload from '@/components/UI/ImageUpload.vue'
import { api } from '@/services/api'
import http from '@/services/http'

const route = useRoute()
const router = useRouter()
const majorId = route.params.id

const loading = ref(true)
const major = ref(null)

const getMajor = async () => {
  try {
    const response = await http.get(`/major/${majorId}`)
    major.value = response.data?.data
  } catch (err) {
    console.error('Gagal mengambil detail jurusan:', err)
    Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Gagal mengambil detail jurusan.' })
  }
}

const logoUrl = () => {
  const base = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8000'
  return `${base}/api/file/major/img_logo/${majorId}/${Date.now()}`
}

// ============ KOMPETENSI ============
const competencies = ref([])
const competencyView = ref('list')
const savingCompetency = ref(false)

const competencyForm = ref({ id: null, competent_name: '', description: '', status_code: true })

const getCompetencies = async () => {
  const response = await api.list('major_competent', { major_id: majorId })
  competencies.value = response?.data || []
}

const resetCompetencyForm = () => {
  competencyForm.value = { id: null, competent_name: '', description: '', status_code: true }
}

const openAddCompetency = () => {
  resetCompetencyForm()
  competencyView.value = 'form'
}

const openEditCompetency = (item) => {
  competencyForm.value = {
    id: item.id,
    competent_name: item.competent_name,
    description: item.description,
    status_code: item.status_code,
  }
  competencyView.value = 'form'
}

const saveCompetency = async () => {
  if (!competencyForm.value.competent_name.trim() || !competencyForm.value.description.trim()) {
    Swal.fire({ icon: 'warning', title: 'Nama dan deskripsi kompetensi wajib diisi' })
    return
  }

  try {
    savingCompetency.value = true

    const payload = {
      major_id: majorId,
      competent_name: competencyForm.value.competent_name,
      description: competencyForm.value.description,
      status_code: competencyForm.value.status_code,
    }

    if (competencyForm.value.id) {
      await api.update('major_competent', competencyForm.value.id, payload)
    } else {
      await api.create('major_competent', payload)
    }

    await getCompetencies()
    competencyView.value = 'list'

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      timer: 1200,
      showConfirmButton: false,
      timerProgressBar: true,
    })
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: err.response?.data?.message || 'Gagal menyimpan kompetensi.',
      confirmButtonColor: '#f97316',
    })
  } finally {
    savingCompetency.value = false
  }
}

const deleteCompetency = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus kompetensi ini?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#f97316',
    reverseButtons: true,
  })
  if (!result.isConfirmed) return

  try {
    await api.delete('major_competent', id)
    await getCompetencies()
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: err.response?.data?.message || 'Gagal menghapus kompetensi.',
    })
  }
}

// ============ GALERI ============
const galleries = ref([])
const galleryView = ref('list')
const savingGallery = ref(false)

const galleryForm = ref({ id: null, img_cover: '', description: '', status_code: true })

const existingGalleryPreview = ref('')

const getGalleries = async () => {
  const response = await api.list('major_gallery', { major_id: majorId })
  galleries.value = response?.data || []
}

const galleryImageUrl = (id) => {
  const base = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8000'
  return `${base}/api/file/major_gallery/img_cover/${id}/${Date.now()}`
}

const resetGalleryForm = () => {
  galleryForm.value = { id: null, img_cover: '', description: '', status_code: true }
  existingGalleryPreview.value = ''
}

const openAddGallery = () => {
  resetGalleryForm()
  galleryView.value = 'form'
}

const openEditGallery = (item) => {
  galleryForm.value = {
    id: item.id,
    img_cover:
      typeof item.img_cover === 'object' ? item.img_cover?.field_value || '' : item.img_cover || '',
    description: item.description,
    status_code: item.status_code,
  }
  existingGalleryPreview.value = galleryImageUrl(item.id)
  galleryView.value = 'form'
}

const saveGallery = async () => {
  if (!galleryForm.value.img_cover) {
    Swal.fire({ icon: 'warning', title: 'Gambar galeri wajib diupload' })
    return
  }
  if (!galleryForm.value.description.trim()) {
    Swal.fire({ icon: 'warning', title: 'Deskripsi gambar wajib diisi' })
    return
  }

  try {
    savingGallery.value = true

    const payload = {
      major_id: majorId,
      img_cover: galleryForm.value.img_cover,
      description: galleryForm.value.description,
      status_code: galleryForm.value.status_code,
    }

    if (galleryForm.value.id) {
      await api.update('major_gallery', galleryForm.value.id, payload)
    } else {
      await api.create('major_gallery', payload)
    }

    await getGalleries()
    galleryView.value = 'list'

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      timer: 1200,
      showConfirmButton: false,
      timerProgressBar: true,
    })
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: err.response?.data?.message || 'Gagal menyimpan galeri.',
      confirmButtonColor: '#f97316',
    })
  } finally {
    savingGallery.value = false
  }
}

const deleteGallery = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus foto galeri ini?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#f97316',
    reverseButtons: true,
  })
  if (!result.isConfirmed) return

  try {
    await api.delete('major_gallery', id)
    await getGalleries()
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: err.response?.data?.message || 'Gagal menghapus galeri.',
    })
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([getMajor(), getCompetencies(), getGalleries()])
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
          <button
            @click="router.push('/admin/major')"
            class="flex items-center gap-2 text-gray-700 transition hover:text-orange-500"
          >
            ⏮ Kembali
          </button>
        </div>

        <div v-if="loading" class="rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">
          Memuat data...
        </div>

        <template v-else>
          <!-- DETAIL DATA -->
          <section class="mb-4 rounded-xl bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-lg font-bold text-gray-800">Detail Data</h2>

            <div class="space-y-3 text-sm">
              <div class="flex">
                <span class="w-40 shrink-0 text-gray-500">Kode Jurusan</span
                ><span class="text-gray-800">: {{ major?.code }}</span>
              </div>
              <div class="flex">
                <span class="w-40 shrink-0 text-gray-500">Nama Jurusan</span
                ><span class="text-gray-800">: {{ major?.major_name }}</span>
              </div>
              <div class="flex">
                <span class="w-40 shrink-0 text-gray-500">Status</span>
                <span
                  class="font-semibold"
                  :class="major?.status_code ? 'text-green-600' : 'text-red-500'"
                >
                  : {{ major?.status_code ? 'Aktif' : 'Non Aktif' }}
                </span>
              </div>
              <div class="flex items-start">
                <span class="w-40 shrink-0 text-gray-500">Logo Jurusan</span>
                <img
                  v-if="major?.img_logo"
                  :src="logoUrl()"
                  class="h-16 w-16 rounded-lg border border-gray-200 object-contain"
                />
                <span v-else class="text-gray-400">-</span>
              </div>
            </div>
          </section>

          <!-- KOMPETENSI -->
          <section class="mb-4 rounded-xl bg-white p-6 shadow-sm">
            <template v-if="competencyView === 'list'">
              <div class="mb-4 flex items-center justify-between">
                <h2 class="text-lg font-bold text-gray-800">Kompetensi Jurusan</h2>
                <button
                  @click="openAddCompetency"
                  class="flex items-center gap-2 rounded-xl bg-orange-400 px-5 py-3 font-semibold text-white transition hover:bg-orange-500"
                >
                  <Plus :size="18" /> Tambah Baru
                </button>
              </div>

              <div v-if="competencies.length === 0" class="py-8 text-center text-gray-400">
                Belum ada kompetensi.
              </div>

              <div v-else class="overflow-x-auto">
                <table class="w-full">
                  <thead class="border-b border-gray-200">
                    <tr class="text-left text-sm font-semibold text-gray-600">
                      <th class="px-3 py-3">No</th>
                      <th class="px-3 py-3">Aksi</th>
                      <th class="px-3 py-3">Nama Kompetensi</th>
                      <th class="px-3 py-3">Deskripsi</th>
                      <th class="px-3 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(item, index) in competencies"
                      :key="item.id"
                      class="border-b border-gray-100 text-sm text-gray-700"
                    >
                      <td class="px-3 py-4">{{ index + 1 }}.</td>
                      <td class="px-3 py-4">
                        <div class="flex items-center gap-2">
                          <button
                            @click="openEditCompetency(item)"
                            class="rounded-lg p-1.5 text-orange-500 hover:bg-orange-50"
                          >
                            <Pencil :size="16" />
                          </button>
                          <button
                            @click="deleteCompetency(item.id)"
                            class="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 :size="16" />
                          </button>
                        </div>
                      </td>
                      <td class="px-3 py-4 font-medium">{{ item.competent_name }}</td>
                      <td class="max-w-md px-3 py-4">{{ item.description }}</td>
                      <td class="px-3 py-4">
                        <span
                          class="rounded-full px-3 py-1 text-xs font-semibold"
                          :class="
                            item.status_code
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-500'
                          "
                        >
                          {{ item.status_code ? 'Aktif' : 'Non Aktif' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>

            <!-- FORM KOMPETENSI -->
            <template v-else>
              <h2 class="mb-4 text-lg font-bold text-gray-800">
                {{ competencyForm.id ? 'Edit' : 'Tambah' }} Kompetensi
              </h2>

              <div class="space-y-4">
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-600"
                    >Nama Kompetensi</label
                  >
                  <input
                    v-model="competencyForm.competent_name"
                    type="text"
                    class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-600">Deskripsi</label>
                  <textarea
                    v-model="competencyForm.description"
                    rows="3"
                    class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  ></textarea>
                </div>

                <div>
                  <label class="mb-2 block text-sm font-medium text-gray-600">Status</label>
                  <div class="flex gap-6">
                    <label class="flex items-center gap-2 text-sm text-gray-700">
                      <input v-model="competencyForm.status_code" type="radio" :value="true" />
                      Aktif
                    </label>
                    <label class="flex items-center gap-2 text-sm text-gray-700">
                      <input v-model="competencyForm.status_code" type="radio" :value="false" />
                      Non-aktif
                    </label>
                  </div>
                </div>

                <div class="flex justify-end gap-3 border-t border-gray-100 pt-4">
                  <button
                    @click="competencyView = 'list'"
                    type="button"
                    class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    @click="saveCompetency"
                    :disabled="savingCompetency"
                    class="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                  >
                    {{ savingCompetency ? 'Menyimpan...' : 'Simpan' }}
                  </button>
                </div>
              </div>
            </template>
          </section>

          <!-- GALERI -->
          <section class="rounded-xl bg-white p-6 shadow-sm">
            <template v-if="galleryView === 'list'">
              <div class="mb-4 flex items-center justify-between">
                <h2 class="text-lg font-bold text-gray-800">Daftar Galeri Jurusan</h2>
                <button
                  @click="openAddGallery"
                  class="flex items-center gap-2 rounded-xl bg-orange-400 px-5 py-3 font-semibold text-white transition hover:bg-orange-500"
                >
                  <Plus :size="18" /> Tambah Baru
                </button>
              </div>

              <div v-if="galleries.length === 0" class="py-8 text-center text-gray-400">
                Belum ada foto galeri.
              </div>

              <div v-else class="overflow-x-auto">
                <table class="w-full">
                  <thead class="border-b border-gray-200">
                    <tr class="text-left text-sm font-semibold text-gray-600">
                      <th class="px-3 py-3">No</th>
                      <th class="px-3 py-3">Gambar</th>
                      <th class="px-3 py-3">Deskripsi</th>
                      <th class="px-3 py-3">Status</th>
                      <th class="px-3 py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(item, index) in galleries"
                      :key="item.id"
                      class="border-b border-gray-100 text-sm text-gray-700"
                    >
                      <td class="px-3 py-4">{{ index + 1 }}</td>
                      <td class="px-3 py-4">
                        <img
                          :src="galleryImageUrl(item.id)"
                          class="h-12 w-20 rounded-lg object-cover"
                          alt="Galeri"
                        />
                      </td>
                      <td class="max-w-md px-3 py-4">{{ item.description }}</td>
                      <td class="px-3 py-4">
                        <span
                          class="rounded-full px-3 py-1 text-xs font-semibold"
                          :class="
                            item.status_code
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-500'
                          "
                        >
                          {{ item.status_code ? 'Aktif' : 'Non Aktif' }}
                        </span>
                      </td>
                      <td class="px-3 py-4">
                        <div class="flex items-center gap-2">
                          <button
                            @click="openEditGallery(item)"
                            class="rounded-lg p-1.5 text-orange-500 hover:bg-orange-50"
                          >
                            <Pencil :size="16" />
                          </button>
                          <button
                            @click="deleteGallery(item.id)"
                            class="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 :size="16" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>

            <!-- FORM GALERI -->
            <template v-else>
              <h2 class="mb-4 text-lg font-bold text-gray-800">
                {{ galleryForm.id ? 'Edit' : 'Tambah' }} Foto Galeri
              </h2>

              <div class="space-y-4">
                <div>
                  <label class="mb-2 block text-sm font-medium text-gray-600">Gambar</label>
                  <ImageUpload
                    v-model="galleryForm.img_cover"
                    :initial-preview="existingGalleryPreview"
                    accept="image/jpeg,image/png,image/webp"
                    :max-size="3"
                  />
                </div>

                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-600">Deskripsi</label>
                  <input
                    v-model="galleryForm.description"
                    type="text"
                    class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label class="mb-2 block text-sm font-medium text-gray-600">Status</label>
                  <div class="flex gap-6">
                    <label class="flex items-center gap-2 text-sm text-gray-700">
                      <input v-model="galleryForm.status_code" type="radio" :value="true" /> Aktif
                    </label>
                    <label class="flex items-center gap-2 text-sm text-gray-700">
                      <input v-model="galleryForm.status_code" type="radio" :value="false" />
                      Non-aktif
                    </label>
                  </div>
                </div>

                <div class="flex justify-end gap-3 border-t border-gray-100 pt-4">
                  <button
                    @click="galleryView = 'list'"
                    type="button"
                    class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    @click="saveGallery"
                    :disabled="savingGallery"
                    class="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                  >
                    {{ savingGallery ? 'Menyimpan...' : 'Simpan' }}
                  </button>
                </div>
              </div>
            </template>
          </section>
        </template>
      </main>
    </div>
  </div>
</template>
