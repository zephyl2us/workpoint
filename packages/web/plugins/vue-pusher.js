import Vue from 'vue'
import Cookies from 'js-cookie'
const token = Cookies.get('')

export default function ({ env, app }) {
  const pusher = {
    api_key: env.pusherAppKey,
    options: {
      cluster: 'ap1',
      forceTLS: true,
      encrypted: true,
      pong_timeout: 6000,
      unavailable_timeout: 2000,
      authTransport: 'ajax',
      authEndpoint: process.env.BASE_URL + '/auth/pusher',
      auth: {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${token}`,
        }
      },
    }
  }

  Vue.use(require('vue-pusher'), pusher)
}