'use strict'

import _ from 'lodash'

export default {
  state: () => ({
    records: [],
    record: {},
    stats: {
      total: 0,
      running: 0,
      checkpoint: 0,
      success: 0
    },
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
    stats (state) {
      return state.stats
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
    receiveBots (state, payload) {
			const { records, pagination } = payload

      state.records = records
      state.pagination = pagination
    },
    receiveStats (state, payload) {
			const { stats } = payload

      state.stats = stats
    },
    receiveUpdateBot (state, payload) {
      console.log(`receiveUpdateBot`, payload)

      const records = _.cloneDeep(state.records)
      const id = payload.id

      const index = _.findIndex(records, ['id', id])
      if(index !== -1) {
        let record = records[index]
        record = _.assign({}, record, payload)
        records[index] = record
      }

      state.records = records
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
		 * Get Bots
		 */
		async getBots ({ commit }, data) {
			const params = $.param(data.params)
			try {
				const response = await this.$axios.get(`/core/army/bot?${params}`)
				commit('receiveBots', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
		/**
		 * Get Stats
		 */
		async getStats ({ commit }, date) {
			try {
				const response = await this.$axios.get(`/core/army/bot/stats?date=${date}`)
				commit('receiveStats', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
  }
}
