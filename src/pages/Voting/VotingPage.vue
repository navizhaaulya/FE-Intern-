<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  CalendarDays,
  Vote,
  ChevronRight,
} from 'lucide-vue-next'

import { publicApi } from '@/services/publicApi'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'

const router = useRouter()

const votings = ref([])
const footer = ref(null)
const majors = ref([])

const loading = ref(true)
const errorMessage = ref('')

const loadVotings = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await publicApi.getVoting()

    votings.value = Array.isArray(response)
      ? response
      : response?.data || []
  } catch (error) {
    console.error(error)

    errorMessage.value =
      error.response?.data?.message ||
      'Gagal mengambil data voting.'
  } finally {
    loading.value = false
  }
}

const loadFooter = async () => {
  try {
    footer.value = await publicApi.getFooter()
  } catch (error) {
    console.error('Gagal mengambil footer:', error)
  }
}

const loadMajors = async () => {
  try {
    majors.value = await publicApi.getMajors()
  } catch (error) {
    console.error('Gagal mengambil majors:', error)
  }
}

const highlightedVoting = computed(() => {
  return (
    votings.value.find((item) => item.is_highlight === true) ||
    votings.value[0]
  )
})

const otherVotings = computed(() => {
  if (!highlightedVoting.value) {
    return votings.value
  }

  return votings.value.filter(
    (item) => item.id !== highlightedVoting.value.id
  )
})

const openVoting = (voting) => {
  if (!voting?.slug) return

  router.push(`/voting/${voting.slug}`)
} 
const formatDate = (date) => {
  if (!date) return '-'

  const parts = date.split(' ')

  if (parts.length >= 3) {
    return `${parts[0]} ${parts[1]} ${parts[2]}`
  }

  return date
}

onMounted(() => {
  loadVotings()
  loadFooter()
  loadMajors()
})
</script>

