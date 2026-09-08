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
              v-if="about?.img_profile_1"
              :src="about.img_profile_1"
              alt="Profil Sekolah"
              class="h-80 w-full object-cover"
            >
          </div>

          <div
            class="overflow-hidden rounded-2xl shadow-lg"
          >
            <img
                v-if="about?.img_profile_2"
                :src="about.img_profile_2"
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