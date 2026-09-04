<script setup>
import { ref, watch, nextTick } from 'vue'
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  ImagePlus,
} from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const editor = ref(null)
const imageInput = ref(null)
const textColor = ref('#000000')

const exec = (command, value = null) => {
  editor.value?.focus()

  document.execCommand(command, false, value)

  updateContent()
}

const updateContent = () => {
  if (!editor.value) return

  emit('update:modelValue', editor.value.innerHTML)
}

// =========================
// TEXT COLOR
// =========================

const changeTextColor = () => {
  editor.value?.focus()

  document.execCommand(
    'foreColor',
    false,
    textColor.value
  )

  updateContent()
}

// =========================
// IMAGE
// =========================

const openImagePicker = () => {
  imageInput.value?.click()
}

const handleImageUpload = (event) => {
  const file = event.target.files?.[0]

  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('File harus berupa gambar.')
    return
  }

  const reader = new FileReader()

  reader.onload = () => {
    editor.value?.focus()

    document.execCommand(
      'insertImage',
      false,
      reader.result
    )

    updateContent()
  }

  reader.readAsDataURL(file)

  // supaya file yang sama bisa dipilih lagi
  event.target.value = ''
}

// =========================
// SYNC VALUE
// =========================

watch(
  () => props.modelValue,
  async (value) => {
    if (!editor.value) return

    if (editor.value.innerHTML !== value) {
      editor.value.innerHTML = value || ''
    }
  }
)

// =========================
// INIT
// =========================

const initEditor = async () => {
  await nextTick()

  if (editor.value) {
    editor.value.innerHTML = props.modelValue || ''
  }
}

initEditor()
</script>

<template>
  <div
    class="overflow-hidden rounded-xl border border-gray-200 bg-white focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100"
  >

    <!-- ========================= -->
    <!-- TOOLBAR -->
    <!-- ========================= -->

    <div
      class="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 px-3 py-2"
    >

      <!-- BOLD -->

      <button
        type="button"
        title="Bold"
        @mousedown.prevent
        @click="exec('bold')"
        class="toolbar-button font-bold"
      >
        <Bold :size="17" />
      </button>


      <!-- ITALIC -->

      <button
        type="button"
        title="Italic"
        @mousedown.prevent
        @click="exec('italic')"
        class="toolbar-button italic"
      >
        <Italic :size="17" />
      </button>


      <!-- UNDERLINE -->

      <button
        type="button"
        title="Underline"
        @mousedown.prevent
        @click="exec('underline')"
        class="toolbar-button underline"
      >
        <Underline :size="17" />
      </button>


      <div class="mx-1 h-6 w-px bg-gray-300"></div>


      <!-- BULLET -->

      <button
        type="button"
        title="Bullet List"
        @mousedown.prevent
        @click="exec('insertUnorderedList')"
        class="toolbar-button"
      >
        <List :size="17" />
      </button>


      <!-- NUMBER -->

      <button
        type="button"
        title="Number List"
        @mousedown.prevent
        @click="exec('insertOrderedList')"
        class="toolbar-button"
      >
        <ListOrdered :size="17" />
      </button>


      <div class="mx-1 h-6 w-px bg-gray-300"></div>


      <!-- ALIGN LEFT -->

      <button
        type="button"
        title="Rata kiri"
        @mousedown.prevent
        @click="exec('justifyLeft')"
        class="toolbar-button"
      >
        <AlignLeft :size="17" />
      </button>


      <!-- ALIGN CENTER -->

      <button
        type="button"
        title="Rata tengah"
        @mousedown.prevent
        @click="exec('justifyCenter')"
        class="toolbar-button"
      >
        <AlignCenter :size="17" />
      </button>


      <!-- ALIGN RIGHT -->

      <button
        type="button"
        title="Rata kanan"
        @mousedown.prevent
        @click="exec('justifyRight')"
        class="toolbar-button"
      >
        <AlignRight :size="17" />
      </button>


      <div class="mx-1 h-6 w-px bg-gray-300"></div>


      <!-- TEXT COLOR -->

      <label
        title="Warna text"
        class="flex h-9 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm text-gray-600 transition hover:bg-orange-100"
      >
        <span
          class="text-xs font-medium"
        >
          A
        </span>

        <input
          v-model="textColor"
          type="color"
          class="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
          @change="changeTextColor"
        />
      </label>


      <!-- IMAGE -->

      <button
        type="button"
        title="Tambah foto"
        @mousedown.prevent
        @click="openImagePicker"
        class="toolbar-button"
      >
        <ImagePlus :size="17" />
      </button>

      <input
        ref="imageInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleImageUpload"
      />


      <div class="mx-1 h-6 w-px bg-gray-300"></div>


      <!-- UNDO -->

      <button
        type="button"
        title="Undo"
        @mousedown.prevent
        @click="exec('undo')"
        class="toolbar-button"
      >
        <Undo2 :size="17" />
      </button>


      <!-- REDO -->

      <button
        type="button"
        title="Redo"
        @mousedown.prevent
        @click="exec('redo')"
        class="toolbar-button"
      >
        <Redo2 :size="17" />
      </button>

    </div>


    <!-- ========================= -->
    <!-- EDITOR -->
    <!-- ========================= -->

    <div
      ref="editor"
      contenteditable="true"
      class="min-h-[350px] px-5 py-4 text-sm leading-7 text-gray-800 outline-none"
      data-placeholder="Tulis konten berita..."
      @input="updateContent"
    ></div>

  </div>
</template>

<style scoped>
.toolbar-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: #475569;
  transition: 0.2s;
}

.toolbar-button:hover {
  background: #fff1e5;
  color: #ff7a00;
}

[contenteditable]:empty::before {
  content: attr(data-placeholder);
  color: #94a3b8;
  pointer-events: none;
}

[contenteditable] img {
  max-width: 100%;
  height: auto;
  margin: 16px 0;
  border-radius: 12px;
}
</style>