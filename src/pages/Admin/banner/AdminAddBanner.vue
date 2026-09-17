<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Save } from 'lucide-vue-next'

import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import ImageUpload from '@/components/UI/ImageUpload.vue'
import { api } from '@/services/api'

const router = useRouter()

const form = ref({
  img_cover: '',
  url: '',
  status_code: true,
})

const loading = ref(false)
const error = ref('')

const goBack = () => {
  router.back()
}

const submitForm = async () => {
  try {
    loading.value = true
    error.value = ''

    // Validasi gambar
    if (!form.value.img_cover) {
      error.value = 'Silakan upload gambar banner terlebih dahulu.'
      return
    }

    // Validasi status
    if (
      form.value.status_code !== true &&
      form.value.status_code !== false
    ) {
      error.value = 'Silakan pilih status banner.'
      return
    }

    const payload = {
      img_cover: form.value.img_cover,
      url: form.value.url,
      status_code: form.value.status_code,
    }

    console.log('Payload Add Banner:', payload)

    const response = await api.create('banner', payload)

    console.log('Response Add Banner:', response)

    if (!response?.success) {
      throw new Error(
        response?.message || 'Gagal menambahkan banner.'
      )
    }

    router.push('/admin/banner')

  } catch (err) {
    console.error('Error tambah banner:', err)

    error.value =
      err.response?.data?.message ||
      err.message ||
      'Gagal menambahkan banner.'

  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="flex">
      <AdminSidebar />

      <main class="flex-1 p-6">
        <!-- Header -->
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-gray-800">
              Tambah Banner
            </h1>

            <p class="mt-1 text-sm text-gray-500">
              Tambahkan banner baru
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

        <!-- Error -->
        <div
          v-if="error"
          class="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {{ error }}
        </div>

        <!-- Form -->
        <div class="rounded-xl bg-white p-6 shadow-sm">
          <form @submit.prevent="submitForm">

            <!-- Gambar Banner -->
            <div class="mb-6">
              <label class="mb-2 block text-sm font-medium text-gray-700">
                Gambar Banner
                <span class="text-red-500">*</span>
              </label>

              <ImageUpload
                v-model="form.img_cover"
                label="Gambar Banner"
                accept="image/jpeg,image/png,image/webp"
                :max-size="5"
                required
              />
            </div>

            <!-- URL -->
            <div class="mb-6">
              <label
                for="url"
                class="mb-2 block text-sm font-medium text-gray-700"
              >
                URL
              </label>

              <input
                id="url"
                v-model="form.url"
                type="text"
                placeholder="Masukkan URL banner"
                class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>

            <!-- Status -->
            <div class="mb-6">
              <label class="mb-3 block text-sm font-medium text-gray-700">
                Status
                <span class="text-red-500">*</span>
              </label>

              <div class="flex gap-8">
                <!-- Aktif -->
                <label class="flex cursor-pointer items-center gap-2">
                  <input
                    v-model="form.status_code"
                    type="radio"
                    :value="true"
                    class="h-4 w-4 accent-orange-500"
                  />

                  <span class="text-sm text-gray-700">
                    Aktif
                  </span>
                </label>

                <!-- Nonaktif -->
                <label class="flex cursor-pointer items-center gap-2">
                  <input
                    v-model="form.status_code"
                    type="radio"
                    :value="false"
                    class="h-4 w-4 accent-orange-500"
                  />

                  <span class="text-sm text-gray-700">
                    Nonaktif
                  </span>
                </label>
              </div>
            </div>

            <!-- Button -->
            <div class="flex justify-end gap-3 border-t border-gray-100 pt-5">
              <button
                type="button"
                @click="goBack"
                :disabled="loading"
                class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="submit"
                :disabled="loading"
                class="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save :size="18" />

                {{ loading ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  </div>
</template>