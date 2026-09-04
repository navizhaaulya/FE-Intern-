<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  User,
  LogOut,
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'

import { authApi } from '@/services/AuthApi'
import { publicApi } from '@/services/publicApi'

const router = useRouter()

const isScrolled = ref(false)
const mobileMenuOpen = ref(false)
const profileMenuOpen = ref(false)
const mobileMajorMenuOpen = ref(false)

const user = ref(null)
const majors = ref([])


// =========================
// SCROLL
// =========================

const handleScroll = () => {
  isScrolled.value = window.scrollY > 30
}


// =========================
// USER
// =========================

const loadUser = () => {
  const storedUser = localStorage.getItem('user')

  if (!storedUser) {
    user.value = null
    return
  }

  try {
    user.value = JSON.parse(storedUser)
  } catch (error) {
    console.error(
      'Data user di localStorage tidak valid:',
      error
    )

    user.value = null
  }
}


// =========================
// MAJORS
// =========================

const loadMajors = async () => {
  try {
    const response = await publicApi.getMajors()

    majors.value = Array.isArray(response)
      ? response
      : response?.data || []
  } catch (error) {
    console.error(
      'Gagal mengambil data kompetensi keahlian:',
      error
    )

    majors.value = []
  }
}


// =========================
// AUTH
// =========================

const isLoggedIn = computed(() => {
  return (
    !!localStorage.getItem('token') &&
    !!user.value
  )
})


const profileName = computed(() => {
  if (!user.value) return 'Profile'

  if (user.value.role_code === 'admin') {
    return 'Admin'
  }

  if (user.value.role_code === 'guru') {
    return 'Guru'
  }

  if (user.value.role_code === 'siswa') {
    return 'Siswa'
  }

  return 'Profile'
})


const profileInitial = computed(() => {
  if (!user.value) return 'U'

  const name =
    user.value.fullname ||
    user.value.username ||
    user.value.email ||
    'User'

  return name.charAt(0).toUpperCase()
})


// =========================
// NAVIGATION
// =========================

const goToProfile = () => {
  profileMenuOpen.value = false
  mobileMenuOpen.value = false

  if (!user.value) return

  if (user.value.role_code === 'admin') {
    router.push('/admin')
    return
  }

  router.push('/profile')
}


const goToLogin = () => {
  mobileMenuOpen.value = false
  router.push('/login')
}


// =========================
// LOGOUT
// =========================

const logout = async () => {
  try {
    await authApi.logout()
  } catch (error) {
    console.error('Logout API gagal:', error)
  } finally {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    user.value = null

    profileMenuOpen.value = false
    mobileMenuOpen.value = false
    mobileMajorMenuOpen.value = false

    window.dispatchEvent(
      new Event('auth-changed')
    )

    router.push('/')
  }
}


// =========================
// AUTH EVENT
// =========================

const handleAuthChanged = () => {
  loadUser()
  profileMenuOpen.value = false
}


// =========================
// LIFECYCLE
// =========================

onMounted(() => {
  window.addEventListener(
    'scroll',
    handleScroll
  )

  window.addEventListener(
    'auth-changed',
    handleAuthChanged
  )

  handleScroll()
  loadUser()
  loadMajors()
})


onBeforeUnmount(() => {
  window.removeEventListener(
    'scroll',
    handleScroll
  )

  window.removeEventListener(
    'auth-changed',
    handleAuthChanged
  )
})
</script>


<template>

  <header
    class="fixed left-0 right-0 top-0 z-[100] transition-all duration-300"
    :class="
      isScrolled
        ? 'bg-white shadow-[0_4px_20px_rgba(15,23,42,0.10)]'
        : 'bg-[#FF7A00]'
    "
  >

    <nav
      class="mx-auto flex h-[76px] max-w-[1340px] items-center justify-between px-6 lg:px-8"
    >

      <!-- ========================= -->
      <!-- LOGO -->
      <!-- ========================= -->

      <router-link
        to="/"
        class="flex items-center gap-3"
      >

        <img
          src="https://smkn7semarang.sch.id/images/icon/logo180.svg"
          alt="SMKN 7 Semarang"
          class="h-14 w-14 object-contain"
        />

        <span
          class="text-xl font-extrabold transition-colors duration-300"
          :class="
            isScrolled
              ? 'text-[#172B4D]'
              : 'text-white'
          "
        >
          SMKN 7 Semarang
        </span>

      </router-link>


      <!-- ========================= -->
      <!-- DESKTOP MENU -->
      <!-- ========================= -->

      <div
        class="hidden items-center gap-9 lg:flex"
      >

        <!-- Beranda -->

        <router-link
          to="/"
          class="font-medium transition-colors duration-300"
          :class="
            isScrolled
              ? 'text-[#172B4D] hover:text-[#FF7A00]'
              : 'text-white hover:text-white/80'
          "
        >
          Beranda
        </router-link>


        <!-- Profil -->

        <router-link
          to="/about"
          class="font-medium transition-colors duration-300"
          :class="
            isScrolled
              ? 'text-[#172B4D] hover:text-[#FF7A00]'
              : 'text-white hover:text-white/80'
          "
        >
          Profil Sekolah
        </router-link>


        <!-- Kompetensi Keahlian -->
