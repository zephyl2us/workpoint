'use strict'

// import Vue from 'vue'
// import VuePusher from 'vue-pusher'

export default function ({ env, app }) {
  const oldLogout = app.$auth.logout.bind(app.$auth)
  const oldLogin = app.$auth.login.bind(app.$auth)

  app.$auth.logout = (...args) => {
    const _ = oldLogout(...args)
    _.then(() => app.$auth.redirect('logout'))
    return _
  }

  app.$auth.login = (...args) => {
    // sometimes doesn't work when the user tries to get to the admin page
    // before being logged in.
    const _ = oldLogin(...args)
    _.then(() => {
			app.$auth.redirect('home', true)
    })
    return _
  }

  // Set pusher to use the same key
	// const authorization = app.$auth.getToken('local')
	// window.authorization = authorization.replace('Bearer', '').trim()

	// console.log(env.pusherAppKey)

	// const pusherConfig = {
	// 	api_key: env.pusherAppKey,
  //   options: {
  //     cluster: 'ap1',
  //     encrypted: true,
  //     pong_timeout: 6000,
	//     unavailable_timeout: 2000,
  //     authTransport: 'ajax',
  //     authEndpoint: '/auth/pusher',
  //     auth: {
  //       headers: {
  //         'X-Requested-With': 'XMLHttpRequest',
  //         // 'Authorization': authorization
  //       }
	// 		}
  //   }
	// }
	// Vue.use(VuePusher, pusherConfig)

}
