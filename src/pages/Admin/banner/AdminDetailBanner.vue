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

const banner = ref(null)
const loading = ref(true)
const error = ref('')

const getBanner = async () => {
  try {
    loading.value = true
    error.value = ''

    const response = await api.detail(
      'banner',
      route.params.id
    )

    console.log('Detail Banner:', response)

    banner.value = response?.data || response

  } catch (err) {
    console.error('Error mengambil detail banner:', err)

    error.value =
      err.response?.data?.message ||
      'Gagal mengambil detail banner.'
  } finally {
    loading.value = false
  }
}

const goToEdit = () => {
  router.push(
    `/admin/banners/${route.params.id}/edit`
  )
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
            @click="router.back()"
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
          Memuat detail banner...
        </div>

        <!-- ERROR -->
        <div
          v-else-if="error"
          class="rounded-2xl bg-white py-20 text-center text-red-500"
        >
          {{ error }}
        </div>

        <!-- DETAIL -->
        <div v-else-if="banner">

          <!-- DATA -->
          <section
            class="mb-5 rounded-2xl bg-white p-7 shadow-sm"
          >

            <div
              class="mb-5 flex items-center justify-between"
            >

              <h1 class="text-2xl font-bold text-gray-800">
                Detail Data
              </h1>

              <button
                @click="goToEdit"
                class="flex items-center gap-2 rounded-xl bg-orange-400 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-500"
              >
                <Pencil :size="15" />
                Edit
              </button>

            </div>

            <div class="divide-y divide-gray-100">

              <!-- IMAGE -->
              <div
                class="grid grid-cols-[200px_1fr] py-4 text-sm"
              >
                <span class="text-gray-700">
                  Gambar Banner
                </span>

                <div>

                  <span v-if="!banner.img_cover">
                    : -
                  </span>

                  <img
                    v-else
                    :src="banner.img_cover"
                    :alt="banner.title || 'Banner'"
                    class="mt-1 h-32 w-56 rounded-xl object-cover"
                  />

                </div>
              </div>

              <!-- URL -->
              <div
                class="grid grid-cols-[200px_1fr] py-4 text-sm"
              >

                <span class="text-gray-700">
                  URL CTA
                </span>

                <span class="break-all text-gray-800">
                  :
                  <a
                    v-if="banner.url"
                    :href="banner.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="ml-1 text-orange-500 hover:underline"
                  >
                    {{ banner.url }}
                  </a>

                  <span v-else>
                    -
                  </span>
                </span>

              </div>

              <!-- STATUS -->
              <div
                class="grid grid-cols-[200px_1fr] items-center py-4 text-sm"
              >

                <span class="text-gray-700">
                  Status
                </span>

                <span class="flex items-center gap-2">
                  :

                  <StatusBadge
                    :status="banner.status_code"
                  />
                </span>

              </div>

              <!-- CREATED -->
              <div
                class="grid grid-cols-[200px_1fr] py-4 text-sm"
              >

                <span class="text-gray-700">
                  Dibuat
                </span>

                <span class="text-gray-800">
                  :
                  {{ formatDate(banner.created_at) }}
                </span>

              </div>

            </div>

          </section>

          <!-- PREVIEW -->
          <section
            class="rounded-2xl bg-white p-7 shadow-sm"
          >

            <h2
              class="mb-6 text-2xl font-bold text-gray-800"
            >
              Preview Banner
            </h2>

            <div
              class="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
            >

              <img
                v-if="banner.img_cover"
                :src="banner.img_cover"
                :alt="banner.title || 'Banner'"
                class="max-h-[500px] w-full object-cover"
              />

              <div
                v-else
                class="flex h-64 items-center justify-center text-gray-400"
              >
                Tidak ada gambar banner.
              </div>

            </div>

            <div
              v-if="banner.url"
              class="mt-5"
            >
              <p class="mb-2 text-sm font-medium text-gray-700">
                Link CTA
              </p>

              <a
                :href="banner.url"
                target="_blank"
                rel="noopener noreferrer"
                class="break-all text-sm text-orange-500 hover:underline"
              >
                {{ banner.url }}
              </a>
            </div>

          </section>

        </div>

      </main>

    </div>

  </div>
</template>