'use strict'

export default function ({ $axios, store, redirect }) {

  $axios.interceptors.request.use((config) => {
    const token = store.state.user.sessionToken
    if (token) {
      config.headers.common['User-Secret'] = `${token}`
    }
    return config
  })

  $axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        console.log('401')
        // await this.$auth.logout()
        store.commit('user/setAuthorized', false)
      }
      return Promise.reject(error)
    }
  )

  // $axios.interceptors.response.use(
  //   (response) => response,
  //   async (error) => {
  //     if (error.response && error.response.status === 401) {
  //       console.log('401')
  //       // await this.$auth.logout()
	// 			// this.$router.push(`/auth/login`)
  //       // redirect('/auth/login')
  //       await store.commit('user/setAuthorized', false)

  //     }
  //     return Promise.reject(error)
  //   }
  // );
}