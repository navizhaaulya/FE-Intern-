<script setup>
defineProps({
  visionMission: {
    type: Object,
    default: () => ({})
  }
})
</script>

<template>
  <section
    id="vision-mission"
    class="bg-white py-28"
  >
    <div class="mx-auto max-w-7xl px-6">

      <!-- VISI -->

      <div class="mx-auto mb-20 max-w-3xl text-center">

        <h2
          class="text-5xl font-extrabold text-slate-900"
        >
          Visi
        </h2>

        <div
          class="mx-auto mt-3 mb-8 h-1 w-20 rounded-full bg-orange-500"
        />

        <p
          class="text-xl leading-9 text-slate-600"
        >
          {{ visionMission?.vision }}
        </p>

      </div>

      <!-- MISI -->

<div>

  <h2
    class="text-center text-5xl font-extrabold text-slate-900"
  >
    Misi
  </h2>

  <div
    class="mx-auto mt-3 mb-14 h-1 w-20 rounded-full bg-orange-500"
  />

  <div
    class="relative"
  >


    <div
      class="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-slate-900 lg:block"
    />

    <div
      class="grid gap-x-24 lg:grid-cols-2"
    >

      <!-- Kolom kiri -->

      <div
        class="space-y-12"
      >

        <div
          v-for="mission in visionMission?.missions?.slice(0, Math.ceil((visionMission?.missions?.length || 0) / 2))"
          :key="mission.order"
          class="flex gap-6"
        >

          <span
            class="min-w-8 text-4xl font-light text-orange-500"
          >
            {{ mission.order }}
          </span>

          <p
            class="leading-9 text-slate-600"
          >
            {{ mission.content }}
          </p>

        </div>

      </div>

      <!-- Kolom kanan -->

      <div
        class="space-y-12"
      >

        <div
          v-for="mission in visionMission?.missions?.slice(Math.ceil((visionMission?.missions?.length || 0) / 2))"
          :key="mission.order"
          class="flex gap-6"
        >

          <span
            class="min-w-8 text-4xl font-light text-orange-500"
          >
            {{ mission.order }}
          </span>

          <p
            class="leading-9 text-slate-600"
          >
            {{ mission.content }}
          </p>

        </div>

      </div>

    </div>

  </div>

</div>
    </div>
  </section>
</template>