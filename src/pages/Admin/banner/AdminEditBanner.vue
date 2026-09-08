<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Save } from 'lucide-vue-next'

import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import { api } from '@/services/api'

const route = useRoute()
const router = useRouter()

const form = ref({
  img_cover: '',
  url: '',
  status_code: '',
})

const loading = ref(true)
const saving = ref(false)
const error = ref('')

const getBanner = async () => {
  try {
    loading.value = true
    error.value = ''

    const response = await api.detail(
      'banner',
      route.params.id
    )

    console.log('Data Banner:', response)

    const data = response?.data || response

    form.value = {
      img_cover: data?.img_cover || '',
      url: data?.url || '',
      status_code: data?.status_code || '',
    }

  } catch (err) {
    console.error('Error mengambil banner:', err)

    error.value =
      err.response?.data?.message ||
      'Gagal mengambil data banner.'
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  try {
    saving.value = true
    error.value = ''

    const payload = {
      img_cover: form.value.img_cover,
      url: form.value.url,
      status_code: form.value.status_code,
    }

    console.log('Payload Edit Banner:', payload)

    await api.update(
      'banners',
      route.params.id,
      payload
    )

    router.push(
      `/admin/banners/${route.params.id}`
    )

  } catch (err) {
    console.error('Error edit banner:', err)

    error.value =
      err.response?.data?.message ||
      err.message ||
      'Gagal mengubah banner.'
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  getBanner()
})
</script>

<template>
  <div class="min-h-screen bg-[#f8f7f6]">

    <Navbar />

    <div class="flex">

      <AdminSidebar />

      <main class="min-w-0 flex-1 px-6 py-8 lg:px-10">

        <!-- BACK -->
        <div
          class="mb-5 rounded-2xl bg-white px-6 py-5 shadow-sm"
        >
          <button
            @click="goBack"
            class="flex items-center gap-3 text-sm font-medium text-gray-700 transition hover:text-orange-500"
          >
            <ArrowLeft :size="18" />
            Kembali
          </button>
        </div>

        <!-- LOADING -->
        <div
          v-if="loading"
          class="rounded-2xl bg-white py-20 text-center text-gray-500"
        >
          Memuat data banner...
        </div>

        <!-- ERROR -->
        <div
          v-else-if="error && !form.img_cover && !form.url"
          class="rounded-2xl bg-white p-7 shadow-sm"
        >
          <p class="text-red-500">
            {{ error }}
          </p>
        </div>

        <!-- FORM -->
        <section
          v-else
          class="rounded-2xl bg-white p-7 shadow-sm"
        >

          <div class="mb-6">

            <h1 class="text-2xl font-bold text-gray-800">
              Edit Banner
            </h1>

            <p class="mt-1 text-sm text-gray-500">
              Ubah data banner yang ditampilkan pada website.
            </p>

          </div>

          <!-- ERROR -->
          <div
            v-if="error"
            class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
          >
            {{ error }}
          </div>

          <form
            @submit.prevent="submitForm"
            class="space-y-6"
          >

            <!-- IMAGE -->
            <div>

              <label
                class="mb-2 block text-sm font-medium text-gray-700"
              >
                URL Gambar
              </label>

              <input
                v-model="form.img_cover"
                type="url"
                placeholder="https://example.com/banner.jpg"
                class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />

            </div>

            <!-- PREVIEW -->
            <div v-if="form.img_cover">

              <label
                class="mb-2 block text-sm font-medium text-gray-700"
              >
                Preview
              </label>

              <img
                :src="form.img_cover"
                alt="Preview Banner"
                class="h-40 w-full max-w-xl rounded-xl border border-gray-200 object-cover"
                @error="$event.target.style.display = 'none'"
              />

            </div>

            <!-- CTA -->
            <div>

              <label
                class="mb-2 block text-sm font-medium text-gray-700"
              >
                URL CTA
              </label>

              <input
                v-model="form.url"
                type="url"
                placeholder="https://example.com"
                class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />

            </div>

            <!-- STATUS -->
            <div>

              <label
                class="mb-2 block text-sm font-medium text-gray-700"
              >
                Status
              </label>

              <select
                v-model="form.status_code"
                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              >

                <option value="" disabled>
                  Pilih status
                </option>

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>

              </select>

            </div>

            <!-- BUTTON -->
            <div
              class="flex justify-end gap-3 border-t border-gray-100 pt-6"
            >

              <button
                type="button"
                @click="goBack"
                class="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Batal
              </button>

              <button
                type="submit"
                :disabled="saving"
                class="flex items-center gap-2 rounded-xl bg-orange-400 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <Save :size="17" />

                {{
                  saving
                    ? 'Menyimpan...'
                    : 'Simpan Perubahan'
                }}

              </button>

            </div>

          </form>

        </section>

      </main>

    </div>

  </div>
</template>