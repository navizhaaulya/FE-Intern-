<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http from '@/services/http'
import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import ImageUpload from '@/components/UI/ImageUpload.vue'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)

const loading = ref(isEdit.value)
const saving = ref(false)

const form = ref({
  title: '',
  description: '',
  img_cover: '',
  start_date: '',
  end_date: '',
  status_code: true,
})

const getVoting = async () => {
  try {
    loading.value = true
    const response = await http.get(`/admin/votings/${route.params.id}`)
    const data = response.data?.data

    form.value.title = data.title
    form.value.description = data.description
    form.value.img_cover = data.img_cover || ''
    form.value.start_date = data.start_date?.split('T')[0] || data.start_date
    form.value.end_date = data.end_date?.split('T')[0] || data.end_date
    form.value.status_code = data.status_code
  } catch (err) {
    console.error('Gagal mengambil data voting:', err)
    Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Gagal mengambil data voting.' })
  } finally {
    loading.value = false
  }
}

const save = async () => {
  if (!form.value.title.trim() || !form.value.description.trim() || !form.value.start_date || !form.value.end_date) {
    Swal.fire({ icon: 'warning', title: 'Lengkapi dulu', text: 'Judul, deskripsi, tanggal mulai, dan tanggal selesai wajib diisi.' })
    return
  }

  try {
    saving.value = true

    if (isEdit.value) {
      await http.put(`/admin/votings/${route.params.id}`, form.value)
    } else {
      await http.post('/admin/votings', form.value)
    }

    await Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: `Voting berhasil ${isEdit.value ? 'diperbarui' : 'ditambahkan'}.`,
      timer: 1500,
      showConfirmButton: false,
      timerProgressBar: true,
    })

    router.push('/admin/votings')
  } catch (err) {
    console.error('Gagal menyimpan voting:', err)
    Swal.fire({ icon: 'error', title: 'Gagal!', text: err.response?.data?.message || 'Gagal menyimpan voting.', confirmButtonColor: '#f97316' })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (isEdit.value) getVoting()
})
</script>

<template>
  <div class="min-h-screen bg-[#f8f7f6]">
    <Navbar />
    <div class="flex">
      <AdminSidebar />
      <main class="min-w-0 flex-1 px-6 py-8 lg:px-10">
        <div class="mb-4 flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-sm">
          <button @click="router.back()" class="text-gray-700 transition hover:text-orange-500">‹</button>
          <h1 class="font-semibold text-gray-800">{{ isEdit ? 'Edit Voting' : 'Tambah Voting' }}</h1>
        </div>

        <div v-if="loading" class="rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">Memuat data...</div>

        <section v-else class="rounded-xl bg-white p-6 shadow-sm space-y-5">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-600">Judul</label>
            <input v-model="form.title" type="text" placeholder="Masukan Judul..." class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-600">Deskripsi</label>
            <textarea v-model="form.description" rows="3" placeholder="Masukan Deskripsi..." class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"></textarea>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-gray-600">Cover</label>
            <ImageUpload v-model="form.img_cover" />
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-600">Tanggal Mulai</label>
              <input v-model="form.start_date" type="date" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-600">Tanggal Selesai</label>
              <input v-model="form.end_date" type="date" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </div>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-gray-600">Status</label>
            <div class="flex gap-6">
              <label class="flex items-center gap-2 text-sm text-gray-700">
                <input v-model="form.status_code" :value="true" type="radio" /> Aktif
              </label>
              <label class="flex items-center gap-2 text-sm text-gray-700">
                <input v-model="form.status_code" :value="false" type="radio" /> Non-aktif
              </label>
            </div>
          </div>

          <button @click="save" :disabled="saving" class="flex items-center gap-2 rounded-xl bg-orange-400 px-6 py-3 font-semibold text-white transition hover:bg-orange-500 disabled:opacity-50">
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </section>
      </main>
    </div>
  </div>
</template>