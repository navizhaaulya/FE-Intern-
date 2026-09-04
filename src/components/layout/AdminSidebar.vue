<script setup>
import {
  LayoutDashboard,
  Image,
  School,
  Eye,
  Video,
  Laptop,
  Calendar,
  Newspaper,
  Vote,
  MessageSquare,
  CircleUserRound
} from 'lucide-vue-next'
</script>


<template>

<aside
class="
w-64
min-h-[calc(100vh-76px)]
bg-white
border-r
border-slate-100
px-5
py-6
"
>

<!-- Admin Header -->
<div class="mb-8">

<h2 class="font-extrabold text-lg text-slate-900">
SMKN 7 SEMARANG
</h2>

<p class="text-sm text-slate-500">
Admin Panel
</p>

</div>


<!-- Dashboard -->

<router-link
to="/admin/dashboard"
class="
flex items-center gap-3
rounded-xl
px-4 py-3
text-slate-700
hover:bg-orange-50
hover:text-[#FF7A00]
"
>

<LayoutDashboard :size="20"/>

Dashboard

</router-link>



<h3 class="mt-8 mb-3 font-bold text-slate-900">
Konten Website
</h3>


<div class="space-y-1">


<router-link
to="/admin/banner"
class="admin-menu"
>
<Image :size="19"/>
Banner
</router-link>


<router-link
to="/admin/profile"
class="admin-menu"
>
<School :size="19"/>
Profil Sekolah
</router-link>


<router-link
to="/admin/vision"
class="admin-menu"
>
<Eye :size="19"/>
Visi Misi
</router-link>


<router-link
to="/admin/video"
class="admin-menu"
>
<Video :size="19"/>
Video Profile
</router-link>


<router-link
to="/admin/major"
class="admin-menu"
>
<Laptop :size="19"/>
Jurusan
</router-link>


<router-link
to="/admin/event"
class="admin-menu"
>
<Calendar :size="19"/>
Event
</router-link>


<router-link
to="/admin/news"
class="admin-menu"
>
<Newspaper :size="19"/>
Berita
</router-link>


<router-link
to="/admin/voting"
class="admin-menu"
>
<Vote :size="19"/>
Voting
</router-link>


<router-link
to="/admin/feedback"
class="admin-menu"
>
<MessageSquare :size="19"/>
Kritik & Saran
</router-link>


</div>



<h3 class="mt-8 mb-3 font-bold text-slate-900">
Lainnya
</h3>


<router-link
to="/admin/master-data"
class="admin-menu"
>

<CircleUserRound :size="19"/>

Master Data

</router-link>


</aside>


</template>


<style scoped>

.admin-menu{

display:flex;
align-items:center;
gap:12px;
padding:10px 12px;
border-radius:12px;
font-size:15px;
font-weight:500;
color:#475569;
transition:.2s;

}

.admin-menu:hover{

background:#fff1e5;
color:#FF7A00;

}

</style>