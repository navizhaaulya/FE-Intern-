<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Clock3,
  Vote,
  Percent,
  Check,
} from 'lucide-vue-next'

import { publicApi } from '@/services/publicApi'
import http from '@/services/http'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()

const voting = ref(null)
const loading = ref(true)
const errorMessage = ref('')

const selectedCandidate = ref(null)
const showSuccess = ref(false)

const footer = ref(null)
const majors = ref(null)

const loadVoting = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await publicApi.getVotingDetail(route.params.slug)

    voting.value = response?.data || null

    if (!voting.value) {
      errorMessage.value = 'Voting tidak ditemukan.'
    }

    try {
      const footerResponse = await publicApi.getFooter()
      footer.value = footerResponse?.data || footerResponse
    } catch (error) {
      console.error('Gagal mengambil footer:', error)
    }

    try {
      const majorsResponse = await publicApi.getMajors()
      majors.value = majorsResponse?.data || majorsResponse
    } catch (error) {
      console.error('Gagal mengambil majors:', error)
    }

  } catch (error) {
    console.error(error)

    errorMessage.value =
      error.response?.data?.message ||
      'Gagal mengambil detail voting.'
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return '-'

  const parts = date.split(' ')

  if (parts.length >= 3) {
    return `${parts[0]} ${parts[1]} ${parts[2]}`
  }

  return date
}

const candidates = computed(() => {
  return voting.value?.candidates || []
})

const selectCandidate = (candidate) => {
  selectedCandidate.value = candidate
}

const submitVote = async () => {

  if (!selectedCandidate.value) {
    return
  }


  const token = localStorage.getItem('token')


  if (!token) {

    await Swal.fire({
      title: 'Belum Login',
      text: 'Silakan login terlebih dahulu untuk memberikan suara.',
      icon: 'warning',
      confirmButtonText: 'Login',
      confirmButtonColor: '#FF8A32',
    })

    router.push('/login')
    return
  }


  try {

    await http.post(
      `/votings/${voting.value.id}/vote`,
      {
        candidate_id: selectedCandidate.value.id
      }
    )


    await Swal.fire({
      title: 'Vote Berhasil!',
      text: 'Terima kasih sudah memberikan suara.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#FF8A32',
      timer: 2500,
      timerProgressBar: true,
    })


    await loadVoting()

    selectedCandidate.value = null


  } catch (error) {

    console.error(error)


    Swal.fire({
      title: 'Gagal',
      text:
        error.response?.data?.message ||
        'Vote gagal dilakukan.',
      icon: 'error',
      confirmButtonColor: '#FF8A32'
    })

  }

}

onMounted(() => {
  loadVoting()
})
</script>

