<script setup>
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

const props = defineProps({
  // kalau diisi, tombol menuju path ini; kalau kosong, kembali ke halaman sebelumnya
  to: { type: String, default: '' },
  label: { type: String, default: 'Kembali' },
})

const router = useRouter()

const goBack = () => {
  if (props.to) router.push(props.to)
  else router.back()
}
</script>

<template>
  <button
    type="button"
    @click="goBack"
    class="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-orange-50 hover:text-orange-500"
  >
    <ArrowLeft :size="18" />
    {{ label }}
  </button>
</template>
