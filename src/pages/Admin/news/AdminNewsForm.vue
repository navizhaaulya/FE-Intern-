<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  Save,
  X,
} from 'lucide-vue-next'

import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import RichTextEditor from '@/components/UI/TextEditor.vue'

import { api } from '@/services/api'

const router = useRouter()

const loading = ref(false)
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

const generateSlug = () => {
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
  if (loading.value) return

  try {
    loading.value = true
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

    // SLUG
    generateSlug()

    if (!form.value.slug) {
      error.value = 'Slug berita tidak dapat dibuat.'
      return
    }

    // CONTENT
    if (!hasContent()) {
      error.value = 'Konten berita wajib diisi.'
      return
    }

    // COVER URL
    const cover = form.value.img_cover.trim()

    if (cover) {
      try {
        new URL(cover)
      } catch {
        error.value = 'Link cover harus berupa URL yang valid.'
        return
      }
    }

    // PAYLOAD
    const payload = {
  slug: form.value.slug,
  title: form.value.title.trim(),
  content: form.value.content,
  img_cover: form.value.img_cover.trim() || null,
  status: form.value.status,
  is_highlight: form.value.is_highlight,
  category_id: form.value.category_id || null,
}

    console.log('PAYLOAD NEWS:', payload)

    await api.create('news', payload)

    alert('Berita berhasil ditambahkan.')

    router.push('/admin/news')

  } catch (err) {
    console.error('ERROR CREATE NEWS:', err)
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
          error.value = Array.isArray(errors[field])
            ? errors[field][0]
            : errors[field]

          return
        }
      }
    }

    error.value =
      err.response?.data?.message ||
      err.message ||
      'Gagal menambahkan berita.'

  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}
</script>


<template>

  <div class="min-h-screen bg-[#F7F7F7]">

    <!-- NAVBAR -->

    <Navbar />


    <div class="flex">

      <!-- SIDEBAR -->

      <AdminSidebar />


      <!-- CONTENT -->

      <main
        class="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12"
      >

        <div class="mx-auto max-w-[1180px]">


          <!-- ================================================= -->
          <!-- HEADER -->
          <!-- ================================================= -->

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

                <span>
                  Konten Website
                </span>

                <span class="mx-2">
                  ›
                </span>

                <span>
                  Berita
                </span>

                <span class="mx-2">
                  ›
                </span>

                <span>
                  Tambah Berita
                </span>

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


          <!-- ================================================= -->
          <!-- FORM -->
          <!-- ================================================= -->

          <section
            class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
          >

            <h1
              class="mb-8 text-xl font-extrabold text-slate-900 sm:text-2xl"
            >
              Tambah Berita
            </h1>


            <!-- ================================================= -->
            <!-- ERROR -->
            <!-- ================================================= -->

            <div
              v-if="error"
              class="mb-6 flex items-center justify-between rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500"
            >

              <span>
                {{ error }}
              </span>


              <button
                type="button"
                @click="error = ''"
                class="transition hover:text-red-700"
              >
                <X :size="17" />
              </button>

            </div>


            <!-- ================================================= -->
            <!-- JUDUL -->
            <!-- ================================================= -->

            <div class="mb-6">

              <label
                class="mb-2 block text-sm font-medium text-slate-800"
              >
                Judul
              </label>


              <input
                v-model="form.title"
                @blur="generateSlug"
                type="text"
                placeholder="Masukkan judul berita"
                class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#FF7A00] focus:ring-2 focus:ring-orange-100"
              />


              <p
                v-if="form.title"
                class="mt-2 text-xs text-slate-400"
              >

                Slug:

                <span class="font-medium text-slate-500">
                  {{ form.slug || 'akan dibuat otomatis' }}
                </span>

              </p>

            </div>


            <!-- ================================================= -->
            <!-- TEXT EDITOR -->
            <!-- ================================================= -->

            <div class="mb-6">

              <label
                class="mb-2 block text-sm font-medium text-slate-800"
              >
                Isi Berita
              </label>


              <!-- REUSABLE TEXT EDITOR -->

              <RichTextEditor
                v-model="form.content"
              />

            </div>


            <!-- ================================================= -->
            <!-- COVER LINK -->
            <!-- ================================================= -->

           <div class="mb-7">

  <label class="mb-2 block text-sm font-medium text-slate-800">
    Link Cover
  </label>

  <input
    v-model="form.img_cover"
    type="url"
    placeholder="https://example.com/gambar.png"
    class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#FF7A00] focus:ring-2 focus:ring-orange-100"
  />

  <p class="mt-2 text-xs text-slate-400">
    Masukkan URL gambar cover.
  </p>

  <div
    v-if="form.img_cover"
    class="mt-4 overflow-hidden rounded-xl border border-slate-200"
  >
    <img
      :src="form.img_cover"
      alt="Preview cover"
      class="h-[220px] w-full object-cover"
      @error="$event.target.style.display = 'none'"
      @load="$event.target.style.display = 'block'"
    />
  </div>

</div>


            <!-- ================================================= -->
            <!-- STATUS -->
            <!-- ================================================= -->

            <div class="mb-8">

              <label
                class="mb-3 block text-sm font-medium text-slate-800"
              >
                Status
              </label>


              <div class="flex flex-wrap gap-6">

                <!-- DRAFT -->

                <label
                  class="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
                >

                  <input
                    v-model="form.status"
                    type="radio"
                    value="draft"
                    class="h-4 w-4 accent-[#FF7A00]"
                  />

                  Draft

                </label>


                <!-- PUBLISH -->

                <label
                  class="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
                >

                  <input
                    v-model="form.status"
                    type="radio"
                    value="publish"
                    class="h-4 w-4 accent-[#FF7A00]"
                  />

                  Diterbitkan

                </label>


                <!-- ARCHIVE -->

                <label
                  class="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
                >

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


            <!-- ================================================= -->
            <!-- HIGHLIGHT -->
            <!-- ================================================= -->

            <div class="mb-8">

              <label
                class="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
              >

                <input
                  v-model="form.is_highlight"
                  type="checkbox"
                  class="h-4 w-4 rounded accent-[#FF7A00]"
                />

                Jadikan berita highlight

              </label>

            </div>


            <!-- ================================================= -->
            <!-- SAVE -->
            <!-- ================================================= -->

            <button
              type="button"
              @click="saveNews"
              :disabled="loading"
              class="inline-flex items-center gap-2 rounded-xl bg-[#FF9343] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#FF7A00] disabled:cursor-not-allowed disabled:opacity-50"
            >

              <Save :size="17" />

              <span>
                {{ loading ? 'Menyimpan...' : 'Simpan' }}
              </span>

            </button>

          </section>

        </div>

      </main>

    </div>

  </div>

</template>