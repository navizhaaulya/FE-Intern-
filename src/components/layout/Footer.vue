<script setup>
import { RouterLink } from 'vue-router'
import {
  Youtube,
  Instagram,
  Facebook,
  Linkedin
} from 'lucide-vue-next'

const iconClass = (url) => [
  'flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-300',
  url
    ? 'border-white hover:bg-white hover:text-orange-500'
    : 'cursor-not-allowed border-white/40 text-white/40'
]

const props = defineProps({
  footer: {
    type: Object,
    default: () => ({})
  },
  majors: {
    type: Array,
    default: () => []
  },
  about:{
    type: Object,
    default: () => ({})
  }
})
</script>

<template>
  <footer class="bg-[#FF933C] text-white">

    <div class="mx-20 max-w-7xl px-20 py-16">

      <div class="grid gap-12 lg:grid-cols-4">

        <!-- LOGO -->

        <div>

          <div class="flex items-center gap-4">

            <img
              src="https://smkn7semarang.sch.id/images/icon/logo180.svg"
              alt="SMKN 7 Semarang"
              class="h-14 w-14 object-contain"
            >

            <div>

              <h3 class="text-2xl font-bold">
                {{ footer?.school_name }}
              </h3>

              <p class="text-lg">
                {{ about?.motto }}
              </p>

            </div>

          </div>

          <p class="mt-8 max-w-xs text-[15px] leading-8">
            {{ footer.footer_description }}
          </p>

        </div>

        <!-- MENU -->

        <div>

          <h3 class="mb-6 text-2xl font-semibold">
            Menu
          </h3>

          <ul class="space-y-4">

            <li><RouterLink to="/">Beranda</RouterLink></li>

            <li><RouterLink to="#about">Profil Sekolah</RouterLink></li>

            <li><RouterLink to="/events">Event</RouterLink></li>

            <li><RouterLink to="/news">Berita</RouterLink></li>

            <li><RouterLink to="/majors">Kompetensi Keahlian</RouterLink></li>

            <li><RouterLink to="/feedback">Kritik & Saran</RouterLink></li>

          </ul>

        </div>

        <!-- MAJOR -->

        <div>

          <h3 class="mb-6 text-2xl font-semibold">
            Kompetensi Keahlian
          </h3>

          <div class="grid grid-cols-2 gap-y-4">

            <RouterLink
              v-for="major in majors"
              :key="major.id"
              :to="`/majors/${major.slug}`"
            >
              {{ major.code }}
            </RouterLink>

          </div>

        </div>

        <!-- CONTACT -->

        <div>

          <h3 class="mb-6 text-2xl font-semibold">
            Kontak Kami
          </h3>

          <a
            :href="`mailto:${footer.school_email}`"
            class="block underline"
          >
            {{ footer.school_email }}
          </a>

          <p class="mt-4">
            {{ footer.school_telephone }}
          </p>

          <div class="mt-8 flex gap-4">

  <a
    :href="footer.footer_yt || '#'"
    target="_blank"
    :class="iconClass(footer.footer_yt)"
    @click="!footer.footer_yt && $event.preventDefault()"
  >
    <Youtube :size="22" />
  </a>

  <a
    :href="footer.footer_ig || '#'"
    target="_blank"
    :class="iconClass(footer.footer_ig)"
    @click="!footer.footer_ig && $event.preventDefault()"
  >
    <Instagram :size="22" />
  </a>

  <a
    :href="footer.footer_fb || '#'"
    target="_blank"
    :class="iconClass(footer.footer_fb)"
    @click="!footer.footer_fb && $event.preventDefault()"
  >
    <Facebook :size="22" />
  </a>

  <a
    :href="footer.footer_linkedin || '#'"
    target="_blank"
    :class="iconClass(footer.footer_linkedin)"
    @click="!footer.footer_linkedin && $event.preventDefault()"
  >
    <Linkedin :size="22" />
  </a>

</div>
        </div>

      </div>

      <div class="my-12 h-px bg-white/40" />

      <p class="text-center text-sm">
        © 2026 {{ footer.school_name }}. All rights reserved.
      </p>

    </div>

  </footer>
</template>