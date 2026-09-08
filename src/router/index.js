import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '@/pages/HomePage.vue'
import NewsPage from '@/pages/NewsPage.vue'
import EventPage from '@/pages/EventPage.vue'
import FeedbackPage from '@/pages/FeedbackPage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import ProfilePage from '@/pages/Profile/ProfilePage.vue'

const router = createRouter({
  history: createWebHistory('/fe/'),

  routes: [

    {
      path: '/',
      name: 'home',
      component: HomePage,
    },

    {
      path: '/news',
      name: 'news',
      component: NewsPage,
    },

    {
      path: '/news/:slug',
      name: 'news-detail',
      component: () => import('@/pages/News/NewsDetailPage.vue'),
    },

    {
      path: '/events',
      name: 'events',
      component: EventPage,
    },

    {
      path: '/events/:slug',
      name: 'event-detail',
      component: () => import('@/pages/events/EventDetailPage.vue'),
    },

    {
      path: '/feedback',
      name: 'feedback',
      component: FeedbackPage,
    },

    {
      path: '/votings',
      name: 'voting',
      component: () => import('@/pages/Voting/VotingPage.vue'),
    },

    {
      path: '/votings/:slug',
      name: 'voting-detail',
      component: () => import('@/pages/Voting/VotingDetail.vue'),
    },

    // =========================
    // AUTH
    // =========================

    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },

    {
      path: '/profile',
      name: 'profile',
      component: ProfilePage,
    },

    // =========================
    // ADMIN
    // =========================

    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/pages/Admin/AdminPage.vue'),
      meta: {
        requiresAuth: true,
        role: 'admin',
      },
    },

    {
  path: '/admin/banner',
  name: 'admin-banners',
  component: () => import('@/pages/Admin/banner/AdminBannerPage.vue'),
  meta: {
    requiresAuth: true,
    role: 'admin',
  },
},

    {
  path: '/admin/news',
  name: 'admin-news',
  component: () => import('@/pages/Admin/news/AdminNewsPage.vue'),
  meta: {
    requiresAuth: true,
    role: 'admin',
  },
},
{
  path: '/admin/news/create',
  name: 'admin-news-create',
  component: () => import('@/pages/Admin/news/AdminNewsForm.vue'),
  meta: {
    requiresAuth: true,
    role: 'admin',
  },
},
{
  path: '/admin/news/:id',
  name: 'admin-news-detail',
  component: () => import('@/pages/Admin/news/AdminNewsDetail.vue'),
  meta: {
    requiresAuth: true,
    role: 'admin',
  },
},
{
  path: '/admin/news/:id/edit',
  name: 'admin-news-edit',
  component: () => import('@/pages/Admin/news/AdminNewsForm.vue'),
  meta: {
    requiresAuth: true,
    role: 'admin',
  },
},

 {
  path: '/admin/event',
  name: 'admin-event',
  component: () => import('@/pages/Admin/Eventadmin/AdminEventPage.vue'),
  meta: {
    requiresAuth: true,
    role: 'admin',
  },
},
{
  path: '/admin/events/create',
  name: 'admin-event-create',
  component: () => import('@/pages/Admin/Eventadmin/AdminAddEvent.vue'),
  meta: {
    requiresAuth: true,
    role: 'admin',
  },
},
{
  path: '/admin/events/:id',
  name: 'admin-event-detail',
  component: () => import('@/pages/Admin/Eventadmin/AdminDetailEvent.vue'),
  meta: {
    requiresAuth: true,
    role: 'admin',
  },
},
{
  path: '/admin/events/:id/edit',
  name: 'admin-event-edit',
  component: () => import('@/pages/Admin/Eventadmin/AdminEditEvent.vue'),
  meta: {
    requiresAuth: true,
    role: 'admin',
  },
},
  ],
})


// =========================
// ROUTE GUARD
// =========================

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  // Kalau halaman butuh login tapi belum ada token
  if (to.meta.requiresAuth && !token) {
    return {
      name: 'login',
    }
  }

  // Kalau halaman khusus admin
  if (to.meta.role === 'admin' && user?.role_code !== 'admin') {
    return {
      path: '/votings',
    }
  }

  return true
})

export default router