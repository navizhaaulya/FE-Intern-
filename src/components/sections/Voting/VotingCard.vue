<script setup>
defineProps({
  candidate: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div
    class="w-[290px] rounded-3xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
  >

    <p class="text-center text-lg font-semibold text-slate-400">
      Pilihan #{{ candidate.order }}
    </p>

    <img
      :src="candidate.img_cover"
      :alt="candidate.title"
      class="mt-5 h-[190px] w-full rounded-2xl object-cover"
    >

    <h3
      class="mt-5 text-center text-2xl font-bold text-slate-900"
    >
      {{ candidate.title }}
    </h3>

    <p
      class="mt-2 text-center text-sm leading-6 text-slate-500 line-clamp-2"
    >
      {{ candidate.description }}
    </p>

    <!-- Progress -->

    <div class="mt-6">

      <div class="mb-2 flex justify-between text-sm">

        <span class="font-semibold text-slate-700">
          {{ candidate.vote_count ?? 0 }} Suara
        </span>

        <span class="font-semibold text-orange-500">
          {{ candidate.percentage ?? 0 }}%
        </span>

      </div>

      <div class="h-2 overflow-hidden rounded-full bg-slate-200">

        <div
          class="h-full rounded-full bg-orange-500 transition-all duration-700"
          :style="{ width: (candidate.percentage ?? 0) + '%' }"
        />

      </div>

    </div>

  </div>
</template>