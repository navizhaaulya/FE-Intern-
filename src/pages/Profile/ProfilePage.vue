<script setup>
import { onMounted, ref, computed } from 'vue'
import {
  Mail,
  AtSign,
  ShieldCheck,
  LogOut,
  GraduationCap,
  BookOpen,
  Settings,
  ArrowLeft,
  Newspaper,
  Vote,
  MessageSquare,
  LayoutDashboard,
  Users,
  FileText,
} from 'lucide-vue-next'
import http from '@/services/http'
import { useRouter } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'

const router = useRouter()

const user = ref(null)
const loading = ref(true)

const loadProfile = async () => {
  try {
    const response = await http.get('/me')
    user.value = response.data.data
  } catch (error) {
    console.error(error)
    router.push('/login')
  } finally {
    loading.value = false
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.dispatchEvent(new Event('auth-changed'))
  router.push('/')
}

// Inisial dari nama lengkap, dipakai sebagai avatar fallback
const initials = computed(() => {
  const name = user.value?.fullname
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('')
})

// Tampilan berbeda per role: warna, label, dan ikon
const roleTheme = computed(() => {
  const code = (user.value?.role_code || '').toLowerCase()

  if (code.includes('admin')) {
    return {
      label: 'Administrator',
      icon: Settings,
      gradient: 'from-violet-500 to-indigo-500',
      badgeBg: 'bg-violet-50',
      badgeText: 'text-violet-600',
      ring: 'ring-violet-100',
    }
  }

  if (code.includes('teacher') || code.includes('guru')) {
    return {
      label: 'Guru',
      icon: BookOpen,
      gradient: 'from-emerald-500 to-teal-500',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-600',
      ring: 'ring-emerald-100',
    }
  }

  return {
    label: 'Murid',
    icon: GraduationCap,
    gradient: 'from-[#FF8A32] to-orange-400',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-[#FF8A32]',
    ring: 'ring-orange-100',
  }
})

// Shortcut berbeda tergantung role. Admin diarahkan ke modul admin,
// murid/guru diarahkan ke halaman publik yang sering dipakai.
const shortcuts = computed(() => {
  const code = (user.value?.role_code || '').toLowerCase()

  if (code.includes('admin')) {
    return [
      {
        label: 'Dashboard Admin',
        icon: LayoutDashboard,
        to: '/admin',
        color: 'text-violet-600',
        bg: 'bg-violet-50',
      },
      {
        label: 'Kelola Berita',
        icon: FileText,
        to: '/admin/news',
        color: 'text-violet-600',
        bg: 'bg-violet-50',
      },
      {
        label: 'Kelola Voting',
        icon: Vote,
        to: '/admin/votings',
        color: 'text-violet-600',
        bg: 'bg-violet-50',
      },
      {
        label: 'Kelola Pengguna',
        icon: Users,
        to: '/admin/users',
        color: 'text-violet-600',
        bg: 'bg-violet-50',
      },
    ]
  }

  return [
    { label: 'Berita', icon: Newspaper, to: '/news', color: 'text-[#FF8A32]', bg: 'bg-orange-50' },
    { label: 'Voting', icon: Vote, to: '/votings', color: 'text-[#FF8A32]', bg: 'bg-orange-50' },
    {
      label: 'Feedback',
      icon: MessageSquare,
      to: '/feedback',
      color: 'text-[#FF8A32]',
      bg: 'bg-orange-50',
    },
    {
      label: 'Jurusan',
      icon: GraduationCap,
      to: '/majors',
      color: 'text-[#FF8A32]',
      bg: 'bg-orange-50',
    },
  ]
})

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-[#FAFAF9]">
    <Navbar />

    <div class="flex-1 px-5 py-10">
      <div class="mx-auto max-w-3xl">
        <!-- Tombol back -->
        <button
          @click="goBack"
          class="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft :size="16" />
          Kembali
        </button>

        <!-- Loading state -->
        <div v-if="loading" class="rounded-[30px] bg-white p-10 shadow-sm">
          <div class="flex animate-pulse flex-col items-center">
            <div class="h-24 w-24 rounded-full bg-slate-100"></div>
            <div class="mt-5 h-5 w-40 rounded bg-slate-100"></div>
            <div class="mt-3 h-4 w-24 rounded bg-slate-100"></div>
          </div>
        </div>

        <!-- Content -->
        <div v-else class="overflow-hidden rounded-[30px] bg-white shadow-sm">
          <!-- Banner + avatar -->
          <div :class="['relative h-32 bg-gradient-to-r', roleTheme.gradient]">
            <div class="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <div
                :class="[
                  'flex h-24 w-24 items-center justify-center rounded-full bg-white p-1.5 shadow-md ring-4',
                  roleTheme.ring,
                ]"
              >
                <div
                  :class="[
                    'flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br text-2xl font-extrabold text-white',
                    roleTheme.gradient,
                  ]"
                >
                  {{ initials }}
                </div>
              </div>
            </div>
          </div>

          <!-- Nama & role -->
          <div class="px-8 pb-8 pt-16 text-center">
            <h1 class="text-2xl font-extrabold text-slate-900">
              {{ user?.fullname }}
            </h1>

            <span
              :class="[
                'mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold',
                roleTheme.badgeBg,
                roleTheme.badgeText,
              ]"
            >
              <component :is="roleTheme.icon" :size="14" />
              {{ roleTheme.label }}
            </span>

            <!-- Info akun -->
            <div class="mt-8 space-y-3 text-left">
              <div class="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm"
                >
                  <AtSign :size="18" class="text-slate-400" />
                </div>
                <div class="min-w-0">
                  <p class="text-xs text-slate-400">Username</p>
                  <p class="truncate font-semibold text-slate-800">{{ user?.username }}</p>
                </div>
              </div>

              <div class="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm"
                >
                  <Mail :size="18" class="text-slate-400" />
                </div>
                <div class="min-w-0">
                  <p class="text-xs text-slate-400">Email</p>
                  <p class="truncate font-semibold text-slate-800">{{ user?.email }}</p>
                </div>
              </div>

              <div class="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm"
                >
                  <ShieldCheck :size="18" class="text-slate-400" />
                </div>
                <div class="min-w-0">
                  <p class="text-xs text-slate-400">Role</p>
                  <p class="truncate font-semibold text-slate-800">{{ user?.role_name }}</p>
                </div>
              </div>
            </div>

            <!-- Logout -->
            <button
              @click="logout"
              class="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-3 font-bold text-red-500 transition hover:bg-red-100"
            >
              <LogOut :size="18" />
              Logout
            </button>
          </div>
        </div>

        <!-- Shortcut penting -->
        <div class="mt-6 rounded-[30px] bg-white p-6 shadow-sm">
          <h2 class="text-sm font-bold text-slate-800">Akses Cepat</h2>

          <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <router-link
              v-for="item in shortcuts"
              :key="item.label"
              :to="item.to"
              class="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-4 text-center transition hover:border-slate-200 hover:shadow-sm"
            >
              <div :class="['flex h-10 w-10 items-center justify-center rounded-lg', item.bg]">
                <component :is="item.icon" :size="18" :class="item.color" />
              </div>
              <span class="text-xs font-semibold text-slate-700">{{ item.label }}</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>
