<script setup>
defineOptions({
  inheritAttrs: false
})
</script>

<template>
  <div
    class="mx-auto max-w-7xl px-5" v-bind="$attrs">
    <slot />
  </div>
</template>