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
    receiveRecords (state, payload) {
			const { records, agents, pagination } = payload

      state.records = records
			state.agents = agents
      state.pagination = pagination
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
				const response = await this.$axios.get(`/core/extra/campaign/create/one?${params}`)
				commit('receiveRecords', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},

		/**
		 * Create Campaign
		 */
		async createCampaign ({ commit }, data) {
			// const id = data.id
			try {
				const response = await this.$axios.post(`/core/extra/campaign/create/one`, data)
        commit('receiveSuccess', response.data)
      } catch (e) {
        commit('receiveError', e.response)
			}
		},
  }
}
