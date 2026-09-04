<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  to: String,
  href: String,
  isScrolled: Boolean
})
</script>

<template>
  <RouterLink
    v-if="to"
    :to="to"
    :class="[
      'font-medium transition',
      isScrolled
        ? 'text-slate-700 hover:text-orange-500'
        : 'text-white hover:text-orange-300'
    ]"
  >
    <slot />
  </RouterLink>

  <a
    v-else
    :href="href"
    :class="[
      'font-medium transition',
      isScrolled
        ? 'text-slate-700 hover:text-orange-500'
        : 'text-white hover:text-orange-300'
    ]"
  >
    <slot />
  </a>
</template>