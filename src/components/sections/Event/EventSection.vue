<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import BaseContainer from '@/components/UI/BaseContainer.vue'
import BaseButton from '@/components/UI/BaseButton.vue'
import SectionTitle from '@/components/UI/SectionTitle.vue'
import EventCard from './EventCard.vue'

const props = defineProps({
  events: {
    type: Array,
    default: () => []
  }
})

const highlightEvents = computed(() => {
  return (props.events ?? [])
    .filter(event => event.is_highlight)
    .slice(0, 8)
})
</script>

<template>
  <section
    id="events"
    class="bg-white py-28"
  >
    <BaseContainer>

      <SectionTitle
        title="Kegiatan & Event"
        subtitle="Ikuti berbagai kegiatan, acara, lomba, dan informasi terbaru yang diselenggarakan oleh SMKN 7 Semarang."
        align="left"
      />

      <div
        class="no-scrollbar mt-14 flex gap-6 overflow-x-auto pb-4"
      >

        <div
          v-for="event in highlightEvents"
          :key="event.id"
          class="w-[290px] shrink-0"
        >
          <EventCard
            :event="event"
          />
        </div>

      </div>

      <div class="mt-14 flex justify-center">
        <RouterLink to="/events">
          <BaseButton size="lg">
            Selengkapnya
          </BaseButton>
        </RouterLink>
      </div>

    </BaseContainer>
  </section>
</template>