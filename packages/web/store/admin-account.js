'use strict'

// import _ from 'lodash'

export default {
  state: () => ({
    response: {
      error: {},
      success: {}
    },
  }),
  getters: {
    responseError (state) {
      return state.response.error
    },
    responseSuccess (state) {
      return state.response.success
    }
  },
  mutations: {
    receiveError (state, payload) {
      state.response.error = payload
    },
    receiveSuccess (state, payload) {
      state.response.success = payload
		},
  },
  actions: {
		/**
		 * Change Password
		 */
		async changePassword ({ commit }, data) {
			try {
				const response = await this.$axios.patch(`/core/account/security/password`, data)
        commit('receiveSuccess', response.data)
      } catch (e) {
        commit('receiveError', e.response)
			}
		},
  }
}
