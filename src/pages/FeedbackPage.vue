<script setup>
import { RouterLink } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import FeedbackForm from '@/components/sections/Feedback/FeedbackForm.vue'
import FeedbackIllustration from '@/components/sections/Feedback/FeedbackIllustration.vue'

import { publicApi } from '@/services/publicApi'
import { useFetch } from '@/composables/UseFetch'

const { data: footer } = useFetch(publicApi.getFooter)
const { data: majors } = useFetch(publicApi.getMajors)
const { data: categories } = useFetch(publicApi.getFeedbackCategories)
</script>

<template>
  <Navbar />

  <section
    class="relative overflow-hidden bg-gradient-to-b from-orange-50/50 via-white to-white pb-24 pt-16"
  >
    <div
      class="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-orange-100/50 blur-3xl"
    />
    <div
      class="pointer-events-none absolute -left-32 top-96 h-72 w-72 rounded-full bg-orange-50 blur-3xl"
    />

    <div class="relative mx-auto max-w-7xl px-6">
      <RouterLink
        to="/"
        class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-orange-500"
      >
        <ArrowLeft :size="16" />
        Kembali ke Beranda
      </RouterLink>

      <div class="mx-auto mt-10 max-w-2xl text-center">
        <span
          class="inline-block rounded-full bg-orange-100 px-4 py-1.5 text-xs font-semibold text-orange-600"
        >
          Suara Anda
        </span>

        <h1 class="mt-5 text-4xl font-extrabold text-slate-900 sm:text-5xl">Kritik & Saran</h1>

        <p class="mt-5 text-lg leading-8 text-slate-500">
          Sampaikan kritik dan saran Anda untuk membantu kami terus berkembang menjadi lebih baik.
        </p>
      </div>

      <div
        class="mx-auto mt-16 grid max-w-5xl items-center gap-16 rounded-[32px] bg-white p-8 shadow-lg sm:p-12 lg:grid-cols-2"
      >
        <FeedbackIllustration />
        <FeedbackForm :categories="categories ?? []" />
      </div>
    </div>
  </section>

  <Footer v-if="footer" :footer="footer" :majors="majors" />
</template>
