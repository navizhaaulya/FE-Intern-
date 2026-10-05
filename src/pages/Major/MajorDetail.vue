<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ArrowLeft, Building2, Briefcase } from 'lucide-vue-next'

import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'

import { publicApi } from '@/services/publicApi'
import { useFetch } from '@/composables/UseFetch'

const route = useRoute()

const { data: footer } = useFetch(publicApi.getFooter)
const { data: majors } = useFetch(publicApi.getMajors)

const major = ref(null)
const loading = ref(true)
const notFound = ref(false)
const galleryIndex = ref(0)

const loadMajor = async (slug) => {
  try {
    loading.value = true
    notFound.value = false
    galleryIndex.value = 0
    major.value = await publicApi.getMajorDetail(slug)
  } catch (err) {
    console.error(err)
    major.value = null
    notFound.value = true
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params.slug,
  (slug) => slug && loadMajor(slug),
  { immediate: true }
)

const galleries = computed(() => major.value?.galleries ?? [])
const competencies = computed(() => major.value?.competencies ?? [])

// foto hero dan foto samping deskripsi diambil dari 2 foto galeri pertama
const heroPhoto = computed(() => galleries.value[0]?.img_cover || '')
const sidePhoto = computed(() => galleries.value[1]?.img_cover || '')
const currentPhoto = computed(() => galleries.value[galleryIndex.value] || null)

const nextPhoto = () => {
  galleryIndex.value = (galleryIndex.value + 1) % galleries.value.length
}

const prevPhoto = () => {
  galleryIndex.value = (galleryIndex.value - 1 + galleries.value.length) % galleries.value.length
}
</script>

<template>
  <Navbar />

  <section class="bg-white pb-24 pt-10">
    <div class="mx-auto max-w-5xl px-6">
      <RouterLink
        to="/"
        class="inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-orange-500"
      >
        <ArrowLeft :size="16" />
        Kembali
      </RouterLink>

      <!-- Loading -->
      <div v-if="loading" class="mt-12 space-y-6">
        <div class="h-56 animate-pulse rounded-2xl bg-slate-100" />
        <div class="h-40 animate-pulse rounded-2xl bg-slate-100" />
      </div>

      <!-- Tidak ditemukan -->
      <div v-else-if="notFound" class="py-32 text-center">
        <p class="text-lg font-semibold text-slate-700">Jurusan tidak ditemukan</p>
        <p class="mt-2 text-sm text-slate-400">
          Periksa kembali tautan atau pilih jurusan dari beranda.
        </p>
      </div>

      <template v-else-if="major">
        <!-- HERO -->
        <div class="mt-12 flex flex-col items-center gap-10 md:flex-row">
          <img
            v-if="heroPhoto"
            :src="heroPhoto"
            :alt="major.major_name"
            class="aspect-[4/3] w-full rounded-xl object-cover shadow-md md:w-[300px] md:shrink-0"
          />

          <div>
            <div class="flex items-center gap-3">
              <img
                v-if="major.img_logo"
                :src="major.img_logo"
                :alt="major.code"
                class="h-9 w-9 object-contain"
              />
              <span class="text-2xl font-bold text-slate-500">{{ major.code }}</span>
            </div>

            <h1 class="mt-3 text-3xl font-extrabold leading-tight text-slate-900 md:text-5xl">
              {{ major.major_name }}
            </h1>
          </div>
        </div>

        <!-- DESKRIPSI -->
        <div
          class="mt-16 grid items-center gap-10"
          :class="sidePhoto ? 'md:grid-cols-[1fr_300px]' : ''"
        >
          <div
            class="major-desc text-sm leading-7 text-slate-700"
            v-html="major.full_description"
          />

          <img
            v-if="sidePhoto"
            :src="sidePhoto"
            :alt="major.major_name"
            class="aspect-[4/3] w-full rounded-lg object-cover shadow-md"
          />
        </div>

        <!-- STATISTIK -->
        <div class="mt-16 flex flex-wrap justify-center gap-6">
          <div class="w-[200px] rounded-2xl bg-white px-6 py-7 text-center shadow-lg">
            <Building2 :size="40" class="mx-auto text-orange-400" />
            <p class="mt-2 text-2xl font-bold text-orange-400">{{ major.total_classes }} Kelas</p>
            <p class="text-sm font-semibold text-slate-600">Total Kelas</p>
          </div>

          <div class="w-[200px] rounded-2xl bg-white px-6 py-7 text-center shadow-lg">
            <Briefcase :size="40" class="mx-auto text-orange-400" />
            <p class="mt-2 text-2xl font-bold text-orange-400">{{ major.major_duration }} Tahun</p>
            <p class="text-sm font-semibold text-slate-600">Program Studi</p>
          </div>
        </div>

        <!-- KOMPETENSI -->
        <div v-if="competencies.length" class="mt-24">
          <div class="text-center">
            <h2 class="text-3xl font-extrabold text-slate-900">Kompetensi Jurusan</h2>
            <div class="mx-auto mt-3 h-1 w-16 rounded-full bg-orange-400" />
            <p class="mt-4 text-sm font-medium text-slate-700">
              Beberapa kompetensi yang mendukung jurusan
            </p>
          </div>

          <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="item in competencies"
              :key="item.id"
              class="rounded-2xl bg-white p-6 text-center shadow-md"
            >
              <h3 class="text-xl font-bold text-orange-400">{{ item.competent_name }}</h3>
              <p class="mt-3 text-sm leading-6 text-slate-500">{{ item.description }}</p>
            </div>
          </div>
        </div>

        <!-- GALERI -->
        <div v-if="currentPhoto" class="mt-24">
          <div class="text-center">
            <h2 class="text-3xl font-extrabold text-slate-900">Galeri Jurusan</h2>
            <div class="mx-auto mt-3 h-1 w-16 rounded-full bg-orange-400" />
          </div>

          <div class="mt-10 overflow-hidden rounded-3xl bg-white shadow-lg">
            <img
              :src="currentPhoto.img_cover"
              :alt="currentPhoto.description"
              class="aspect-[16/10] w-full object-cover"
            />

            <p class="px-4 py-3 text-center text-xs italic text-slate-600">
              {{ currentPhoto.description }}
            </p>

            <div class="flex items-center justify-between px-6 pb-5">
              <div class="flex items-center gap-2">
                <img
                  v-if="major.img_logo"
                  :src="major.img_logo"
                  :alt="major.code"
                  class="h-7 w-7 object-contain"
                />
                <span class="text-lg font-bold text-slate-500">{{ major.code }}</span>
              </div>

              <div class="flex gap-3">
                <button
                  @click="prevPhoto"
                  :disabled="galleries.length < 2"
                  class="rounded-lg border border-orange-300 px-5 py-2 text-sm text-slate-500 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sebelumnya
                </button>
                <button
                  @click="nextPhoto"
                  :disabled="galleries.length < 2"
                  class="rounded-lg border border-orange-300 px-5 py-2 text-sm text-slate-500 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>

  <Footer v-if="footer" :footer="footer" :majors="majors" />
</template>

<style scoped>
.major-desc :deep(p) {
  margin-bottom: 1rem;
}

/* huruf pertama paragraf pembuka dibuat besar seperti di desain */
.major-desc :deep(p:first-of-type)::first-letter {
  font-size: 2em;
  font-weight: 700;
  line-height: 1;
  color: #0f172a;
}

.major-desc :deep(ul) {
  margin-bottom: 1rem;
  list-style: disc;
  padding-left: 1.25rem;
}
</style>
