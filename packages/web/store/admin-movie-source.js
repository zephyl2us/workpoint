'use strict'

import _ from 'lodash'
import $ from 'jquery'

export default {
  state: () => ({
    records: [],
    pagination: {},
    sync: {
      timestamp: null,
      current: 0,
      total: 0,
      name: null
    },
    response: {
      error: {},
      success: {}
    },
  }),
  getters: {
    records (state) {
      return state.records
    },
    pagination (state) {
      return state.pagination
    },
    isSyncFinished (state) {
      const current = state.sync.current
      const total = state.sync.total
      return total && total === current
    },
    syncCurrent (state) {
      return state.sync.current
    },
    syncTotal (state) {
      return state.sync.total
    },
    syncName (state) {
      return state.sync.name
    },
    responseError (state) {
      return state.response.error
    },
    responseSuccess (state) {
      return state.response.success
    }
  },
  mutations: {
    receiveSources (state, payload) {
			const { records, pagination } = payload

      // console.log(categories)
      state.records = records
      state.pagination = pagination
    },
    receiveUpdateSource (state, payload) {
      const { record } = payload
      const records = _.cloneDeep(state.records)

      const id = _.get(record, 'id')
      const index = _.findIndex(records, ['id', id])

      console.log(id, index)

      if(index !== -1) {
        const oldRecord = records[index]
        records[index] =  _.cloneDeep(_.assign(oldRecord, record))

        state.records = records
      }
    },
    receiveSource (state, payload) {
    },
    receiveSync (state, payload) {
			const { name, current, total } = payload

      if(state.sync.current < current) {
        state.sync.name = name
        state.sync.current = current
        state.sync.total = total
      }

      // console.log(categories)
    },
    clearSync (state, payload) {
      state.sync.name = null
      state.sync.current = 0
      state.sync.total = 0
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
		 * Get Sources
		 */
		async getSources ({ commit }, params) {
      // console.log(params)
			params = $.param(params)
      // console.log(params)
			try {
				const response = await this.$axios.get(`/core/movie/source?${params}`)
				commit('receiveSources', response.data)
			} catch (e){
        commit('receiveError', e.response)
			}
		},
		/**
		 * Sync Source
		 */
		async syncSource ({ commit }) {
			// const id = data.id
			try {
				const response = await this.$axios.post(`/core/movie/source/sync`)
        commit('receiveSuccess', response.data)
      } catch (e) {
        commit('receiveError', e.response)
			}
		},
		/**
		 * Link Source
		 */
		async linkSource ({ commit }, data) {
			const id = data.id
      const refId = _.get(data, 'ref_id')
			try {
				const response = await this.$axios.post(`/core/movie/source/link/${id}`, {
          movie_ref_id: refId
        })
				commit('receiveUpdateSource', response.data)
			} catch (e){
				console.error('CANNOT FETCH')
			}
		},
  }
}
