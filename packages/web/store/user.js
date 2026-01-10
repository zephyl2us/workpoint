'use strict'

import _ from 'lodash'

export default {
  state: () => ({
    permission: {},
    sessionToken: null,
    isAuthorized: true
  }),
  getters: {
    permission (state) {
      return state.permission
    },
    isAuthorized (state) {
      return state.isAuthorized
    }
  },
  mutations: {
    setPermission (state, payload) {
      state.permission = payload
    },
    setSessionToken (state, value) {
      state.sessionToken = value
    },
    setAuthorized (state, value) {
      state.isAuthorized = value
    },
  },
  actions: {
    fetchPermission ({ commit }) {
      const permission = _.get(this.$auth.user, 'permission')
      commit('setPermission', permission)

    }
  }
}
