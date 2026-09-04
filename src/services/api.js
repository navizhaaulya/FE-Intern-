import http from './http'

export const api = {
  list: (model, params = {}) =>
    http.get(`/${model}`, { params }).then((res) => res.data),

  detail: (model, id) =>
    http.get(`/${model}/${id}`).then((res) => res.data),

  create: (model, payload) =>
    http.post(`/${model}`, payload).then((res) => res.data),

  update: (model, id, payload) =>
    http.put(`/${model}/${id}`, payload).then((res) => res.data),

  delete: (model, id) =>
    http.delete(`/${model}/${id}`).then((res) => res.data),

  dataset: (model, params = {}) =>
    http.get(`/${model}/dataset`, { params }).then((res) => res.data),
}