<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { Search, Clock3, ArrowLeft } from 'lucide-vue-next'

import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import NewsCard from '@/components/sections/News/NewsCard.vue'

import { publicApi } from '@/services/publicApi'
import { useFetch } from '@/composables/UseFetch'

const { data: footer } = useFetch(publicApi.getFooter)
const { data: majors } = useFetch(publicApi.getMajors)

const news = ref([])

const keyword = ref('')
const sort = ref('desc')

const loadNews = async () => {
  try {
    news.value = await publicApi.getNews({
      search: keyword.value,
      sort_by: 'created_at',
      sort: sort.value
    })
  } catch (err) {
    console.error(err)
  }
}

onMounted(loadNews)

watch(keyword, () => {
  loadNews()
})

const toggleSort = async () => {
  sort.value = sort.value === 'desc' ? 'asc' : 'desc'
  await loadNews()
}

const filteredNews = computed(() => news.value)
</script>

<template>
  <Navbar />

  <section class="bg-white py-20">

    <div class="mx-auto max-w-7xl px-6">

      <!-- Back -->

      <RouterLink
        to="/"
        class="inline-flex items-center gap-2 text-slate-600 hover:text-orange-500"
      >
        <ArrowLeft :size="18" />
        Kembali
      </RouterLink>

      <!-- Title -->

      <div class="mt-8 text-center">

        <h1 class="text-5xl font-extrabold text-slate-900">
          Berita
        </h1>

        <div class="mx-auto mt-4 h-1 w-20 rounded-full bg-orange-500" />

        <p class="mx-auto mt-6 max-w-xl text-lg text-slate-500">
          Dapatkan informasi dan kabar terbaru seputar kegiatan,
          prestasi, dan perkembangan di SMKN 7 Semarang.
        </p>

      </div>

      <!-- Filter -->

      <div class="mx-auto mt-14 flex max-w-3xl gap-4">

        <div class="relative flex-1">

          <Search
            :size="18"
            class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            v-model="keyword"
            type="text"
            placeholder="Cari berita..."
            class="h-12 w-full rounded-full border border-slate-300 pl-12 pr-5 outline-none transition focus:border-orange-500"
          >

        </div>

        <button
  @click="toggleSort"
  :class="[
    'flex h-12 items-center gap-2 rounded-full border px-6 transition-all duration-300',
    sort === 'desc'
      ? 'border-orange-500 bg-orange-500 text-white'
      : 'border-slate-300 bg-white text-slate-600 hover:border-orange-500 hover:text-orange-500'
  ]"
>
  <Clock3 :size="18" />
  {{ sort === 'desc' ? 'Terbaru' : 'Terlama' }}
</button>

      </div>

      <!-- Cards -->

      <div class="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">

       <NewsCard
  v-for="item in filteredNews"
  :key="item.id"
  :news="item"
/>

      </div>

    </div>

  </section>

  <Footer
    v-if="footer"
    :footer="footer"
    :majors="majors"
  />
</template>