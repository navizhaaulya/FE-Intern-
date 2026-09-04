<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'

defineProps({
  majors: {
    type: Array,
    default: () => []
  },

  isScrolled: Boolean
})

const showDropdown = ref(false)
</script>

<template>

  <div
    class="relative"
    @mouseenter="showDropdown = true"
    @mouseleave="showDropdown = false"
  >

    <button
      class="flex items-center gap-1 font-medium transition"
      :class="
        isScrolled
          ? 'text-slate-700 hover:text-orange-500'
          : 'text-white hover:text-orange-300'
      "
    >
    Kompetensi Keahlian

      <ChevronDown
        :size="18"
        class="transition"
        :class="{ 'rotate-180': showDropdown }"
      />

    </button>

    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >

      <div
        v-if="showDropdown"
        class="absolute left-1/2 top-full z-50 mt-4 w-[360px] -translate-x-1/2 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-100"
      >

        <div class="grid grid-cols-2 gap-2">

          <RouterLink
            v-for="major in majors"
            :key="major.id"
            :to="`/majors/${major.slug}`"
            class="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-orange-50 hover:text-orange-500"
          >

            {{ major.code }}

            <ChevronRight
              :size="16"
              class="transition group-hover:translate-x-1"
            />

          </RouterLink>

        </div>

      </div>

    </Transition>

  </div>

</template>