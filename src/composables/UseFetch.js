import { ref, onMounted } from 'vue'

export function useFetch(fetcher) {
  const data = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const load = async () => {
    loading.value = true
    error.value = null

    try {
      data.value = await fetcher()
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  return {
    data,
    loading,
    error,
    reload: load,
  }
}