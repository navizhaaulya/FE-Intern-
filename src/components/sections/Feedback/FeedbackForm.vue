<script setup>
import { reactive, watch } from 'vue'
import Swal from 'sweetalert2'

import BaseButton from '@/components/UI/BaseButton.vue'
import { publicApi } from '@/services/publicApi'

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  }
})

const form = reactive({
  sender_name: '',
  type: true,
  category_id: '',
  message: ''
})

const errors = reactive({
  category_id: '',
  message: ''
})

const validate = () => {
  errors.category_id = ''
  errors.message = ''

  let valid = true

  if (!form.category_id) {
    errors.category_id = 'Kategori wajib dipilih.'
    valid = false
  }

  if (!form.message.trim()) {
    errors.message = 'Pesan tidak boleh kosong.'
    valid = false
  }

  return valid
}

watch(() => form.category_id, () => {
  errors.category_id = ''
})

watch(() => form.message, () => {
  errors.message = ''
})

const submit = async () => {
  if (!validate()) return

  try {
    await publicApi.submitFeedback(form)

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Terima kasih atas kritik dan saran Anda.',
      confirmButtonColor: '#f97316',
      timer: 2000,
      showConfirmButton: false
    })

    form.sender_name = ''
    form.type = true
    form.category_id = ''
    form.message = ''
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Terjadi kesalahan saat mengirim.'
    })
  }
}
</script>

<template>
  <form
    class="space-y-6"
    @submit.prevent="submit"
  >

    <!-- Nama -->

    <div>
      <label class="mb-2 block font-semibold">
        Nama Pengirim
        <span class="font-normal text-slate-400">
          (Opsional)
        </span>
      </label>

      <input
        v-model="form.sender_name"
        type="text"
        placeholder="Ketik di sini..."
        class="h-12 w-full rounded-xl border border-slate-300 px-4 focus:border-orange-500 focus:outline-none"
      >
    </div>

    <!-- Tipe -->

    <div>
      <label class="mb-2 block font-semibold">
        Tipe
      </label>

      <div class="flex gap-8">

        <label class="flex items-center gap-2">
          <input
            v-model="form.type"
            :value="true"
            type="radio"
          >
          Kritik
        </label>

        <label class="flex items-center gap-2">
          <input
            v-model="form.type"
            :value="false"
            type="radio"
          >
          Saran
        </label>

      </div>
    </div>

    <!-- Kategori -->

    <div>

      <label class="mb-2 block font-semibold">
        Kategori
      </label>

      <select
        v-model="form.category_id"
        :class="[
          'h-12 w-full rounded-xl border px-4 focus:outline-none',
          errors.category_id
            ? 'border-red-500'
            : 'border-slate-300 focus:border-orange-500'
        ]"
      >

        <option
          disabled
          value=""
        >
          Pilih kategori sesuai pesan anda
        </option>

        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.category_name }}
        </option>

      </select>

      <p
        v-if="errors.category_id"
        class="mt-2 text-sm text-red-500"
      >
        {{ errors.category_id }}
      </p>

    </div>

    <!-- Pesan -->

    <div>

      <label class="mb-2 block font-semibold">
        Pesan
      </label>

      <textarea
        v-model="form.message"
        rows="5"
        placeholder="Bagikan pendapatmu..."
        :class="[
          'w-full rounded-xl border p-4 focus:outline-none',
          errors.message
            ? 'border-red-500'
            : 'border-slate-300 focus:border-orange-500'
        ]"
      />

      <p
        v-if="errors.message"
        class="mt-2 text-sm text-red-500"
      >
        {{ errors.message }}
      </p>

    </div>

    <BaseButton
      type="submit"
      size="lg"
      class="w-full justify-center"
    >
      Kirim
    </BaseButton>

  </form>
</template>