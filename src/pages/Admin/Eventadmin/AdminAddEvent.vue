<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Save } from 'lucide-vue-next'
import Swal from 'sweetalert2'

import { api } from '@/services/api'
import http from '@/services/http'
import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import ImageUpload from '@/components/UI/ImageUpload.vue'
import RichTextEditor from '@/components/UI/TextEditor.vue'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)

const form = ref({
  slug: '',
  title: '',
  content: '',
  location: '',
  start_date: '',
  end_date: '',
  img_cover: '',
  status: 'draft',
  is_highlight: false,
})

const loading = ref(isEdit.value)
const saving = ref(false)
const error = ref('')

const existingImageUrl = computed(() => {
  const val = form.value.img_cover
  if (!val || typeof val !== 'string') return ''
  if (val.startsWith('http')) return val
  const base = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8000'
  return `${base}/api/file/events/img_cover/${route.params.id}/${Date.now()}`
})

const generateSlug = () => {
  if (isEdit.value) return
  form.value.slug = form.value.title
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const getEvent = async () => {
  try {
    loading.value = true
    const response = await http.get(`/events/${route.params.id}`)
    const data = response.data?.data

    form.value.slug = data.slug
    form.value.title = data.title
    form.value.content = data.content
    form.value.location = data.location
    form.value.start_date = data.start_date?.split('T')[0] || data.start_date
    form.value.end_date = data.end_date?.split('T')[0] || data.end_date
    form.value.img_cover =
      typeof data.img_cover === 'object'
        ? data.img_cover?.field_value || data.img_cover?.path || ''
        : data.img_cover || ''
    form.value.status = data.status
    form.value.is_highlight = data.is_highlight
  } catch (err) {
    console.error('Gagal mengambil data event:', err)
    error.value = 'Gagal mengambil data event.'
  } finally {
    loading.value = false
  }
}

const goBack = () => router.push('/admin/event')

const submit = async () => {
  error.value = ''

  if (
    !form.value.slug ||
    !form.value.title ||
    !form.value.content ||
    !form.value.start_date ||
    !form.value.end_date
  ) {
    Swal.fire({
      title: 'Data belum lengkap',
      text: 'Silakan lengkapi field yang wajib diisi.',
      icon: 'warning',
      confirmButtonColor: '#f97316',
    })
    return
  }

  if (!form.value.img_cover) {
    Swal.fire({
      title: 'Gambar belum diupload',
      text: 'Silakan upload gambar cover terlebih dahulu.',
      icon: 'warning',
      confirmButtonColor: '#f97316',
    })
    return
  }

  if (!isEdit.value) generateSlug()

  saving.value = true

  try {
    if (isEdit.value) {
      await api.update('events', route.params.id, form.value)
    } else {
      await api.create('events', form.value)
    }

    await Swal.fire({
      title: 'Berhasil!',
      text: `Event berhasil ${isEdit.value ? 'diperbarui' : 'ditambahkan'}.`,
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#f97316',
      timer: 2000,
      timerProgressBar: true,
    })

    router.push('/admin/event')
  } catch (err) {
    console.error(err)
    Swal.fire({
      title: 'Gagal!',
      text: err.response?.data?.message || 'Gagal menyimpan event.',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#f97316',
    })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (isEdit.value) getEvent()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="flex">
      <AdminSidebar />

      <main class="flex-1 p-6">
        <div class="mb-6 flex items-center gap-4">
          <button @click="goBack" class="rounded-lg p-2 hover:bg-gray-200">
            <ArrowLeft :size="20" />
          </button>

          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ isEdit ? 'Edit Event' : 'Tambah Event' }}
            </h1>
            <p class="mt-1 text-sm text-gray-500">Kelola data event sekolah.</p>
          </div>
        </div>

        <div
          v-if="loading"
          class="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500"
        >
          Memuat data...
        </div>

        <div
          v-else-if="error"
          class="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600"
        >
          {{ error }}
        </div>

        <div v-if="!loading" class="rounded-xl border border-gray-200 bg-white p-6">
          <form @submit.prevent="submit" class="space-y-5">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">
                Judul Event <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.title"
                @blur="generateSlug"
                type="text"
                placeholder="Masukkan judul event"
                class="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
              />

              <p v-if="form.title" class="mt-2 text-xs text-gray-400">
                Slug:
                <span class="font-medium text-gray-500">{{
                  form.slug || 'akan dibuat otomatis'
                }}</span>
              </p>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">
                Konten <span class="text-red-500">*</span>
              </label>
              <RichTextEditor v-model="form.content" />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Lokasi</label>
              <input
                v-model="form.location"
                type="text"
                placeholder="Masukkan lokasi event"
                class="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">
                  Tanggal Mulai <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.start_date"
                  type="date"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">
                  Tanggal Selesai <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.end_date"
                  type="date"
                  class="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                />
              </div>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">
                Gambar Cover <span class="text-red-500">*</span>
              </label>
              <ImageUpload
                v-model="form.img_cover"
                :initial-preview="existingImageUrl"
                accept="image/jpeg,image/png,image/webp"
                :max-size="5"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Status</label>
              <select
                v-model="form.status"
                class="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
              >
                <option value="draft">Draft</option>
                <option value="publish">Publish</option>
                <option value="archive">Archive</option>
              </select>
            </div>

            <div class="flex items-center gap-3">
              <input id="highlight" v-model="form.is_highlight" type="checkbox" class="h-4 w-4" />
              <label for="highlight" class="text-sm text-gray-700">Jadikan event highlight</label>
            </div>

            <div class="flex justify-end gap-3 border-t pt-4">
              <button
                type="button"
                @click="goBack"
                :disabled="saving"
                class="rounded-lg border border-gray-200 px-5 py-2.5 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="submit"
                :disabled="saving"
                class="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-white transition hover:bg-orange-600 disabled:opacity-50"
              >
                <Save :size="18" />
                {{ saving ? 'Menyimpan...' : 'Simpan Event' }}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>
