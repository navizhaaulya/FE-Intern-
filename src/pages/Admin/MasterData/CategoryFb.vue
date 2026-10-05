<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Search, Pencil, Trash2 } from 'lucide-vue-next'
import Swal from 'sweetalert2'

import { api } from '@/services/api'
import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'

const list = ref([])
const loading = ref(true)
const error = ref(null)
const search = ref('')

const view = ref('list') // 'list' | 'form'
const saving = ref(false)

const form = ref({ id: null, category_name: '', status: true })

const getCategories = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await api.list('feedback_categories')
    list.value = response?.data || []
  } catch (err) {
    console.error('Gagal mengambil kategori:', err)
    error.value = err.response?.data?.message || err.message || 'Gagal mengambil data kategori'
  } finally {
    loading.value = false
  }
}

const filteredList = computed(() => {
  const keyword = search.value.toLowerCase().trim()
  if (!keyword) return list.value
  return list.value.filter((c) => c.category_name?.toLowerCase().includes(keyword))
})

const resetForm = () => {
  form.value = { id: null, category_name: '', status: true }
}

const openAdd = () => {
  resetForm()
  view.value = 'form'
}

const openEdit = (item) => {
  form.value = { id: item.id, category_name: item.category_name, status: item.status }
  view.value = 'form'
}

const cancelForm = () => {
  view.value = 'list'
}

const saveCategory = async () => {
  if (!form.value.category_name.trim()) {
    Swal.fire({ icon: 'warning', title: 'Nama kategori wajib diisi' })
    return
  }

  try {
    saving.value = true

    const payload = {
      category_name: form.value.category_name,
      status: form.value.status,
    }

    if (form.value.id) {
      await api.update('feedback_categories', form.value.id, payload)
    } else {
      await api.create('feedback_categories', payload)
    }

    await getCategories()
    view.value = 'list'

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: `Kategori berhasil ${form.value.id ? 'diperbarui' : 'ditambahkan'}.`,
      timer: 1500,
      showConfirmButton: false,
      timerProgressBar: true,
    })
  } catch (err) {
    console.error('Gagal menyimpan kategori:', err)
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: err.response?.data?.message || 'Gagal menyimpan kategori.',
      confirmButtonColor: '#f97316',
    })
  } finally {
    saving.value = false
  }
}

const deleteCategory = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus kategori ini?',
    text: 'Kategori yang dihapus tidak dapat dikembalikan.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#f97316',
    cancelButtonColor: '#6b7280',
    reverseButtons: true,
  })

  if (!result.isConfirmed) return

  try {
    await api.delete('feedback_categories', id)
    await getCategories()
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Kategori berhasil dihapus.',
      timer: 1500,
      showConfirmButton: false,
      timerProgressBar: true,
    })
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: err.response?.data?.message || 'Gagal menghapus kategori.',
      confirmButtonColor: '#f97316',
    })
  }
}

onMounted(getCategories)
</script>

<template>
  <div class="min-h-screen bg-[#f8f7f6]">
    <Navbar />

    <div class="flex">
      <AdminSidebar />

      <main class="min-w-0 flex-1 px-6 py-8 lg:px-10">
        <div class="mb-4 rounded-2xl bg-white px-6 py-4 shadow-sm">
          <h1 class="font-semibold text-gray-800">Master Data</h1>
          <p class="mt-1 text-sm text-gray-500">
            Kelola kategori yang dipakai di berbagai fitur website.
          </p>
        </div>

        <section class="rounded-xl bg-white p-6 shadow-sm">
          <!-- LIST VIEW -->
          <template v-if="view === 'list'">
            <div class="mb-6 flex items-center justify-between gap-4">
              <h2 class="text-lg font-bold text-gray-800">Kategori Kritik & Saran</h2>

              <button
                @click="openAdd"
                class="flex items-center gap-2 rounded-xl bg-orange-400 px-5 py-3 font-semibold text-white transition hover:bg-orange-500"
              >
                <Plus :size="18" />
                Tambah Kategori
              </button>
            </div>

            <div class="relative mb-6 max-w-sm">
              <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                v-model="search"
                type="text"
                placeholder="Cari kategori..."
                class="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div
              v-if="error"
              class="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600"
            >
              {{ error }}
              <button @click="getCategories" class="ml-3 font-semibold underline">Coba lagi</button>
            </div>

            <div v-if="loading" class="py-10 text-center text-gray-500">Memuat data...</div>

            <div v-else-if="filteredList.length === 0" class="py-10 text-center text-gray-400">
              Belum ada kategori.
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full">
                <thead class="border-b border-gray-200">
                  <tr class="text-left text-sm font-semibold text-gray-600">
                    <th class="px-3 py-3">No</th>
                    <th class="px-3 py-3">Nama Kategori</th>
                    <th class="px-3 py-3">Status</th>
                    <th class="px-3 py-3">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="(item, index) in filteredList"
                    :key="item.id"
                    class="border-b border-gray-100 text-sm text-gray-700"
                  >
                    <td class="px-3 py-4">{{ index + 1 }}.</td>
                    <td class="px-3 py-4 font-medium">{{ item.category_name }}</td>
                    <td class="px-3 py-4">
                      <span
                        class="rounded-full px-3 py-1 text-xs font-semibold"
                        :class="
                          item.status ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                        "
                      >
                        {{ item.status ? 'Aktif' : 'Non Aktif' }}
                      </span>
                    </td>
                    <td class="px-3 py-4">
                      <div class="flex items-center gap-2">
                        <button
                          @click="openEdit(item)"
                          class="rounded-lg p-1.5 text-orange-500 hover:bg-orange-50"
                          title="Edit"
                        >
                          <Pencil :size="16" />
                        </button>
                        <button
                          @click="deleteCategory(item.id)"
                          class="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                          title="Hapus"
                        >
                          <Trash2 :size="16" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <!-- FORM VIEW -->
          <template v-else>
            <h2 class="mb-6 text-lg font-bold text-gray-800">
              {{ form.id ? 'Edit' : 'Tambah' }} Kategori Kritik & Saran
            </h2>

            <div class="max-w-lg space-y-5">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-600">Nama Kategori</label>
                <input
                  v-model="form.category_name"
                  type="text"
                  placeholder="Fasilitas, Pelayanan, dll"
                  class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-gray-600">Status</label>
                <div class="flex gap-6">
                  <label class="flex items-center gap-2 text-sm text-gray-700">
                    <input v-model="form.status" type="radio" :value="true" /> Aktif
                  </label>
                  <label class="flex items-center gap-2 text-sm text-gray-700">
                    <input v-model="form.status" type="radio" :value="false" /> Non-aktif
                  </label>
                </div>
              </div>

              <div class="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  @click="cancelForm"
                  type="button"
                  :disabled="saving"
                  class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  @click="saveCategory"
                  :disabled="saving"
                  class="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600 disabled:opacity-50"
                >
                  {{ saving ? 'Menyimpan...' : 'Simpan' }}
                </button>
              </div>
            </div>
          </template>
        </section>
      </main>
    </div>
  </div>
</template>
