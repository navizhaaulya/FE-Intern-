<script setup>
import SectionTitle from '@/components/UI/SectionTitle.vue'
import BaseContainer from '@/components/UI/BaseContainer.vue'

const props = defineProps({
  about: {
    type: Object,
    default: () => ({})
  }
})

// sama pola dengan DataTable.vue: handle path relatif dari BE
const getImageUrl = (imgObj) => {
  if (!imgObj) return ''
  if (typeof imgObj === 'string') return imgObj // jaga-jaga kalau masih ada yang balikin string mentah
  const rawUrl = imgObj.url || imgObj.field_value || ''
  if (!rawUrl) return ''
  if (rawUrl.startsWith('http')) return rawUrl
  return `${import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')}/${rawUrl}`
}
</script>

<template>
  <section id="about" class="bg-white py-28">
    <BaseContainer>
      <div class="grid items-center gap-16 lg:grid-cols-2">
        <div class="space-y-5">
          <div class="overflow-hidden rounded-2xl shadow-lg">
            <img
              v-if="getImageUrl(about?.img_profile_1)"
              :src="getImageUrl(about.img_profile_1)"
              alt="Profil Sekolah"
              class="h-80 w-full object-cover"
            >
          </div>

          <div class="overflow-hidden rounded-2xl shadow-lg">
            <img
              v-if="getImageUrl(about?.img_profile_2)"
              :src="getImageUrl(about.img_profile_2)"
              alt="Kegiatan Sekolah"
              class="h-80 w-full object-cover"
            >
          </div>
        </div>

        <div class="max-w-xl">
          <SectionTitle :badge="about?.motto" :title="about?.profile_title" />
          <div v-html="about?.profile_description" class="whitespace-pre-line text-justify leading-8 text-slate-600"></div>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>