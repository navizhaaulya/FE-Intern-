<script setup>
import { computed } from 'vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  as: {
    type: [String, Object],
    default: 'button'
  },

  variant: {
    type: String,
    default: 'primary'
  },

  size: {
    type: String,
    default: 'md'
  },

  type: {
    type: String,
    default: 'button'
  },

  disabled: {
    type: Boolean,
    default: false
  },

  fullWidth: {
    type: Boolean,
    default: false
  }
})

const variantClass = computed(() => {
  switch (props.variant) {
    case 'outline':
      return 'border-2 border-white bg-white text-orange-500 hover:bg-orange-50'

    case 'ghost':
      return 'bg-transparent text-white hover:bg-white/10'

    default:
      return 'bg-orange-500 text-white hover:bg-orange-600'
  }
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-5 py-2 text-sm'

    case 'lg':
      return 'px-10 py-4 text-lg'

    default:
      return 'px-8 py-4'
  }
})
</script>

<template>
  <component
    :is="as"
    :type="as === 'button' ? type : undefined"
    :disabled="disabled" v-bind="$attrs"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-full font-semibold shadow-xl transition duration-300 hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50',
      variantClass,
      sizeClass,
      fullWidth && 'w-full'
    ]"
  >
    <slot />
  </component>
</template>