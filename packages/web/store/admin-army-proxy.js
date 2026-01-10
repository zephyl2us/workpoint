'use strict'

// import _ from 'lodash'

export default {
  state: () => ({
    records: [],
    record: {},
    pagination: {},
    response: {
      error: {},
      success: {}
    },
  }),
  getters: {
    records (state) {
      return state.records
    },
    record (state) {
      return state.record
    },
    pagination (state) {
      return state.pagination
    },
    responseError (state) {
      return state.response.error
    },
    responseSuccess (state) {
      return state.response.success
    }
  },
  mutations: {
    receiveProxies (state, payload) {
			const { records, pagination } = payload

      state.records = records
      state.pagination = pagination
    },
    receiveProxy (state, payload) {
			const { record } = payload

      state.record = record
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
		 * Get Proxies
		 */
		async getProxies ({ commit }, params) {
      // console.log(params)
			params = $.param(params)
      // console.log(params)
			try {
				const response = await this.$axios.get(`/core/army/proxy?${params}`)
				commit('receiveProxies', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
		/**
		 * Get Proxy
		 */
		async getProxy ({ commit }, id) {
			try {
				const response = await this.$axios.get(`/core/army/proxy/${id}`)
				commit('receiveProxy', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
  }
}