<div class="group relative">

  <button
    type="button"
    class="flex items-center gap-1 font-medium transition-colors duration-300"
    :class="
      isScrolled
        ? 'text-[#172B4D] hover:text-[#FF7A00]'
        : 'text-white hover:text-white/80'
    "
  >
    Kompetensi Keahlian

    <ChevronDown
      :size="17"
      class="transition-transform duration-200 group-hover:rotate-180"
    />
  </button>


  <!-- Dropdown Jurusan -->
  <div
    class="invisible absolute left-1/2 top-full mt-4 w-[370px] -translate-x-1/2 translate-y-2 rounded-xl bg-white p-4 opacity-0 shadow-[0_10px_35px_rgba(15,23,42,0.15)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
  >

    <!-- List Jurusan -->
    <div
      v-if="majors.length"
      class="grid grid-cols-2 gap-x-2 gap-y-1"
    >

      <router-link
        v-for="major in majors"
        :key="major.id"
        :to="`/majors/${major.slug}`"
        class="group/major flex items-center justify-between rounded-lg px-4 py-3 text-sm text-slate-600 transition-all duration-200 hover:bg-orange-50 hover:text-[#FF7A00]"
      >

        <!-- Kode Jurusan -->
        <span class="font-medium">
          {{ major.code || major.major_name }}
        </span>

        <!-- Arrow -->
        <ChevronRight
          :size="16"
          class="text-slate-400 transition-all duration-200 group-hover/major:translate-x-1 group-hover/major:text-[#FF7A00]"
        />

      </router-link>

    </div>


    <!-- Kalau data belum ada -->
    <div
      v-else
      class="px-4 py-5 text-center text-sm text-slate-400"
    >
      Data kompetensi belum tersedia.
    </div>

  </div>

