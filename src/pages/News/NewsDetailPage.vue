<script setup>
import { useRoute } from 'vue-router'
import { publicApi } from '@/services/publicApi'
import { useFetch } from '@/composables/UseFetch'
import { ArrowLeft } from 'lucide-vue-next'

import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'

const route = useRoute()

const { data: news } = useFetch(() =>
  publicApi.getNewsDetail(route.params.slug)
)

const { data: footer } = useFetch(publicApi.getFooter)
const { data: majors } = useFetch(publicApi.getMajors)
</script>

<template>

  <Navbar />

  <section
    v-if="news"
    class="py-24"
  >
  <div class="mx-auto max-w-6xl px-6">

      <!-- Back -->

      <RouterLink
        to="/events"
        class="mb-8 inline-flex items-center gap-2 text-slate-600 hover:text-orange-500"
      >
        <ArrowLeft :size="18" />
        Kembali
      </RouterLink>
      </div>

    <div class="mx-auto max-w-5xl px-6">

      <img
        :src="news.img_cover"
        :alt="news.title"
        class="h-[450px] w-full rounded-3xl object-cover"
      >

      <h1
        class="mt-10 text-5xl font-bold text-slate-900"
      >
        {{ news.title }}
      </h1>

      <div
        class="mt-4 flex gap-6 text-slate-500"
      >

        <span>
          {{ new Date(news.created_at).toLocaleDateString('id-ID',{
            day:'numeric',
            month:'long',
            year:'numeric'
          }) }}
        </span>

      </div>

      <div
        class="prose prose-lg mt-12 max-w-none"
        v-html="news.content"
      />

    </div>

  </section>

  <Footer
    v-if="footer"
    :footer="footer"
    :majors="majors"
  />

</template>