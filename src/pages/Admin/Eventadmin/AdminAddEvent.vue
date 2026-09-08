<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import Swal from 'sweetalert2'

import { api } from '@/services/api'
import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'

const router = useRouter()

const loading = ref(false)

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

const submit = async () => {
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

  loading.value = true

  try {
    await api.create('events', form.value)

    await Swal.fire({
      title: 'Berhasil!',
      text: 'Event berhasil ditambahkan.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#f97316',
      timer: 2000,
      timerProgressBar: true,
    })

    router.push('/admin/events')
  } catch (err) {
    console.error(err)

    Swal.fire({
      title: 'Gagal!',
      text: err.response?.data?.message || 'Gagal menambahkan event.',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#f97316',
    })
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
        <div class="flex items-center gap-4 mb-6">
          <button
            @click="router.push('/admin/event')"
            class="p-2 rounded-lg hover:bg-gray-200"
          >
            <ArrowLeft :size="20" />
          </button>

          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              Tambah Event
            </h1>

            <p class="text-sm text-gray-500 mt-1">
              Tambahkan event baru.
            </p>
          </div>
        </div>

        <!-- Form -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <form
            @submit.prevent="submit"
            class="space-y-5"
          >
            <!-- Slug -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Slug <span class="text-red-500">*</span>
              </label>

              <input
                v-model="form.slug"
                type="text"
                placeholder="contoh-event"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              />
            </div>

            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Judul Event <span class="text-red-500">*</span>
              </label>

              <input
                v-model="form.title"
                type="text"
                placeholder="Masukkan judul event"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              />
            </div>

            <!-- Content -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Konten <span class="text-red-500">*</span>
              </label>

              <textarea
                v-model="form.content"
                rows="7"
                placeholder="Masukkan deskripsi event..."
                class="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none resize-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              ></textarea>
            </div>

            <!-- Location -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Lokasi
              </label>

              <input
                v-model="form.location"
                type="text"
                placeholder="Masukkan lokasi event"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              />
            </div>

            <!-- Date -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai <span class="text-red-500">*</span>
                </label>

                <input
                  v-model="form.start_date"
                  type="date"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Selesai <span class="text-red-500">*</span>
                </label>

                <input
                  v-model="form.end_date"
                  type="date"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                />
              </div>
            </div>

            <!-- Image -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>

              <input
                v-model="form.img_cover"
                type="text"
                placeholder="URL gambar cover"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              />

              <p class="text-xs text-gray-400 mt-1">
                Untuk sementara masukkan URL gambar.
              </p>
            </div>

            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>

              <select
                v-model="form.status"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              >
                <option value="draft">Draft</option>
                <option value="publish">Publish</option>
                <option value="archive">Archive</option>
              </select>
            </div>

            <!-- Highlight -->
            <div class="flex items-center gap-3">
              <input
                id="highlight"
                v-model="form.is_highlight"
                type="checkbox"
                class="w-4 h-4"
              />

              <label
                for="highlight"
                class="text-sm text-gray-700"
              >
                Jadikan event highlight
              </label>
            </div>

            <!-- Buttons -->
            <div class="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                @click="router.push('/admin/events')"
                class="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>

              <button
                type="submit"
                :disabled="loading"
                class="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                {{ loading ? 'Menyimpan...' : 'Simpan Event' }}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>