'use strict'

// import _ from 'lodash'

export default {
  state: () => ({
    records: [],
		agents: [],
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
    agents (state) {
      return state.agents
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
    receiveUsers (state, payload) {
			const { records, agents, pagination } = payload

      state.records = records
			state.agents = agents
      state.pagination = pagination
    },
    receiveGenerateAnt (state, payload) {
			const { record } = payload

      // console.log(payload)
      // console.log(record)

      state.generateAnt = record
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
		 * Get Users
		 */
		async getUsers ({ commit }, params) {
      // console.log(params)
			params = $.param(params)
      // console.log(params)
			try {
				const response = await this.$axios.get(`/core/extra/one?${params}`)
				commit('receiveUsers', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
  }
}