<template>
  <div class="min-h-screen bg-[#FDF8F2]">

    <!-- ========================= -->
    <!-- NAVBAR -->
    <!-- ========================= -->

    <Navbar />

    <!-- ========================= -->
    <!-- MAIN CONTENT -->
    <!-- ========================= -->

    <main class="px-5 py-8 sm:px-8 lg:px-12">

      <div class="mx-auto max-w-[1080px]">

        <!-- Kembali -->
        <button
          type="button"
          class="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-[#FF9343]"
          @click="router.back()"
        >
          <ArrowLeft :size="18" />
          Kembali
        </button>

        <!-- Page Title -->
        <div class="mb-10 text-center">

          <h1
            class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
          >
            Voting
          </h1>

          <p
            class="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500"
          >
            Ikuti berbagai pemilihan yang sedang berlangsung dan
            berikan suara untuk pilihan favoritmu.
          </p>

        </div>

        <!-- Loading -->
        <div
          v-if="loading"
          class="flex min-h-[400px] items-center justify-center"
        >
          <div class="text-sm font-medium text-slate-500">
            Memuat data voting...
          </div>
        </div>

        <!-- Error -->
        <div
          v-else-if="errorMessage"
          class="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600"
        >
          {{ errorMessage }}
        </div>

        <!-- Content -->
        <template v-else>

          <!-- ========================= -->
          <!-- HIGHLIGHT VOTING -->
          <!-- ========================= -->

          <section v-if="highlightedVoting">

            <div class="mb-5">

              <h2 class="text-xl font-bold text-slate-900">
                Voting Pilihan
              </h2>

              <p class="mt-1 text-sm text-slate-500">
                Voting yang sedang menjadi pilihan utama.
              </p>

            </div>

            <!-- Highlight Banner -->
            <!-- NETRAL: foto + overlay gelap -->
            <div
              class="group relative min-h-[360px] overflow-hidden rounded-[28px] bg-slate-900 shadow-[0_12px_35px_rgba(15,23,42,0.12)]"
            >

              <!-- Background Image -->
              <img
                v-if="highlightedVoting.img_cover"
                :src="highlightedVoting.img_cover"
                :alt="highlightedVoting.title"
                class="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />

              <!-- Fallback -->
              <div
                v-else
                class="absolute inset-0 bg-slate-800"
              ></div>

              <!-- Overlay -->
              <div
                class="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/30"
              ></div>

              <!-- Content -->
              <div
                class="relative z-10 flex min-h-[360px] max-w-[700px] flex-col justify-center px-7 py-10 sm:px-10 lg:px-12"
              >

                <!-- Label -->
                <span
                  class="w-fit rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md"
                >
                  Voting Highlight
                </span>

                <!-- Title -->
                <h2
                  class="mt-5 text-3xl font-extrabold leading-tight text-white sm:text-4xl"
                >
                  {{ highlightedVoting.title }}
                </h2>

                <!-- Description -->
                <p
                  v-if="highlightedVoting.description"
                  class="mt-3 max-w-[600px] text-sm leading-6 text-white/80 sm:text-base"
                >
                  {{ highlightedVoting.description }}
                </p>

                <!-- Date -->
                <div class="mt-6 flex flex-wrap gap-3">

                  <div
                    v-if="highlightedVoting.start_date"
                    class="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-xs font-medium text-white backdrop-blur-md"
                  >
                    <CalendarDays :size="15" />

                    Mulai
                    {{ formatDate(highlightedVoting.start_date) }}
                  </div>

                  <div
                    v-if="highlightedVoting.end_date"
                    class="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-xs font-medium text-white backdrop-blur-md"
                  >
                    <CalendarDays :size="15" />

                    Berakhir
                    {{ formatDate(highlightedVoting.end_date) }}
                  </div>

                </div>

                <!-- Button -->
                <button
                  type="button"
                  class="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#E87925] shadow-md transition hover:-translate-y-0.5 hover:bg-[#FFF7F0] hover:shadow-lg"
                  @click="openVoting(highlightedVoting)"
                >
                  Lihat Voting
                  <ChevronRight :size="18" />
                </button>

              </div>

            </div>

          </section>

          <!-- ========================= -->
          <!-- DAFTAR VOTING -->
          <!-- ========================= -->

          <section class="mt-14">

            <div class="mb-6">

              <h2 class="text-xl font-bold text-slate-900">
                Daftar Voting
              </h2>

              <p class="mt-1 text-sm text-slate-500">
                Pilih voting yang ingin kamu lihat.
              </p>

            </div>

            <!-- Voting Cards -->
            <div
              v-if="otherVotings.length"
              class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >

              <article
                v-for="voting in otherVotings"
                :key="voting.id"
                class="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[#FFB77D] hover:shadow-[0_12px_30px_rgba(255,148,67,0.12)]"
              >

                <!-- Image -->
                <div
                  class="relative h-48 overflow-hidden bg-[#FFF1E5]"
                >

                  <img
                    v-if="voting.img_cover"
                    :src="voting.img_cover"
                    :alt="voting.title"
                    class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div
                    v-else
                    class="flex h-full items-center justify-center bg-[#FFF1E5]"
                  >
                    <Vote
                      :size="48"
                      stroke-width="1.5"
                      class="text-[#FFB16F]"
                    />
                  </div>

                  <!-- Image Overlay -->
                  <div
                    class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
                  ></div>

                </div>

                <!-- Content -->
                <div class="p-5">

                  <!-- Orange Accent -->
                  <p
                    class="text-[11px] font-semibold uppercase tracking-wider text-[#FF9343]"
                  >
                    Pemilihan
                  </p>

                  <h3
                    class="mt-2 line-clamp-2 text-lg font-bold leading-6 text-slate-900"
                  >
                    {{ voting.title }}
                  </h3>

                  <p
                    v-if="voting.description"
                    class="mt-2 line-clamp-2 text-sm leading-5 text-slate-500"
                  >
                    {{ voting.description }}
                  </p>

                  <!-- Date -->
                  <div
                    class="mt-4 flex items-center gap-2 text-xs text-slate-500"
                  >
                    <CalendarDays
                      :size="14"
                      class="text-[#FF9343]"
                    />

                    <span>
                      {{ formatDate(voting.start_date) }}
                      -
                      {{ formatDate(voting.end_date) }}
                    </span>
                  </div>

                  <!-- Detail -->
                  <button
                    type="button"
                    class="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFF1E5] py-2.5 text-sm font-semibold text-[#E87925] transition hover:bg-[#FF9845] hover:text-white"
                    @click="openVoting(voting)"
                  >
                    Lihat Detail
                    <ChevronRight :size="17" />
                  </button>

                </div>

              </article>

            </div>

            <!-- Empty -->
            <div
              v-else
              class="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center"
            >

              <Vote
                :size="42"
                class="mx-auto text-[#FFB16F]"
              />

              <p
                class="mt-4 text-sm font-medium text-slate-500"
              >
                Belum ada voting lainnya.
              </p>

            </div>

          </section>

        </template>

      </div>

    </main>

    <Footer
      v-if="footer"
      :footer="footer"
      :majors="majors"
    />

  </div>
</template>