<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  subtitle: String,

  align: {
    type: String,
    default: 'left'
  },

  theme: {
    type: String,
    default: 'light'
  }
})

const isCenter = computed(() => props.align === 'center')
</script>

<template>
  <div :class="isCenter ? 'text-center' : 'text-left'">
    <h2
      :class="[
        'text-4xl font-extrabold',
        theme === 'dark' ? 'text-white' : 'text-slate-900'
      ]"
    >
      {{ title }}
    </h2>

    <div
      :class="[
        'mt-3 h-1 w-20 rounded-full bg-orange-500',
        isCenter ? 'mx-auto' : ''
      ]"
    ></div>

    <p
      class="mt-6 max-w-2xl text-xl leading-9"
      :class="[
        theme === 'dark' ? 'text-white/90' : 'text-slate-600',
        isCenter ? 'mx-auto' : ''
      ]"
    >
      {{ subtitle }}
    </p>
  </div>
</template>