</div>
        <!-- Event -->

        <router-link
          to="/events"
          class="font-medium transition-colors duration-300"
          :class="
            isScrolled
              ? 'text-[#172B4D] hover:text-[#FF7A00]'
              : 'text-white hover:text-white/80'
          "
        >
          Event
        </router-link>


        <!-- Berita -->

        <router-link
          to="/news"
          class="font-medium transition-colors duration-300"
          :class="
            isScrolled
              ? 'text-[#172B4D] hover:text-[#FF7A00]'
              : 'text-white hover:text-white/80'
          "
        >
          Berita
        </router-link>


        <!-- Kritik -->

        <router-link
          to="/feedback"
          class="font-medium transition-colors duration-300"
          :class="
            isScrolled
              ? 'text-[#172B4D] hover:text-[#FF7A00]'
              : 'text-white hover:text-white/80'
          "
        >
          Kritik & Saran
        </router-link>


        <!-- ========================= -->
        <!-- BELUM LOGIN -->
        <!-- ========================= -->

        <router-link
          v-if="!isLoggedIn"
          to="/login"
          class="rounded-xl px-7 py-3 font-bold text-white transition-all duration-300"
          :class="
            isScrolled
              ? 'bg-[#FF7A00] hover:bg-[#E86F00]'
              : 'bg-white/20 hover:bg-white/30'
          "
        >
          Login
        </router-link>


        <!-- ========================= -->
        <!-- SUDAH LOGIN -->
        <!-- ========================= -->

        <div
          v-else
          class="relative"
        >

          <button
            type="button"
            class="flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold transition-all duration-300"
            :class="
              isScrolled
                ? 'bg-[#FF7A00] text-white hover:bg-[#E86F00]'
                : 'bg-white/20 text-white hover:bg-white/30'
            "
            @click="
              profileMenuOpen = !profileMenuOpen
            "
          >

            <span
              class="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-extrabold text-[#FF7A00]"
            >
              {{ profileInitial }}
            </span>

            <span>
              {{ profileName }}
            </span>

            <ChevronDown
              :size="16"
              class="transition-transform duration-200"
              :class="
                profileMenuOpen
                  ? 'rotate-180'
                  : ''
              "
            />

          </button>


          <!-- Profile Dropdown -->

          <div
            v-if="profileMenuOpen"
            class="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-2xl bg-white p-2 shadow-[0_10px_35px_rgba(15,23,42,0.15)]"
          >

            <div
              class="border-b border-slate-100 px-3 py-3"
            >

              <p
                class="text-sm font-bold text-slate-800"
              >
                {{
                  user?.fullname ||
                  user?.username ||
                  'User'
                }}
              </p>

              <p
                class="mt-1 truncate text-xs text-slate-500"
              >
                {{
                  user?.email ||
                  user?.username
                }}
              </p>

            </div>


            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-orange-50 hover:text-[#FF7A00]"
              @click="goToProfile"
            >

              <User :size="17" />

              Profile

            </button>


            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
              @click="logout"
            >

              <LogOut :size="17" />

              Logout

            </button>

          </div>

        </div>

      </div>


      <!-- ========================= -->
      <!-- MOBILE BUTTON -->
      <!-- ========================= -->

      <button
        type="button"
        class="lg:hidden"
        :class="
          isScrolled
            ? 'text-slate-800'
            : 'text-white'
        "
        @click="
          mobileMenuOpen = !mobileMenuOpen
        "
      >

        <X
          v-if="mobileMenuOpen"
          :size="25"
        />

        <Menu
          v-else
          :size="25"
        />

      </button>

    </nav>


    <!-- ========================= -->
    <!-- MOBILE MENU -->
    <!-- ========================= -->

    <div
      v-if="mobileMenuOpen"
      class="border-t border-slate-100 bg-white px-6 py-5 lg:hidden"
    >

      <div class="flex flex-col gap-4">

        <router-link
          to="/"
          class="font-medium text-slate-700"
          @click="
            mobileMenuOpen = false
          "
        >
          Beranda
        </router-link>


        <router-link
          to="/about"
          class="font-medium text-slate-700"
          @click="
            mobileMenuOpen = false
          "
        >
          Profil Sekolah
        </router-link>


        <!-- ========================= -->
        <!-- MOBILE MAJOR -->
        <!-- ========================= -->

        <div>

          <button
            type="button"
            class="flex w-full items-center justify-between font-medium text-slate-700"
            @click="
              mobileMajorMenuOpen =
                !mobileMajorMenuOpen
            "
          >

            <span>
              Kompetensi Keahlian
            </span>

            <ChevronDown
              :size="18"
              class="transition-transform duration-200"
              :class="
                mobileMajorMenuOpen
                  ? 'rotate-180'
                  : ''
              "
            />

          </button>


          <div
            v-if="mobileMajorMenuOpen"
            class="mt-2 space-y-1 border-l border-orange-100 pl-4"
          >

            <router-link
              to="/majors"
              class="block py-2 text-sm font-semibold text-slate-700"
              @click="
                mobileMenuOpen = false
              "
            >
              Semua Kompetensi
            </router-link>


            <router-link
              v-for="major in majors"
              :key="major.id"
              :to="`/majors/${major.slug}`"
              class="block py-2 text-sm text-slate-500 transition hover:text-[#FF7A00]"
              @click="
                mobileMenuOpen = false
              "
            >
              {{ major.major_name }}
            </router-link>

          </div>

        </div>


        <!-- Event -->

        <router-link
          to="/events"
          class="font-medium text-slate-700"
          @click="
            mobileMenuOpen = false
          "
        >
          Event
        </router-link>


        <!-- Berita -->

        <router-link
          to="/news"
          class="font-medium text-slate-700"
          @click="
            mobileMenuOpen = false
          "
        >
          Berita
        </router-link>


        <!-- Feedback -->

        <router-link
          to="/feedback"
          class="font-medium text-slate-700"
          @click="
            mobileMenuOpen = false
          "
        >
          Kritik & Saran
        </router-link>


        <!-- ========================= -->
        <!-- MOBILE LOGIN -->
        <!-- ========================= -->

        <button
          v-if="!isLoggedIn"
          type="button"
          class="rounded-xl bg-[#FF7A00] px-5 py-3 text-center font-bold text-white"
          @click="goToLogin"
        >
          Login
        </button>


        <!-- ========================= -->
        <!-- MOBILE PROFILE -->
        <!-- ========================= -->

        <div
          v-else
          class="border-t border-slate-100 pt-4"
        >

          <div
            class="mb-3 flex items-center gap-3"
          >

            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-bold text-[#FF7A00]"
            >
              {{ profileInitial }}
            </div>

            <div>

              <p
                class="text-sm font-bold text-slate-800"
              >
                {{
                  user?.fullname ||
                  user?.username ||
                  'User'
                }}
              </p>

              <p
                class="text-xs text-slate-500"
              >
                {{ profileName }}
              </p>

            </div>

          </div>


          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-orange-50"
            @click="goToProfile"
          >

            <User :size="17" />

            Profile

          </button>


          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-500 hover:bg-red-50"
            @click="logout"
          >

            <LogOut :size="17" />

            Logout

          </button>

        </div>

      </div>

    </div>

  </header>


  <!-- Spacer -->

  <div class="h-[76px]"></div>

</template>