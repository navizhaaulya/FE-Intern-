<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import BaseContainer from '@/components/UI/BaseContainer.vue'
import BaseButton from '@/components/UI/BaseButton.vue'
import SectionTitle from '@/components/UI/SectionTitle.vue'
import VotingCard from './VotingCard.vue'

const props = defineProps({
  votings: {
    type: Array,
    default: () => []
  }
})

const highlightVoting = computed(() => {
  return (props.votings ?? []).find(item => item.is_highlight)
})
</script>

<template>
  <section
    v-if="highlightVoting"
    class="bg-white py-28"
  >
    <BaseContainer>

     <div
  class="overflow-hidden rounded-[32px]  px-10 py-8 text-center text-black"
>

 <div class="flex flex-wrap items-center justify-center gap-4">

  <span
    class="rounded-full bg-gradient-to-r from-orange-500 to-orange-400 px-5 py-2 text-base font-semibold text-white"
  >
    Highlight Voting
  </span>

  <span class="text-base text-black/80">
    {{ highlightVoting.start_date }} - {{ highlightVoting.end_date }}
  </span>

</div>
  <h2
  class="mt-5 text-5xl font-extrabold tracking-tight"
>
  {{ highlightVoting.title }}
</h2>

  <p
  class="mx-auto mt-3 max-w-2xl text-lg text-black/90"
>
  {{ highlightVoting.description }}
</p>

</div>

<div
  class="relative z-10 -mt-2 flex flex-wrap justify-center gap-8"
>
  <VotingCard
    v-for="candidate in highlightVoting.candidates"
    :key="candidate.id"
    :candidate="candidate"
  />
</div>

      <div class="mt-10 flex justify-center">

        <RouterLink :to="`/votings/${highlightVoting.slug}`">

          <BaseButton size="lg">
            Ikuti Voting
          </BaseButton>

        </RouterLink>

      </div>

    </BaseContainer>
  </section>
</template>