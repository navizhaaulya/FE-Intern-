<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/api'
import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import Swal from 'sweetalert2'

const CONFIG_ID = 2

const loading = ref(true)
const saving = ref(false)
const error = ref(null)

const form = ref({
  school_name: '',
  footer_description: '',
  motto: '',
  school_telephone: '',
  school_email: '',
  footer_ig: '',
  footer_yt: '',
  footer_fb: '',
  footer_linkedin: '',
  headline_title: '',
})

const getConfig = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await api.detail('global_config', CONFIG_ID)
    const data = response?.data || response

    form.value = {
      school_name: data.school_name || '',
      footer_description: data.footer_description || '',
      motto: data.motto || '',
      school_telephone: data.school_telephone || '',
      school_email: data.school_email || '',
      footer_ig: data.footer_ig || '',
      footer_yt: data.footer_yt || '',
      footer_fb: data.footer_fb || '',
      footer_linkedin: data.footer_linkedin || '',
      headline_title: data.headline_title || '',
    }
  } catch (err) {
    console.error('Gagal mengambil global config:', err)
    error.value = err.response?.data?.message || err.message || 'Gagal mengambil data config'
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  try {
    saving.value = true

    await api.update('global_config', CONFIG_ID, { ...form.value })

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Konfigurasi website berhasil diperbarui.',
      timer: 1500,
      showConfirmButton: false,
      timerProgressBar: true,
    })
  } catch (err) {
    console.error('Gagal menyimpan config:', err)
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: err.response?.data?.message || 'Gagal menyimpan konfigurasi.',
      confirmButtonColor: '#f97316',
    })
  } finally {
    saving.value = false
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
        <div class="mb-4 rounded-2xl bg-white px-6 py-4 shadow-sm">
          <h1 class="font-semibold text-gray-800">Konfigurasi Website</h1>
          <p class="mt-1 text-sm text-gray-500">
            Kelola informasi umum sekolah, kontak, dan tautan media sosial.
          </p>
        </div>

        <div v-if="error" class="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {{ error }}
          <button @click="getConfig" class="ml-3 font-semibold underline">Coba lagi</button>
        </div>

        <div v-if="loading" class="rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">
          Memuat data...
        </div>

        <section v-else class="space-y-6">
          <!-- INFO SEKOLAH -->
          <div class="rounded-2xl bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-lg font-bold text-gray-800">Informasi Sekolah</h2>

            <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-600">Nama Sekolah</label>
                <input
                  v-model="form.school_name"
                  type="text"
                  placeholder="SMK Negeri 7 Semarang"
                  class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-600">Motto</label>
                <input
                  v-model="form.motto"
                  type="text"
                  placeholder="Motto sekolah"
                  class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-600">Telepon Sekolah</label>
                <input
                  v-model="form.school_telephone"
                  type="text"
                  placeholder="(024) 123456"
                  class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-600">Email Sekolah</label>
                <input
                  v-model="form.school_email"
                  type="email"
                  placeholder="info@smkn7smg.sch.id"
                  class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>
          </div>

          <!-- HEADLINE -->
          <div class="rounded-2xl bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-lg font-bold text-gray-800">Headline</h2>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-600">Judul Headline</label>
              <input
                v-model="form.headline_title"
                type="text"
                placeholder="Judul utama yang tampil di beranda"
                class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <!-- FOOTER -->
          <div class="rounded-2xl bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-lg font-bold text-gray-800">Footer</h2>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-600">Deskripsi Footer</label>
              <textarea
                v-model="form.footer_description"
                rows="3"
                placeholder="Deskripsi singkat sekolah untuk footer"
                class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              ></textarea>
            </div>
          </div>

          <!-- MEDIA SOSIAL -->
          <div class="rounded-2xl bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-lg font-bold text-gray-800">Media Sosial</h2>

            <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-600">Instagram</label>
                <input
                  v-model="form.footer_ig"
                  type="text"
                  placeholder="https://instagram.com/..."
                  class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-600">YouTube</label>
                <input
                  v-model="form.footer_yt"
                  type="text"
                  placeholder="https://youtube.com/..."
                  class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-600">Facebook</label>
                <input
                  v-model="form.footer_fb"
                  type="text"
                  placeholder="https://facebook.com/..."
                  class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-600">LinkedIn</label>
                <input
                  v-model="form.footer_linkedin"
                  type="text"
                  placeholder="https://linkedin.com/..."
                  class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <button
              @click="saveConfig"
              :disabled="saving"
              class="rounded-xl bg-orange-400 px-6 py-3 font-semibold text-white transition hover:bg-orange-500 disabled:opacity-50"
            >
              {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
