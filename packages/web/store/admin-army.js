'use strict'

// import _ from 'lodash'

export default {
  state: () => ({
    addresses: [],
    response: {
      error: {},
      success: {}
    },
  }),
  getters: {
    addresses (state) {
      return state.addresses
    },
    responseError (state) {
      return state.response.error
    },
    responseSuccess (state) {
      return state.response.success
    }
  },
  mutations: {
    receiveAddresses (state, payload) {
			const { records } = payload

      state.addresses = records
    },
    receiveError (state, payload) {
      state.response.error = payload
    },
    receiveSuccess (state, payload) {
      state.response.success = payload
		},
  },
  actions: {
		/**
		 * Get Addresses
		 */
		async getAddresses ({ commit }, params) {
			params = $.param(params)
			try {
				const response = await this.$axios.get(`/core/army/address`)
				commit('receiveAddresses', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
  }
}
