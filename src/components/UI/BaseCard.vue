<script setup>
defineProps({
  hover: {
    type: Boolean,
    default: true
  }
})
</script>

<template>
  <div
    :class="[
      'rounded-3xl shadow-lg overflow-hidden',
      hover && 'transition duration-300 hover:-translate-y-2 hover:shadow-xl'
    ]"
  >
    <slot />
  </div>
</template>