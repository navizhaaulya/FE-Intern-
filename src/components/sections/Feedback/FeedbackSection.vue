<script setup>
import BaseContainer from '@/components/UI/BaseContainer.vue'
import SectionTitle from '@/components/UI/SectionTitle.vue'
import FeedbackIllustration from './FeedbackIllustration.vue'
import FeedbackForm from './FeedbackForm.vue'

defineProps({
  categories: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <section class="bg-[#FFF8F3] py-28">
    <BaseContainer>

      <SectionTitle
        title="Kritik & Saran"
        subtitle="Sampaikan Kritik dan Saran Anda."
        align="left"
      />

      <div
        class="mt-14 grid items-center gap-16 rounded-[32px] bg-white p-12 shadow-lg lg:grid-cols-2"
      >
        <FeedbackIllustration />

        <FeedbackForm
          :categories="categories"
        />
      </div>

    </BaseContainer>
  </section>
</template>