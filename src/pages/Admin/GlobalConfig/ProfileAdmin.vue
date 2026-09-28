<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/api'
import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import RichTextEditor from '@/components/UI/TextEditor.vue'
import ImageUpload from '@/components/UI/ImageUpload.vue'
import Swal from 'sweetalert2'

const CONFIG_ID = 2

const loading = ref(true)
const saving = ref(false)
const error = ref(null)

const form = ref({})

// preview KHUSUS gambar lama dari database (ImageUpload.vue gak handle ini sendiri)
const existingPreview = ref({
  img_profile_1: '',
  img_profile_2: '',
})

const getConfig = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await api.detail('global_config', CONFIG_ID)
    const data = response?.data || response

    form.value = { ...data }

    ;['img_profile_1', 'img_profile_2'].forEach((key) => {
      const val = data[key]
      let url = ''
      let rawPath = ''

      if (val && typeof val === 'object') {
        url = val.url?.startsWith('http')
          ? val.url
          : `${import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')}/${val.url}`
        rawPath = val.field_value || val.url || ''
      } else if (typeof val === 'string') {
        url = val
        rawPath = val
      }

      existingPreview.value[key] = url
      // simpan path lama di form, ini yang dikirim balik kalau user gak ganti gambar
      form.value[key] = rawPath
    })
  } catch (err) {
    console.error('Gagal mengambil global config:', err)
    error.value = err.response?.data?.message || err.message || 'Gagal mengambil data config'
  } finally {
    loading.value = false
  }
}

// tiap kali ImageUpload berhasil upload gambar baru, hapus preview lama
// biar yang tampil cuma preview baru dari komponennya
const onImageChanged = (field) => {
  existingPreview.value[field] = ''
}

const buildPayload = () => {
  const {
    id,
    created_by,
    updated_by,
    created_at,
    updated_at,
    rel_created_by,
    rel_updated_by,
    model,
    class_model,
    video_profile,
    ...rest
  } = form.value

  return rest
}

const saveProfile = async () => {
  try {
    saving.value = true

    await api.update('global_config', CONFIG_ID, buildPayload())

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Profil sekolah berhasil diperbarui.',
      timer: 1500,
      showConfirmButton: false,
      timerProgressBar: true,
    })
  } catch (err) {
    console.error('Gagal menyimpan profil sekolah:', err)
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: err.response?.data?.message || 'Gagal menyimpan profil sekolah.',
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
          <h1 class="font-semibold text-gray-800">Kelola Profil Sekolah</h1>
        </div>

        <div v-if="error" class="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {{ error }}
          <button @click="getConfig" class="ml-3 font-semibold underline">Coba lagi</button>
        </div>

        <div v-if="loading" class="rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">
          Memuat data...
        </div>

        <section v-else class="space-y-6">
          <!-- JUDUL -->
          <div class="rounded-2xl bg-white p-6 shadow-sm">
            <label class="mb-1 block text-sm font-medium text-gray-600">Judul Profil</label>
            <input
              v-model="form.profile_title"
              type="text"
              class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <!-- DESKRIPSI -->
          <div class="rounded-2xl bg-white p-6 shadow-sm">
            <label class="mb-2 block text-sm font-medium text-gray-600">Deskripsi Profil</label>
            <RichTextEditor v-model="form.profile_description" />
          </div>

          <!-- GAMBAR -->
          <div class="rounded-2xl bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-lg font-bold text-gray-800">Gambar Profil</h2>

            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div v-for="field in ['img_profile_1', 'img_profile_2']" :key="field">
                <label class="mb-2 block text-sm font-medium text-gray-600">
                  {{ field === 'img_profile_1' ? 'Gambar Profil 1' : 'Gambar Profil 2' }}
                </label>

                <!-- gambar lama dari database, cuma tampil kalau belum ganti gambar baru -->
                <div v-if="existingPreview[field]" class="relative mb-3 w-fit">
                  <img
                    :src="existingPreview[field]"
                    class="h-44 w-72 rounded-xl border border-gray-200 object-cover"
                  />
                  <p class="mt-1 text-xs text-gray-400">
                    Gambar saat ini. Upload baru untuk mengganti.
                  </p>
                </div>

                <ImageUpload v-model="form[field]" @update:modelValue="onImageChanged(field)" />
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <button
              @click="saveProfile"
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
