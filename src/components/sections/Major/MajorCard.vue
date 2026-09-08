<script setup>
import BaseCard from '@/components/UI/BaseCard.vue'

defineProps({
  major: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <BaseCard
  class="group flex h-[280px] flex-col rounded-[24px] border border-[#F4E6D8] bg-[#FEF7F0] p-6 shadow-[0_4px_18px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
>
    <!-- Header -->
    <div class="flex items-center gap-4">
      <img
        :src="major.img_logo"
        :alt="major.major_name"
        class="h-14 w-14 object-contain transition-transform duration-300 group-hover:scale-110"
      >

      <h3 class="text-2xl font-bold text-slate-800">
        {{ major.code }}
      </h3>
    </div>

    <!-- Nama Jurusan -->
      <h4
    class="mt-3 text-[17px] font-semibold leading-7 text-slate-700">
    {{ major.major_name }}
    </h4>

    <!-- Deskripsi -->
    <p
  class="mt-3 flex-1 text-[14px] leading-6 text-slate-500 line-clamp-3"
>
  {{ major.summary }}
</p>

    <!-- Button -->
    <RouterLink
  :to="`/majors/${major.slug}`"
  class="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-orange-500"
>
  Lihat detail →
</RouterLink>
  </BaseCard>
</template>