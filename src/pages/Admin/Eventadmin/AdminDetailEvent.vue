<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Pencil } from 'lucide-vue-next'

import { api } from '@/services/api'
import Navbar from '@/components/Navbar.vue'
import AdminSidebar from '@/components/AdminSidebar.vue'
import StatusBadge from '@/components/StatusBadge.vue'

const route = useRoute()
const router = useRouter()

const event = ref(null)
const loading = ref(false)
const error = ref('')

const getEvent = async () => {
  loading.value = true

  try {
    const response = await api.detail(
      'events',
      route.params.id
    )

    event.value = response?.data || response
  } catch (err) {
    console.error(err)
    error.value = 'Gagal mengambil detail event.'
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return '-'

  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

onMounted(() => {
  getEvent()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="flex">
      <AdminSidebar />

      <main class="flex-1 p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <button
              @click="router.push('/admin/events')"
              class="p-2 rounded-lg hover:bg-gray-200"
            >
              <ArrowLeft :size="20" />
            </button>

            <div>
              <h1 class="text-2xl font-bold text-gray-900">
                Detail Event
              </h1>

              <p class="text-sm text-gray-500 mt-1">
                Informasi lengkap event.
              </p>
            </div>
          </div>

          <button
            v-if="event"
            @click="router.push(`/admin/events/${event.id}/edit`)"
            class="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            <Pencil :size="18" />
            Edit
          </button>
        </div>

        <!-- Loading -->
        <div
          v-if="loading"
          class="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500"
        >
          Memuat detail event...
        </div>

        <!-- Error -->
        <div
          v-else-if="error"
          class="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4"
        >
          {{ error }}
        </div>

        <!-- Detail -->
        <div
          v-else-if="event"
          class="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          <!-- Cover -->
          <img
            v-if="event.img_cover"
            :src="event.img_cover"
            :alt="event.title"
            class="w-full h-72 object-cover"
          />

          <div class="p-6">
            <!-- Title -->
            <div class="flex items-start justify-between gap-5 mb-6">
              <div>
                <p class="text-sm text-gray-400 mb-1">
                  {{ event.slug }}
                </p>

                <h2 class="text-3xl font-bold text-gray-900">
                  {{ event.title }}
                </h2>
              </div>

              <StatusBadge :status="event.status" />
            </div>

            <!-- Info -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-xs text-gray-400 mb-1">
                  Lokasi
                </p>

                <p class="font-medium text-gray-900">
                  {{ event.location || '-' }}
                </p>
              </div>

              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-xs text-gray-400 mb-1">
                  Tanggal Mulai
                </p>

                <p class="font-medium text-gray-900">
                  {{ formatDate(event.start_date) }}
                </p>
              </div>

              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-xs text-gray-400 mb-1">
                  Tanggal Selesai
                </p>

                <p class="font-medium text-gray-900">
                  {{ formatDate(event.end_date) }}
                </p>
              </div>
            </div>

            <!-- Highlight -->
            <div
              v-if="event.is_highlight"
              class="inline-flex px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-sm font-medium mb-6"
            >
              ⭐ Event Highlight
            </div>

            <!-- Content -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                Deskripsi Event
              </h3>

              <div class="text-gray-600 leading-7 whitespace-pre-line">
                {{ event.content }}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>