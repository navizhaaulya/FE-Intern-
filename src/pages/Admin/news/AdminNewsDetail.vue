<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Pencil } from 'lucide-vue-next'

import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import StatusBadge from '@/components/UI/StatusBadge.vue'
import { api } from '@/services/api'

const route = useRoute()
const router = useRouter()

const news = ref(null)
const loading = ref(true)
const error = ref('')

const getNews = async () => {
  try {
    loading.value = true

    const response = await api.detail(
      'news',
      route.params.id
    )

    console.log('Detail News:', response)

    news.value = response?.data || response

  } catch (err) {
    console.error('Error mengambil detail berita:', err)

    error.value =
      err.response?.data?.message ||
      'Gagal mengambil detail berita.'
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return '-'

  return new Date(date).toLocaleDateString(
    'id-ID',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  )
}

const goToEdit = () => {
  router.push(`/admin/news/${route.params.id}/edit`)
}

onMounted(() => {
  getNews()
})
</script>

<template>
  <div class="min-h-screen bg-[#f8f7f6]">

    <Navbar />

    <div class="flex">

      <AdminSidebar />

      <main class="min-w-0 flex-1 px-6 py-8 lg:px-10">

        <!-- BACK -->
        <div class="mb-5 rounded-2xl bg-white px-6 py-5 shadow-sm">

          <button
            @click="router.back()"
            class="flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-orange-500"
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
          Memuat detail berita...
        </div>

        <!-- ERROR -->
        <div
          v-else-if="error"
          class="rounded-2xl bg-white py-20 text-center text-red-500"
        >
          {{ error }}
        </div>

        <!-- DETAIL -->
        <div v-else-if="news">

          <!-- DATA -->
          <section class="mb-5 rounded-2xl bg-white p-7 shadow-sm">

            <div class="mb-5 flex items-center justify-between">

              <h1 class="text-2xl font-bold text-gray-800">
                Detail Data
              </h1>

              <button
                @click="goToEdit"
                class="flex items-center gap-2 rounded-xl bg-orange-400 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500"
              >
                <Pencil :size="15" />
                Edit
              </button>

            </div>

            <div class="divide-y divide-gray-100">

              <!-- JUDUL -->
              <div class="grid grid-cols-[200px_1fr] py-4 text-sm">
                <span class="text-gray-700">
                  Judul
                </span>

                <span class="text-gray-800">
                  : {{ news.title || '-' }}
                </span>
              </div>

              <!-- COVER -->
              <div class="grid grid-cols-[200px_1fr] py-4 text-sm">
                <span>
                  Cover Berita
                </span>

                <div>
                  <span v-if="!news.img_cover">
                    : -
                  </span>

                  <img
                    v-else
                    :src="news.img_cover"
                    :alt="news.title"
                    class="mt-1 h-24 w-40 rounded-xl object-cover"
                  />
                </div>
              </div>

              <!-- PENULIS -->
              <div class="grid grid-cols-[200px_1fr] py-4 text-sm">
                <span>
                  Penulis
                </span>

                <span>
                  :
                  {{
                    news.rel_created_by ||
                    news.created_by ||
                    'Admin'
                  }}
                </span>
              </div>

              <!-- STATUS -->
              <div class="grid grid-cols-[200px_1fr] py-4 text-sm">
                <span>
                  Status
                </span>

                <span class="flex items-center gap-2">
                  :
                  <StatusBadge
                    :status="news.status"
                    type="news"
                  />
                </span>
              </div>

            </div>

          </section>

          <!-- ARTICLE -->
          <article class="rounded-2xl bg-white p-8 shadow-sm">

            <!-- DATE -->
            <p class="mb-5 text-sm text-gray-500">
              {{ formatDate(news.created_at) }}
            </p>

            <!-- TITLE -->
            <h2 class="mb-6 text-3xl font-bold leading-tight text-gray-900">
              {{ news.title }}
            </h2>

            <!-- AUTHOR -->
            <div class="mb-8 flex items-center gap-3">

              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-orange-200 font-semibold text-orange-700"
              >
                A
              </div>

              <span class="font-medium text-gray-800">
                {{
                  news.rel_created_by ||
                  'Admin'
                }}
              </span>

            </div>

            <!-- COVER -->
            <img
              v-if="news.img_cover"
              :src="news.img_cover"
              :alt="news.title"
              class="mb-8 max-h-[450px] w-full rounded-2xl object-cover"
            />

            <!-- CONTENT -->
            <div
              class="prose max-w-none whitespace-pre-line text-sm leading-7 text-gray-700"
            >
              {{ news.content }}
            </div>

          </article>

        </div>

      </main>

    </div>

  </div>
</template>