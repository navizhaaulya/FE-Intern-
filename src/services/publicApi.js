import http from './http'

export const publicApi = {
  // Banner
  getBanners: () => http.get('/no-auth/banners').then((res) => res.data.data),

  // About
  getAbout: () => http.get('/no-auth/about').then(res => res.data.data),

  // Vision Mission
  getVisionMission: () =>
    http.get('/no-auth/vision-mission').then(res => res.data.data),

  // Footer
  getFooter: () =>
    http.get('/no-auth/footer').then(res => res.data.data),

  // Events
  getEvents: (params = {}) =>
  http.get('/no-auth/events', { params }).then(res => res.data.data),
  getEventDetail: (slug) =>
  http.get(`/no-auth/events/${slug}`).then(res => res.data.data),
  // Majors
  getMajors: () =>
    http.get('/no-auth/majors').then(res => res.data.data),

  getMajorDetail: (slug) =>
    http.get(`/no-auth/majors/${slug}`).then(res => res.data.data),

  // News
  getNews: (params = {}) =>
    http.get('/no-auth/news', { params }).then(res => res.data.data),

  getNewsDetail: (id) =>
    http.get(`/no-auth/news/${id}`).then(res => res.data.data),

  // Voting
  getVoting: () =>
    http.get('/no-auth/votings').then(res => res.data.data),

  getVotingDetail: (slug) =>
  http.get(`/no-auth/votings/${slug}`).then((res) => res.data),
  // Feedback
  getFeedbackCategories: () =>
    http.get('/feedback-categories').then(res => res.data.data),

  submitFeedback: (payload) =>
    http.post('/feedbacks', payload).then(res => res.data),
}