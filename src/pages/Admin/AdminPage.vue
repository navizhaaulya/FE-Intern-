<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import {
  Users,
  Vote,
  Newspaper,
  MessageSquare,
  Plus,
  CalendarDays,
  ChevronRight,
} from 'lucide-vue-next'

import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import { publicApi } from '@/services/publicApi'

const router = useRouter()

/*
|--------------------------------------------------------------------------
| DATA WEBSITE
|--------------------------------------------------------------------------
*/

const footer = ref(null)
const majors = ref([])

const votings = ref([])
const news = ref([])
const feedbacks = ref([])

const loading = ref(true)

const loadDashboard = async () => {
  loading.value = true

  try {
    /*
     * Ambil data yang memang sudah tersedia
     */

    const [
      footerResponse,
      majorsResponse,
      votingResponse,
      newsResponse,
      feedbackResponse,
    ] = await Promise.all([
      publicApi.getFooter(),
      publicApi.getMajors(),
      publicApi.getVoting(),
      publicApi.getNews(),
      publicApi.getFeedbacks(),
    ])

    footer.value =
      Array.isArray(footerResponse)
        ? footerResponse
        : footerResponse?.data || footerResponse

    majors.value =
      Array.isArray(majorsResponse)
        ? majorsResponse
        : majorsResponse?.data || []

    votings.value =
      Array.isArray(votingResponse)
        ? votingResponse
        : votingResponse?.data || []

    news.value =
      Array.isArray(newsResponse)
        ? newsResponse
        : newsResponse?.data || []

    feedbacks.value =
      Array.isArray(feedbackResponse)
        ? feedbackResponse
        : feedbackResponse?.data || []

  } catch (error) {
    console.error('Gagal mengambil data dashboard:', error)
  } finally {
    loading.value = false
  }
}


/*
|--------------------------------------------------------------------------
| STATISTIK
|--------------------------------------------------------------------------
*/

const totalVoting = computed(() => votings.value.length)

const totalNews = computed(() => news.value.length)

const totalFeedback = computed(() => feedbacks.value.length)

const totalSaran = computed(() => {
  return feedbacks.value.filter(
    item =>
      item.type === true ||
      item.type === 1 ||
      item.type === '1'
  ).length
})

const totalKritik = computed(() => {
  return feedbacks.value.filter(
    item =>
      item.type === false ||
      item.type === 0 ||
      item.type === '0'
  ).length
})


/*
|--------------------------------------------------------------------------
| QUICK ACCESS
|--------------------------------------------------------------------------
*/

const goTo = (path) => {
  router.push(path)
}


/*
|--------------------------------------------------------------------------
| INIT
|--------------------------------------------------------------------------
*/

onMounted(() => {
  loadDashboard()
})
</script>


