<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { ArrowLeft, Save, X } from 'lucide-vue-next'

import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import RichTextEditor from '@/components/UI/TextEditor.vue'
import ImageUpload from '@/components/UI/ImageUpload.vue'
import http from '@/services/http'

import { api } from '@/services/api'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)

const loading = ref(isEdit.value)
const saving = ref(false)
const error = ref('')

const user = JSON.parse(localStorage.getItem('user') || 'null')

const form = ref({
  slug: '',
  title: '',
  content: '',
  img_cover: '',
  status: 'draft',
  is_highlight: false,
  category_id: null,
})

const categories = ref([])

const getCategories = async () => {
  try {
    const response = await api.list('news_categories')
    categories.value = (response?.data || []).filter((c) => c.active)
  } catch (err) {
    console.error('Gagal mengambil kategori berita:', err)
  }
}

// ⬇️ Preview gambar lama pas mode Edit (path relatif -> lewat endpoint getFile)
const existingImageUrl = computed(() => {
  const val = form.value.img_cover
  if (!val || typeof val !== 'string') return ''
  if (val.startsWith('http')) return val
  const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
  return `${baseUrl}/api/file/news/img_cover/${route.params.id}/${Date.now()}`
})

const getNews = async () => {
  try {
    loading.value = true
    const response = await http.get(`/news/${route.params.id}`)
    const data = response.data?.data

    form.value.slug = data.slug
    form.value.title = data.title
    form.value.content = data.content
    form.value.img_cover =
      typeof data.img_cover === 'object'
        ? data.img_cover?.field_value || data.img_cover?.path || ''
        : data.img_cover || ''
    form.value.status = data.status
    form.value.is_highlight = data.is_highlight
    form.value.category_id = data.category_id
  } catch (err) {
    console.error('Gagal mengambil data berita:', err)
    error.value = 'Gagal mengambil data berita.'
  } finally {
    loading.value = false
  }
}

