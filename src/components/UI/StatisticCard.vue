<script setup>
import BaseCard from './BaseCard.vue'

defineProps({
  icon: Object,
  title: String,
  subtitle: String,
  description: String
})
</script>

<template>
  <BaseCard>

    <div class="flex flex-col items-center px-5 py-25 text-center">

      <component
        :is="icon"
        :size="40"
        class="mb-4 text-orange-500"
      />

      <h3 class="text-4xl font-bold text-orange-500">
        {{ title }}
      </h3>

      <h4 class="mb-4 text-xl font-semibold text-orange-500">
        {{ subtitle }}
      </h4>

      <p class="text-sm leading-7 text-slate-500">
        {{ description }}
      </p>

    </div>

  </BaseCard>
</template>