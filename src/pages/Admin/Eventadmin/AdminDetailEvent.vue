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

const event = ref(null)
const loading = ref(true)
const error = ref('')

const getEvent = async () => {
  try {
    loading.value = true

    const response = await api.detail(
      'events',
      route.params.id
    )

    console.log('Detail Event:', response)

    event.value = response?.data || response

  } catch (err) {
    console.error(
      'Error mengambil detail event:',
      err
    )

    error.value =
      err.response?.data?.message ||
      'Gagal mengambil detail event.'
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

const formatDateRange = (start, end) => {
  if (!start && !end) return '-'

  if (start && end) {
    return `${formatDate(start)} - ${formatDate(end)}`
  }

  return formatDate(start || end)
}

const goToEdit = () => {
  router.push(
    `/admin/events/${route.params.id}/edit`
  )
}

onMounted(() => {
  getEvent()
})
</script>

<template>
  <div class="min-h-screen bg-[#f8f7f6]">

    <Navbar />

    <div class="flex">

      <AdminSidebar />

      <main
        class="min-w-0 flex-1 px-6 py-8 lg:px-10"
      >

        <!-- BACK -->
        <div
          class="mb-5 rounded-2xl bg-white px-6 py-5 shadow-sm"
        >

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
          Memuat detail event...
        </div>


        <!-- ERROR -->
        <div
          v-else-if="error"
          class="rounded-2xl bg-white py-20 text-center text-red-500"
        >
          {{ error }}
        </div>


        <!-- DETAIL -->
        <div v-else-if="event">

          <!-- DATA -->
          <section
            class="mb-5 rounded-2xl bg-white p-7 shadow-sm"
          >

            <div
              class="mb-5 flex items-center justify-between"
            >

              <h1
                class="text-2xl font-bold text-gray-800"
              >
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


            <div
              class="divide-y divide-gray-100"
            >

              <!-- JUDUL -->
              <div
                class="grid grid-cols-[200px_1fr] py-4 text-sm"
              >

                <span class="text-gray-700">
                  Judul Event
                </span>

                <span class="text-gray-800">
                  : {{ event.title || '-' }}
                </span>

              </div>


              <!-- COVER -->
              <div
                class="grid grid-cols-[200px_1fr] py-4 text-sm"
              >

                <span>
                  Cover Event
                </span>

                <div>

                  <span v-if="!event.img_cover">
                    : -
                  </span>

                  <img
                    v-else
                    :src="event.img_cover"
                    :alt="event.title"
                    class="mt-1 h-24 w-40 rounded-xl object-cover"
                  />

                </div>

              </div>


              <!-- LOKASI -->
              <div
                class="grid grid-cols-[200px_1fr] py-4 text-sm"
              >

                <span>
                  Lokasi
                </span>

                <span>
                  : {{ event.location || '-' }}
                </span>

              </div>


              <!-- TANGGAL -->
              <div
                class="grid grid-cols-[200px_1fr] py-4 text-sm"
              >

                <span>
                  Tanggal Event
                </span>

                <span>
                  :
                  {{
                    formatDateRange(
                      event.start_date,
                      event.end_date
                    )
                  }}
                </span>

              </div>


              <!-- STATUS -->
              <div
                class="grid grid-cols-[200px_1fr] py-4 text-sm"
              >

                <span>
                  Status
                </span>

                <span
                  class="flex items-center gap-2"
                >
                  :

                  <StatusBadge
                    :status="event.status"
                    type="event"
                  />

                </span>

              </div>

            </div>

          </section>


          <!-- EVENT CONTENT -->
          <article
            class="rounded-2xl bg-white p-8 shadow-sm"
          >
            <!-- EVENT DATE -->
            <p
              class="mb-5 text-sm font-medium text-orange-500"
            >
              {{
                formatDateRange(
                  event.start_date,
                  event.end_date
                )
              }}
            </p>


            <!-- TITLE -->
            <h2
              class="mb-6 text-3xl font-bold leading-tight text-gray-900"
            >
              {{ event.title }}
            </h2>


            <!-- LOCATION -->
            <div
              class="mb-8 text-sm text-gray-600"
            >
              📍 {{ event.location || '-' }}
            </div>


            <!-- COVER -->
            <img
              v-if="event.img_cover"
              :src="event.img_cover"
              :alt="event.title"
              class="mb-8 max-h-[450px] w-full rounded-2xl object-cover"
            />


            <!-- CONTENT -->
            <div
              v-if="event.content"
              class="prose max-w-none whitespace-pre-line text-sm leading-7 text-gray-700"
            >
              {{ event.content }}
            </div>

          </article>

        </div>

      </main>

    </div>

  </div>
</template>