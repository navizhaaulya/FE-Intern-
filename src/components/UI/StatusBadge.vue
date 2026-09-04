<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: [String, Boolean, Number],
    default: null,
  },
})

const normalizedStatus = computed(() => {
  // BOOLEAN / BANNER
  if (
    props.status === true ||
    props.status === 'true' ||
    props.status === 1 ||
    props.status === '1'
  ) {
    return 'active'
  }

  if (
    props.status === false ||
    props.status === 'false' ||
    props.status === 0 ||
    props.status === '0'
  ) {
    return 'inactive'
  }

  // NEWS
  return String(props.status || '').toLowerCase()
})

const label = computed(() => {
  const labels = {
    active: 'Aktif',
    inactive: 'Non Aktif',

    publish: 'Diterbitkan',
    draft: 'Draft',
    archive: 'Diarsipkan',
  }

  return labels[normalizedStatus.value] || props.status
})

const statusClass = computed(() => {
  const classes = {
    active: 'bg-green-100 text-green-600',
    inactive: 'bg-red-50 text-red-500',

    publish: 'bg-green-100 text-green-700',
    draft: 'bg-yellow-100 text-yellow-700',
    archive: 'bg-gray-100 text-gray-600',
  }

  return (
    classes[normalizedStatus.value] ||
    'bg-gray-100 text-gray-600'
  )
})
</script>

<template>
  <span
    :class="statusClass"
    class="inline-flex rounded-full px-4 py-1.5 text-xs font-semibold"
  >
    {{ label }}
  </span>
</template>