<script setup>
import { Eye, Pencil, Trash2, Star } from 'lucide-vue-next'
import StatusBadge from '@/components/UI/StatusBadge.vue'

const props = defineProps({
  columns: { type: Array, required: true },
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  currentPage: { type: Number, default: 1 },
  itemsPerPage: { type: Number, default: 10 },
  totalPages: { type: Number, default: 1 },
  actions: { type: Array, default: () => ['detail', 'edit', 'delete'] },
  // key di item yang nandain status highlight, biar bintangnya kesorot kuning
  highlightKey: { type: String, default: '' },
})

const emit = defineEmits(['detail', 'edit', 'delete', 'highlight', 'page-change'])

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const getValue = (item, column) => {
  const value = item[column.key]
  if (column.type === 'image') {
    if (typeof value === 'object' && value !== null) {
      const rawUrl = value.url || value.field_value || ''
      if (!rawUrl) return ''
      if (rawUrl.startsWith('http')) return rawUrl
      return `${import.meta.env.VITE_API_URL}/${rawUrl}`
    }
    return value || ''
  }
  return value
}

const getBadge = (item, column) => {
  const value = getValue(item, column)
  const key = String(value)
  return column.badgeMap?.[key] || { label: value ?? '-', class: 'bg-gray-100 text-gray-500' }
}

const changePage = (page, totalPages) => {
  if (page < 1 || page > totalPages) return
  emit('page-change', page)
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-5 py-4 text-left text-sm font-semibold text-gray-600">No</th>
            <th v-for="column in columns" :key="column.key" class="px-5 py-4 text-left text-sm font-semibold text-gray-600">
              {{ column.label }}
            </th>
            <th v-if="actions.length > 0" class="px-5 py-4 text-center text-sm font-semibold text-gray-600">Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length + 2" class="px-5 py-10 text-center text-gray-500">Memuat data...</td>
          </tr>

          <tr v-else-if="items.length === 0">
            <td :colspan="columns.length + 2" class="px-5 py-10 text-center text-gray-500">Tidak ada data.</td>
          </tr>

          <tr v-for="(item, index) in items" v-else :key="item.id" class="border-b border-gray-100 hover:bg-gray-50">
            <td class="px-5 py-4 text-sm text-gray-600">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>

            <td v-for="column in columns" :key="column.key" class="px-5 py-4 text-sm text-gray-600">
              <template v-if="column.type === 'image'">
                <img v-if="getValue(item, column)" :src="getValue(item, column)" class="w-16 h-10 object-cover rounded-lg" :alt="item.title || 'Image'" />
                <div v-else class="w-16 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">No Image</div>
              </template>

              <StatusBadge v-else-if="column.type === 'status'" :status="getValue(item, column)" />

              <span v-else-if="column.type === 'badge'" class="rounded-full px-3 py-1 text-xs font-semibold" :class="getBadge(item, column).class">
                {{ getBadge(item, column).label }}
              </span>

              <template v-else-if="column.type === 'date'">{{ formatDate(getValue(item, column)) }}</template>

              <template v-else-if="column.type === 'truncate'">
                <p class="line-clamp-2 max-w-md">{{ getValue(item, column) || '-' }}</p>
              </template>

              <template v-else>{{ getValue(item, column) || '-' }}</template>
            </td>

            <td v-if="actions.length > 0" class="px-5 py-4">
              <div class="flex items-center justify-center gap-2">
                <button v-if="actions.includes('detail')" @click="emit('detail', item.id)" class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900" title="Detail">
                  <Eye :size="18" />
                </button>
                <button v-if="actions.includes('edit')" @click="emit('edit', item.id)" class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-orange-500" title="Edit">
                  <Pencil :size="18" />
                </button>
                <button v-if="actions.includes('delete')" @click="emit('delete', item.id)" class="p-2 rounded-lg text-red-500 hover:bg-red-50" title="Hapus">
                  <Trash2 :size="18" />
                </button>
                <button
                  v-if="actions.includes('highlight')"
                  @click="emit('highlight', item.id)"
                  class="p-2 rounded-lg hover:bg-yellow-50"
                  :class="highlightKey && item[highlightKey] ? 'text-yellow-400' : 'text-gray-400'"
                  title="Jadikan Highlight"
                >
                  <Star :size="18" :fill="highlightKey && item[highlightKey] ? 'currentColor' : 'none'" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="flex items-center justify-between px-5 py-4 border-t border-gray-200">
      <p class="text-sm text-gray-500">Halaman {{ currentPage }} dari {{ totalPages }}</p>
      <div class="flex items-center gap-2">
        <button @click="changePage(currentPage - 1, totalPages)" :disabled="currentPage === 1" class="px-3 py-2 text-sm border rounded-lg disabled:opacity-40">Sebelumnya</button>
        <button v-for="page in totalPages" :key="page" @click="changePage(page, totalPages)" class="w-9 h-9 rounded-lg text-sm" :class="currentPage === page ? 'bg-orange-500 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'">{{ page }}</button>
        <button @click="changePage(currentPage + 1, totalPages)" :disabled="currentPage === totalPages" class="px-3 py-2 text-sm border rounded-lg disabled:opacity-40">Berikutnya</button>
      </div>
    </div>
  </div>
</template>