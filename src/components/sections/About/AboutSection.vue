<script setup>
import SectionTitle from '@/components/UI/SectionTitle.vue'
import BaseContainer from '@/components/UI/BaseContainer.vue'


defineProps({
  about: {
    type: Object,
    default: () => ({})
  }
})
</script>

<template>
  <section
    id="about"
    class="bg-white py-28"
  >

    <BaseContainer>

      <div class="grid items-center gap-16 lg:grid-cols-2">

        <!-- Images -->

        <div class="space-y-5">

          <div
            class="overflow-hidden rounded-2xl shadow-lg"
          >
            <img
              src="https://image.idntimes.com/post/20241122/img-20241122-wa0092-40a34a8ca1fa3703fd1fe6c829212b4b.jpg"
              alt="Profil Sekolah"
              class="h-80 w-full object-cover"
            >
          </div>

          <div
            class="overflow-hidden rounded-2xl shadow-lg"
          >
            <img
              src="https://sin1.contabostorage.com/adef61e95f524badb0b95b15d2c793b7:portal/media/20842/IMG_4293.JPG"
              alt="Kegiatan Sekolah"
              class="h-80 w-full object-cover"
            >
          </div>

        </div>

        <!-- Content -->

        <div class="max-w-xl">

          <SectionTitle
            :badge="about?.motto"
            :title="about?.profile_title"
          />

          <p
            class="whitespace-pre-line text-justify leading-8 text-slate-600"
          >
            {{ about?.profile_description }}
          </p>

        </div>

      </div>

    </BaseContainer>

  </section>
</template>