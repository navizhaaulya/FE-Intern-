<script setup>
import { GraduationCap, BadgeCheck, Trophy } from 'lucide-vue-next'
import BaseContainer from '@/components/UI/BaseContainer.vue'
import StatisticCard from '@/components/UI/StatisticCard.vue'

const statistics = [
  {
    icon: GraduationCap,
    title: '2.000+',
    subtitle: 'Siswa Aktif',
    description:
      'Siswa aktif yang belajar dan mengembangkan kompetensi di berbagai bidang.'
  },

  {
    icon: BadgeCheck,
    title: 'A',
    subtitle: 'Akreditasi Sekolah',
    description:
      'Terakreditasi A sebagai bukti kualitas pendidikan dan tata kelola sekolah.'
  },

  {
    icon: Trophy,
    title: '100+',
    subtitle: 'Prestasi Siswa',
    description:
      'Prestasi akademik maupun non-akademik di tingkat kota, provinsi hingga nasional.'
  }
]
</script>

<template>
  <section
    class="bg-white py-28"
  >

    <BaseContainer>

      <div
        class="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
      >

        <StatisticCard
          v-for="item in statistics"
          :key="item.subtitle"
          v-bind="item"
        />

      </div>

    </BaseContainer>

  </section>
</template>