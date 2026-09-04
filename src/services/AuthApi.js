import http from './http'

export const authApi = {
  login: (payload) =>
    http.post('/login', payload).then((res) => res.data),

  logout: () =>
    http.post('/logout').then((res) => res.data),

  me: () =>
    http.get('/me').then((res) => res.data),

  refresh: () =>
    http.post('/refresh').then((res) => res.data),
}