<template>

  <!-- NAVBAR WEBSITE -->
  <Navbar />


  <!-- ADMIN LAYOUT -->
  <div class="flex min-h-screen bg-[#F7F7F7]">


    <!-- SIDEBAR -->
    <AdminSidebar />


    <!-- CONTENT -->
    <main
      class="
        flex-1
        px-5
        py-8
        sm:px-8
        lg:px-12
      "
    >

      <div class="mx-auto max-w-[1180px]">


        <!-- HEADER -->
        <div class="mb-7">

          <p class="text-sm font-semibold text-[#FF7A00]">
            Admin Panel
          </p>

          <h1
            class="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl"
          >
            Selamat datang, Admin!
          </h1>

          <p class="mt-1 text-sm text-slate-500">
            Kelola dan pantau aktivitas website SMKN 7 Semarang.
          </p>

        </div>




      <!-- ================================================= -->
      <!-- STATISTIK -->
      <!-- ================================================= -->

      <div
        v-if="loading"
        class="flex min-h-[300px] items-center justify-center"
      >

        <p class="text-sm text-slate-500">
          Memuat dashboard...
        </p>

      </div>


      <template v-else>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <!-- TOTAL PENGGUNA -->

          <div
            class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >

            <div class="flex items-center justify-between">

              <div>

                <p class="text-xs text-slate-500">
                  Total Pengguna
                </p>

                <p class="mt-2 text-2xl font-bold text-slate-900">
                  -
                </p>

              </div>

              <div
                class="rounded-xl bg-orange-50 p-3 text-[#FF7A00]"
              >
                <Users :size="21" />
              </div>

            </div>

          </div>


          <!-- VOTING -->

          <div
            class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >

            <div class="flex items-center justify-between">

              <div>

                <p class="text-xs text-slate-500">
                  Voting Aktif
                </p>

                <p class="mt-2 text-2xl font-bold text-slate-900">
                  {{ totalVoting }}
                </p>

              </div>

              <div
                class="rounded-xl bg-orange-50 p-3 text-[#FF7A00]"
              >
                <Vote :size="21" />
              </div>

            </div>

          </div>


          <!-- BERITA -->

          <div
            class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >

            <div class="flex items-center justify-between">

              <div>

                <p class="text-xs text-slate-500">
                  Berita Terunggah
                </p>

                <p class="mt-2 text-2xl font-bold text-slate-900">
                  {{ totalNews }}
                </p>

              </div>

              <div
                class="rounded-xl bg-orange-50 p-3 text-[#FF7A00]"
              >
                <Newspaper :size="21" />
              </div>

            </div>

          </div>


          <!-- SARAN -->

          <div
            class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >

            <div class="flex items-center justify-between">

              <div>

                <p class="text-xs text-slate-500">
                  Total Saran
                </p>

                <p class="mt-2 text-2xl font-bold text-slate-900">
                  {{ totalSaran }}
                </p>

              </div>

              <div
                class="rounded-xl bg-orange-50 p-3 text-[#FF7A00]"
              >
                <MessageSquare :size="21" />
              </div>

            </div>

          </div>


          <!-- KRITIK -->

          <div
            class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >

            <div class="flex items-center justify-between">

              <div>

                <p class="text-xs text-slate-500">
                  Total Kritik
                </p>

                <p class="mt-2 text-2xl font-bold text-slate-900">
                  {{ totalKritik }}
                </p>

              </div>

              <div
                class="rounded-xl bg-orange-50 p-3 text-[#FF7A00]"
              >
                <MessageSquare :size="21" />
              </div>

            </div>

          </div>

        </div>


        <!-- ================================================= -->
        <!-- QUICK ACCESS -->
        <!-- ================================================= -->

        <section
          class="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        >

          <div
            class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
          >

            <div>

              <h2 class="text-sm font-bold text-slate-900">
                QUICK ACCESS
              </h2>

              <p class="mt-1 text-sm text-slate-500">
                Akses cepat ke fitur utama
              </p>

            </div>


            <div class="flex flex-wrap gap-2">

              <button
                type="button"
                @click="goTo('/admin/news')"
                class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#FF7A00] hover:text-[#FF7A00]"
              >
                <Plus :size="15" />
                Tambah Berita
              </button>


              <button
                type="button"
                @click="goTo('/admin/events')"
                class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#FF7A00] hover:text-[#FF7A00]"
              >
                <CalendarDays :size="15" />
                Tambah Event
              </button>


              <button
                type="button"
                @click="goTo('/admin/voting')"
                class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#FF7A00] hover:text-[#FF7A00]"
              >
                <Vote :size="15" />
                Tambah Vote
              </button>


              <button
                type="button"
                @click="goTo('/admin/feedback')"
                class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#FF7A00] hover:text-[#FF7A00]"
              >
                <MessageSquare :size="15" />
                Kritik & Saran
              </button>

            </div>

          </div>

        </section>


        <!-- ================================================= -->
        <!-- STATISTIK KRITIK & SARAN -->
        <!-- ================================================= -->

        <section class="mt-6 grid gap-6 lg:grid-cols-2">


          <!-- KRITIK -->

          <div
            class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
          >

            <h2 class="font-bold text-slate-900">
              Statistik Kritik
            </h2>

            <div class="mt-6">

              <div class="flex h-52 items-end justify-around gap-5">

                <div
                  class="flex h-full flex-1 flex-col justify-end"
                >

                  <div
                    class="h-[35%] rounded-t-xl bg-[#FF9343]"
                  ></div>

                  <p class="mt-2 text-center text-xs text-slate-500">
                    Akademik
                  </p>

                </div>


                <div
                  class="flex h-full flex-1 flex-col justify-end"
                >

                  <div
                    class="h-[65%] rounded-t-xl bg-[#FF9343]"
                  ></div>

                  <p class="mt-2 text-center text-xs text-slate-500">
                    Fasilitas
                  </p>

                </div>


                <div
                  class="flex h-full flex-1 flex-col justify-end"
                >

                  <div
                    class="h-[48%] rounded-t-xl bg-[#FF9343]"
                  ></div>

                  <p class="mt-2 text-center text-xs text-slate-500">
                    Event
                  </p>

                </div>


                <div
                  class="flex h-full flex-1 flex-col justify-end"
                >

                  <div
                    class="h-[25%] rounded-t-xl bg-[#FF9343]"
                  ></div>

                  <p class="mt-2 text-center text-xs text-slate-500">
                    Lainnya
                  </p>

                </div>

              </div>

            </div>

          </div>


          <!-- SARAN -->

          <div
            class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
          >

            <h2 class="font-bold text-slate-900">
              Statistik Saran
            </h2>

            <div class="mt-6">

              <div class="flex h-52 items-end justify-around gap-5">

                <div
                  class="flex h-full flex-1 flex-col justify-end"
                >

                  <div
                    class="h-[40%] rounded-t-xl bg-[#FF9343]"
                  ></div>

                  <p class="mt-2 text-center text-xs text-slate-500">
                    Akademik
                  </p>

                </div>


                <div
                  class="flex h-full flex-1 flex-col justify-end"
                >

                  <div
                    class="h-[70%] rounded-t-xl bg-[#FF9343]"
                  ></div>

                  <p class="mt-2 text-center text-xs text-slate-500">
                    Fasilitas
                  </p>

                </div>


                <div
                  class="flex h-full flex-1 flex-col justify-end"
                >

                  <div
                    class="h-[50%] rounded-t-xl bg-[#FF9343]"
                  ></div>

                  <p class="mt-2 text-center text-xs text-slate-500">
                    Event
                  </p>

                </div>


                <div
                  class="flex h-full flex-1 flex-col justify-end"
                >

                  <div
                    class="h-[28%] rounded-t-xl bg-[#FF9343]"
                  ></div>

                  <p class="mt-2 text-center text-xs text-slate-500">
                    Lainnya
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>


        <!-- ================================================= -->
        <!-- DAFTAR VOTING -->
        <!-- ================================================= -->

        <section
          class="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        >

          <div class="flex items-center justify-between">

            <div>

              <h2 class="font-bold text-slate-900">
                Daftar Voting
              </h2>

              <p class="mt-1 text-xs text-slate-500">
                Voting yang tersedia di website.
              </p>

            </div>

            <button
              type="button"
              @click="goTo('/voting')"
              class="inline-flex items-center gap-1 text-xs font-semibold text-[#FF7A00] hover:underline"
            >
              Lihat semua
              <ChevronRight :size="15" />
            </button>

          </div>


          <div class="mt-5 overflow-x-auto">

            <table class="w-full min-w-[600px]">

              <thead>

                <tr
                  class="border-b border-slate-100 text-left text-xs text-slate-500"
                >

                  <th class="px-4 py-3">
                    Judul Voting
                  </th>

                  <th class="px-4 py-3">
                    Periode
                  </th>

                  <th class="px-4 py-3">
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                <tr
                  v-for="voting in votings.slice(0, 5)"
                  :key="voting.id"
                  class="border-b border-slate-50 last:border-0"
                >

                  <td class="px-4 py-4 text-sm font-semibold text-slate-800">
                    {{ voting.title }}
                  </td>

                  <td class="px-4 py-4 text-sm text-slate-500">
                    {{ voting.start_date }} -
                    {{ voting.end_date }}
                  </td>

                  <td class="px-4 py-4">

                    <span
                      class="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600"
                    >
                      Aktif
                    </span>

                  </td>

                </tr>


                <tr v-if="!votings.length">

                  <td
                    colspan="3"
                    class="px-4 py-8 text-center text-sm text-slate-400"
                  >
                    Belum ada data voting.
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </section>

      </template>

    </div>

  </main>

  <div class="h-16 bg-[#F7F7F7] sm:h-20"></div>

  </div>

  <Footer
    v-if="footer"
    :footer="footer"
    :majors="majors"
  />

</template>