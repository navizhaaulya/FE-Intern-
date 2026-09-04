<script setup>
import { onMounted, ref } from 'vue'
import { User, Mail, Shield, LogOut } from 'lucide-vue-next'
import http from '@/services/http'
import { useRouter } from 'vue-router'


const router = useRouter()

const user = ref(null)
const loading = ref(true)


const loadProfile = async () => {

  try {

    const response = await http.get('/me')

    user.value = response.data.data

  } catch(error){

    console.error(error)

    router.push('/login')

  } finally {

    loading.value = false

  }

}


const logout = () => {

  localStorage.removeItem('token')
  localStorage.removeItem('user')

  window.dispatchEvent(
    new Event('auth-changed')
  )

  router.push('/')

}


onMounted(()=>{
  loadProfile()
})

</script>


<template>

<div class="min-h-screen bg-[#FAFAF9] px-5 py-10">

<div class="mx-auto max-w-3xl">


<div
class="rounded-[30px] bg-white p-8 shadow-sm"
>


<div class="text-center">


<div
class="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-100"
>

<User
:size="45"
class="text-[#FF8A32]"
/>

</div>


<h1
class="mt-5 text-2xl font-extrabold"
>
{{ user?.fullname }}
</h1>


<p
class="text-sm text-slate-500"
>
{{ user?.role_name }}
</p>


</div>



<div class="mt-8 space-y-4">


<div class="rounded-xl bg-slate-50 p-4">

<p class="text-xs text-slate-400">
Username
</p>

<p class="font-semibold">
{{ user?.username }}
</p>

</div>



<div class="rounded-xl bg-slate-50 p-4">

<p class="text-xs text-slate-400">
Email
</p>

<p class="font-semibold">
{{ user?.email }}
</p>

</div>



<div class="rounded-xl bg-slate-50 p-4">

<p class="text-xs text-slate-400">
Role
</p>

<p class="font-semibold">
{{ user?.role_code }}
</p>

</div>



</div>


<button
@click="logout"
class="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF8A32] py-3 font-bold text-white"
>

<LogOut :size="18"/>

Logout

</button>


</div>


</div>

</div>

</template>