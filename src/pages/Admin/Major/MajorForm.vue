<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Save } from 'lucide-vue-next'
import Swal from 'sweetalert2'

import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import ImageUpload from '@/components/UI/ImageUpload.vue'
import RichTextEditor from '@/components/UI/TextEditor.vue'
import { api } from '@/services/api'
import http from '@/services/http'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)

const form = ref({
  slug: '',
  img_logo: '',
  code: '',
  major_name: '',
  summary: '',
  total_classes: 1,
  major_duration: 1,
  full_description: '',
  status_code: true,
})

const loading = ref(isEdit.value)
const saving = ref(false)
const error = ref('')

const existingImageUrl = computed(() => {
  const val = form.value.img_logo
  if (!val || typeof val !== 'string') return ''
  if (val.startsWith('http')) return val
  const base = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8000'
  return `${base}/api/file/major/img_logo/${route.params.id}/${Date.now()}`
})

const generateSlug = () => {
  if (isEdit.value) return
  form.value.slug = form.value.major_name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const getMajor = async () => {
  try {
    loading.value = true
    const response = await http.get(`/major/${route.params.id}`)
    const data = response.data?.data

    form.value.slug = data.slug
    console.log('RAW img_logo dari API:', data.img_logo)
    form.value.img_logo =
      typeof data.img_logo === 'object'
        ? data.img_logo?.field_value || data.img_logo?.path || ''
        : data.img_logo || ''
    form.value.code = data.code
    form.value.major_name = data.major_name
    form.value.summary = data.summary
    form.value.total_classes = data.total_classes
    form.value.major_duration = data.major_duration
    form.value.full_description = data.full_description
    form.value.status_code = data.status_code
  } catch (err) {
    console.error('Gagal mengambil data jurusan:', err)
    error.value = 'Gagal mengambil data jurusan.'
  } finally {
    loading.value = false
  }
}

const goBack = () => router.back()

const submitForm = async () => {
  try {
    error.value = ''

    if (!form.value.img_logo) {
      error.value = 'Silakan upload logo jurusan terlebih dahulu.'
      return
    }

    if (!isEdit.value) generateSlug()

    saving.value = true

    const payload = { ...form.value }

    if (isEdit.value) {
      await api.update('major', route.params.id, payload)
    } else {
      await api.create('major', payload)
    }

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: `Jurusan berhasil ${isEdit.value ? 'diperbarui' : 'ditambahkan'}.`,
      timer: 1500,
      showConfirmButton: false,
      timerProgressBar: true,
    })

    router.push('/admin/major')
  } catch (err) {
    console.error('Gagal menyimpan jurusan:', err)
    error.value = err.response?.data?.message || err.message || 'Gagal menyimpan jurusan.'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (isEdit.value) getMajor()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="flex">
      <AdminSidebar />

      <main class="flex-1 p-6">
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-gray-800">
              {{ isEdit ? 'Edit Jurusan' : 'Tambah Jurusan' }}
            </h1>
            <p class="mt-1 text-sm text-gray-500">Kelola data kompetensi keahlian.</p>
          </div>

          <button
            @click="goBack"
            class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <ArrowLeft :size="18" />
            Kembali
          </button>
        </div>

        <div v-if="loading" class="rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">
          Memuat data...
        </div>

        <div
          v-else-if="error"
          class="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {{ error }}
        </div>

        <div v-if="!loading" class="rounded-xl bg-white p-6 shadow-sm">
          <form @submit.prevent="submitForm" class="space-y-6">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700"
                >Logo Jurusan <span class="text-red-500">*</span></label
              >
              <ImageUpload
                v-model="form.img_logo"
                :initial-preview="existingImageUrl"
                accept="image/jpeg,image/png,image/webp"
                :max-size="5"
              />
            </div>

            <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700"
                  >Kode Jurusan <span class="text-red-500">*</span></label
                >
                <input
                  v-model="form.code"
                  type="text"
                  placeholder="SIJA"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700"
                  >Nama Jurusan <span class="text-red-500">*</span></label
                >
                <input
                  v-model="form.major_name"
                  @blur="generateSlug"
                  type="text"
                  placeholder="Sistem Informasi, Jaringan, dan Aplikasi"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
              </div>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"
                >Ringkasan Singkat <span class="text-red-500">*</span></label
              >
              <input
                v-model="form.summary"
                type="text"
                placeholder="Ringkasan singkat untuk kartu jurusan"
                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>

            <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Total Kelas</label>
                <input
                  v-model.number="form.total_classes"
                  type="number"
                  min="0"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">Durasi (tahun)</label>
                <input
                  v-model.number="form.major_duration"
                  type="number"
                  min="1"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
              </div>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700"
                >Deskripsi Lengkap <span class="text-red-500">*</span></label
              >
              <RichTextEditor v-model="form.full_description" />
            </div>

            <div>
              <label class="mb-3 block text-sm font-medium text-gray-700"
                >Status <span class="text-red-500">*</span></label
              >
              <div class="flex gap-8">
                <label class="flex cursor-pointer items-center gap-2">
                  <input
                    v-model="form.status_code"
                    type="radio"
                    :value="true"
                    class="h-4 w-4 accent-orange-500"
                  />
                  <span class="text-sm text-gray-700">Aktif</span>
                </label>
                <label class="flex cursor-pointer items-center gap-2">
                  <input
                    v-model="form.status_code"
                    type="radio"
                    :value="false"
                    class="h-4 w-4 accent-orange-500"
                  />
                  <span class="text-sm text-gray-700">Nonaktif</span>
                </label>
              </div>
            </div>

            <div class="flex justify-end gap-3 border-t border-gray-100 pt-5">
              <button
                type="button"
                @click="goBack"
                :disabled="saving"
                class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save :size="18" />
                {{ saving ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>
