<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Save } from 'lucide-vue-next'

import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import ImageUpload from '@/components/UI/ImageUpload.vue'
import { api } from '@/services/api'
import http from '@/services/http'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)

const form = ref({
  title: '',
  img_cover: '',
  url: '',
  status_code: true,
})

const loading = ref(isEdit.value) // true kalau edit (nunggu fetch data lama)
const saving = ref(false)
const error = ref('')

// ⬇️ Buat generate URL preview gambar lama (path relatif -> lewat endpoint getFile)
const existingImageUrl = computed(() => {
  if (!form.value.img_cover) return ''
  if (form.value.img_cover.startsWith('http')) return form.value.img_cover
  const base = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8000'
  return `${base}/api/file/banner/img_cover/${route.params.id}/${Date.now()}`
})

const getBanner = async () => {
  try {
    loading.value = true
    const response = await http.get(`/banner/${route.params.id}`)
    const data = response.data?.data

    form.value.title = data.title
    form.value.img_cover =
      typeof data.img_cover === 'object'
        ? data.img_cover?.field_value || data.img_cover?.path || ''
        : data.img_cover || ''
    form.value.url = data.url || ''
    form.value.status_code = data.status_code
  } catch (err) {
    console.error('Gagal mengambil data banner:', err)
    Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Gagal mengambil data banner.' })
  } finally {
    loading.value = false
  }
}

const goBack = () => router.back()

const submitForm = async () => {
  try {
    error.value = ''

    if (!form.value.img_cover) {
      error.value = 'Silakan upload gambar banner terlebih dahulu.'
      return
    }

    saving.value = true

    const payload = {
      title: form.value.title,
      img_cover: form.value.img_cover,
      url: form.value.url,
      status_code: form.value.status_code,
    }

    if (isEdit.value) {
      await api.update('banner', route.params.id, payload)
    } else {
      await api.create('banner', payload)
    }

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: `Banner berhasil ${isEdit.value ? 'diperbarui' : 'ditambahkan'}.`,
      timer: 1500,
      showConfirmButton: false,
      timerProgressBar: true,
    })

    router.push('/admin/banner')
  } catch (err) {
    console.error('Error simpan banner:', err)
    error.value = err.response?.data?.message || err.message || 'Gagal menyimpan banner.'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (isEdit.value) getBanner()
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
              {{ isEdit ? 'Edit Banner' : 'Tambah Banner' }}
            </h1>
            <p class="mt-1 text-sm text-gray-500">
              {{ isEdit ? 'Perbarui data banner' : 'Tambahkan banner baru' }}
            </p>
          </div>

          <button
            type="button"
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
          <form @submit.prevent="submitForm">
            <div class="mb-6">
              <label class="mb-2 block text-sm font-medium text-gray-700">
                Gambar Banner <span class="text-red-500">*</span>
              </label>

              <ImageUpload
                v-model="form.img_cover"
                :initial-preview="existingImageUrl"
                label="Gambar Banner"
                accept="image/jpeg,image/png,image/webp"
                :max-size="5"
              />
            </div>

            <div class="mb-6">
              <label for="url" class="mb-2 block text-sm font-medium text-gray-700">URL</label>
              <input
                id="url"
                v-model="form.url"
                type="text"
                placeholder="Masukkan URL banner"
                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>

            <div class="mb-6">
              <label class="mb-3 block text-sm font-medium text-gray-700">
                Status <span class="text-red-500">*</span>
              </label>

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
