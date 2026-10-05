<script setup>
import { RouterLink } from 'vue-router'
import { Check, ArrowRight } from 'lucide-vue-next'

defineProps({
  major: {
    type: Object,
    required: true,
  },
  reverse: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div
    class="flex flex-col items-center gap-10 py-14 lg:flex-row lg:gap-16"
    :class="reverse ? 'lg:flex-row-reverse' : ''"
  >
    <!-- FOTO -->
    <div class="relative w-full shrink-0 lg:w-[460px]">
      <div class="overflow-hidden rounded-[28px] shadow-xl">
        <img
          :src="major.img_cover || major.img_logo"
          :alt="major.major_name"
          class="aspect-[4/3] w-full object-cover"
        />
      </div>

      <div
        class="absolute -bottom-6 -right-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-lg"
      >
        <img
          v-if="major.img_logo"
          :src="major.img_logo"
          :alt="major.code"
          class="h-full w-full object-contain"
        />
      </div>
    </div>

    <!-- KONTEN -->
    <div class="flex-1">
      <span class="text-xs font-bold uppercase tracking-widest text-orange-500">
        {{ major.code }}
      </span>

      <h3 class="mt-2 text-2xl font-extrabold leading-snug text-slate-900 sm:text-3xl">
        {{ major.major_name }}
      </h3>

      <p class="mt-4 text-[15px] leading-7 text-slate-500">
        {{ major.summary }}
      </p>

      <ul v-if="major.competencies?.length" class="mt-6 space-y-3">
        <li
          v-for="(item, idx) in major.competencies"
          :key="idx"
          class="flex items-center gap-3 text-sm font-medium text-slate-700"
        >
          <span
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white"
          >
            <Check :size="14" />
          </span>
          Pembelajaran {{ item }}
        </li>
      </ul>

      <RouterLink
        :to="`/majors/${major.slug}`"
        class="mt-8 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600"
      >
        Selengkapnya
        <ArrowRight :size="16" />
      </RouterLink>
    </div>
  </div>
</template>
