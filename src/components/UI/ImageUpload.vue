<script setup>
import { ref, watch } from 'vue'
import { Upload, X } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },

  accept: {
    type: String,
    default: 'image/jpeg,image/png,image/webp',
  },

  maxSize: {
    type: Number,
    default: 2,
  },
})

const emit = defineEmits([
  'update:modelValue',
  'file-selected',
])

const fileInput = ref(null)
const preview = ref(props.modelValue || '')
const error = ref('')

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      preview.value = ''
    }
  }
)

const openFilePicker = () => {
  fileInput.value?.click()
}

const handleFile = (event) => {
  const file = event.target.files?.[0]

  if (!file) return

  error.value = ''

  const maxBytes = props.maxSize * 1024 * 1024

  if (file.size > maxBytes) {
    error.value = `Ukuran file maksimal ${props.maxSize}MB.`
    event.target.value = ''
    return
  }

  if (!file.type.startsWith('image/')) {
    error.value = 'File harus berupa gambar.'
    event.target.value = ''
    return
  }

  const reader = new FileReader()

  reader.onload = () => {
    preview.value = reader.result

    emit('update:modelValue', reader.result)
    emit('file-selected', file)
  }

  reader.readAsDataURL(file)
}

const removeImage = () => {
  preview.value = ''
  error.value = ''

  emit('update:modelValue', '')

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<template>
  <div>

    <!-- UPLOAD BOX -->
    <div
      v-if="!preview"
      class="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-7"
    >
      <div class="flex items-center justify-between gap-6">

        <div class="flex items-center gap-5">

          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center text-gray-400"
          >
            <Upload :size="38" />
          </div>

          <div>
            <p class="text-sm font-medium text-gray-600">
              Pilih file atau seret gambar di sini
            </p>

            <p class="mt-1 text-xs text-gray-500">
              JPG, PNG, WebP, maks. {{ maxSize }}MB
            </p>
          </div>

        </div>

        <button
          type="button"
          @click="openFilePicker"
          class="rounded-lg border border-orange-300 bg-orange-50 px-8 py-2 text-sm font-medium text-orange-400 transition hover:bg-orange-100"
        >
          Pilih file
        </button>

      </div>
    </div>

    <!-- PREVIEW -->
    <div
      v-else
      class="relative w-fit"
    >

      <img
        :src="preview"
        alt="Preview cover"
        class="h-44 w-72 rounded-xl border border-gray-200 object-cover"
      />

      <button
        type="button"
        @click="removeImage"
        class="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow transition hover:bg-red-600"
        title="Hapus gambar"
      >
        <X :size="15" />
      </button>

    </div>

    <!-- ERROR -->
    <p
      v-if="error"
      class="mt-2 text-xs text-red-500"
    >
      {{ error }}
    </p>

    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      class="hidden"
      @change="handleFile"
    />

  </div>
</template>