<script setup>
import { MessageSquareMore } from 'lucide-vue-next'
</script>

<template>
  <div class="flex flex-col">

    <div class="flex items-center gap-5">

      <div
        class="flex h-16 w-16 items-center justify-center rounded-xl bg-orange-100"
      >
        <MessageSquareMore
          :size="34"
          class="text-orange-500"
        />
      </div>

      <div>

        <h2
          class="text-3xl font-bold text-slate-900"
        >
          Form Kritik dan Saran
        </h2>

        <p
          class="mt-1 text-slate-500"
        >
          Sampaikan kritik dan saran anda
        </p>

      </div>

    </div>

    <img
      src="/src/assets/images/5397869.jpg"
      alt="Feedback"
      class="mx-auto mt-12 w-full max-w-md"
    >

  </div>
</template>