const generateSlug = () => {
  // Jangan regenerate slug otomatis pas mode edit (biar slug lama gak berubah gara-gara blur input judul)
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

const hasContent = () => {
  if (!form.value.content) return false

  const plainText = form.value.content
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()

  return plainText.length > 0
}

const saveNews = async () => {
  if (saving.value) return

  try {
    saving.value = true
    error.value = ''

    // USER
    if (!user?.id) {
      error.value = 'Data user tidak ditemukan. Silakan login kembali.'
      return
    }

    // TITLE
    if (!form.value.title.trim()) {
      error.value = 'Judul berita wajib diisi.'
      return
    }

    // SLUG (cuma di-generate ulang pas Add)
    if (!isEdit.value) {
      generateSlug()
    }

    if (!form.value.slug) {
      error.value = 'Slug berita tidak dapat dibuat.'
      return
    }

    // CONTENT
    if (!hasContent()) {
      error.value = 'Konten berita wajib diisi.'
      return
    }

    const payload = {
      slug: form.value.slug,
      title: form.value.title.trim(),
      content: form.value.content,
      img_cover: form.value.img_cover || null,
      status: form.value.status,
      is_highlight: form.value.is_highlight,
      category_id: form.value.category_id || null,
    }

    console.log('PAYLOAD NEWS:', payload)

    if (isEdit.value) {
      await api.update('news', route.params.id, payload)
    } else {
      await api.create('news', payload)
    }

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: `Berita berhasil ${isEdit.value ? 'diperbarui' : 'ditambahkan'}.`,
      timer: 1500,
      showConfirmButton: false,
      timerProgressBar: true,
    })

    router.push('/admin/news')
  } catch (err) {
    console.error('ERROR SAVE NEWS:', err)
    console.error('RESPONSE:', err.response?.data)

    const errors = err.response?.data?.errors

    if (errors) {
      const fields = [
        'slug',
        'title',
        'content',
        'img_cover',
        'status',
        'is_highlight',
        'created_by',
        'updated_by',
        'category_id',
      ]

      for (const field of fields) {
        if (errors[field]) {
          error.value = Array.isArray(errors[field]) ? errors[field][0] : errors[field]

          return
        }
      }
    }

    error.value = err.response?.data?.message || err.message || 'Gagal menyimpan berita.'
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  getCategories()
  if (isEdit.value) getNews()
})
</script>
<template>
  <div class="min-h-screen bg-[#F7F7F7]">
    <Navbar />

    <div class="flex">
      <AdminSidebar />

      <main class="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12">
        <div class="mx-auto max-w-[1180px]">
          <!-- HEADER -->

          <div
            class="mb-4 flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-6 py-5 shadow-sm"
          >
            <div class="flex items-center gap-3">
              <button
                type="button"
                @click="goBack"
                class="text-slate-500 transition hover:text-[#FF7A00]"
              >
                <ArrowLeft :size="20" />
              </button>

              <div class="text-sm text-slate-500">
                <span>Konten Website</span>
                <span class="mx-2">›</span>
                <span>Berita</span>
                <span class="mx-2">›</span>
                <span>{{ isEdit ? 'Edit Berita' : 'Tambah Berita' }}</span>
              </div>
            </div>

            <button
              type="button"
              @click="goBack"
              class="text-sm font-medium text-slate-700 transition hover:text-[#FF7A00]"
            >
              Kembali
            </button>
          </div>

          <div
            v-if="loading"
            class="rounded-2xl border border-slate-100 bg-white p-10 text-center text-slate-500 shadow-sm"
          >
            Memuat data...
          </div>

          <!-- FORM -->

          <section v-else class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <h1 class="mb-8 text-xl font-extrabold text-slate-900 sm:text-2xl">
              {{ isEdit ? 'Edit Berita' : 'Tambah Berita' }}
            </h1>

            <!-- ERROR -->

            <div
              v-if="error"
              class="mb-6 flex items-center justify-between rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500"
            >
              <span>{{ error }}</span>
              <button type="button" @click="error = ''" class="transition hover:text-red-700">
                <X :size="17" />
              </button>
            </div>

            <!-- JUDUL -->

            <div class="mb-6">
              <label class="mb-2 block text-sm font-medium text-slate-800"> Judul </label>

              <input
                v-model="form.title"
                @blur="generateSlug"
                type="text"
                placeholder="Masukkan judul berita"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#FF7A00] focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <!-- TEXT EDITOR -->

            <div class="mb-6">
              <label class="mb-2 block text-sm font-medium text-slate-800"> Isi Berita </label>

              <RichTextEditor v-model="form.content" />
            </div>

            <div class="mb-6">
              <label class="mb-2 block text-sm font-medium text-slate-800"> Kategori </label>

              <select
                v-model="form.category_id"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#FF7A00] focus:ring-2 focus:ring-orange-100"
              >
                <option :value="null">Pilih kategori (opsional)</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <!-- COVER (UPLOAD FILE, bukan link) -->

            <div class="mb-7">
              <label class="mb-2 block text-sm font-medium text-slate-800"> Gambar Cover </label>

              <ImageUpload
                v-model="form.img_cover"
                :initial-preview="existingImageUrl"
                accept="image/jpeg,image/png,image/webp"
                :max-size="5"
              />
            </div>

            <!-- STATUS -->

            <div class="mb-8">
              <label class="mb-3 block text-sm font-medium text-slate-800"> Status </label>

              <div class="flex flex-wrap gap-6">
                <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    v-model="form.status"
                    type="radio"
                    value="draft"
                    class="h-4 w-4 accent-[#FF7A00]"
                  />
                  Draft
                </label>

                <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    v-model="form.status"
                    type="radio"
                    value="publish"
                    class="h-4 w-4 accent-[#FF7A00]"
                  />
                  Diterbitkan
                </label>

                <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    v-model="form.status"
                    type="radio"
                    value="archive"
                    class="h-4 w-4 accent-[#FF7A00]"
                  />
                  Diarsipkan
                </label>
              </div>
            </div>

            <!-- HIGHLIGHT -->

            <div class="mb-8">
              <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  v-model="form.is_highlight"
                  type="checkbox"
                  class="h-4 w-4 rounded accent-[#FF7A00]"
                />
                Jadikan berita highlight
              </label>
            </div>

            <!-- SAVE -->

            <button
              type="button"
              @click="saveNews"
              :disabled="saving"
              class="inline-flex items-center gap-2 rounded-xl bg-[#FF9343] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#FF7A00] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save :size="17" />
              <span>{{ saving ? 'Menyimpan...' : 'Simpan' }}</span>
            </button>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>
