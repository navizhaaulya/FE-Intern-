<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Save } from 'lucide-vue-next'

import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import { api } from '@/services/api'

const router = useRouter()

const form = ref({
  img_cover: '',
  url: '',
  status_code: '',
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

    const payload = {
      img_cover: form.value.img_cover,
      url: form.value.url,
      status_code: form.value.status_code,
    }

    console.log('Payload Add Banner:', payload)

    await api.create('banner', payload)

    router.push('/admin/banners')
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

        <!-- FORM -->
        <section
          class="rounded-2xl bg-white p-7 shadow-sm"
        >

          <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-800">
              Tambah Banner
            </h1>

            <p class="mt-1 text-sm text-gray-500">
              Tambahkan banner baru yang akan ditampilkan pada website.
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

            <!-- IMAGE URL -->
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

              <p class="mt-2 text-xs text-gray-400">
                Masukkan URL gambar banner.
              </p>
            </div>

            <!-- IMAGE PREVIEW -->
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

            <!-- URL CTA -->
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

              <p class="mt-2 text-xs text-gray-400">
                URL tujuan ketika banner diklik.
              </p>
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
                :disabled="loading"
                class="flex items-center gap-2 rounded-xl bg-orange-400 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save :size="17" />

                {{ loading ? 'Menyimpan...' : 'Simpan Banner' }}
              </button>

            </div>

          </form>

        </section>

      </main>

    </div>

  </div>
</template>