<template>
  <Navbar />

  <main class="min-h-screen bg-[#FAFAF9] px-5 py-8 sm:px-8 lg:px-12">

    <div class="mx-auto max-w-[1180px]">

      <!-- Kembali -->
      <button
        type="button"
        class="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-[#FF7A00]"
        @click="router.back()"
      >
        <ArrowLeft :size="18" />
        Kembali
      </button>

      <!-- Loading -->
      <div
        v-if="loading"
        class="flex min-h-[500px] items-center justify-center"
      >
        <p class="text-sm font-medium text-slate-500">
          Memuat detail voting...
        </p>
      </div>

      <!-- Error -->
      <div
        v-else-if="errorMessage"
        class="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600"
      >
        {{ errorMessage }}
      </div>

      <template v-else-if="voting">

        <!-- ========================= -->
        <!-- VOTING HEADER -->
        <!-- ========================= -->

        <section
          class="relative overflow-hidden rounded-[28px] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.07)]"
        >

          <!-- Background decoration -->
          <div
            class="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#FFF0E3]"
          ></div>

          <div
            class="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[#FFF5EC]"
          ></div>

          <div
            class="relative grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_360px] lg:items-center lg:p-12"
          >

            <!-- LEFT CONTENT -->
            <div>

              <span
                class="inline-flex items-center gap-2 rounded-full bg-[#FFF1E5] px-4 py-2 text-xs font-bold text-[#F47B20]"
              >
                <Vote :size="15" />
                Pemilihan
              </span>

              <h1
                class="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl"
              >
                {{ voting.title }}
              </h1>

              <p
                v-if="voting.description"
                class="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base"
              >
                {{ voting.description }}
              </p>

              <!-- DATE -->
              <div class="mt-6 flex flex-wrap gap-3">

                <div
                  class="inline-flex items-center gap-2 rounded-xl bg-[#FFF7F0] px-4 py-3 text-xs font-semibold text-slate-600"
                >
                  <Clock3
                    :size="16"
                    class="text-[#FF8A32]"
                  />

                  <div>
                    <p class="text-[10px] font-medium text-slate-400">
                      Mulai
                    </p>

                    <p class="mt-0.5">
                      {{ formatDate(voting.start_date) }}
                    </p>
                  </div>
                </div>

                <div
                  class="inline-flex items-center gap-2 rounded-xl bg-[#FFF7F0] px-4 py-3 text-xs font-semibold text-slate-600"
                >
                  <Clock3
                    :size="16"
                    class="text-[#FF8A32]"
                  />

                  <div>
                    <p class="text-[10px] font-medium text-slate-400">
                      Berakhir
                    </p>

                    <p class="mt-0.5">
                      {{ formatDate(voting.end_date) }}
                    </p>
                  </div>
                </div>

              </div>

            </div>

            <!-- RIGHT IMAGE -->
            <div
              v-if="voting.img_cover"
              class="relative h-[230px] overflow-hidden rounded-2xl"
            >

              <img
                :src="voting.img_cover"
                :alt="voting.title"
                class="h-full w-full object-cover"
              />

              <div
                class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
              ></div>

            </div>

          </div>
        </section>


        <!-- ========================= -->
        <!-- CANDIDATES -->
        <!-- ========================= -->

        <section class="mt-12">

          <div class="text-center">

            <h2
              class="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl"
            >
              Pilih Kandidatmu
            </h2>

            <p class="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Tentukan pilihanmu dan berikan suara untuk kandidat favoritmu.
            </p>

          </div>


          <!-- Candidate Grid -->
          <div
            v-if="candidates.length"
            class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >

            <article
              v-for="(candidate, index) in candidates"
              :key="candidate.id"
              class="group relative overflow-hidden rounded-[24px] border bg-white shadow-[0_5px_22px_rgba(15,23,42,0.06)] transition duration-300"
              :class="
                selectedCandidate?.id === candidate.id
                  ? 'border-[#FF8A32] ring-2 ring-[#FF8A32]/20'
                  : 'border-slate-100 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,23,42,0.10)]'
              "
            >

              <!-- Number -->
              <div
                class="absolute left-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm backdrop-blur"
              >
                Pilihan #{{ index + 1 }}
              </div>


              <!-- Selected -->
              <div
                v-if="selectedCandidate?.id === candidate.id"
                class="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#FF8A32] text-white shadow-md"
              >
                <Check :size="17" />
              </div>


              <!-- Candidate Image -->
              <div class="relative h-[290px] overflow-hidden bg-[#FFF5EC]">

                <img
                  v-if="candidate.img_cover"
                  :src="candidate.img_cover"
                  :alt="candidate.title"
                  class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />

                <div
                  v-else
                  class="flex h-full items-center justify-center"
                >
                  <Vote
                    :size="64"
                    stroke-width="1.3"
                    class="text-[#FFB477]"
                  />
                </div>

              </div>


              <!-- Candidate Content -->
              <div class="p-5">

                <h3
                  class="text-center text-xl font-extrabold text-slate-900"
                >
                  {{ candidate.title }}
                </h3>

                <p
                  v-if="candidate.description"
                  class="mt-3 line-clamp-3 text-center text-sm leading-5 text-slate-500"
                >
                  {{ candidate.description }}
                </p>


                <!-- Statistics -->
                <div
                  class="mt-5 grid grid-cols-2 gap-3"
                >

                  <div
                    class="rounded-xl bg-[#FFF8F2] px-3 py-3 text-center"
                  >

                    <div
                      class="flex items-center justify-center gap-1.5"
                    >
                      <Vote
                        :size="16"
                        class="text-[#FF8A32]"
                      />

                      <span
                        class="text-lg font-extrabold text-slate-800"
                      >
                        {{ candidate.vote_count ?? 0 }}
                      </span>
                    </div>

                    <p class="mt-0.5 text-[11px] text-slate-400">
                      suara
                    </p>

                  </div>


                  <div
                    class="rounded-xl bg-[#FFF8F2] px-3 py-3 text-center"
                  >

                    <div
                      class="flex items-center justify-center gap-1.5"
                    >
                      <Percent
                        :size="16"
                        class="text-[#FF8A32]"
                      />

                      <span
                        class="text-lg font-extrabold text-slate-800"
                      >
                        {{ candidate.percentage ?? 0 }}%
                      </span>
                    </div>

                    <p class="mt-0.5 text-[11px] text-slate-400">
                      persen
                    </p>

                  </div>

                </div>


                <!-- Select Button -->
                <button
                  type="button"
                  class="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition"
                  :class="
                    selectedCandidate?.id === candidate.id
                      ? 'bg-[#FF8A32] text-white shadow-md shadow-orange-200'
                      : 'bg-[#FFF1E5] text-[#E8751C] hover:bg-[#FF8A32] hover:text-white'
                  "
                  @click="selectCandidate(candidate)"
                >
                  <Check
                    v-if="selectedCandidate?.id === candidate.id"
                    :size="17"
                  />

                  {{
                    selectedCandidate?.id === candidate.id
                      ? 'Terpilih'
                      : 'Pilih Kandidat'
                  }}
                </button>

              </div>

            </article>

          </div>


          <!-- Empty Candidates -->
          <div
            v-else
            class="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center"
          >
            <Vote
              :size="45"
              class="mx-auto text-slate-300"
            />

            <p class="mt-4 text-sm font-medium text-slate-500">
              Belum ada kandidat untuk voting ini.
            </p>
          </div>


          <!-- ========================= -->
          <!-- CONFIRM VOTE -->
          <!-- ========================= -->

          <div
            v-if="selectedCandidate"
            class="sticky bottom-5 z-20 mx-auto mt-8 max-w-2xl rounded-2xl border border-orange-100 bg-white/95 p-4 shadow-[0_10px_35px_rgba(15,23,42,0.15)] backdrop-blur-md"
          >

            <div
              class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >

              <div>

                <p class="text-xs text-slate-400">
                  Pilihanmu
                </p>

                <p class="mt-1 font-bold text-slate-900">
                  {{ selectedCandidate.title }}
                </p>

              </div>

              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF8A32] px-6 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:bg-[#F27A1F]"
                @click="submitVote"
              >
                <Vote :size="17" />
                Konfirmasi Pilihan
              </button>

            </div>

          </div>

        </section>

      </template>

      
      
    </div>

    <div class="h-30 sm:h-36 lg:h-40"></div>
    
  </main>
  <Footer
     v-if="footer"
     :footer="footer"
     :majors="majors"
   />
</template>