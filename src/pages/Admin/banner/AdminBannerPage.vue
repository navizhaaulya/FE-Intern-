<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  Search,
} from 'lucide-vue-next'

import { api } from '@/services/api'
import Navbar from '@/components/layout/Navbar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import StatusBadge from '@/components/UI/StatusBadge.vue'

const router = useRouter()

const bannerList = ref([])
const loading = ref(false)
const error = ref(null)
const search = ref('')

const getBanners = async () => {
  try {
    loading.value = true
    error.value = null

    // Konsisten dengan nama model / endpoint Laravel
    const response = await api.list('banner')

    console.log('Response API Banner:', response)

    bannerList.value = response?.data || []
  } catch (err) {
    console.error('Error mengambil banner:', err)

    error.value =
      err.response?.data?.message ||
      err.message ||
      'Gagal mengambil data banner'
  } finally {
    loading.value = false
  }
}

const filteredBanners = computed(() => {
  if (!search.value) return bannerList.value

  const keyword = search.value.toLowerCase()

  return bannerList.value.filter((banner) =>
    banner.title?.toLowerCase().includes(keyword) ||
    banner.url?.toLowerCase().includes(keyword)
  )
})

const goToCreate = () => {
  router.push('/admin/banners/create')
}

const goToDetail = (id) => {
  router.push(`/admin/banners/${id}`)
}

const goToEdit = (id) => {
  router.push(`/admin/banners/${id}/edit`)
}

const deleteBanner = async (id) => {
  const confirmed = confirm(
    'Yakin ingin menghapus banner ini?'
  )

  if (!confirmed) return

  try {
    await api.delete('banners', id)

    await getBanners()
  } catch (err) {
    console.error('Error menghapus banner:', err)

    alert(
      err.response?.data?.message ||
      'Gagal menghapus banner'
    )
  }
}

onMounted(() => {
  getBanners()
})
</script>

<template>
  <div class="min-h-screen bg-[#f8f7f6]">
    <Navbar />

    <div class="flex">
      <AdminSidebar />

      <main class="min-w-0 flex-1 px-6 py-8 lg:px-10">

        <!-- HEADER -->
        <div
          class="mb-4 flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-sm"
        >
          <button
            @click="router.back()"
            class="text-gray-700 transition hover:text-orange-500"
          >
            ‹
          </button>

          <h1 class="font-semibold text-gray-800">
            Kelola Banner
          </h1>
        </div>

        <!-- TITLE -->
        <section
          class="mb-4 flex items-center justify-between bg-white px-6 py-4 shadow-sm"
        >
          <h2 class="text-xl font-bold text-gray-800">
            Daftar Banner
          </h2>

          <button
            @click="goToCreate"
            class="flex items-center gap-2 rounded-xl bg-orange-400 px-5 py-3 font-semibold text-white transition hover:bg-orange-500"
          >
            <Plus :size="18" />
            Tambah Banner
          </button>
        </section>

        <!-- TABLE CARD -->
        <section class="bg-white p-6 shadow-sm">

          <!-- SEARCH -->
          <div class="relative mb-6 max-w-sm">
            <Search
              :size="18"
              class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              v-model="search"
              type="text"
              placeholder="Cari banner..."
              class="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <!-- LOADING -->
          <div
            v-if="loading"
            class="py-16 text-center text-gray-500"
          >
            Memuat data banner...
          </div>

          <!-- ERROR -->
          <div
            v-else-if="error"
            class="py-16 text-center"
          >
            <p class="mb-4 text-red-500">
              {{ error }}
            </p>

            <button
              @click="getBanners"
              class="rounded-lg bg-orange-400 px-5 py-2 text-white hover:bg-orange-500"
            >
              Coba Lagi
            </button>
          </div>

          <!-- TABLE -->
          <div
            v-else
            class="overflow-x-auto"
          >
            <table class="w-full min-w-[750px] border-collapse">

              <thead>
                <tr class="border-b border-gray-200 bg-gray-50 text-left text-sm text-gray-700">

                  <th class="w-16 px-5 py-4 font-semibold">
                    No
                  </th>

                  <th class="px-5 py-4 font-semibold">
                    Gambar
                  </th>

                  <th class="px-5 py-4 font-semibold">
                    URL CTA
                  </th>

                  <th class="px-5 py-4 font-semibold">
                    Status
                  </th>

                  <th class="px-5 py-4 font-semibold">
                    Aksi
                  </th>

                </tr>
              </thead>

              <tbody>

                <tr
                  v-for="(banner, index) in filteredBanners"
                  :key="banner.id"
                  class="border-b border-gray-100 transition hover:bg-gray-50"
                >

                  <!-- NOMOR -->
                  <td class="px-5 py-4 text-sm text-gray-700">
                    {{ index + 1 }}
                  </td>

                  <!-- IMAGE -->
                  <td class="px-5 py-4">

                    <img
                      v-if="banner.img_cover"
                      :src="banner.img_cover"
                      :alt="banner.title || 'Banner'"
                      class="h-16 w-24 rounded-xl object-cover"
                    />

                    <div
                      v-else
                      class="flex h-16 w-24 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400"
                    >
                      No Image
                    </div>

                  </td>

                  <!-- URL -->
                  <td class="max-w-xs px-5 py-4">

                    <a
                      v-if="banner.url"
                      :href="banner.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="block truncate text-sm text-gray-600 hover:text-orange-500 hover:underline"
                    >
                      {{ banner.url }}
                    </a>

                    <span
                      v-else
                      class="text-sm text-gray-400"
                    >
                      -
                    </span>

                  </td>

                  <!-- STATUS -->
                  <td class="px-5 py-4">

                    <StatusBadge
                      :status="banner.status_code"
                    />

                  </td>

                  <!-- AKSI -->
                  <td class="px-5 py-4">

                    <div class="flex items-center gap-2">

                      <!-- DETAIL -->
                      <button
                        @click="goToDetail(banner.id)"
                        class="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-500 transition hover:bg-sky-200"
                        title="Detail"
                      >
                        <Eye :size="16" />
                      </button>

                      <!-- EDIT -->
                      <button
                        @click="goToEdit(banner.id)"
                        class="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-orange-500 transition hover:bg-orange-100"
                        title="Edit"
                      >
                        <Pencil :size="15" />
                      </button>

                      <!-- DELETE -->
                      <button
                        @click="deleteBanner(banner.id)"
                        class="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-500 transition hover:bg-red-200"
                        title="Hapus"
                      >
                        <Trash2 :size="15" />
                      </button>

                    </div>

                  </td>

                </tr>

                <!-- EMPTY -->
                <tr v-if="filteredBanners.length === 0">
                  <td
                    colspan="5"
                    class="py-16 text-center text-gray-400"
                  >
                    Belum ada data banner.
                  </td>
                </tr>

              </tbody>

            </table>
          </div>

        </section>

      </main>
    </div>
  </div>
</template>