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

const form = ref({})
const videoLink = ref('') // input terpisah, khusus link video (string biasa)

const getConfig = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await api.detail('global_config', CONFIG_ID)
    const data = response?.data || response

    form.value = { ...data }

    // video_profile dari BE datang sebagai object { url, field_value, ... }
    // ambil field_value-nya buat ditampilkan sebagai link biasa
    const vp = data.video_profile
    if (vp && typeof vp === 'object') {
      videoLink.value = vp.field_value || ''
    } else if (typeof vp === 'string') {
      videoLink.value = vp
    }
  } catch (err) {
    console.error('Gagal mengambil global config:', err)
    error.value = err.response?.data?.message || err.message || 'Gagal mengambil data config'
  } finally {
    loading.value = false
  }
}

// buang field yang gak boleh/gak perlu dikirim manual,
// termasuk field gambar profil yang gak disentuh di halaman ini
const buildPayload = () => {
  const {
    id,
    created_by,
    updated_by,
    created_at,
    updated_at,
    img_profile_1,
    img_profile_2,
    rel_created_by,
    rel_updated_by,
    model,
    class_model,
    video_profile, // buang object lama, kita ganti manual di bawah
    ...rest
  } = form.value

  return {
    ...rest,
    video_profile: videoLink.value.trim(), // kirim string link, bukan object
  }
}

const saveVideo = async () => {
  try {
    saving.value = true

    await api.update('global_config', CONFIG_ID, buildPayload())

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Video profil berhasil diperbarui.',
      timer: 1500,
      showConfirmButton: false,
      timerProgressBar: true,
    })
  } catch (err) {
    console.error('Gagal menyimpan video profile:', err)
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: err.response?.data?.message || 'Gagal menyimpan video profil.',
      confirmButtonColor: '#f97316',
    })
  } finally {
    saving.value = false
  }
}

// deteksi link YouTube biasa -> ubah ke format embed biar bisa di-preview
const embedUrl = (link) => {
  if (!link) return ''

  const ytMatch = link.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  )
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`
  }

  return '' // bukan youtube -> bukan pakai iframe, coba tag <video> langsung
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
          <h1 class="font-semibold text-gray-800">Kelola Video Profile</h1>
        </div>

        <div v-if="error" class="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {{ error }}
          <button @click="getConfig" class="ml-3 font-semibold underline">Coba lagi</button>
        </div>

        <div v-if="loading" class="rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">
          Memuat data...
        </div>

        <section v-else class="rounded-2xl bg-white p-6 shadow-sm">
          <div class="mb-6">
            <label class="mb-1 block text-sm font-medium text-gray-600">Link Video</label>
            <input
              v-model="videoLink"
              type="text"
              placeholder="https://youtu.be/xxxxxxxxxxx"
              class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
            <p class="mt-1 text-xs text-gray-400">
              Tempel link YouTube (atau link video langsung) di sini.
            </p>
          </div>

          <!-- PREVIEW -->
          <div class="mb-6">
            <label class="mb-2 block text-sm font-medium text-gray-600">Preview</label>

            <div class="aspect-video w-full max-w-xl overflow-hidden rounded-xl bg-gray-100">
              <iframe
                v-if="embedUrl(videoLink)"
                :src="embedUrl(videoLink)"
                class="h-full w-full"
                frameborder="0"
                allowfullscreen
              />
              <video
                v-else-if="videoLink"
                :src="videoLink"
                controls
                class="h-full w-full object-cover"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center text-sm text-gray-400"
              >
                Belum ada video
              </div>
            </div>
          </div>

          <button
            @click="saveVideo"
            :disabled="saving"
            class="rounded-xl bg-orange-400 px-6 py-3 font-semibold text-white transition hover:bg-orange-500 disabled:opacity-50"
          >
            {{ saving ? 'Menyimpan...' : 'Perbarui' }}
          </button>
        </section>
      </main>
    </div>
  </div>
</template>
