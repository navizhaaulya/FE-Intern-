<script setup>
import BaseContainer from '@/components/UI/BaseContainer.vue'
import SectionTitle from '@/components/UI/SectionTitle.vue'
import MajorCard from './MajorCard.vue'

defineProps({
  majors: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <section
    id="majors"
    class="bg-white py-28"
  >
    <BaseContainer>

      <SectionTitle
        title="Kompetensi Keahlian"
        subtitle="Kompetensi Keahlian di SMKN 7 Semarang"
        align="center"
      />

      <div
        class="mt-10 grid grid-cols-1 gap-x-10 gap-y-15 md:grid-cols-2 xl:grid-cols-3"
      >
        <MajorCard
          v-for="major in majors"
          :key="major.id"
          :major="major"
        />
      </div>

    </BaseContainer>
  </section>
</template>