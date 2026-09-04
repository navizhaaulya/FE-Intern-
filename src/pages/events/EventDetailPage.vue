<script setup>
import { useRoute, RouterLink } from 'vue-router'
import { ArrowLeft, CalendarDays, MapPin } from 'lucide-vue-next'

import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'

import { publicApi } from '@/services/publicApi'
import { useFetch } from '@/composables/UseFetch'

const route = useRoute()

const { data: event } = useFetch(() =>
  publicApi.getEventDetail(route.params.slug)
)

const { data: footer } = useFetch(publicApi.getFooter)
const { data: majors } = useFetch(publicApi.getMajors)

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const plainContent = (html) => {
  return html?.replace(/<[^>]*>/g, '') ?? ''
}
</script>

<template>
  <Navbar />

  <section
    v-if="event"
    class="bg-white py-14"
  >
    <div class="mx-auto max-w-5xl px-6">

      <!-- Back -->

      <RouterLink
        to="/events"
        class="inline-flex items-center gap-2 text-slate-700 transition hover:text-orange-500"
      >
        <ArrowLeft :size="18" />
        Kembali
      </RouterLink>

      <!-- Judul -->

      <div class="mt-10 text-center">

        <h1
          class="mx-auto max-w-4xl text-4xl font-extrabold leading-tight text-slate-900"
        >
          {{ event.title }}
        </h1>

        <div
          class="mt-4 flex flex-col items-center gap-2 text-sm text-slate-600"
        >

          <div class="flex items-center gap-2">
            <MapPin
              :size="16"
              class="text-orange-500"
            />
            {{ event.location }}
          </div>

          <div class="flex items-center gap-2">
            <CalendarDays
              :size="16"
              class="text-orange-500"
            />

            {{ formatDate(event.start_date) }}

            <template v-if="event.end_date && event.end_date !== event.start_date">
              - {{ formatDate(event.end_date) }}
            </template>

          </div>

        </div>

      </div>

      <!-- Foto -->

      <div class="mt-10 flex justify-center">

        <figure class="w-full">

          <img
  :src="event.img_cover"
  :alt="event.title"
  class="h-[600px] w-full rounded-3xl object-cover shadow-xl"
>
          <figcaption
            class="mt-3 text-center text-sm text-slate-500"
          >
            Poster
          </figcaption>

        </figure>

      </div>

      <!-- Isi -->

     <article
  class="prose prose-slate mt-14 max-w-none"
  v-html="event.content"
/>

    </div>

  </section>

  <Footer
    v-if="footer"
    :footer="footer"
    :majors="majors"
  />

</template>