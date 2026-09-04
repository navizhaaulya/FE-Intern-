<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  User,
  Lock,
  Eye,
  EyeOff,
  ChevronDown
} from 'lucide-vue-next'

import { authApi } from '@/services/AuthApi'

const router = useRouter()

const loginAs = ref('admin')
const identifier = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const identifierLabel = computed(() => {
  if (loginAs.value === 'siswa') {
    return 'NISN'
  }

  return 'Email / Username'
})

const login = async () => {
  errorMessage.value = ''

  if (!identifier.value || !password.value) {
    errorMessage.value = 'Email/Username dan password wajib diisi.'
    return
  }

  loading.value = true

  try {
    const response = await authApi.login({
      login_as: loginAs.value,
      identifier: identifier.value,
      password: password.value
    })

    if (response.success) {
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      if (response.user.role_code === 'admin') {
        router.push('/admin')
      } else {
        router.push('/votings')
      }
    }
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message ||
      'Email/Username atau password salah.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#F8F5F1] px-5 py-8 sm:px-8">

    <!-- Kembali -->
    <div class="mx-auto max-w-[1000px]">
      <button
        type="button"
        class="inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-[#FF9142]"
        @click="router.back()"
      >
        <ArrowLeft :size="18" />
        Kembali
      </button>
    </div>

    <!-- Login Card -->
    <div
      class="mx-auto mt-5 flex w-full max-w-[1000px] overflow-hidden rounded-[24px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
    >

      <!-- LEFT SIDE -->
      <div
        class="relative hidden min-h-[570px] w-[43%] overflow-hidden bg-gradient-to-b from-[#713B00] via-[#C56A18] to-[#FF9845] md:flex md:flex-col md:items-center md:justify-center"
      >

        <!-- Decorative circle -->
        <div
          class="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-300/10"
        />

        <div
          class="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-yellow-300/10"
        />

        <!-- Decorative shapes -->
        <div
          class="absolute left-[-50px] top-[42%] h-32 w-32 rounded-full bg-white/5"
        />

        <div
          class="absolute right-[-45px] top-[18%] h-28 w-28 rounded-full bg-white/5"
        />

        <!-- Content -->
        <div class="relative z-10 px-8 text-center">

          <h2 class="text-3xl font-extrabold tracking-tight text-white">
            Selamat Datang!
          </h2>

          <p class="mt-2 text-base font-semibold text-white">
            Website Resmi SMKN 7 Semarang
          </p>

          <p class="mt-1 text-sm text-white/85">
            Tiada Hari Tanpa Prestasi
          </p>

          <!-- Logo -->
          <div class="mt-10 flex justify-center">
            <div
              class="flex h-32 w-32 items-center justify-center rounded-full bg-white/95 p-4 shadow-lg"
            >
              <img
                src="https://smkn7semarang.sch.id/images/icon/logo180.svg"
                alt="Logo SMKN 7 Semarang"
                class="h-full w-full object-contain"
              >
            </div>
          </div>

          <p class="mt-8 max-w-[260px] text-sm leading-6 text-white/80">
            Akses layanan sekolah dengan mudah melalui akun Anda.
          </p>

        </div>
      </div>

      <!-- RIGHT SIDE -->
      <div
        class="flex min-h-[570px] w-full items-center bg-white px-7 py-10 sm:px-12 md:w-[57%] md:px-14"
      >

        <div class="mx-auto w-full max-w-[430px]">

          <!-- Header -->
          <div>
            <p class="text-sm font-semibold text-[#FF9142]">
              SMKN 7 Semarang
            </p>

            <h1
              class="mt-1 text-4xl font-extrabold tracking-tight text-[#17233C]"
            >
              Login
            </h1>

            <p class="mt-2 text-sm text-slate-500">
              Masuk menggunakan akun Anda untuk melanjutkan.
            </p>
          </div>

          <!-- Login sebagai -->
          <div class="mt-7">

            <label
              class="mb-2 block text-sm font-semibold text-[#17233C]"
            >
              Login sebagai
            </label>

            <div class="relative">
              <select
                v-model="loginAs"
                class="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#FF9142] focus:bg-white focus:ring-4 focus:ring-orange-100"
              >
                <option value="admin">
                  Admin
                </option>

                <option value="guru">
                  Guru
                </option>

                <option value="siswa">
                  Siswa
                </option>
              </select>

              <ChevronDown
                :size="18"
                class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

          </div>

          <!-- Identifier -->
          <div class="mt-5">

            <label
              class="mb-2 flex items-center gap-2 text-sm font-semibold text-[#17233C]"
            >
              <User
                :size="17"
                class="text-slate-500"
              />

              {{ identifierLabel }}
            </label>

            <input
              v-model="identifier"
              type="text"
              :placeholder="
                loginAs === 'siswa'
                  ? 'Masukkan NISN'
                  : 'Masukkan email atau username'
              "
              class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#FF9142] focus:bg-white focus:ring-4 focus:ring-orange-100"
            >

          </div>

          <!-- Password -->
          <div class="mt-5">

            <div class="mb-2 flex items-center justify-between">

              <label
                class="flex items-center gap-2 text-sm font-semibold text-[#17233C]"
              >
                <Lock
                  :size="17"
                  class="text-slate-500"
                />

                Password
              </label>

              <button
                type="button"
                class="text-xs font-semibold text-[#FF9142] transition hover:text-[#E97828]"
              >
                Lupa Password?
              </button>

            </div>

            <div class="relative">

              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan password"
                class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#FF9142] focus:bg-white focus:ring-4 focus:ring-orange-100"
                @keyup.enter="login"
              >

              <button
                type="button"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#FF9142]"
                @click="showPassword = !showPassword"
              >
                <Eye
                  v-if="!showPassword"
                  :size="19"
                />

                <EyeOff
                  v-else
                  :size="19"
                />
              </button>

            </div>

          </div>

          <!-- Error -->
          <div
            v-if="errorMessage"
            class="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {{ errorMessage }}
          </div>

          <!-- Login Button -->
          <button
            type="button"
            :disabled="loading"
            class="mt-7 h-12 w-full rounded-xl bg-[#FF9142] text-sm font-bold text-white shadow-[0_5px_12px_rgba(255,145,66,0.28)] transition hover:bg-[#F47E29] hover:shadow-[0_7px_16px_rgba(255,145,66,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
            @click="login"
          >
            {{ loading ? 'Memproses...' : 'Masuk' }}
          </button>

          <!-- Footer -->
          <p class="mt-7 text-center text-xs text-slate-400">
            © 2026 SMKN 7 Semarang
          </p>

        </div>

      </div>

    </div>
  </div>
</template>